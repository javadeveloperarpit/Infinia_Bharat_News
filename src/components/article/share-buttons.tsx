"use client";

import { useState } from "react";

import {
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

import { Link2, Check } from "lucide-react";

interface Props {
  title: string;
  url: string;
}

export default function ShareButtons({
  title,
  url,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      // Hide toast after 2.2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  }

  return (
    <div
      className="
        sticky
        top-24
        z-30

        flex
        flex-row
        md:flex-col

        gap-3
        items-center

        w-fit

        relative
      "
    >
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="
          w-11
          h-11
          rounded-full
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          hover:scale-110
          transition-transform
          shadow-lg
        "
      >
        <FaFacebookF size={18} />
      </a>

      {/* X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="
          w-11
          h-11
          rounded-full
          bg-black
          text-white
          flex
          items-center
          justify-center
          hover:scale-110
          transition-transform
          shadow-lg
        "
      >
        <FaXTwitter size={18} />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${title} ${url}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="
          w-11
          h-11
          rounded-full
          bg-green-600
          text-white
          flex
          items-center
          justify-center
          hover:scale-110
          transition-transform
          shadow-lg
        "
      >
        <FaWhatsapp size={18} />
      </a>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        aria-label="Copy article link"
        className={`
          w-11
          h-11
          rounded-full
          text-white
          flex
          items-center
          justify-center
          transition-all
          duration-200
          shadow-lg

          ${
            copied
              ? "bg-[#C8102E] scale-110"
              : "bg-zinc-800 hover:scale-110"
          }
        `}
      >
        {copied ? (
          <Check
            size={19}
            strokeWidth={2.5}
            className="animate-[scale-in_0.2s_ease-out]"
          />
        ) : (
          <Link2 size={18} />
        )}
      </button>

      {/* =====================================================
          COPY SUCCESS TOAST
          ===================================================== */}
      {copied && (
        <div
          className="
            absolute
            left-1/2
            -translate-x-1/2

            md:left-14
            md:top-1/2
            md:-translate-y-1/2
            md:translate-x-0

            bottom-[-58px]
            md:bottom-auto

            whitespace-nowrap

            flex
            items-center
            gap-2

            rounded-xl
            bg-white
            dark:bg-zinc-900

            px-4
            py-2.5

            shadow-xl
            border
            border-zinc-200
            dark:border-zinc-700

            text-sm
            font-semibold
            text-zinc-800
            dark:text-white

            animate-[toast-in_0.25s_ease-out]

            pointer-events-none
          "
        >
          {/* Red check circle */}
          <span
            className="
              flex
              items-center
              justify-center

              w-6
              h-6

              rounded-full
              bg-[#C8102E]
              text-white
            "
          >
            <Check size={14} strokeWidth={3} />
          </span>

          <span>Link copied!</span>

          {/* Small arrow */}
          <span
            className="
              absolute
              -top-1.5
              left-1/2
              md:left-0
              md:top-1/2
              md:-translate-x-1/2
              md:-translate-y-1/2

              w-3
              h-3

              rotate-45

              bg-white
              dark:bg-zinc-900

              border-l
              border-t
              border-zinc-200
              dark:border-zinc-700

              md:border-l-0
              md:border-t-0
              md:border-b
              md:border-r
            "
          />
        </div>
      )}
    </div>
  );
}


