import type { Metadata } from "next";
import Link from "next/link";

import {
  getPublishedArticles,
} from "@/services/public/article.public.service";

import {
  getAllPublishedVideos,
} from "@/services/public/video.public.service";

import {
  getCategories,
} from "@/services/public/category.public.service";

import InfiniteLatestArticles from "@/components/latest/infinite-latest-articles";

// ============================================================
// SEO
// ============================================================

export const metadata: Metadata = {
  title: "Latest News | Infinia Bharat News",

  description:
    "भारत और दुनिया की ताज़ा खबरें पढ़ें। राजनीति, बिजनेस, खेल, मनोरंजन, टेक्नोलॉजी और देश-दुनिया की नवीनतम खबरें Infinia Bharat News पर।",

  alternates: {
    canonical: "/latest",
  },

  openGraph: {
    title: "Latest News | Infinia Bharat News",

    description:
      "भारत और दुनिया की ताज़ा खबरें और ब्रेकिंग न्यूज़ पढ़ें।",

    url: "/latest",

    type: "website",
  },
};

// ============================================================
// TYPES
// ============================================================

type LatestItem =
  | {
      type: "article";
      id: string;
      slug: string;
      title: string;
      description: string;
      thumbnail: string;
      category?: string;
      categoryHi?: string;
      categoryId?: string;
      createdAt?: string;
    }
  | {
      type: "video";
      id: string;
      title: string;
      description: string;
      thumbnail: string;
      youtubeUrl: string;
      category?: string;
      categoryHi?: string;
      categoryId?: string;
      createdAt?: string;
    };

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

// ============================================================
// PAGE
// ============================================================

export default async function LatestPage() {
  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const [
    articles,
    videos,
    categories,
  ] = await Promise.all([
    getPublishedArticles(),
    getAllPublishedVideos(),
    getCategories(),
  ]);

  const safeArticles = Array.isArray(articles)
    ? articles
    : [];

  const safeVideos = Array.isArray(videos)
    ? videos.filter(
        (video) =>
          video?.status === "published"
      )
    : [];

  const safeCategories = Array.isArray(categories)
    ? categories
    : [];

  // ==========================================================
  // COMBINE ARTICLES + VIDEOS
  // ==========================================================

  const latestItems: LatestItem[] = [
    ...safeArticles.map((article) => ({
      type: "article" as const,

      id: String(article.id),

      slug: article.slug || "",

      title: article.title || "",

      description:
        article.shortDescription || "",

      thumbnail:
        article.thumbnail ||
        "/placeholder-news.jpg",

      category:
        article.category || "",

      categoryHi:
        article.categoryHi || "",

      categoryId:
        article.categoryId || "",

      createdAt:
        article.createdAt,
    })),

    ...safeVideos.map((video) => ({
      type: "video" as const,

      id: String(video.id),

      title: video.title || "",

      description:
        video.description || "",

      thumbnail:
        video.thumbnail ||
        "/placeholder-news.jpg",

      youtubeUrl:
        video.youtubeUrl || "",

      category:
        video.category || "",

      categoryHi:
        video.categoryHi || "",

      categoryId:
        video.categoryId || "",

      createdAt:
        video.createdAt,
    })),
  ];

  // ==========================================================
  // SORT LATEST → OLDEST
  // ==========================================================

  latestItems.sort(
    (a, b) =>
      getTime(b.createdAt) -
      getTime(a.createdAt)
  );

  // ==========================================================
  // TOP SECTIONS
  // ==========================================================

  const mainItem =
    latestItems[0];

  const superfastItems =
    latestItems.slice(1, 6);

  const stripItems =
    latestItems.slice(6, 14);

  // ==========================================================
  // ARTICLES ALREADY SHOWN ABOVE
  // ==========================================================

  const alreadyShownArticleIds = new Set(
    latestItems
      .slice(0, 14)
      .filter(
        (item) =>
          item.type === "article"
      )
      .map(
        (item) =>
          String(item.id)
      )
  );

  // ==========================================================
  // INFINITE ARTICLES
  //
  // IMPORTANT:
  // Top 14 mixed news section में जो articles
  // already दिख चुके हैं उन्हें remove कर दिया गया है.
  // ==========================================================

  const latestArticlesForInfinite =
    safeArticles
      .map((article) => {
        const category =
          safeCategories.find(
            (item) =>
              String(item.id) ===
              String(article.categoryId)
          );

        return {
          id: String(article.id),

          slug:
            article.slug || "",

          title:
            article.title || "",

          description:
            article.shortDescription ||
            "",

          thumbnail:
            article.thumbnail ||
            "/placeholder-news.jpg",

          category:
            article.category ||
            "",

          categoryHi:
            article.categoryHi ||
            "",

          categoryId:
            article.categoryId ||
            "",

          categorySlug:
            category?.slug ||
            "",

          createdAt:
            article.createdAt,
        };
      })

      .sort(
        (a, b) =>
          getTime(b.createdAt) -
          getTime(a.createdAt)
      )

      .filter(
        (article) =>
          !alreadyShownArticleIds.has(
            String(article.id)
          )
      );

  // ==========================================================
  // LATEST VIDEOS
  // ==========================================================

  const latestVideos =
  safeVideos
    .map((video) => {
      const realCategory =
        safeCategories.find(
          (category) =>
            String(category.id) ===
            String(video.categoryId)
        );

      return {
        id: String(video.id),

        title:
          video.title || "",

        description:
          video.description || "",

        thumbnail:
          video.thumbnail ||
          "/fallback.webp",

        category:
          realCategory?.name ||
          video.category ||
          "",

        categoryHi:
          realCategory?.nameHi ||
          video.categoryHi ||
          "",

        categoryId:
          video.categoryId || "",

        categorySlug:
          realCategory?.slug ||
          "",

        createdAt:
          video.createdAt,

        youtubeUrl:
          video.youtubeUrl || "",
      };
    })
    .sort(
      (a, b) =>
        getTime(b.createdAt) -
        getTime(a.createdAt)
    )
    .slice(0, 8);

  // ==========================================================
  // CATEGORY NAME
  // ==========================================================

  function getCategoryName(
  item: LatestItem
) {
  // सबसे पहले categoryId से real category खोजो
  const realCategory =
    safeCategories.find(
      (category) =>
        String(category.id) ===
        String(item.categoryId)
    );

  // अगर real category मिल गई तो वही दिखेगी
  if (realCategory) {
    return (
      realCategory.nameHi?.trim() ||
      realCategory.name?.trim() ||
      item.categoryHi?.trim() ||
      item.category?.trim() ||
      (item.type === "video"
        ? "वीडियो"
        : "समाचार")
    );
  }

  // पुराने data / missing categoryId के लिए fallback
  return (
    item.categoryHi?.trim() ||
    item.category?.trim() ||
    (item.type === "video"
      ? "वीडियो"
      : "समाचार")
  );
}

  // ==========================================================
  // CATEGORY SLUG
  // ==========================================================

  function getCategorySlug(
    categoryId?: string
  ) {
    if (!categoryId) {
      return "";
    }

    const category =
      safeCategories.find(
        (item) =>
          String(item.id) ===
          String(categoryId)
      );

    return category?.slug || "";
  }

  // ==========================================================
  // ITEM URL
  // ==========================================================

  function getItemHref(
    item: LatestItem
  ) {
    if (
      item.type === "article"
    ) {
      return `/news/${item.slug}`;
    }

    return `/video/${item.id}`;
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main
      className="
        min-h-screen
        bg-[#f5f5f5]
        overflow-x-hidden
      "
    >
      <section
        className="
          container-news
          pt-5
          pb-10
          md:pt-7
          md:pb-14
        "
      >
        {/* ====================================================
            PAGE HEADING
        ===================================================== */}

        <div
          className="
            mb-5
            md:mb-7
            flex
            items-end
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <span
                className="
                  block
                  w-1.5
                  h-8
                  md:h-10
                  bg-red-700
                "
              />

              <h1
                className="
                  text-3xl
                  md:text-5xl
                  font-black
                  tracking-tight
                  text-zinc-950
                "
              >
                Latest News
              </h1>
            </div>

            <p
              className="
                mt-1.5
                ml-[18px]
                md:ml-[21px]
                text-xs
                md:text-sm
                text-zinc-500
              "
            >
              भारत और दुनिया की ताज़ा खबरें
            </p>
          </div>

          <div
            className="
              hidden
              sm:flex
              items-center
              gap-2
              text-xs
              font-bold
              text-zinc-500
            "
          >
            <span
              className="
                w-2
                h-2
                rounded-full
                bg-red-700
              "
            />

            LIVE UPDATES
          </div>
        </div>

        {/* ====================================================
            MAIN GRID
        ===================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[175px_minmax(0,1fr)]
            gap-5
            xl:gap-7
            items-start
          "
        >
          {/* ==================================================
              CATEGORY RAIL
          =================================================== */}

          <aside
            className="
              hidden
              lg:block
              sticky
              top-24
              bg-white
              border
              border-zinc-200
            "
          >
            <div
              className="
                px-4
                py-3
                bg-zinc-950
                text-white
                text-sm
                font-black
                border-b-4
                border-red-700
              "
            >
              कैटेगरी
            </div>

            <div>
              <Link
                href="/latest"
                className="
                  flex
                  items-center
                  justify-between
                  gap-2
                  px-3
                  py-2.5
                  bg-red-50
                  text-red-700
                  border-b
                  border-zinc-100
                  text-[13px]
                  font-black
                "
              >
                <span>
                  लेटेस्ट
                </span>

                <span>
                  ›
                </span>
              </Link>

              {safeCategories.map(
                (category) => (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="
                      group
                      flex
                      items-center
                      justify-between
                      gap-2
                      px-3
                      py-2.5
                      border-b
                      border-zinc-100
                      text-zinc-700
                      hover:bg-red-50
                      hover:text-red-700
                      transition-colors
                      text-[13px]
                      font-bold
                    "
                  >
                    <span className="truncate">
                      {category.nameHi ||
                        category.name}
                    </span>

                    <span
                      className="
                        shrink-0
                        text-zinc-300
                        group-hover:text-red-500
                      "
                    >
                      ›
                    </span>
                  </Link>
                )
              )}
            </div>
          </aside>

          {/* ==================================================
              NEWS CONTENT
          =================================================== */}

          <div className="min-w-0">
            {/* ================================================
                MAIN STORY + SUPERFAST
            ================================================= */}

            {mainItem && (
              <div
                className="
                  grid
                  grid-cols-1
                  xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)]
                  gap-5
                  items-stretch
                "
              >
                {/* MAIN STORY */}

                <Link
                  href={getItemHref(
                    mainItem
                  )}
                  className="
                    group
                    block
                    bg-white
                    border
                    border-zinc-200
                    overflow-hidden
                    shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_8px_25px_rgba(0,0,0,0.09)]
                    transition-shadow
                  "
                >
                  <div
                    className="
                      relative
                      w-full
                      aspect-[16/9]
                      sm:aspect-[16/8.8]
                      bg-zinc-200
                      overflow-hidden
                    "
                  >
                    <img
                      src={
                        mainItem.thumbnail
                      }
                      alt={mainItem.title}
                      className="
                        absolute
                        inset-0
                        w-full
                        h-full
                        object-cover
                        transition-transform
                        duration-700
                        ease-out
                        group-hover:scale-[1.035]
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-black/90
                        via-black/20
                        to-transparent
                      "
                    />

                    {mainItem.type ===
                      "video" && (
                      <span
                        className="
                          absolute
                          left-4
                          top-4
                          flex
                          items-center
                          justify-center
                          w-11
                          h-11
                          rounded-full
                          bg-red-700
                          text-white
                          text-sm
                          shadow-xl
                        "
                      >
                        ▶
                      </span>
                    )}

                    <div
                      className="
                        absolute
                        left-4
                        right-4
                        bottom-4
                        md:left-5
                        md:right-5
                        md:bottom-5
                      "
                    >
                      <span
                        className="
                          inline-flex
                          items-center
                          bg-red-700
                          text-white
                          px-2.5
                          py-1
                          mb-2
                          text-[10px]
                          md:text-[11px]
                          font-black
                        "
                      >
                        {getCategoryName(
                          mainItem
                        )}
                      </span>

                      <h2
                        className="
                          max-w-4xl
                          text-xl
                          sm:text-2xl
                          md:text-3xl
                          xl:text-[32px]
                          leading-[1.16]
                          font-black
                          text-white
                          line-clamp-3
                        "
                      >
                        {mainItem.title}
                      </h2>
                    </div>
                  </div>

                  <div
                    className="
                      px-4
                      py-3.5
                      md:px-5
                      md:py-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        md:text-[15px]
                        leading-6
                        text-zinc-600
                        line-clamp-2
                      "
                    >
                      {mainItem.description}
                    </p>

                    <div
                      className="
                        mt-2.5
                        flex
                        items-center
                        gap-2
                        text-[10px]
                        md:text-[11px]
                        text-zinc-400
                      "
                    >
                      <span>
                        {formatDate(
                          mainItem.createdAt
                        )}
                      </span>

                      {mainItem.createdAt &&
                        formatTime(
                          mainItem.createdAt
                        ) && (
                          <>
                            <span>•</span>

                            <span>
                              {formatTime(
                                mainItem.createdAt
                              )}
                            </span>
                          </>
                        )}
                    </div>
                  </div>
                </Link>

                {/* SUPERFAST */}

                <div
                  className="
                    bg-white
                    border
                    border-zinc-200
                    overflow-hidden
                    flex
                    flex-col
                    h-full
                  "
                >
                  <div
                    className="
                      shrink-0
                      px-4
                      py-3
                      md:px-5
                      md:py-3.5
                      bg-zinc-950
                      text-white
                      border-b-4
                      border-red-700
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <h2
                        className="
                          text-lg
                          md:text-xl
                          font-black
                        "
                      >
                        खबरें सुपरफास्ट
                      </h2>

                      <span
                        className="
                          text-[9px]
                          md:text-[10px]
                          font-bold
                          text-zinc-400
                          uppercase
                        "
                      >
                        FAST NEWS
                      </span>
                    </div>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        md:text-[11px]
                        text-zinc-400
                      "
                    >
                      सबसे कम समय में सबसे ज्यादा खबरें
                    </p>
                  </div>

                  <div className="flex-1 min-h-0">
                    {superfastItems.map(
                      (item, index) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={getItemHref(item)}
                          className="
                            group
                            flex
                            gap-3
                            px-3.5
                            py-3
                            md:px-4
                            border-b
                            border-zinc-200
                            last:border-b-0
                            hover:bg-zinc-50
                            transition-colors
                          "
                        >
                          <div
                            className="
                              relative
                              shrink-0
                              w-[82px]
                              h-[58px]
                              sm:w-[92px]
                              sm:h-[64px]
                              overflow-hidden
                              bg-zinc-200
                            "
                          >
                            <img
                              src={item.thumbnail}
                              alt=""
                              loading="lazy"
                              className="
                                absolute
                                inset-0
                                w-full
                                h-full
                                object-cover
                                transition-transform
                                duration-300
                                group-hover:scale-105
                              "
                            />

                            {item.type ===
                              "video" && (
                              <span
                                className="
                                  absolute
                                  inset-0
                                  flex
                                  items-center
                                  justify-center
                                  bg-black/20
                                  text-white
                                  text-[11px]
                                "
                              >
                                <span
                                  className="
                                    flex
                                    items-center
                                    justify-center
                                    w-7
                                    h-7
                                    rounded-full
                                    bg-red-700
                                    shadow-lg
                                  "
                                >
                                  ▶
                                </span>
                              </span>
                            )}
                          </div>

                          <span
                            className="
                              shrink-0
                              flex
                              items-center
                              justify-center
                              w-5
                              h-5
                              mt-0.5
                              bg-red-700
                              text-white
                              text-[9px]
                              font-black
                            "
                          >
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <h3
                              className="
                                text-[13px]
                                md:text-sm
                                leading-[1.4]
                                font-extrabold
                                text-zinc-900
                                line-clamp-2
                                group-hover:text-red-700
                                transition-colors
                              "
                            >
                              {item.title}
                            </h3>

                            <div
                              className="
                                mt-1
                                text-[9px]
                                text-zinc-400
                              "
                            >
                              {formatTime(
                                item.createdAt
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================
                COMPACT NEWS STRIPS
            ================================================= */}

            {stripItems.length > 0 && (
              <section className="mt-5">
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    mb-3
                  "
                >
                  <h2
                    className="
                      text-base
                      md:text-lg
                      font-black
                      text-zinc-950
                    "
                  >
                    और बड़ी खबरें
                  </h2>

                  <span
                    className="
                      h-px
                      flex-1
                      bg-zinc-300
                    "
                  />
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-2.5
                  "
                >
                  {stripItems.map(
                    (item) => (
                      <Link
                        key={`${item.type}-${item.id}`}
                        href={getItemHref(item)}
                        className="
                          group
                          flex
                          items-center
                          gap-3
                          min-w-0
                          min-h-[76px]
                          px-3
                          py-2.5
                          bg-white
                          border
                          border-zinc-200
                          hover:border-red-600
                          hover:shadow-sm
                          transition-all
                        "
                      >
                        <div
                          className="
                            relative
                            shrink-0
                            w-[86px]
                            h-[58px]
                            overflow-hidden
                            bg-zinc-200
                          "
                        >
                          <img
                            src={item.thumbnail}
                            alt=""
                            loading="lazy"
                            className="
                              absolute
                              inset-0
                              w-full
                              h-full
                              object-cover
                              transition-transform
                              duration-300
                              group-hover:scale-105
                            "
                          />

                          {item.type ===
                            "video" && (
                            <span
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-black/15
                                text-white
                              "
                            >
                              <span
                                className="
                                  flex
                                  items-center
                                  justify-center
                                  w-6
                                  h-6
                                  rounded-full
                                  bg-red-700
                                  text-[8px]
                                "
                              >
                                ▶
                              </span>
                            </span>
                          )}
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <span
                            className="
                              block
                              mb-1
                              text-[9px]
                              md:text-[10px]
                              font-black
                              text-red-700
                              uppercase
                              truncate
                            "
                          >
                            {getCategoryName(item)}
                          </span>

                          <h3
                            className="
                              text-[13px]
                              md:text-sm
                              leading-[1.38]
                              font-extrabold
                              text-zinc-900
                              line-clamp-2
                              group-hover:text-red-700
                              transition-colors
                            "
                          >
                            {item.title}
                          </h3>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}

            {/* ================================================
                LATEST VIDEOS
            ================================================= */}

            {latestVideos.length > 0 && (
              <section
                className="
                  mt-10
                  md:mt-12
                  bg-white
                  border
                  border-zinc-200
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-4
                    py-4
                    md:px-5
                    md:py-5
                    border-b
                    border-zinc-200
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            block
                            w-1
                            h-7
                            bg-red-700
                          "
                        />

                        <h2
                          className="
                            text-xl
                            md:text-2xl
                            font-black
                            text-zinc-950
                          "
                        >
                          Latest Videos
                        </h2>
                      </div>

                      <p
                        className="
                          mt-1
                          ml-3.5
                          text-[11px]
                          md:text-xs
                          text-zinc-500
                        "
                      >
                        ताज़ा वीडियो खबरें
                      </p>
                    </div>

                    <Link
                      href="/video"
                      className="
                        shrink-0
                        inline-flex
                        items-center
                        gap-1
                        px-3
                        py-2
                        border
                        border-zinc-300
                        text-[11px]
                        md:text-xs
                        font-black
                        text-zinc-800
                        hover:bg-red-700
                        hover:text-white
                        hover:border-red-700
                        transition-colors
                      "
                    >
                      और देखें
                      <span>→</span>
                    </Link>
                  </div>
                </div>

                <div
                  className="
                    p-4
                    md:p-5
                    lg:p-6
                  "
                >
                  <div
                    className="
                      grid
                      grid-cols-1
                      sm:grid-cols-2
                      lg:grid-cols-4
                      gap-5
                      md:gap-6
                    "
                  >
                    {latestVideos.map(
                      (video) => (
                        <Link
                          key={video.id}
                          href={`/video/${video.id}`}
                          className="
                            group
                            min-w-0
                            block
                          "
                        >
                          <div
                            className="
                              relative
                              aspect-video
                              overflow-hidden
                              bg-zinc-200
                            "
                          >
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              loading="lazy"
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

                            <div
                              className="
                                absolute
                                inset-0
                                bg-gradient-to-t
                                from-black/65
                                via-transparent
                                to-transparent
                              "
                            />

                            <span
                              className="
                                absolute
                                left-3
                                bottom-3
                                flex
                                items-center
                                justify-center
                                w-9
                                h-9
                                rounded-full
                                bg-red-700
                                text-white
                                text-[10px]
                                shadow-lg
                                group-hover:scale-110
                                transition-transform
                              "
                            >
                              ▶
                            </span>

                            <span
                              className="
                                absolute
                                top-2
                                left-2
                                px-2
                                py-1
                                bg-black/80
                                text-white
                                text-[8px]
                                font-black
                                tracking-wider
                              "
                            >
                              VIDEO
                            </span>
                          </div>

                          <div className="pt-3">
                            <div
                              className="
                                text-[9px]
                                md:text-[10px]
                                font-black
                                text-red-700
                                mb-1
                                uppercase
                              "
                            >
                              {video.categoryHi ||
                                video.category ||
                                "वीडियो"}
                            </div>

                            <h3
                              className="
                                text-sm
                                md:text-[15px]
                                leading-[1.4]
                                font-black
                                text-zinc-950
                                line-clamp-2
                                group-hover:text-red-700
                                transition-colors
                              "
                            >
                              {video.title}
                            </h3>

                            {video.description && (
                              <p
                                className="
                                  mt-1.5
                                  text-[11px]
                                  md:text-xs
                                  leading-[1.5]
                                  text-zinc-500
                                  line-clamp-2
                                "
                              >
                                {video.description}
                              </p>
                            )}

                            <div
                              className="
                                mt-2
                                text-[9px]
                                text-zinc-400
                              "
                            >
                              {formatDate(
                                video.createdAt
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* ================================================
                INFINITE ARTICLES
            ================================================= */}

            {latestArticlesForInfinite.length > 0 && (
              <InfiniteLatestArticles
                articles={
                  latestArticlesForInfinite
                }
                categories={
                  safeCategories
                }
                excludeIds={[]}
              />
            )}

            {/* ================================================
                EMPTY STATE
            ================================================= */}

            {latestItems.length === 0 && (
              <div
                className="
                  bg-white
                  border
                  border-zinc-200
                  px-6
                  py-16
                  text-center
                "
              >
                <div
                  className="
                    text-4xl
                    mb-3
                  "
                >
                  📰
                </div>

                <p
                  className="
                    text-zinc-500
                    font-bold
                  "
                >
                  अभी कोई नवीनतम खबर उपलब्ध नहीं है।
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}