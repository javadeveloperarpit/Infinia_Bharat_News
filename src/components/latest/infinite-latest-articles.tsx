"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ============================================================
// TYPES
// ============================================================

export interface InfiniteLatestArticle {
  id: string;
  slug: string;

  title: string;
  description?: string;

  thumbnail?: string;

  category?: string;
  categoryHi?: string;
  categoryId?: string;

  createdAt?: string;
  categorySlug?: string;

  status?: string;
}

interface Category {
  id: string;
  name?: string;
  nameHi?: string;
  slug?: string;
  status?: string;
}

interface InfiniteLatestArticlesProps {
  articles?: InfiniteLatestArticle[];

  /**
   * Articles already displayed above this section.
   * These IDs will NEVER be shown again here.
   */
  excludeIds?: string[];

  /**
   * Categories from the server.
   * Used to resolve categoryId -> Hindi category name/slug.
   */
  categories?: Category[];
}

// ============================================================
// HELPERS
// ============================================================

function getTime(value?: string) {
  if (!value) return 0;

  const time = new Date(value).getTime();

  return Number.isNaN(time) ? 0 : time;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeArticle(
  raw: any
): InfiniteLatestArticle | null {
  if (!raw) return null;

  const id = String(
    raw.id ??
      raw._id ??
      raw.articleId ??
      ""
  );

  const slug = String(
    raw.slug ??
      raw.urlSlug ??
      ""
  );

  const title = String(
    raw.title ??
      raw.headline ??
      ""
  );

  if (!id || !slug || !title) {
    return null;
  }

  return {
    id,
    slug,

    title,

    description:
      raw.shortDescription ??
      raw.description ??
      raw.excerpt ??
      "",

    thumbnail:
      raw.thumbnail ??
      raw.image ??
      raw.featuredImage ??
      "/placeholder-news.jpg",

    category:
      raw.category ??
      raw.categoryName ??
      "",

    categoryHi:
      raw.categoryHi ??
      raw.categoryHindi ??
      "",

    categoryId:
      raw.categoryId
        ? String(raw.categoryId)
        : "",

    createdAt:
      raw.createdAt ??
      raw.publishedAt ??
      raw.date ??
      "",

    categorySlug:
      raw.categorySlug ??
      "",

    status:
      raw.status ??
      "published",
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function InfiniteLatestArticles({
  articles = [],
  excludeIds = [],
  categories = [],
}: InfiniteLatestArticlesProps) {

  // ==========================================================
  // SERVER-PROVIDED ARTICLES
  // ==========================================================

  const initialArticles = useMemo(() => {
    if (!Array.isArray(articles)) {
      return [];
    }

    return articles
      .map(normalizeArticle)
      .filter(
        (
          item
        ): item is InfiniteLatestArticle =>
          Boolean(item)
      );
  }, [articles]);

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    allArticles,
    setAllArticles,
  ] = useState<InfiniteLatestArticle[]>(
    initialArticles
  );

  const [
    loadingArticles,
    setLoadingArticles,
  ] = useState(true);

  const INITIAL_COUNT = 12;
  const LOAD_COUNT = 12;

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(INITIAL_COUNT);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  // ==========================================================
  // EXCLUDE ALREADY DISPLAYED ARTICLES
  // ==========================================================

  const excludedIdSet = useMemo(() => {
    return new Set(
      (excludeIds || []).map(String)
    );
  }, [excludeIds]);

  // ==========================================================
  // FETCH COMPLETE ARTICLES.JSON
  //
  // IMPORTANT:
  // This does NOT depend on getPublishedArticles()
  // and therefore is not limited to 20 articles.
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAllArticles() {
      try {
        setLoadingArticles(true);

        const response = await fetch(
          "/data/articles.json",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `articles.json failed: ${response.status}`
          );
        }

        const data = await response.json();

        const rawArticles = Array.isArray(data)
          ? data
          : Array.isArray(data?.articles)
            ? data.articles
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const normalized =
          rawArticles
            .map(normalizeArticle)
            .filter(
              (
                item: any
              ): item is InfiniteLatestArticle =>
                Boolean(item)
            );

        if (!cancelled) {
          setAllArticles(normalized);
        }
      } catch (error) {
        console.error(
          "Failed to load complete articles.json:",
          error
        );

        // Keep server-provided articles as fallback.
        if (!cancelled) {
          setAllArticles(
            initialArticles
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingArticles(false);
        }
      }
    }

    loadAllArticles();

    return () => {
      cancelled = true;
    };
  }, [initialArticles]);

  // ==========================================================
  // PREPARE COMPLETE LIST
  // ==========================================================

  const safeArticles = useMemo(() => {

    const unique = new Map<
      string,
      InfiniteLatestArticle
    >();

    for (const article of allArticles) {

      if (!article?.id) {
        continue;
      }

      // ------------------------------------------------------
      // NEVER SHOW ARTICLES ALREADY DISPLAYED ABOVE
      // ------------------------------------------------------

      if (
        excludedIdSet.has(
          String(article.id)
        )
      ) {
        continue;
      }

      // ------------------------------------------------------
      // ONLY PUBLISHED ARTICLES
      // ------------------------------------------------------

      if (
        article.status &&
        String(article.status).toLowerCase() !==
          "published"
      ) {
        continue;
      }

      // ------------------------------------------------------
      // REMOVE DUPLICATES
      // ------------------------------------------------------

      if (
        !unique.has(
          String(article.id)
        )
      ) {
        unique.set(
          String(article.id),
          article
        );
      }
    }

    return Array.from(unique.values()).sort(
      (a, b) =>
        getTime(b.createdAt) -
        getTime(a.createdAt)
    );

  }, [
    allArticles,
    excludedIdSet,
  ]);

  // ==========================================================
  // RESET VISIBLE COUNT WHEN DATA CHANGES
  // ==========================================================

  useEffect(() => {
    setVisibleCount(
      INITIAL_COUNT
    );
  }, [safeArticles.length]);

  // ==========================================================
  // VISIBLE ARTICLES
  // ==========================================================

  const visibleArticles = useMemo(
    () =>
      safeArticles.slice(
        0,
        visibleCount
      ),
    [
      safeArticles,
      visibleCount,
    ]
  );

  // ==========================================================
  // SENTINEL
  // ==========================================================

  const loadMoreRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================================
  // LOAD MORE
  // ==========================================================

  const loadMore = useCallback(() => {

    if (
      loadingMore ||
      loadingArticles
    ) {
      return;
    }

    if (
      visibleCount >=
      safeArticles.length
    ) {
      return;
    }

    setLoadingMore(true);

    window.setTimeout(() => {

      setVisibleCount(
        (current) =>
          Math.min(
            current + LOAD_COUNT,
            safeArticles.length
          )
      );

      setLoadingMore(false);

    }, 180);

  }, [
    loadingMore,
    loadingArticles,
    visibleCount,
    safeArticles.length,
  ]);

  // ==========================================================
  // INFINITE SCROLL
  // ==========================================================

  useEffect(() => {

    const element =
      loadMoreRef.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {

          const first =
            entries[0];

          if (
            first?.isIntersecting
          ) {
            loadMore();
          }

        },
        {
          root: null,
          rootMargin:
            "700px 0px",
          threshold: 0,
        }
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };

  }, [loadMore]);

  // ==========================================================
  // CATEGORY RESOLVER
  // ==========================================================

  const getCategory = useCallback(
    (
      article: InfiniteLatestArticle
    ) => {

      // ------------------------------------------------------
      // FIRST: CATEGORY ID
      // ------------------------------------------------------

      if (
        article.categoryId
      ) {

        const category =
          categories.find(
            (item) =>
              String(item.id) ===
              String(
                article.categoryId
              )
          );

        if (category) {

          return {
            name:
              category.nameHi ||
              category.name ||
              article.categoryHi ||
              article.category ||
              "समाचार",

            slug:
              category.slug || "",
          };
        }
      }

      // ------------------------------------------------------
      // SECOND: ARTICLE CATEGORY DATA
      // ------------------------------------------------------

      return {
        name:
          article.categoryHi ||
          article.category ||
          "समाचार",

        slug:
          article.categorySlug ||
          "",
      };

    },
    [categories]
  );

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (
    !loadingArticles &&
    safeArticles.length === 0
  ) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section
      className="
        mt-10
        md:mt-14
      "
    >

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          mb-4
          md:mb-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-2.5
            shrink-0
          "
        >

          <span
            className="
              block
              w-1.5
              h-7
              md:h-8
              bg-red-700
            "
          />

          <h2
            className="
              text-xl
              md:text-2xl
              font-black
              tracking-tight
              text-zinc-950
            "
          >
            और खबरें
          </h2>

        </div>

        <span
          className="
            h-px
            flex-1
            bg-zinc-300
          "
        />

        <span
          className="
            hidden
            sm:block
            shrink-0
            text-[10px]
            font-black
            text-zinc-400
            uppercase
            tracking-wider
          "
        >
          More News
        </span>

      </div>

      {/* ====================================================
          ARTICLES
      ==================================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-3
          md:gap-4
        "
      >

        {visibleArticles.map(
          (article) => {

            const category =
              getCategory(
                article
              );

            const categoryName =
              category.name;

            const categoryHref =
              category.slug
                ? `/category/${category.slug}`
                : "";

            return (
              <article
                key={article.id}
                className="
                  group
                  bg-white
                  border
                  border-zinc-200
                  overflow-hidden
                  hover:border-red-500
                  hover:shadow-[0_8px_25px_rgba(0,0,0,0.07)]
                  transition-all
                "
              >

                <Link
                  href={`/news/${article.slug}`}
                  className="
                    flex
                    gap-3
                    p-3
                    md:p-3.5
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      shrink-0
                      w-[110px]
                      h-[74px]
                      sm:w-[145px]
                      sm:h-[96px]
                      overflow-hidden
                      bg-zinc-100
                    "
                  >

                    <img
                      src={
                        article.thumbnail ||
                        "/placeholder-news.jpg"
                      }
                      alt={article.title}
                      loading="lazy"
                      decoding="async"
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-500
                        group-hover:scale-105
                      "
                    />

                  </div>

                  {/* CONTENT */}

                  <div
                    className="
                      min-w-0
                      flex-1
                      flex
                      flex-col
                    "
                  >

                    {/* CATEGORY */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        mb-1
                        min-w-0
                      "
                    >

                      <span
  className="
    inline-flex
    max-w-full
    text-[9px]
    md:text-[10px]
    font-black
    text-red-700
  "
>
  {categoryName}
</span>

                    </div>

                    {/* TITLE */}

                    <h3
                      className="
                        text-[13px]
                        sm:text-sm
                        md:text-[15px]
                        leading-[1.4]
                        font-black
                        text-zinc-950
                        line-clamp-3
                        group-hover:text-red-700
                        transition-colors
                      "
                    >
                      {article.title}
                    </h3>

                    {/* DATE */}

                    <div
                      className="
                        mt-auto
                        pt-1.5
                        flex
                        items-center
                        gap-2
                        text-[9px]
                        text-zinc-400
                      "
                    >

                      {formatDate(
                        article.createdAt
                      )}

                      {article.createdAt &&
                        formatTime(
                          article.createdAt
                        ) && (
                          <>
                            <span>
                              •
                            </span>

                            <span>
                              {formatTime(
                                article.createdAt
                              )}
                            </span>
                          </>
                        )}

                    </div>

                  </div>

                </Link>

              </article>
            );
          }
        )}

      </div>

      {/* ====================================================
          LOADING MORE
      ==================================================== */}

      {loadingMore && (
        <div
          className="
            flex
            justify-center
            items-center
            py-7
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-bold
              text-zinc-500
            "
          >

            <span
              className="
                w-4
                h-4
                rounded-full
                border-2
                border-zinc-300
                border-t-red-700
                animate-spin
              "
            />

            और खबरें लोड हो रही हैं...

          </div>
        </div>
      )}

      {/* ====================================================
          SENTINEL
      ==================================================== */}

      <div
        ref={loadMoreRef}
        className="
          h-12
          w-full
        "
        aria-hidden="true"
      />

      {/* ====================================================
          END
      ==================================================== */}

      {!loadingArticles &&
        !loadingMore &&
        safeArticles.length > 0 &&
        visibleCount >=
          safeArticles.length && (

          <div
            className="
              py-8
              text-center
            "
          >

            <div
              className="
                flex
                items-center
                justify-center
                gap-3
              "
            >

              <span
                className="
                  h-px
                  w-12
                  bg-zinc-300
                "
              />

              <span
                className="
                  text-[10px]
                  font-black
                  text-zinc-400
                  uppercase
                  tracking-wider
                "
              >
                सभी खबरें दिखाई जा चुकी हैं
              </span>

              <span
                className="
                  h-px
                  w-12
                  bg-zinc-300
                "
              />

            </div>

          </div>
        )}

    </section>
  );
}