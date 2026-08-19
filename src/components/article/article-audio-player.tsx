"use client";

import {
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings2,
  Volume2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface ArticleAudioPlayerProps {
  title?: string;
  content?: string;
  language?: string;
}

interface SpeechBlock {
  index: number;
  text: string;
  estimatedSeconds: number;
}

const WORDS_PER_MINUTE = 150;
const MIN_BLOCK_SECONDS = 1.5;

function estimateDuration(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(
    MIN_BLOCK_SECONDS,
    (words / WORDS_PER_MINUTE) * 60
  );
}

/* =========================================================
   EXTRACT READABLE ARTICLE BLOCKS
========================================================= */

function extractSpeechBlocks(
  html: string
): SpeechBlock[] {
  if (!html) return [];

  if (typeof window === "undefined") {
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<figure[\s\S]*?<\/figure>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text
      ? [
          {
            index: 0,
            text,
            estimatedSeconds: estimateDuration(text),
          },
        ]
      : [];
  }

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    html,
    "text/html"
  );

  doc
    .querySelectorAll(
      "script, style, noscript, iframe, video, figure"
    )
    .forEach((element) => element.remove());

  const selectors = [
    "p",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "li",
  ];

  const blocks: SpeechBlock[] = [];

  doc
    .querySelectorAll(selectors.join(","))
    .forEach((element) => {
      const text =
        element.textContent
          ?.replace(/\s+/g, " ")
          .trim() || "";

      if (!text) return;

      if (
        element.closest(
          "figure, iframe, video, script, style"
        )
      ) {
        return;
      }

      blocks.push({
        index: blocks.length,
        text,
        estimatedSeconds: estimateDuration(text),
      });
    });

  /*
   * Fallback:
   * If article has no normal readable HTML blocks,
   * extract plain text.
   */

  if (!blocks.length) {
    const text =
      doc.body.textContent
        ?.replace(/\s+/g, " ")
        .trim() || "";

    if (text) {
      blocks.push({
        index: 0,
        text,
        estimatedSeconds: estimateDuration(text),
      });
    }
  }

  return blocks;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));

  const minutes = Math.floor(safe / 60);

  const remaining = safe % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

export default function ArticleAudioPlayer({
  title,
  content,
  language = "hi-IN",
}: ArticleAudioPlayerProps) {
  const [voices, setVoices] =
    useState<SpeechSynthesisVoice[]>([]);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [currentBlock, setCurrentBlock] =
    useState(-1);

  const [speed, setSpeed] =
    useState(1);

  const [showSettings, setShowSettings] =
    useState(false);

  const [supported, setSupported] =
    useState(true);

  const [isSeeking, setIsSeeking] =
    useState(false);

  const blocksRef =
    useRef<SpeechBlock[]>([]);

  const currentIndexRef =
    useRef(0);

  const speedRef =
    useRef(1);

  const stoppedRef =
    useRef(false);

  const progressRef =
    useRef<HTMLDivElement | null>(null);

  const activeUtteranceRef =
    useRef<SpeechSynthesisUtterance | null>(
      null
    );

  /* =======================================================
     BLOCKS
  ======================================================= */

  const blocks = useMemo(
    () =>
      extractSpeechBlocks(
        content || ""
      ),
    [content]
  );

  const hasContent =
    Boolean(title?.trim()) ||
    blocks.length > 0;

  /*
   * Audio starts with title, then article blocks.
   *
   * Title gets index -1 so it DOES NOT highlight
   * an article paragraph.
   */

  const speechQueue = useMemo(() => {
    const queue: SpeechBlock[] = [];

    if (title?.trim()) {
      queue.push({
        index: -1,
        text: title.trim(),
        estimatedSeconds: estimateDuration(
          title.trim()
        ),
      });
    }

    return [
      ...queue,
      ...blocks,
    ];
  }, [title, blocks]);

  /* =======================================================
     TOTAL TIME
  ======================================================= */

  const totalSeconds = useMemo(
    () =>
      speechQueue.reduce(
        (total, item) =>
          total + item.estimatedSeconds,
        0
      ),
    [speechQueue]
  );

  const elapsedSeconds = useMemo(() => {
    const currentQueueIndex =
      currentIndexRef.current;

    return speechQueue
      .slice(0, currentQueueIndex)
      .reduce(
        (total, item) =>
          total + item.estimatedSeconds,
        0
      );
  }, [speechQueue, currentBlock]);

  const progress = useMemo(() => {
    if (!speechQueue.length) return 0;

    if (currentBlock === -1) {
      return 0;
    }

    const queueIndex =
      currentIndexRef.current;

    return Math.min(
      100,
      Math.max(
        0,
        (queueIndex /
          Math.max(
            1,
            speechQueue.length - 1
          )) *
          100
      )
    );
  }, [
    currentBlock,
    speechQueue.length,
  ]);

  /* =======================================================
     SPEED REF
  ======================================================= */

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /* =======================================================
     SUPPORT
  ======================================================= */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window) ||
      !(
        "SpeechSynthesisUtterance" in
        window
      )
    ) {
      setSupported(false);
    }
  }, []);

  /* =======================================================
     VOICES
  ======================================================= */

  useEffect(() => {
    if (!supported) return;

    const loadVoices = () => {
      const available =
        window.speechSynthesis.getVoices();

      setVoices(available);
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, [supported]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        stoppedRef.current = true;

        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =======================================================
     SELECT BEST VOICE
  ======================================================= */

  const selectedVoice = useMemo(() => {
    if (!voices.length) {
      return undefined;
    }

    const requested =
      language.toLowerCase();

    const base =
      requested.split("-")[0];

    /*
     * Exact language first.
     */

    const exact =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() ===
          requested
      );

    if (exact) return exact;

    /*
     * Prefer natural / online voices.
     */

    const preferred =
      voices.find((voice) => {
        const lang =
          voice.lang.toLowerCase();

        const name =
          voice.name.toLowerCase();

        return (
          lang.startsWith(`${base}-`) &&
          (
            name.includes("natural") ||
            name.includes("online") ||
            name.includes("neural") ||
            name.includes("google")
          )
        );
      });

    if (preferred) return preferred;

    /*
     * Any matching language family.
     */

    const family =
      voices.find((voice) =>
        voice.lang
          .toLowerCase()
          .startsWith(`${base}-`)
      );

    if (family) return family;

    /*
     * Final language-specific fallback.
     */

    if (base === "en") {
      return (
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith("en")
        ) || voices[0]
      );
    }

    if (base === "hi") {
      return (
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith("hi")
        ) || voices[0]
      );
    }

    return voices[0];
  }, [voices, language]);

  /* =======================================================
     HIGHLIGHT
  ======================================================= */

  const updateHighlight =
    useCallback((index: number) => {
      if (
        typeof window === "undefined"
      ) {
        return;
      }

      setCurrentBlock(index);

      window.dispatchEvent(
        new CustomEvent(
          "article-audio-progress",
          {
            detail: {
              index,
            },
          }
        )
      );
    }, []);

  /* =======================================================
     SPEAK
  ======================================================= */

  const speakQueueItem = useCallback(
    (queueIndex: number) => {
      if (!supported) return;

      if (
        !speechQueue.length
      ) {
        return;
      }

      if (
        queueIndex >=
        speechQueue.length
      ) {
        setIsPlaying(false);
        setIsPaused(false);

        currentIndexRef.current =
          speechQueue.length;

        setCurrentBlock(
          blocks.length
        );

        updateHighlight(-1);

        return;
      }

      const item =
        speechQueue[queueIndex];

      currentIndexRef.current =
        queueIndex;

      updateHighlight(
        item.index
      );

      const utterance =
        new SpeechSynthesisUtterance(
          item.text
        );

      activeUtteranceRef.current =
        utterance;

      utterance.rate =
        speedRef.current;

      utterance.pitch = 1;

      utterance.volume = 1;

      if (selectedVoice) {
        utterance.voice =
          selectedVoice;

        utterance.lang =
          selectedVoice.lang;
      } else {
        utterance.lang =
          language;
      }

      utterance.onstart = () => {
        if (stoppedRef.current) {
          return;
        }

        setIsPlaying(true);
        setIsPaused(false);

        updateHighlight(
          item.index
        );
      };

      utterance.onend = () => {
        if (stoppedRef.current) {
          return;
        }

        const next =
          queueIndex + 1;

        if (
          next <
          speechQueue.length
        ) {
          speakQueueItem(next);
        } else {
          setIsPlaying(false);
          setIsPaused(false);

          currentIndexRef.current =
            speechQueue.length;

          setCurrentBlock(
            blocks.length
          );

          updateHighlight(-1);
        }
      };

      utterance.onerror = (
        event
      ) => {
        /*
         * cancel/interrupted should not
         * permanently break the player.
         */

        if (
          stoppedRef.current ||
          event.error === "canceled" ||
          event.error === "interrupted"
        ) {
          return;
        }

        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(
        utterance
      );
    },
    [
      blocks.length,
      language,
      selectedVoice,
      speechQueue,
      supported,
      updateHighlight,
    ]
  );

  /* =======================================================
     PLAY
  ======================================================= */

  const handlePlay = useCallback(() => {
    if (
      !supported ||
      !speechQueue.length
    ) {
      return;
    }

    stoppedRef.current = false;

    if (
      isPaused &&
      window.speechSynthesis.paused
    ) {
      window.speechSynthesis.resume();

      setIsPaused(false);
      setIsPlaying(true);

      return;
    }

    if (
      window.speechSynthesis.speaking
    ) {
      return;
    }

    let queueIndex =
      currentIndexRef.current;

    if (
      queueIndex >=
      speechQueue.length
    ) {
      queueIndex = 0;

      currentIndexRef.current = 0;
    }

    speakQueueItem(queueIndex);
  }, [
    isPaused,
    speakQueueItem,
    speechQueue.length,
    supported,
  ]);

  /* =======================================================
     PAUSE
  ======================================================= */

  const handlePause = () => {
    if (!supported) return;

    if (
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.pause();

      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  /* =======================================================
     RESTART
  ======================================================= */

  const handleRestart = () => {
    if (!supported) return;

    stoppedRef.current = true;

    window.speechSynthesis.cancel();

    currentIndexRef.current = 0;

    setCurrentBlock(-1);

    stoppedRef.current = false;

    setTimeout(() => {
      speakQueueItem(0);
    }, 80);
  };

  /* =======================================================
     SEEK
  ======================================================= */

  const seekToQueueIndex =
    useCallback(
      (
        queueIndex: number,
        shouldPlay = isPlaying
      ) => {
        if (!speechQueue.length) return;

        const safeIndex =
          Math.max(
            0,
            Math.min(
              speechQueue.length - 1,
              Math.round(queueIndex)
            )
          );

        currentIndexRef.current =
          safeIndex;

        const item =
          speechQueue[safeIndex];

        stoppedRef.current = true;

        window.speechSynthesis.cancel();

        stoppedRef.current = false;

        updateHighlight(
          item.index
        );

        if (shouldPlay) {
          setTimeout(() => {
            speakQueueItem(
              safeIndex
            );
          }, 80);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
        }
      },
      [
        isPlaying,
        speakQueueItem,
        speechQueue,
        updateHighlight,
      ]
    );

  /* =======================================================
     +/- 10 SEC
  ======================================================= */

  const seekBySeconds = (
    seconds: number
  ) => {
    if (!speechQueue.length) return;

    const currentTime =
      speechQueue
        .slice(
          0,
          currentIndexRef.current
        )
        .reduce(
          (total, item) =>
            total +
            item.estimatedSeconds,
          0
        );

    const targetTime =
      Math.max(
        0,
        Math.min(
          totalSeconds,
          currentTime + seconds
        )
      );

    let accumulated = 0;

    let targetIndex = 0;

    for (
      let i = 0;
      i < speechQueue.length;
      i++
    ) {
      accumulated +=
        speechQueue[i]
          .estimatedSeconds;

      if (
        accumulated >= targetTime
      ) {
        targetIndex = i;
        break;
      }
    }

    seekToQueueIndex(
      targetIndex
    );
  };

  /* =======================================================
     TIMELINE
  ======================================================= */

  const seekFromPointer = (
    clientX: number
  ) => {
    const element =
      progressRef.current;

    if (
      !element ||
      !speechQueue.length
    ) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    const ratio =
      Math.max(
        0,
        Math.min(
          1,
          (clientX - rect.left) /
            rect.width
        )
      );

    const target =
      ratio *
      Math.max(
        0,
        speechQueue.length - 1
      );

    seekToQueueIndex(target);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    setIsSeeking(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    seekFromPointer(
      event.clientX
    );
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isSeeking) return;

    seekFromPointer(
      event.clientX
    );
  };

  const handlePointerUp = () => {
    setIsSeeking(false);
  };

  /* =======================================================
     SPEED
  ======================================================= */

  const changeSpeed = (
    newSpeed: number
  ) => {
    const safeSpeed =
      Math.min(
        1.5,
        Math.max(
          0.75,
          newSpeed
        )
      );

    setSpeed(safeSpeed);

    speedRef.current =
      safeSpeed;

    if (
      isPlaying ||
      window.speechSynthesis.speaking
    ) {
      const index =
        currentIndexRef.current;

      stoppedRef.current = true;

      window.speechSynthesis.cancel();

      stoppedRef.current = false;

      setTimeout(() => {
        speakQueueItem(index);
      }, 80);
    }
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const statusText =
    currentIndexRef.current >=
    speechQueue.length
      ? "लेख पूरा हो गया"
      : isPlaying
        ? "अभी पढ़ा जा रहा है"
        : isPaused
          ? "ऑडियो रुका हुआ है"
          : "खबर सुनने के लिए चलाएं";

  if (
    !supported ||
    !hasContent ||
    !speechQueue.length
  ) {
    return null;
  }

  return (
    <section
      aria-label="Article audio player"
      className="
        relative
        my-8
        w-full
        overflow-hidden
        rounded-[22px]
        border
        border-zinc-200
        bg-white
        shadow-[0_12px_40px_rgba(0,0,0,0.07)]
      "
    >
      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-[3px]
          bg-gradient-to-r
          from-red-600
          via-yellow-400
          to-red-600
        "
      />

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          px-4
          pb-3
          pt-5
          sm:px-6
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className={`
              relative
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-[14px]
              transition-all
              duration-300
              ${
                isPlaying
                  ? "bg-red-600 text-white shadow-[0_5px_18px_rgba(200,16,46,0.25)]"
                  : "bg-red-50 text-red-600"
              }
            `}
          >
            <Volume2
              size={20}
              strokeWidth={2}
            />

            {isPlaying && (
              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-yellow-400
                  ring-2
                  ring-white
                "
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className="
                  text-sm
                  font-extrabold
                  tracking-tight
                  text-zinc-900
                  sm:text-[15px]
                "
              >
                खबर सुनें
              </h3>

              <span
                className="
                  hidden
                  rounded-full
                  bg-zinc-100
                  px-2
                  py-0.5
                  text-[9px]
                  font-bold
                  tracking-wider
                  text-zinc-500
                  sm:inline-flex
                "
              >
                AUDIO
              </span>
            </div>

            <p
              className="
                mt-0.5
                truncate
                text-[11px]
                font-medium
                text-zinc-500
                sm:text-xs
              "
            >
              {statusText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (value) => !value
            )
          }
          className="
            flex
            h-9
            shrink-0
            items-center
            gap-1.5
            rounded-full
            border
            border-zinc-200
            bg-zinc-50
            px-3
            text-xs
            font-bold
            text-zinc-700
            transition
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-600
          "
        >
          <Settings2 size={14} />

          <span>{speed}x</span>

          <ChevronDown
            size={13}
            className={`
              transition-transform
              ${
                showSettings
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>
      </div>

      <div className="px-4 sm:px-6">
        <div
          ref={progressRef}
          onPointerDown={
            handlePointerDown
          }
          onPointerMove={
            handlePointerMove
          }
          onPointerUp={
            handlePointerUp
          }
          onPointerCancel={
            handlePointerUp
          }
          className="
            group
            relative
            flex
            h-7
            w-full
            cursor-pointer
            touch-none
            items-center
          "
          aria-label="Audio timeline"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="
              relative
              h-1.5
              w-full
              overflow-visible
              rounded-full
              bg-zinc-100
            "
          >
            <div
              className="
                absolute
                left-0
                top-0
                h-full
                rounded-full
                bg-red-600
                transition-[width]
                duration-200
              "
              style={{
                width: `${progress}%`,
              }}
            />

            <div
              className="
                absolute
                top-1/2
                h-3.5
                w-3.5
                -translate-y-1/2
                rounded-full
                border-2
                border-white
                bg-yellow-400
                shadow-[0_2px_8px_rgba(0,0,0,0.2)]
                transition-[left]
                duration-200
              "
              style={{
                left: `calc(${progress}% - 7px)`,
              }}
            />
          </div>
        </div>

        <div
          className="
            -mt-1
            flex
            items-center
            justify-between
            text-[10px]
            font-semibold
            tabular-nums
            text-zinc-400
          "
        >
          <span>
            {formatTime(
              elapsedSeconds
            )}
          </span>

          <span>
            {formatTime(
              totalSeconds
            )}
          </span>
        </div>
      </div>

      <div
        className="
          flex
          items-center
          justify-center
          gap-5
          px-4
          py-4
          sm:gap-7
          sm:px-6
          sm:py-5
        "
      >
        <button
          type="button"
          onClick={() =>
            seekBySeconds(-10)
          }
          className="
            flex
            h-10
            w-10
            flex-col
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-zinc-100
            hover:text-zinc-900
            active:scale-90
          "
          aria-label="Back 10 seconds"
        >
          <RotateCcw
            size={18}
            strokeWidth={2}
          />

          <span className="-mt-1 text-[8px] font-bold">
            10
          </span>
        </button>

        <button
          type="button"
          onClick={
            isPlaying
              ? handlePause
              : handlePlay
          }
          className="
            relative
            flex
            h-[58px]
            w-[58px]
            items-center
            justify-center
            rounded-full
            bg-red-600
            text-white
            shadow-[0_8px_24px_rgba(200,16,46,0.28)]
            transition-all
            duration-200
            hover:scale-[1.04]
            hover:bg-red-700
            active:scale-95
          "
          aria-label={
            isPlaying
              ? "Pause article"
              : "Play article"
          }
        >
          {isPlaying && (
            <span
              className="
                absolute
                inset-[-5px]
                rounded-full
                border
                border-red-200
                opacity-70
              "
            />
          )}

          {isPlaying ? (
            <Pause
              size={23}
              fill="currentColor"
            />
          ) : (
            <Play
              size={24}
              fill="currentColor"
              className="ml-0.5"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() =>
            seekBySeconds(10)
          }
          className="
            flex
            h-10
            w-10
            flex-col
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-zinc-100
            hover:text-zinc-900
            active:scale-90
          "
          aria-label="Forward 10 seconds"
        >
          <RotateCw
            size={18}
            strokeWidth={2}
          />

          <span className="-mt-1 text-[8px] font-bold">
            10
          </span>
        </button>
      </div>

      <div
        className="
          border-t
          border-zinc-100
          bg-zinc-50/70
          px-4
          py-2.5
          text-center
          sm:px-6
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            text-zinc-500
            sm:text-[11px]
          "
        >
          {currentBlock >= 0
            ? `पढ़ा जा रहा है · ${Math.round(
                progress
              )}%`
            : currentIndexRef.current >=
              speechQueue.length
              ? "लेख पूरा हो गया"
              : "खबर सुनने के लिए चलाएं"}
        </p>
      </div>

      {showSettings && (
        <div
          className="
            border-t
            border-zinc-100
            bg-white
            px-4
            py-3
            sm:px-6
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
            "
          >
            <span
              className="
                mr-1
                text-[10px]
                font-bold
                uppercase
                tracking-wider
                text-zinc-400
              "
            >
              Speed
            </span>

            {[0.75, 1, 1.25, 1.5].map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    changeSpeed(value)
                  }
                  className={`
                    rounded-full
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    transition
                    ${
                      speed === value
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }
                  `}
                >
                  {value}x
                </button>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}