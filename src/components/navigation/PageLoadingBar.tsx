"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PageLoadingBar() {
  const pathname = usePathname();

  // Initial page load ke liye true
  const [loading, setLoading] = useState(true);

  // ==========================================
  // INITIAL WEBSITE LOAD
  // ==========================================

  useEffect(() => {
    // Browser ko page render karne ka time
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // ==========================================
  // PAGE CHANGE
  // ==========================================

  useEffect(() => {
    if (!loading) {
      setLoading(false);
    }
  }, [pathname]);

  // ==========================================
  // INTERNAL NAVIGATION
  // ==========================================

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target =
        event.target as HTMLElement;

      const link =
        target.closest("a");

      if (!link) return;

      const href =
        link.getAttribute("href");

      if (!href) return;

      // External links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Hash links
      if (href.startsWith("#")) {
        return;
      }

      // New tab / modified click
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      // Same page
      if (href === pathname) {
        return;
      }

      // Start loader
      setLoading(true);
    };

    document.addEventListener(
      "click",
      handleClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleClick
      );
    };
  }, [pathname]);

  // ==========================================
  // HIDE AFTER NAVIGATION
  // ==========================================

  useEffect(() => {
    if (!loading) return;

    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!loading) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-white/20
        backdrop-blur-[4px]
        animate-loader-fade-in
      "
    >

      {/* ======================================
          LOGO LOADER
      ====================================== */}

      <div
        className="
          relative
          flex
          h-[170px]
          w-[170px]
          items-center
          justify-center
        "
      >

        {/* SOFT GLOW */}

        <div
          className="
            absolute
            inset-[25px]
            rounded-full
            bg-red-500/10
            blur-[35px]
            animate-logo-glow
          "
        />

        {/* CRYSTAL RING */}

        <div
          className="
            absolute
            inset-[5px]
            rounded-full
            border
            border-zinc-200/80
          "
        />

        <div
          className="
            absolute
            inset-[5px]
            rounded-full
            animate-crystal-ring
          "
        />

        {/* LOGO */}

        <div
          className="
            relative
            z-10
            flex
            h-[118px]
            w-[118px]
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-white
            bg-white/55
            shadow-[0_12px_50px_rgba(0,0,0,0.12)]
            backdrop-blur-xl
            animate-logo-breathe
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              inset-[2px]
              rounded-full
              border
              border-zinc-200/50
            "
          />

          <Image
            src="/loader.png"
            alt="Infinia Bharat News"
            width={100}
            height={100}
            priority
            className="
              relative
              z-10
              h-[92px]
              w-[92px]
              object-contain
              drop-shadow-[0_6px_12px_rgba(0,0,0,0.14)]
            "
          />

          {/* CRYSTAL SHINE */}

          <div
            className="
              pointer-events-none
              absolute
              -left-[100%]
              top-[-30%]
              z-20
              h-[180%]
              w-[35%]
              rotate-[25deg]
              bg-gradient-to-r
              from-transparent
              via-white/80
              to-transparent
              blur-[3px]
              animate-logo-shine
            "
          />

        </div>

      </div>
    </div>
  );
}