"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PageLoadingBar() {
  const pathname = usePathname();

  // IMPORTANT:
  // Initial page load par loader render NAHI hoga.
  const [loading, setLoading] = useState(false);

  // ==========================================
  // ROUTE CHANGE COMPLETE
  // ==========================================

  useEffect(() => {
    // Jaise hi new pathname React ko milta hai,
    // loader immediately remove.
    setLoading(false);
  }, [pathname]);

  // ==========================================
  // INTERNAL NAVIGATION
  // ==========================================

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Only normal left click
      if (event.button !== 0) return;

      // Ctrl / Cmd / Shift / Alt
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!target) return;

      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;

      // ------------------------------------------
      // External links
      // ------------------------------------------

      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // ------------------------------------------
      // Hash links
      // ------------------------------------------

      if (href.startsWith("#")) {
        return;
      }

      // ------------------------------------------
      // Download links
      // ------------------------------------------

      if (link.hasAttribute("download")) {
        return;
      }

      // ------------------------------------------
      // New tab
      // ------------------------------------------

      if (link.target === "_blank") {
        return;
      }

      // ------------------------------------------
      // Same page
      // ------------------------------------------

      const currentPath =
        window.location.pathname +
        window.location.search;

      if (
        href === currentPath ||
        href === window.location.pathname
      ) {
        return;
      }

      // ==========================================
      // SHOW LOADER
      // ==========================================

      setLoading(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // ==========================================
  // IMPORTANT
  // ==========================================

  if (!loading) {
    return null;
  }

  // ==========================================
  // LOADER
  // ==========================================

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
            src="/loader.webp"
            alt="Infinia Bharat News"
            width={100}
            height={100}
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
              left-0
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

