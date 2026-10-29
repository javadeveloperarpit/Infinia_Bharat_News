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

/* =========================================================
   SAFE SPEECH HELPERS
   (Facebook / Instagram in-app browsers me TTS unreliable hai)
========================================================= */

function isSpeechSupported(): boolean {
  try {
    if (typeof window === "undefined") return false;

    const ua = navigator.userAgent || "";

    // FB / Instagram in-app browser: player hi mat dikhao
    if (/FBAN|FBAV|FB_IAB|FBIOS|Instagram/i.test(ua)) return false;

    return (
      !!window.speechSynthesis &&
      typeof window.speechSynthesis.getVoices === "function" &&
      typeof window.speechSynthesis.speak === "function" &&
      typeof window.SpeechSynthesisUtterance === "function"
    );
  } catch {
    return false;
  }
}

function getSynth(): SpeechSynthesis | null {
  try {
    if (typeof window === "undefined") return null;
    return window.speechSynthesis || null;
  } catch {
    return null;
  }
}

function safeCancel() {
  try {
    getSynth()?.cancel();
  } catch {}
}

/* =========================================================
   TEXT HELPERS
========================================================= */

function estimateDuration(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(MIN_BLOCK_SECONDS, (words / WORDS_PER_MINUTE) * 60);
}

function detectPrimaryLanguage(
  title: string,
  blocks: SpeechBlock[],
  fallback = "hi-IN"
) {
  const text = [title, ...blocks.map((b) => b.text)].join(" ").trim();

  if (!text) return fallback;

  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;

  if (devanagariCount > 0 && devanagariCount >= latinCount * 0.15) {
    return "hi-IN";
  }

  return "en-IN";
}

function normalizeForSpeech(text: string, language: string) {
  if (!text) return "";

  let normalized = text.replace(/\s+/g, " ").trim();

  normalized = normalized
    .replace(/([.!?।])([A-Za-z\u0900-\u097F])/g, "$1 $2")
    .replace(/([,;:])([A-Za-z\u0900-\u097F])/g, "$1 $2");

  if (language.startsWith("hi")) {
    normalized = normalized
      .replace(/\bAI\b/g, "ए आई")
      .replace(/\bEV\b/g, "ई वी")
      .replace(/\bSUV\b/g, "एस यू वी")
      .replace(/\bCEO\b/g, "सी ई ओ")
      .replace(/\bPM\b/g, "पी एम")
      .replace(/\bCM\b/g, "सी एम")
      .replace(/\bUP\b/g, "यू पी")
      .replace(/\bUS\b/g, "यू एस")
      .replace(/\bUK\b/g, "यू के")
      .replace(/\bNASA\b/g, "नासा")
      .replace(/\bISRO\b/g, "इसरो");
  }

  return normalized;
}

function getBestVoice(voices: SpeechSynthesisVoice[], language: string) {
  if (!voices.length) return undefined;

  const requested = language.toLowerCase();
  const base = requested.split("-")[0];

  const matching = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(base)
  );

  if (!matching.length) return undefined;

  const getScore = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    const voiceLanguage = voice.lang.toLowerCase();
    let score = 0;

    if (voiceLanguage === requested) score += 100;
    if (name.includes("natural")) score += 100;
    if (name.includes("neural")) score += 90;
    if (name.includes("online")) score += 80;
    if (name.includes("enhanced")) score += 70;
    if (name.includes("premium")) score += 65;
    if (name.includes("microsoft")) score += 60;
    if (name.includes("google")) score += 55;
    if (name.includes("india")) score += 50;
    if (voice.localService === false) score += 25;

    return score;
  };

  return [...matching].sort((a, b) => getScore(b) - getScore(a))[0];
}

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSpeechBlocks(html: string): SpeechBlock[] {
  if (!html) return [];

  const cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<video[\s\S]*?<\/video>/gi, "")
    .replace(/<audio[\s\S]*?<\/audio>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "");

  const blockRegex = /<(p|h2|h3|h4|blockquote|li)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const blocks: SpeechBlock[] = [];

  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const text = cleanText(match[2]);
    if (!text) continue;

    blocks.push({
      index: blocks.length,
      text,
      estimatedSeconds: estimateDuration(text),
    });
  }

  if (!blocks.length) {
    const text = cleanText(cleanHtml);

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

  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function ArticleAudioPlayer({
  title,
  content,
  language = "hi-IN",
}: ArticleAudioPlayerProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(-1);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Default FALSE: server render + unsupported browsers me kuch render nahi hoga
  const [supported, setSupported] = useState(false);

  const [isSeeking, setIsSeeking] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);

  const currentIndexRef = useRef(0);
  const speedRef = useRef(1);
  const stoppedRef = useRef(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const blocks = useMemo(() => extractSpeechBlocks(content || ""), [content]);

  const hasContent = Boolean(title?.trim()) || blocks.length > 0;

  const primaryLanguage = useMemo(
    () => detectPrimaryLanguage(title || "", blocks, language),
    [title, blocks, language]
  );

  const selectedVoice = useMemo(
    () => getBestVoice(voices, primaryLanguage),
    [voices, primaryLanguage]
  );

  const speechQueue = useMemo(() => {
    const queue: SpeechBlock[] = [];

    if (title?.trim()) {
      queue.push({
        index: -1,
        text: title.trim(),
        estimatedSeconds: estimateDuration(title.trim()),
      });
    }

    return [...queue, ...blocks];
  }, [title, blocks]);

  const totalSeconds = useMemo(
    () => speechQueue.reduce((t, item) => t + item.estimatedSeconds, 0),
    [speechQueue]
  );

  const elapsedSeconds = useMemo(
    () =>
      speechQueue
        .slice(0, currentQueueIndex)
        .reduce((t, item) => t + item.estimatedSeconds, 0),
    [speechQueue, currentQueueIndex]
  );

  const progress = useMemo(() => {
    if (!speechQueue.length) return 0;
    if (currentQueueIndex >= speechQueue.length) return 100;

    return Math.min(
      100,
      Math.max(
        0,
        (currentQueueIndex / Math.max(1, speechQueue.length - 1)) * 100
      )
    );
  }, [currentQueueIndex, speechQueue.length]);

  /* ---------- speed ref ---------- */

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  /* ---------- support (client only, safe) ---------- */

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  /* ---------- load voices (safe) ---------- */

  useEffect(() => {
    if (!supported) return;

    const synth = getSynth();
    if (!synth) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        setVoices(synth.getVoices());
      } catch {
        setSupported(false);
      }
    };

    loadVoices();

    try {
      synth.onvoiceschanged = loadVoices;
    } catch {}

    return () => {
      try {
        synth.onvoiceschanged = null;
      } catch {}
    };
  }, [supported]);

  /* ---------- cleanup (safe) ---------- */

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      safeCancel();
    };
  }, []);

  /* ---------- highlight ---------- */

  const updateHighlight = useCallback((index: number) => {
    if (typeof window === "undefined") return;

    setCurrentBlock(index);

    try {
      window.dispatchEvent(
        new CustomEvent("article-audio-progress", { detail: { index } })
      );
    } catch {}
  }, []);

  /* ---------- speak ---------- */

  const speakQueueItem = useCallback(
    (queueIndex: number) => {
      const synth = getSynth();

      if (!supported || !synth || !speechQueue.length) return;

      if (queueIndex >= speechQueue.length) {
        setIsPlaying(false);
        setIsPaused(false);
        currentIndexRef.current = speechQueue.length;
        setCurrentQueueIndex(speechQueue.length);
        updateHighlight(-1);
        return;
      }

      try {
        const item = speechQueue[queueIndex];

        currentIndexRef.current = queueIndex;
        setCurrentQueueIndex(queueIndex);
        updateHighlight(item.index);

        const utterance = new SpeechSynthesisUtterance(
          normalizeForSpeech(item.text, primaryLanguage)
        );

        utterance.rate = speedRef.current;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          utterance.lang = primaryLanguage;
        }

        utterance.onstart = () => {
          if (stoppedRef.current) return;
          setIsPlaying(true);
          setIsPaused(false);
          updateHighlight(item.index);
        };

        utterance.onend = () => {
          if (stoppedRef.current) return;

          const next = queueIndex + 1;

          if (next < speechQueue.length) {
            speakQueueItem(next);
          } else {
            setIsPlaying(false);
            setIsPaused(false);
            currentIndexRef.current = speechQueue.length;
            setCurrentQueueIndex(speechQueue.length);
            updateHighlight(-1);
          }
        };

        utterance.onerror = (event) => {
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

        if (synth.speaking) synth.cancel();

        synth.speak(utterance);
      } catch {
        setIsPlaying(false);
        setIsPaused(false);
      }
    },
    [primaryLanguage, selectedVoice, speechQueue, supported, updateHighlight]
  );

  /* ---------- play ---------- */

  const handlePlay = useCallback(() => {
    const synth = getSynth();

    if (!supported || !synth || !speechQueue.length) return;

    stoppedRef.current = false;

    try {
      if (isPaused && synth.paused) {
        synth.resume();
        setIsPaused(false);
        setIsPlaying(true);
        return;
      }

      if (synth.speaking) return;

      let queueIndex = currentIndexRef.current;

      if (queueIndex >= speechQueue.length) {
        queueIndex = 0;
        currentIndexRef.current = 0;
        setCurrentQueueIndex(0);
      }

      speakQueueItem(queueIndex);
    } catch {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isPaused, speakQueueItem, speechQueue.length, supported]);

  /* ---------- pause ---------- */

  const handlePause = () => {
    const synth = getSynth();

    if (!supported || !synth || !synth.speaking) return;

    try {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
    } catch {}
  };

  /* ---------- seek ---------- */

  const seekToQueueIndex = useCallback(
    (queueIndex: number, shouldPlay = isPlaying) => {
      if (!speechQueue.length) return;

      const safeIndex = Math.max(
        0,
        Math.min(speechQueue.length - 1, Math.round(queueIndex))
      );

      currentIndexRef.current = safeIndex;
      setCurrentQueueIndex(safeIndex);

      const item = speechQueue[safeIndex];

      stoppedRef.current = true;
      safeCancel();
      stoppedRef.current = false;

      updateHighlight(item.index);

      if (shouldPlay) {
        setTimeout(() => speakQueueItem(safeIndex), 80);
      } else {
        setIsPlaying(false);
        setIsPaused(false);
      }
    },
    [isPlaying, speakQueueItem, speechQueue, updateHighlight]
  );

  const seekBySeconds = (seconds: number) => {
    if (!speechQueue.length) return;

    const currentTime = speechQueue
      .slice(0, currentIndexRef.current)
      .reduce((t, item) => t + item.estimatedSeconds, 0);

    const targetTime = Math.max(
      0,
      Math.min(totalSeconds, currentTime + seconds)
    );

    let accumulated = 0;
    let targetIndex = 0;

    for (let i = 0; i < speechQueue.length; i++) {
      accumulated += speechQueue[i].estimatedSeconds;

      if (accumulated >= targetTime) {
        targetIndex = i;
        break;
      }
    }

    seekToQueueIndex(targetIndex);
  };

  const seekFromPointer = (clientX: number) => {
    const element = progressRef.current;

    if (!element || !speechQueue.length) return;

    const rect = element.getBoundingClientRect();

    const ratio = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );

    seekToQueueIndex(ratio * Math.max(0, speechQueue.length - 1));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsSeeking(true);

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {}

    seekFromPointer(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    seekFromPointer(event.clientX);
  };

  const handlePointerUp = () => setIsSeeking(false);

  /* ---------- speed ---------- */

  const changeSpeed = (newSpeed: number) => {
    const safeSpeed = Math.min(1.5, Math.max(0.75, newSpeed));

    setSpeed(safeSpeed);
    speedRef.current = safeSpeed;

    const synth = getSynth();

    if (isPlaying || synth?.speaking) {
      const index = currentIndexRef.current;

      stoppedRef.current = true;
      safeCancel();
      stoppedRef.current = false;

      setTimeout(() => speakQueueItem(index), 80);
    }
  };

  /* ---------- status ---------- */

  const finished = currentQueueIndex >= speechQueue.length;

  const statusText = finished
    ? "लेख पूरा हो गया"
    : isPlaying
    ? "अभी पढ़ा जा रहा है"
    : isPaused
    ? "ऑडियो रुका हुआ है"
    : "खबर सुनने के लिए चलाएं";

  if (!supported || !hasContent || !speechQueue.length) {
    return null;
  }

  return (
    <section
      aria-label="Article audio player"
      className="relative my-8 w-full overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.07)]"
    >
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-red-600 via-yellow-400 to-red-600" />

      <div className="flex items-center justify-between gap-4 px-4 pb-3 pt-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all duration-300 ${
              isPlaying
                ? "bg-red-600 text-white shadow-[0_5px_18px_rgba(200,16,46,0.25)]"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Volume2 size={20} strokeWidth={2} />

            {isPlaying && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-yellow-400 ring-2 ring-white" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold tracking-tight text-zinc-900 sm:text-[15px]">
                खबर सुनें
              </h3>

              <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-zinc-500 sm:inline-flex">
                AUDIO
              </span>
            </div>

            <p className="mt-0.5 truncate text-[11px] font-medium text-zinc-500 sm:text-xs">
              {statusText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSettings((value) => !value)}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-bold text-zinc-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Settings2 size={14} />
          <span>{speed}x</span>
          <ChevronDown
            size={13}
            className={`transition-transform ${
              showSettings ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div className="px-4 sm:px-6">
        <div
          ref={progressRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="group relative flex h-7 w-full cursor-pointer touch-none items-center"
          aria-label="Audio timeline"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="relative h-1.5 w-full overflow-visible rounded-full bg-zinc-100">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-red-600 transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />

            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>
        </div>

        <div className="-mt-1 flex items-center justify-between text-[10px] font-semibold tabular-nums text-zinc-400">
          <span>{formatTime(elapsedSeconds)}</span>
          <span>{formatTime(totalSeconds)}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 px-4 py-4 sm:gap-7 sm:px-6 sm:py-5">
        <button
          type="button"
          aria-label="10 seconds back"
          onClick={() => seekBySeconds(-10)}
          className="flex h-10 w-10 flex-col items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-90"
        >
          <RotateCcw size={18} />
          <span className="-mt-1 text-[8px] font-bold">10</span>
        </button>

        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={isPlaying ? handlePause : handlePlay}
          className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full bg-red-600 text-white shadow-[0_8px_24px_rgba(200,16,46,0.28)] transition-all duration-200 hover:scale-[1.04] hover:bg-red-700 active:scale-95"
        >
          {isPlaying ? (
            <Pause size={23} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <button
          type="button"
          aria-label="10 seconds forward"
          onClick={() => seekBySeconds(10)}
          className="flex h-10 w-10 flex-col items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-90"
        >
          <RotateCw size={18} />
          <span className="-mt-1 text-[8px] font-bold">10</span>
        </button>
      </div>

      <div className="border-t border-zinc-100 bg-zinc-50/70 px-4 py-2.5 text-center sm:px-6">
        <p className="text-[10px] font-semibold text-zinc-500 sm:text-[11px]">
          {currentBlock >= 0
            ? `पढ़ा जा रहा है · ${Math.round(progress)}%`
            : finished
            ? "लेख पूरा हो गया"
            : "खबर सुनने के लिए चलाएं"}
        </p>
      </div>

      {showSettings && (
        <div className="border-t border-zinc-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Speed
            </span>

            {[0.75, 1, 1.25, 1.5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => changeSpeed(value)}
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                  speed === value
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {value}x
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}