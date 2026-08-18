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

interface SpeechChunk {
  text: string;
  estimatedSeconds: number;
}

const WORDS_PER_MINUTE = 145;
const MIN_CHUNK_SECONDS = 2;

function htmlToText(html: string) {
  if (!html) return "";

  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const parser = new DOMParser();

  const doc = parser.parseFromString(
    html,
    "text/html"
  );

  doc
    .querySelectorAll(
      "script, style, noscript, iframe"
    )
    .forEach((element) => element.remove());

  return (doc.body.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   SMART CHUNKING
========================================================= */

function splitText(
  text: string,
  maxLength = 190
): SpeechChunk[] {
  const sentences =
    text.match(
      /[^.!?।॥]+[.!?।॥]+|[^.!?।॥]+$/g
    ) || [];

  const chunks: SpeechChunk[] = [];

  let current = "";

  for (const sentence of sentences) {
    const clean = sentence.trim();

    if (!clean) continue;

    if (
      current.length +
        clean.length +
        1 <=
      maxLength
    ) {
      current = current
        ? `${current} ${clean}`
        : clean;
    } else {
      if (current) {
        chunks.push({
          text: current,
          estimatedSeconds:
            estimateDuration(current),
        });
      }

      current = clean;
    }
  }

  if (current) {
    chunks.push({
      text: current,
      estimatedSeconds:
        estimateDuration(current),
    });
  }

  return chunks;
}

/* =========================================================
   ESTIMATE AUDIO TIME
========================================================= */

function estimateDuration(text: string) {
  const words =
    text.trim().split(/\s+/).length;

  return Math.max(
    MIN_CHUNK_SECONDS,
    (words / WORDS_PER_MINUTE) * 60
  );
}

function formatTime(seconds: number) {
  const safe =
    Math.max(0, Math.round(seconds));

  const minutes =
    Math.floor(safe / 60);

  const remaining =
    safe % 60;

  return `${minutes}:${remaining
    .toString()
    .padStart(2, "0")}`;
}

/* =========================================================
   COMPONENT
========================================================= */

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

  const [currentChunk, setCurrentChunk] =
    useState(0);

  const [speed, setSpeed] =
    useState(1);

  const [showSettings, setShowSettings] =
    useState(false);

  const [supported, setSupported] =
    useState(true);

  const [isSeeking, setIsSeeking] =
    useState(false);

  const chunksRef =
    useRef<SpeechChunk[]>([]);

  const currentIndexRef =
    useRef(0);

  const speedRef =
    useRef(1);

  const stoppedRef =
    useRef(false);

  const progressRef =
    useRef<HTMLDivElement | null>(null);

  /* =======================================================
     TEXT
  ======================================================= */

  const text = useMemo(() => {
    const articleText =
      htmlToText(content || "");

    return [
      title,
      articleText,
    ]
      .filter(Boolean)
      .join(". ")
      .trim();
  }, [title, content]);

  const chunks = useMemo(
    () => splitText(text),
    [text]
  );

  /* =======================================================
     TOTAL TIME
  ======================================================= */

  const totalSeconds = useMemo(() => {
    return chunks.reduce(
      (total, chunk) =>
        total + chunk.estimatedSeconds,
      0
    );
  }, [chunks]);

  const elapsedSeconds = useMemo(() => {
    return chunks
      .slice(0, currentChunk)
      .reduce(
        (total, chunk) =>
          total + chunk.estimatedSeconds,
        0
      );
  }, [chunks, currentChunk]);

  const currentChunkProgress =
    chunks.length > 0
      ? currentChunk / chunks.length
      : 0;

  const progress =
    Math.min(
      100,
      currentChunkProgress * 100
    );

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
      setVoices(
        window.speechSynthesis.getVoices()
      );
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
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* =======================================================
     VOICE
  ======================================================= */

  const selectedVoice = useMemo(() => {
    if (!voices.length) {
      return undefined;
    }

    const requested =
      language.toLowerCase();

    const base =
      requested.split("-")[0];

    const exact =
      voices.find(
        (voice) =>
          voice.lang.toLowerCase() ===
          requested
      );

    if (exact) return exact;

    const family =
      voices.find(
        (voice) =>
          voice.lang
            .toLowerCase()
            .startsWith(
              `${base}-`
            )
      );

    if (family) return family;

    if (base === "hi") {
      const hindi =
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith("hi")
        );

      if (hindi) return hindi;
    }

    if (base === "en") {
      const english =
        voices.find((voice) =>
          voice.lang
            .toLowerCase()
            .startsWith("en")
        );

      if (english) return english;
    }

    return voices[0];
  }, [voices, language]);

  /* =======================================================
     HIGHLIGHT ARTICLE
  ======================================================= */

  const updateHighlight =
    useCallback((index: number) => {
      if (
        typeof window === "undefined"
      ) {
        return;
      }

      window.dispatchEvent(
        new CustomEvent(
          "article-audio-highlight",
          {
            detail: {
              index,
              text:
                chunksRef.current[index]
                  ?.text || "",
            },
          }
        )
      );
    }, []);

  /* =======================================================
     SPEAK CHUNK
  ======================================================= */

  const speakChunk = useCallback(
    (index: number) => {
      if (!supported) return;

      if (
        !chunksRef.current.length
      ) {
        return;
      }

      if (
        index >=
        chunksRef.current.length
      ) {
        setIsPlaying(false);
        setIsPaused(false);

        setCurrentChunk(
          chunksRef.current.length
        );

        updateHighlight(-1);

        return;
      }

      const chunk =
        chunksRef.current[index];

      currentIndexRef.current =
        index;

      setCurrentChunk(index);

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

      updateHighlight(index);

      const utterance =
        new SpeechSynthesisUtterance(
          chunk.text
        );

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
          language || "hi-IN";
      }

      utterance.onstart = () => {
        if (!stoppedRef.current) {
          setIsPlaying(true);
          setIsPaused(false);

          updateHighlight(index);
        }
      };

      utterance.onend = () => {
        if (stoppedRef.current) {
          return;
        }

        const next =
          currentIndexRef.current + 1;

        if (
          next <
          chunksRef.current.length
        ) {
          speakChunk(next);
        } else {
          setIsPlaying(false);
          setIsPaused(false);

          setCurrentChunk(
            chunksRef.current.length
          );

          updateHighlight(-1);
        }
      };

      utterance.onerror = () => {
        if (stoppedRef.current) {
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
      language,
      selectedVoice,
      supported,
      updateHighlight,
    ]
  );

  /* =======================================================
     PLAY
  ======================================================= */

  const handlePlay = useCallback(() => {
    if (!supported || !text) {
      return;
    }

    chunksRef.current = chunks;

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

    let index =
      currentIndexRef.current;

    if (
      index >=
      chunksRef.current.length
    ) {
      index = 0;

      currentIndexRef.current = 0;

      setCurrentChunk(0);
    }

    speakChunk(index);
  }, [
    chunks,
    isPaused,
    speakChunk,
    supported,
    text,
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

    stoppedRef.current = false;

    chunksRef.current = chunks;

    currentIndexRef.current = 0;

    setCurrentChunk(0);

    setTimeout(() => {
      speakChunk(0);
    }, 50);
  };

  /* =======================================================
     STOP
  ======================================================= */

  const handleStop = () => {
    if (!supported) return;

    stoppedRef.current = true;

    window.speechSynthesis.cancel();

    currentIndexRef.current = 0;

    setCurrentChunk(0);

    setIsPlaying(false);
    setIsPaused(false);

    updateHighlight(-1);
  };

  /* =======================================================
     SEEK TO CHUNK
  ======================================================= */

  const seekToChunk = useCallback(
    (index: number) => {
      if (!chunks.length) return;

      const safeIndex =
        Math.max(
          0,
          Math.min(
            chunks.length - 1,
            Math.round(index)
          )
        );

      chunksRef.current = chunks;

      currentIndexRef.current =
        safeIndex;

      setCurrentChunk(safeIndex);

      stoppedRef.current = true;

      window.speechSynthesis.cancel();

      stoppedRef.current = false;

      updateHighlight(safeIndex);

      if (isPlaying) {
        setTimeout(() => {
          speakChunk(safeIndex);
        }, 70);
      }
    },
    [
      chunks,
      isPlaying,
      speakChunk,
      updateHighlight,
    ]
  );

  /* =======================================================
     +/- 10 SEC
  ======================================================= */

  const seekBySeconds = (
    seconds: number
  ) => {
    if (!chunks.length) return;

    const currentTime =
      chunks
        .slice(
          0,
          currentIndexRef.current
        )
        .reduce(
          (total, chunk) =>
            total +
            chunk.estimatedSeconds,
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
      i < chunks.length;
      i++
    ) {
      accumulated +=
        chunks[i].estimatedSeconds;

      if (accumulated >= targetTime) {
        targetIndex = i;
        break;
      }
    }

    seekToChunk(targetIndex);
  };

  /* =======================================================
     TIMELINE SEEK
  ======================================================= */

  const seekFromPointer = (
    clientX: number
  ) => {
    const element =
      progressRef.current;

    if (!element || !chunks.length) {
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
      (chunks.length - 1);

    seekToChunk(target);
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
        speakChunk(index);
      }, 70);
    }
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const statusText =
    currentChunk >= chunks.length
      ? "लेख पूरा हो गया"
      : isPlaying
        ? "अभी पढ़ा जा रहा है"
        : isPaused
          ? "ऑडियो रुका हुआ है"
          : "खबर सुनने के लिए चलाएं";

  if (!supported || !text) {
    return null;
  }

  /* =======================================================
     UI
  ======================================================= */

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
      {/* PREMIUM TOP LINE */}

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

      {/* ==================================================
          HEADER
      ================================================== */}

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

        {/* SETTINGS */}

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

      {/* ==================================================
          TIMELINE
      ================================================== */}

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
          {/* TRACK */}

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
            {/* RED PROGRESS */}

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

            {/* YELLOW CURRENT POSITION */}

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

        {/* TIME */}

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

      {/* ==================================================
          CONTROLS
      ================================================== */}

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
        {/* BACK 10 */}

        <button
          type="button"
          onClick={() =>
            seekBySeconds(-10)
          }
          className="
            group
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

          <span
            className="
              -mt-1
              text-[8px]
              font-bold
            "
          >
            10
          </span>
        </button>

        {/* PLAY */}

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

        {/* FORWARD 10 */}

        <button
          type="button"
          onClick={() =>
            seekBySeconds(10)
          }
          className="
            group
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

          <span
            className="
              -mt-1
              text-[8px]
              font-bold
            "
          >
            10
          </span>
        </button>
      </div>

      {/* ==================================================
          READING POSITION
      ================================================== */}

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
          {currentChunk < chunks.length
            ? `पढ़ा जा रहा है · ${Math.min(
                100,
                Math.round(progress)
              )}%`
            : "लेख पूरा हो गया"}
        </p>
      </div>

      {/* ==================================================
          SPEED SETTINGS
      ================================================== */}

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