"use client";

import {
  useState,
  useRef
} from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Search,
  X,
  Radio,
} from "lucide-react";

export default function MainHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const logoClickCount = useRef(0);
const logoClickTimer = useRef<NodeJS.Timeout | null>(null);

function handleLogoClick() {
  logoClickCount.current += 1;

  if (logoClickTimer.current) {
    clearTimeout(logoClickTimer.current);
  }

  if (logoClickCount.current === 5) {
    logoClickCount.current = 0;

    window.location.href = "/admin";

    return;
  }

  logoClickTimer.current = setTimeout(() => {
    logoClickCount.current = 0;
  }, 2000);
}

  function handleSearch(e: React.KeyboardEvent) {
  if (e.key === "Enter") {
    submitSearch();
  }

  if (e.key === "Escape") {
    setSearchOpen(false);
  }
}
  function submitSearch() {
  const cleanedQuery = query.trim();

  if (!cleanedQuery) {
    return;
  }

  window.location.href = `/search?q=${encodeURIComponent(
    cleanedQuery
  )}`;
}

  return (
    <>
      {/* =========================================
          MAIN HEADER
      ========================================= */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
          overflow-x-clip
          bg-[#090909]/95
          backdrop-blur-xl
          border-b
          border-[#ECCA6D]/20
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[80px]
            w-full
            max-w-[1600px]
            items-center
            justify-between
            gap-3
            px-3
            sm:h-[76px]
            sm:px-5
            lg:h-[85px]
            lg:px-8
          "
        >
          {/* =====================================
              LOGO
          ===================================== */}

          <Link
            href="/"
  onClick={handleLogoClick}
            className="
              flex
              min-w-0
              shrink
              items-center
              outline-none
            "
          >
            <Image
              src="/logo.png"
              alt="INFINIA Bharat News"
              width={220}
              height={70}
              priority
              className="
                h-auto
                w-[125px]
                object-contain
                sm:w-[165px]
                lg:w-[220px]
              "
            />
          </Link>

          {/* =====================================
              ACTIONS
          ===================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              sm:gap-3
            "
          >
            {/* =================================
                SEARCH BUTTON
            ================================= */}

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-white/15
                bg-white/[0.04]
                text-white/70
                transition-all
                duration-300
                hover:border-[#ECCA6D]
                hover:text-[#ECCA6D]
                sm:w-auto
                sm:gap-2
                sm:px-4
              "
            >
              <Search size={18} />

              <span
                className="
                  hidden
                  text-sm
                  font-medium
                  sm:block
                "
              >
                Search
              </span>
            </button>

            {/* =================================
                LIVE TV
            ================================= */}

            <Link
              href="/live-tv"
              aria-label="Live TV"
              className="
                group
                relative
                flex
                h-10
                shrink-0
                items-center
                justify-center
                gap-2
                overflow-hidden
                rounded-xl
                border
                border-red-600/50
                bg-black
                px-3
                text-white
                transition-all
                duration-300
                hover:border-[#ECCA6D]
                sm:px-4
                lg:px-5
              "
            >
              {/* Hover Glow */}

              <span
                className="
                  absolute
                  inset-0
                  bg-red-600/10
                  opacity-0
                  transition
                  group-hover:opacity-100
                "
              />

              {/* Live Dot */}

              <span
                className="
                  relative
                  flex
                  h-2.5
                  w-2.5
                  shrink-0
                "
              >
                <span
                  className="
                    absolute
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-red-500
                    opacity-75
                  "
                />

                <span
                  className="
                    relative
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-red-500
                  "
                />
              </span>

              <Radio
                size={15}
                className="
                  relative
                  text-[#ECCA6D]
                "
              />

              <span
                className="
                  relative
                  text-xs
                  font-semibold
                  sm:text-sm
                "
              >
                LIVE TV
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================
          SEARCH OVERLAY
      ========================================= */}

      {searchOpen && (
  <div
    className="
      fixed
      inset-0
      z-[100]
      flex
      items-start
      justify-center
      bg-black/80
      px-3
      pt-[76px]
      backdrop-blur-xl
      sm:px-5
      sm:pt-28
    "
    onClick={() => setSearchOpen(false)}
  >
    <div
      className="
        w-full
        max-w-2xl
        overflow-hidden
        rounded-2xl
        border
        border-[#ECCA6D]/30
        bg-[#111]
        shadow-[0_20px_60px_rgba(0,0,0,0.5)]
      "
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      {/* SEARCH INPUT */}

      <div
        className="
          flex
          min-h-[58px]
          items-center
          gap-2
          px-3
          sm:min-h-[68px]
          sm:gap-4
          sm:px-5
        "
      >
        {/* SEARCH ICON */}

        <Search
          size={20}
          className="
            shrink-0
            text-[#ECCA6D]
            sm:h-[22px]
            sm:w-[22px]
          "
        />

        {/* INPUT */}

        <input
          autoFocus
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={handleSearch}
          placeholder="Search latest news..."
          enterKeyHint="search"
          className="
            min-w-0
            flex-1
            bg-transparent
            py-2
            text-[16px]
            text-white
            outline-none
            placeholder:text-zinc-500
            sm:text-lg
          "
        />

        

<button
  type="button"
  aria-label="Close search"
  onClick={() => {
    setQuery("");
    setSearchOpen(false);
  }}
  className="
    flex
    h-9
    w-9
    shrink-0
    items-center
    justify-center
    rounded-full
    text-zinc-300
    transition-all
    hover:bg-white/10
    hover:text-white
    active:scale-95
  "
>
  <X
    size={21}
    strokeWidth={2}
  />
</button>
      </div>

      {/* MOBILE SEARCH BUTTON */}

      <div
        className="
          border-t
          border-white/10
          p-3
          sm:hidden
        "
      >
        <button
          type="button"
          onClick={submitSearch}
          disabled={!query.trim()}
          className="
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-[#ECCA6D]
            text-sm
            font-bold
            text-black
            transition
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Search size={17} />

          Search News
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
}

