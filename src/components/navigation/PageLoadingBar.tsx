"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function PageLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  // =========================================================
  // ROUTE CHANGE COMPLETE
  // =========================================================

  useEffect(() => {
    // pathname change hote hi loader hata do
    setLoading(false);
  }, [pathname]);

  // =========================================================
  // BROWSER / PHONE BACK-FORWARD NAVIGATION
  // =========================================================

  useEffect(() => {
    const handlePopState = () => {
      // Browser back/forward par loader kabhi stuck na rahe
      setLoading(false);
    };

    const handlePageShow = () => {
      // BFCache se page restore hone par bhi loader remove
      setLoading(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setLoading(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // =========================================================
  // INTERNAL NAVIGATION
  // =========================================================

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0) return;

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

      // External links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // Hash
      if (href.startsWith("#")) {
        return;
      }

      // Downloads
      if (link.hasAttribute("download")) {
        return;
      }

      // New tab
      if (link.target === "_blank") {
        return;
      }

      // =====================================================
      // RESOLVE TARGET URL
      // =====================================================

      let targetUrl: URL;

      try {
        targetUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      // Different origin
      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      const currentUrl =
        window.location.pathname +
        window.location.search;

      const targetPath =
        targetUrl.pathname +
        targetUrl.search;

      // Same page
      if (targetPath === currentUrl) {
        return;
      }

      // =====================================================
      // SHOW LOADER
      // =====================================================

      setLoading(true);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // =========================================================
  // SAFETY TIMEOUT
  // =========================================================
  // Agar kisi unusual browser state mein navigation complete
  // event miss ho jaye, loader permanently stuck nahi hoga.

  useEffect(() => {
    if (!loading) return;

    const timeout = window.setTimeout(() => {
      setLoading(false);
    }, 15000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loading]);

  // =========================================================
  // LOADER
  // =========================================================

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