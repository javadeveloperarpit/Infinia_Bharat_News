"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import { createPortal } from "react-dom";

import {
  useLanguageStore,
} from "@/store/language-store";


interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: "active" | "inactive";
}


interface Props {
  categories: Category[];
  englishCategories: Category[];
}


export default function NavbarLanguage({
  categories,
  englishCategories,
}: Props) {

  const pathname =
    usePathname();

  const language =
    useLanguageStore(
      (state) => state.language
    );


  const [
    englishOpen,
    setEnglishOpen,
  ] = useState(false);


  const englishMenuRef =
    useRef<HTMLDivElement>(null);


  const englishButtonRef =
    useRef<HTMLButtonElement>(null);


  const [
    dropdownPosition,
    setDropdownPosition,
  ] = useState({
    top: 0,
    left: 0,
  });


  const [
    mounted,
    setMounted,
  ] = useState(false);


  // ============================================================
  // MOUNT
  // ============================================================

  useEffect(() => {

    setMounted(true);

  }, []);


  // ============================================================
  // ACTIVE ENGLISH CATEGORY
  // ============================================================

  const isEnglishCategory =
    pathname.startsWith(
      "/category/english-"
    );
const isReelsPage =
  pathname === "/reels" ||
  pathname.startsWith("/reels/");

  // ============================================================
  // UPDATE DROPDOWN POSITION
  // ============================================================

  function updateDropdownPosition() {

    if (!englishButtonRef.current) {
      return;
    }


    const rect =
      englishButtonRef.current.getBoundingClientRect();


    const dropdownWidth =
      Math.min(
        430,
        window.innerWidth - 20
      );


    let left =
      rect.left;


    // -----------------------------------------
    // MOBILE
    // -----------------------------------------

    if (window.innerWidth < 640) {

      left =
        (window.innerWidth -
          dropdownWidth) /
        2;

    }


    // -----------------------------------------
    // DESKTOP
    // -----------------------------------------

    else {

      if (
        left + dropdownWidth >
        window.innerWidth - 10
      ) {

        left =
          window.innerWidth -
          dropdownWidth -
          10;

      }


      if (left < 10) {
        left = 10;
      }

    }


    setDropdownPosition({
      top: rect.bottom + 8,
      left,
    });

  }


  // ============================================================
  // OPEN DROPDOWN
  // ============================================================

  function toggleEnglish() {

    if (!englishOpen) {

      updateDropdownPosition();

    }

    setEnglishOpen(
      (value) => !value
    );

  }


  // ============================================================
  // UPDATE ON SCROLL / RESIZE
  // ============================================================

  useEffect(() => {

    if (!englishOpen) {
      return;
    }


    function update() {

      updateDropdownPosition();

    }


    window.addEventListener(
      "resize",
      update
    );


    window.addEventListener(
      "scroll",
      update,
      true
    );


    return () => {

      window.removeEventListener(
        "resize",
        update
      );

      window.removeEventListener(
        "scroll",
        update,
        true
      );

    };

  }, [englishOpen]);


  // ============================================================
  // CLOSE OUTSIDE CLICK
  // ============================================================

  useEffect(() => {

    if (!englishOpen) {
      return;
    }


    function handleClickOutside(
      event: MouseEvent
    ) {

      const target =
        event.target as Node;


      const clickedButton =
        englishButtonRef.current?.contains(
          target
        );


      const clickedDropdown =
        englishMenuRef.current?.contains(
          target
        );


      if (
        !clickedButton &&
        !clickedDropdown
      ) {

        setEnglishOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, [englishOpen]);


  // ============================================================
  // ENGLISH DROPDOWN
  // ============================================================

  const englishDropdown =
    englishOpen &&
    mounted
      ? createPortal(

          <div
            ref={englishMenuRef}
            style={{
              position: "fixed",
              top:
                dropdownPosition.top,
              left:
                dropdownPosition.left,
            }}
            className="
              z-[999999]

              w-[calc(100vw-20px)]
              max-w-[430px]

              rounded-2xl

              border
              border-[#ECCA6D]/20

              bg-[#0d0d0d]

              shadow-[0_20px_70px_rgba(0,0,0,0.75)]

              p-3
              sm:p-4
            "
          >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
              className="
                mb-3
                px-2
                pb-3
                border-b
                border-white/10
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  className="
                    text-xl
                    leading-none
                    bg-gradient-to-r
                    from-[#ECCA6D]
                    via-white
                    to-[#ECCA6D]
                    bg-clip-text
                    text-transparent
                  "
                >
                  ✦
                </span>


                <div>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    English Articles
                  </p>


                  <p
                    className="
                      text-[11px]
                      text-white/45
                    "
                  >
                    Latest news in English
                  </p>

                </div>

              </div>

            </div>


            {/* ==================================================
                CATEGORY GRID
            ================================================== */}

            <div
              className="
                grid
                grid-cols-2
                gap-2

                max-h-[65vh]
                overflow-y-auto
              "
            >

              {englishCategories.map(
                (category) => (

                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    onClick={() =>
                      setEnglishOpen(false)
                    }
                    className="
                      group

                      rounded-xl

                      border
                      border-white/5

                      bg-white/[0.025]

                      px-3
                      py-3

                      transition-all
                      duration-200

                      hover:border-[#ECCA6D]/30
                      hover:bg-[#ECCA6D]/[0.06]
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-semibold
                          text-white/80

                          group-hover:text-[#ECCA6D]

                          transition
                        "
                      >

                        {category.name.replace(
                          /^English\s*/i,
                          ""
                        )}

                      </span>


                      <span
                        className="
                          shrink-0
                          text-white/20

                          group-hover:text-[#ECCA6D]

                          transition
                        "
                      >
                        →
                      </span>

                    </div>

                  </Link>

                )
              )}


            </div>

          </div>,

          document.body

        )
      : null;


  // ============================================================
  // NAVBAR
  // ============================================================

  return (

    <>

      <div
        className="
          relative

          flex
          items-center

          gap-6
          sm:gap-8

          h-12

          min-w-max
        "
      >

        {/* ======================================================
            HOME
        ====================================================== */}

        <Link
          href="/"
          className={`
            whitespace-nowrap

            text-sm
            font-semibold

            transition

            ${
              pathname === "/"
                ? "text-[#ECCA6D]"
                : "text-white/80 hover:text-[#ECCA6D]"
            }
          `}
        >

          {language === "hi"
            ? "होम"
            : "HOME"}

        </Link>


        {/* ======================================================
            ENGLISH
        ====================================================== */}

        {englishCategories.length > 0 && (

          <div
            className="
              h-full
              flex
              items-center
              shrink-0
            "
          >

            <button
              ref={englishButtonRef}
              type="button"
              onClick={toggleEnglish}
              className={`
                group

                flex
                items-center

                gap-1.5

                whitespace-nowrap

                text-sm
                font-semibold

                transition

                ${
                  isEnglishCategory
                    ? "text-[#ECCA6D]"
                    : "text-white/90 hover:text-[#ECCA6D]"
                }
              `}
            >

              {/* SPARK */}

              <span
                className="
                  text-base
                  leading-none

                  bg-gradient-to-r
                  from-[#ECCA6D]
                  via-white
                  to-[#ECCA6D]

                  bg-[length:200%_auto]

                  bg-clip-text
                  text-transparent
                "
              >
                ✦
              </span>


              <span>
                ENGLISH
              </span>


              {/* ARROW */}

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                className={`
                  transition-transform
                  duration-200

                  ${
                    englishOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              >

                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

              </svg>

            </button>

          </div>

        )}
{/* ======================================================
    REELS
====================================================== */}

<Link
  href="/reels"
  className={`
    group
    relative
    flex
    items-center
    gap-2
    whitespace-nowrap
    text-sm
    font-semibold
    transition-all
    duration-200
    ${
      isReelsPage
        ? "text-[#ECCA6D]"
        : "text-white/80 hover:text-[#ECCA6D]"
    }
  `}
>
  {/* REELS ICON */}
  <span
    className={`
      relative
      flex
      h-[24px]
      w-[24px]
      items-center
      justify-center
      rounded-full
      border
      transition-all
      duration-200
      ${
        isReelsPage
          ? "border-[#ECCA6D]/60 bg-[#ECCA6D]/10"
          : "border-white/20 bg-white/[0.04] group-hover:border-[#ECCA6D]/50 group-hover:bg-[#ECCA6D]/10"
      }
    `}
  >
    {/* Play */}
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className={`
        ml-[1px]
        transition-transform
        duration-200
        ${
          isReelsPage
            ? "text-[#ECCA6D]"
            : "text-white/80 group-hover:text-[#ECCA6D] group-hover:scale-110"
        }
      `}
    >
      <path
        d="M2.5 1.5L8 5L2.5 8.5V1.5Z"
        fill="currentColor"
      />
    </svg>

    {/* Live ring */}
    <span
      className="
        pointer-events-none
        absolute
        inset-[-3px]
        rounded-full
        border
        border-[#ECCA6D]/0
        transition-all
        duration-300
        group-hover:border-[#ECCA6D]/20
      "
    />
  </span>

  {/* TEXT */}
  <span className="relative">
    REELS

    {/* GOLD UNDERLINE */}
    <span
      className={`
        absolute
        -bottom-1
        left-0
        h-[1px]
        bg-gradient-to-r
        from-[#ECCA6D]
        to-transparent
        transition-all
        duration-300
        ${
          isReelsPage
            ? "w-full"
            : "w-0 group-hover:w-full"
        }
      `}
    />
  </span>
</Link>
{/* ======================================================
    VIDEOS
====================================================== */}

<Link
  href="/videos"
  className={`
    group
    relative
    flex
    items-center
    gap-2
    whitespace-nowrap
    text-sm
    font-semibold
    transition-all
    duration-200
    ${
      pathname === "/videos" || pathname.startsWith("/videos/")
        ? "text-[#ECCA6D]"
        : "text-white/80 hover:text-[#ECCA6D]"
    }
  `}
>
  {/* VIDEO ICON */}
  <span
    className={`
      relative
      flex
      h-[24px]
      w-[24px]
      items-center
      justify-center
      rounded-md
      border
      transition-all
      duration-200
      ${
        pathname === "/videos" || pathname.startsWith("/videos/")
          ? "border-[#ECCA6D]/60 bg-[#ECCA6D]/10"
          : "border-white/20 bg-white/[0.04] group-hover:border-[#ECCA6D]/50 group-hover:bg-[#ECCA6D]/10"
      }
    `}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="
        transition-transform
        duration-200
        group-hover:scale-110
      "
    >
      <rect
        x="3"
        y="5"
        width="14"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />

      <path
        d="M17 9L21 7V17L17 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M9 9L13 12L9 15V9Z"
        fill="currentColor"
      />
    </svg>

    <span
      className="
        pointer-events-none
        absolute
        inset-[-3px]
        rounded-md
        border
        border-[#ECCA6D]/0
        transition-all
        duration-300
        group-hover:border-[#ECCA6D]/20
      "
    />
  </span>

  {/* TEXT */}
  <span className="relative">
    VIDEOS

    <span
      className={`
        absolute
        -bottom-1
        left-0
        h-[1px]
        bg-gradient-to-r
        from-[#ECCA6D]
        to-transparent
        transition-all
        duration-300
        ${
          pathname === "/videos" || pathname.startsWith("/videos/")
            ? "w-full"
            : "w-0 group-hover:w-full"
        }
      `}
    />
  </span>

  {/* NEW / FEATURED BADGE */}
  <span
    className="
      relative
      -ml-1
      -mt-3
      rounded-full
      border
      border-[#ECCA6D]/30
      bg-[#ECCA6D]/10
      px-1.5
      py-[2px]
      text-[7px]
      font-black
      leading-none
      tracking-wide
      text-[#ECCA6D]
    "
  >
    HD
  </span>
</Link>

        {/* ======================================================
            NORMAL CATEGORIES
        ====================================================== */}

        {categories.map(
          (category) => (

            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`
                whitespace-nowrap

                text-sm
                font-semibold

                transition

                ${
                  pathname ===
                  `/category/${category.slug}`
                    ? "text-[#ECCA6D]"
                    : "text-white/80 hover:text-[#ECCA6D]"
                }
              `}
            >

              {language === "hi"
                ? category.nameHi
                : category.name}

            </Link>

          )
        )}

      </div>


      {/* ========================================================
          PORTAL DROPDOWN
      ======================================================== */}

      {englishDropdown}

    </>

  );

}