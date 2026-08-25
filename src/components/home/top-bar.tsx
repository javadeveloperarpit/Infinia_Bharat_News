"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useLanguageStore,
} from "@/store/language-store";

import {
  MapPin,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

export default function TopBar() {
  const [date, setDate] = useState("");

  const {
    language,
    setLanguage,
  } = useLanguageStore();

  // ======================================================
  // TYPEWRITER
  // Only runs on desktop (lg+)
  // ======================================================

  const texts = [
    "देश की हर बड़ी खबर सबसे पहले",
    "सच के साथ, सबसे आगे",
    "भारत की आवाज़, INFINIA के साथ",
  ];

  const [isDesktop, setIsDesktop] = useState(false);
  const [typing, setTyping] = useState("");
  const [index, setIndex] = useState(0);
  const [char, setChar] = useState(0);

  // ======================================================
  // DATE
  // ======================================================

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();

      setDate(
        now.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      );
    };

    updateDate();

    const timer = setInterval(
      updateDate,
      60000
    );

    return () => clearInterval(timer);
  }, []);

  // ======================================================
  // DESKTOP DETECTION
  // ======================================================

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)"
    );

    const updateDesktop = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateDesktop();

    mediaQuery.addEventListener(
      "change",
      updateDesktop
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateDesktop
      );
    };
  }, []);

  // ======================================================
  // TYPEWRITER
  // Does NOT run on mobile/tablet
  // ======================================================

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const text = texts[index];

    if (char < text.length) {
      const timer = setTimeout(() => {
        setTyping(
          (prev) =>
            prev + text[char]
        );

        setChar(
          (prev) => prev + 1
        );
      }, 120);

      return () =>
        clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setTyping("");

      setChar(0);

      setIndex(
        (prev) =>
          (prev + 1) %
          texts.length
      );
    }, 2500);

    return () =>
      clearTimeout(timer);
  }, [
    isDesktop,
    char,
    index,
  ]);

  return (
    <div
      className="
        w-full
        bg-[#090909]
        border-b
        border-[#ECCA6D]/20
      "
    >
      <div
  className="
    container-news
    min-h-10
    flex
    items-center
    justify-between
    gap-2
    py-2
  "
>

        {/* ==========================================
            LEFT
        ========================================== */}

        <div
          className="
            flex
            items-center
            gap-2
            text-[11px]
            sm:text-xs
            text-white/70
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              max-w-[120px]
              sm:max-w-none
            "
          >
            <MapPin
              size={14}
              className="
                text-[#ECCA6D]
                shrink-0
              "
              aria-hidden="true"
            />

            <span className="truncate">
              India
            </span>
          </div>

          <span
            className="
              text-white/30
              hidden
              sm:block
            "
            aria-hidden="true"
          >
            |
          </span>

          <span>
            {date}
          </span>
        </div>

        {/* ==========================================
            CENTER
            Desktop only
        ========================================== */}

        <div
  className="
    hidden
    lg:flex
    items-center
    justify-center
    w-[320px]
    min-w-[320px]
    h-5
    overflow-hidden
    text-xs
    font-semibold
    tracking-wide
    text-[#ECCA6D]
  "
  aria-hidden="true"
>
  <span className="whitespace-nowrap">
    {typing}
    <span className="animate-pulse">|</span>
  </span>
</div>

        {/* ==========================================
            RIGHT
        ========================================== */}

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* LANGUAGE SWITCH */}

          <button
            type="button"
            onClick={() => {
              setLanguage(
                language === "hi"
                  ? "en"
                  : "hi"
              );
            }}
            aria-label={
              language === "hi"
                ? "Switch to English"
                : "हिंदी में बदलें"
            }
            title={
              language === "hi"
                ? "Switch to English"
                : "हिंदी में बदलें"
            }
            className="
              text-xs
              font-semibold
              text-[#ECCA6D]
              border
              border-[#ECCA6D]/30
              px-3
              py-1
              rounded-full
              hover:bg-[#ECCA6D]
              hover:text-black
              transition
            "
          >
            {language === "hi"
              ? "English"
              : "हिंदी"}
          </button>

          <div
            className="
              h-4
              w-px
              bg-white/20
              hidden
              md:block
            "
            aria-hidden="true"
          />

          {/* FACEBOOK */}

          <a
            className="
              text-white/60
              hover:text-[#ECCA6D]
              transition
            "
            href="https://www.facebook.com/InfiniaBharatNews"
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF
              size={18}
              aria-hidden="true"
            />
          </a>

          {/* X */}

          <a
            className="
              text-white/60
              hover:text-[#ECCA6D]
              transition
            "
            href="https://twitter.com/"
            aria-label="X"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter
              size={18}
              aria-hidden="true"
            />
          </a>

          {/* YOUTUBE */}

          <a
            className="
              text-white/60
              hover:text-[#ECCA6D]
              transition
            "
            href="https://www.youtube.com/@Infinia_Bharat_News"
            aria-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube
              size={18}
              aria-hidden="true"
            />
          </a>

          {/* INSTAGRAM */}

          <a
            className="
              text-white/60
              hover:text-[#ECCA6D]
              transition
            "
            href="https://www.instagram.com/infiniabharatnews?igsh=eHptM29kbGV3ZXlw"
            aria-label="Instagram"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              size={18}
              aria-hidden="true"
            />
          </a>

        </div>
      </div>
    </div>
  );
}