"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  useLanguageStore,
} from "@/store/language-store";



// ======================================================
// TYPES
// ======================================================

export interface BreakingNewsItem {
  id: string;

  text: string;

  textHi?: string;

  active: boolean;

  expiry?: string;

  createdAt?: string;

  updatedAt?: string;
}


// ======================================================
// FALLBACK ARTICLE TYPE
// ======================================================

export interface BreakingFallbackArticle {
  id: string;

  slug: string;

  title: string;

  titleHi?: string;

  createdAt?: string;

  publishedAt?: string;

  categoryId?: string;
}


interface BreakingStripProps {
  news: BreakingNewsItem[];

  /*
    Active breaking news khatam hone par
    latest articles yahan inject honge.
  */
  articles?: BreakingFallbackArticle[];
}


// ======================================================
// BREAKING STRIP
// ======================================================

export default function BreakingStrip({
  news: initialNews,
  articles = [],
}: BreakingStripProps) {

  const { language } =
    useLanguageStore();


  // ====================================================
  // ACTIVE BREAKING NEWS
  // ====================================================

  const activeBreakingNews =
    initialNews.filter(
      (item) => item.active
    );


  // ====================================================
  // FALLBACK LATEST ARTICLES
  // ====================================================

  const fallbackArticles =
    articles
      .filter(
        (article) =>
          article?.slug &&
          article?.title
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt ||
            b.publishedAt ||
            0
          ).getTime() -
          new Date(
            a.createdAt ||
            a.publishedAt ||
            0
          ).getTime()
      )
      .slice(0, 4);


  // ====================================================
  // INJECT FALLBACK
  // ====================================================

  /*
    Agar active breaking news available hai:
      → original breaking news

    Agar active breaking news nahi hai:
      → latest 4 articles

    UI / CSS / dimensions same rahenge.
  */

  const sourceNews: BreakingNewsItem[] =
    activeBreakingNews.length > 0
      ? activeBreakingNews
      : fallbackArticles.map(
          (article) => ({
            id: `fallback-${article.id}`,

            text:
              article.title,

            textHi:
              article.titleHi ||
              article.title,

            active: true,

            createdAt:
              article.createdAt ||
              article.publishedAt,
          })
        );


  // ====================================================
  // MARQUEE DATA
  // ====================================================

  const [news, setNews] =
    useState<BreakingNewsItem[]>(() => [
      ...sourceNews,
      ...sourceNews,
      ...sourceNews,
    ]);


  const [position, setPosition] =
    useState(0);


  const trackRef =
    useRef<HTMLDivElement>(null);


  // ====================================================
  // UPDATE WHEN SOURCE CHANGES
  // ====================================================

  useEffect(() => {

    setNews([
      ...sourceNews,
      ...sourceNews,
      ...sourceNews,
    ]);

    setPosition(0);

  }, [
    initialNews,
    articles,
    language,
  ]);


  // ====================================================
  // CONTINUOUS MOVEMENT
  // ====================================================

  useEffect(() => {

    const timer =
      setInterval(() => {

        setPosition(
          (prev) =>
            prev - 1
        );

      }, 20);

    return () =>
      clearInterval(timer);

  }, []);


  // ====================================================
  // RESET WITHOUT JUMP
  // ====================================================

  useEffect(() => {

    const track =
      trackRef.current;

    if (!track)
      return;


    const firstChild =
      track.firstElementChild as
        HTMLElement | null;


    if (
      firstChild &&
      Math.abs(position) >=
        firstChild.offsetWidth
    ) {

      setNews((prev) => {

        if (
          prev.length === 0
        ) {
          return prev;
        }

        return [
          ...prev.slice(1),
          prev[0],
        ];

      });

      setPosition(0);
    }

  }, [position]);


  // ====================================================
  // EMPTY
  // ====================================================

  if (
    news.length === 0
  ) {
    return null;
  }


  // ====================================================
  // UI
  // ====================================================

  return (

    <section
  translate="no"
  className="
    notranslate
    relative
    w-full
    bg-[#fffafa]
    border-y
    border-zinc-200
    overflow-visible
    shadow-sm
  "
>
  <div
    className="
      relative
      flex
      h-10
      sm:h-11
      md:h-12
      items-center
    "
  >
        {/* ==================================================
            LABEL
        ================================================== */}

        <div
  className="
    relative
    z-20
    h-full
    shrink-0
    flex
    items-center
    justify-center
    px-1
    md:px-2
    overflow-visible
  "
>
  <Image
    src={
      language === "hi"
        ? "/images/breaking news tag.webp"
        : "/images/breaking news tag2.webp"
    }
    alt="Breaking News"
    width={170}
    height={48}
    priority
    className="
  h-11
  md:h-12
  w-auto
  max-w-none
  -translate-y-1
  select-none
  pointer-events-none
"
  />
</div>


        {/* ==================================================
            STREAM
        ================================================== */}

        <div
          className="
            overflow-hidden
            flex-1
          "
        >

          <div
            ref={trackRef}
            style={{
              transform:
                `translateX(${position}px)`,
            }}
            className="
              flex
              items-center
              whitespace-nowrap
              will-change-transform
            "
          >

            {news.map(
              (
                item,
                index
              ) => {

                /*
                  Fallback article identify karne ke liye
                  id me fallback- prefix use kiya hai.
                */

                const isFallback =
                  item.id.startsWith(
                    "fallback-"
                  );


                const articleId =
                  isFallback
                    ? item.id.replace(
                        "fallback-",
                        ""
                      )
                    : null;


                const article =
                  articleId
                    ? fallbackArticles.find(
                        (a) =>
                          a.id ===
                          articleId
                      )
                    : null;


                const content =
                  language === "hi"
                    ? item.textHi ||
                      item.text
                    : item.text;


                return (

                  <div
                    key={
                      item.id +
                      index
                    }
                    className="
                      flex
                      items-center
                      px-8
                      font-semibold
                      text-[13px]
                      sm:text-sm
                      md:text-[15px]
                      tracking-normal
                      text-zinc-800
                      shrink-0
                    "
                  >

                    {article ? (

                      <Link
                        href={`/news/${article.slug}`}
                        className="
                          hover:text-red-700
                          transition-colors
                        "
                      >
                        {content}
                      </Link>

                    ) : (

                      content

                    )}


                    <span
                      className="
                        mx-6
                        h-4
                        w-px
                        bg-red-600
                      "
                    />

                  </div>

                );
              }
            )}

          </div>

        </div>

      </div>

    </section>

  );
}