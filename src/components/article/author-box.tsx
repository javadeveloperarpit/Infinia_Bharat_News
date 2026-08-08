"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  BadgeCheck,
} from "lucide-react";

interface Props {
  article: any;
}

// ==========================================
// CREATE AUTHOR SLUG
// ==========================================

function createAuthorSlug(
  name: string
) {
  return name
    .toLowerCase()
    .trim()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

// ==========================================
// AUTHOR BOX
// ==========================================

export default function AuthorBox({
  article,
}: Props) {

  const ref =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    showFloating,
    setShowFloating,
  ] = useState(false);

  // ========================================
  // AUTHOR DATA
  // ========================================

  const author =
    article?.author || {};

  const name =
    author.name ||
    "INFINIA BHARAT NEWS";

  const email =
    author.email ||
    "news@infiniabharatnews.com";

  const photo =
    author.photo ||
    "";

  // ========================================
  // SLUG
  // ========================================
  //
  // First preference:
  // author.slug
  //
  // Fallback:
  // generate from author.name
  //
  // ========================================

  const slug =
    author.slug ||
    createAuthorSlug(name);

  const profileUrl =
    slug
      ? `/author/${slug}`
      : "";

  const initials =
    name
      .trim()
      .charAt(0)
      .toUpperCase();


  // ==========================================
  // STICKY AUTHOR
  // ==========================================

  useEffect(() => {

    if (!ref.current) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {

          setShowFloating(
            !entry.isIntersecting
          );

        },
        {
          threshold: 0.15,
        }
      );

    observer.observe(
      ref.current
    );

    return () => {
      observer.disconnect();
    };

  }, []);


  // ==========================================
  // AUTHOR AVATAR
  // ==========================================

  const Avatar = ({
    size = "normal",
  }: {
    size?: "normal" | "small";
  }) => {

    const sizeClass =
      size === "small"
        ? "w-10 h-10 text-sm"
        : "w-12 h-12 text-lg";

    return photo ? (

      <img
        src={photo}
        alt={name}
        className={`
          ${sizeClass}
          rounded-full
          object-cover
          ring-2
          ring-white
          shadow-sm
        `}
      />

    ) : (

      <div
        className={`
          ${sizeClass}
          rounded-full
          bg-red-600
          text-white
          flex
          items-center
          justify-center
          font-bold
          shadow-sm
        `}
      >
        {initials}
      </div>

    );
  };


  // ==========================================
  // NO PROFILE
  // ==========================================

  if (!profileUrl) {

    return (
      <div
        ref={ref}
        className="
          mt-10
          w-fit
          max-w-sm
          border
          border-zinc-200
          rounded-2xl
          bg-white
          shadow-sm
          p-4
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <Avatar />

          <div
            className="
              min-w-0
            "
          >

            <div
              className="
                flex
                items-center
                gap-1
              "
            >

              <h3
                className="
                  font-bold
                  text-sm
                  truncate
                  max-w-[180px]
                "
              >
                {name}
              </h3>

              <BadgeCheck
                size={15}
                className="
                  shrink-0
                  text-blue-500
                  fill-blue-500
                  stroke-white
                "
              />

            </div>

            <p
              className="
                text-xs
                text-zinc-500
                truncate
                max-w-[220px]
              "
            >
              {email}
            </p>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================
  // MAIN
  // ==========================================

  return (
    <>
      {/* =====================================
          FLOATING AUTHOR - DESKTOP
      ===================================== */}

      {showFloating && (

        <div
          className="
            hidden
            lg:block
            fixed
            right-8
            top-28
            z-50
          "
        >

          <Link
            href={profileUrl}
            className="
              flex
              items-center
              gap-3
              bg-white
              border
              border-zinc-200
              rounded-full
              px-2
              py-2
              pr-4
              shadow-xl
              hover:shadow-2xl
              hover:-translate-y-0.5
              transition-all
              duration-200
            "
          >

            {/* PHOTO */}

            <div
              className="
                relative
                shrink-0
              "
            >

              <Avatar
                size="small"
              />

              <span
                className="
                  absolute
                  -right-1
                  -bottom-1
                  bg-white
                  rounded-full
                  flex
                  items-center
                  justify-center
                "
              >

                <BadgeCheck
                  size={15}
                  className="
                    text-blue-500
                    fill-blue-500
                    stroke-white
                  "
                />

              </span>

            </div>


            {/* INFO */}

            <div
              className="
                min-w-0
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >

                <p
                  className="
                    text-xs
                    font-bold
                    text-zinc-950
                    max-w-[150px]
                    truncate
                  "
                >
                  {name}
                </p>

                <BadgeCheck
                  size={14}
                  className="
                    shrink-0
                    text-blue-500
                    fill-blue-500
                    stroke-white
                  "
                />

              </div>

              <p
                className="
                  text-[10px]
                  text-zinc-500
                "
              >
                View Author Profile
              </p>

            </div>

          </Link>

        </div>

      )}


      {/* =====================================
          FLOATING AUTHOR - MOBILE
      ===================================== */}

      {showFloating && (

        <div
          className="
            lg:hidden
            fixed
            top-[170px]
            right-10
            z-50
          "
        >

          <Link
            href={profileUrl}
            aria-label={`View ${name} profile`}
            className="
              relative
              block
            "
          >

            {photo ? (

              <img
                src={photo}
                alt={name}
                className="
                  w-11
                  h-11
                  rounded-full
                  object-cover
                  shadow-xl
                  ring-2
                  ring-white
                  hover:scale-105
                  transition
                "
              />

            ) : (

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-red-600
                  text-white
                  flex
                  items-center
                  justify-center
                  font-bold
                  shadow-xl
                  ring-2
                  ring-white
                "
              >
                {initials}
              </div>

            )}

            <span
              className="
                absolute
                -right-1
                -bottom-1
                bg-white
                rounded-full
                flex
                items-center
                justify-center
              "
            >

              <BadgeCheck
                size={16}
                className="
                  text-blue-500
                  fill-blue-500
                  stroke-white
                "
              />

            </span>

          </Link>

        </div>

      )}


      {/* =====================================
          ORIGINAL AUTHOR CARD
      ===================================== */}

      <div
        ref={ref}
        className="
          mt-10
          w-fit
          max-w-sm
          border
          border-zinc-200
          rounded-2xl
          bg-white
          shadow-sm
          p-4
          hover:shadow-md
          transition
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          {/* =================================
              PROFILE PHOTO
          ================================= */}

          <Link
            href={profileUrl}
            aria-label={`View ${name} profile`}
            className="
              relative
              shrink-0
              group
            "
          >

            <div
              className="
                group-hover:scale-105
                transition-transform
                duration-200
              "
            >

              <Avatar />

            </div>


            {/* VERIFIED BADGE */}

            <span
              className="
                absolute
                -right-1
                -bottom-1
                bg-white
                rounded-full
                flex
                items-center
                justify-center
              "
            >

              <BadgeCheck
                size={17}
                className="
                  text-blue-500
                  fill-blue-500
                  stroke-white
                "
              />

            </span>

          </Link>


          {/* =================================
              AUTHOR INFO
          ================================= */}

          <div
            className="
              min-w-0
            "
          >

            {/* NAME CLICKABLE */}

            <Link
              href={profileUrl}
              className="
                flex
                items-center
                gap-1
                font-bold
                text-sm
                text-zinc-950
                hover:text-red-600
                transition
              "
            >

              <span
                className="
                  truncate
                  max-w-[180px]
                "
              >
                {name}
              </span>

              <BadgeCheck
                size={15}
                className="
                  shrink-0
                  text-blue-500
                  fill-blue-500
                  stroke-white
                "
              />

            </Link>


            {/* EMAIL */}

            <p
              className="
                text-xs
                text-zinc-500
                truncate
                max-w-[220px]
              "
            >
              {email}
            </p>


            {/* VIEW PROFILE */}

            <Link
              href={profileUrl}
              className="
                inline-flex
                mt-1
                text-[11px]
                font-semibold
                text-red-600
                hover:text-red-700
                transition
              "
            >
              View Author Profile →
            </Link>

          </div>

        </div>

      </div>
    </>
  );
}