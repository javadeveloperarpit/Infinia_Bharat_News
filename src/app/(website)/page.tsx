import {
  getPublishedArticles,
  getFeaturedArticles,
  getPublishedArticlesByCategory,
} from "@/services/public/article.public.service";

import {
  getPublishedVideos,
  getPublishedVideosByCategory,
} from "@/services/public/video.public.service";

import {
  getCategories,
} from "@/services/category.service";

import BreakingStrip
  from "@/components/home/breaking-strip";

import HeroSection
  from "@/components/home/hero-section";

import NewsGrid
  from "@/components/home/news-grid";

import CategorySection
  from "@/components/home/category-section";

import ShortsSection
  from "@/components/home/shorts-section";

import {
  getPublishedShorts,
} from "@/services/public/shorts.public.service";

import BannerAd
  from "@/components/ads/BannerAd";

import {
  getAdsByType,
} from "@/services/ads.service";

import type {
  NativeAd,
} from "@/services/ads.service";

import {
  getActiveBreakingNews,
} from "@/services/public/breaking.public.service";

export default async function Home() {
  // ======================================
  // FETCH HOME DATA
  // ======================================

  const [
  articles,
  featured,
  categories,
  videos,
  shorts,
  bannerAds,
  nativeAds,
  breakingNews,
] = await Promise.all([
  getPublishedArticles(),
  getFeaturedArticles(),
  getCategories(),
  getPublishedVideos(),
  getPublishedShorts(),
  getAdsByType("banner"),
  getAdsByType("native"),
  getActiveBreakingNews(),
]);

  // ======================================
  // CONVERT BANNER ADS TO PLAIN OBJECTS
  // ======================================

  const bannerAdsPlain = bannerAds
    .filter((ad) => ad.active)
    .map((ad) => ({
      ...ad,

      createdAt:
        ad.createdAt &&
        typeof ad.createdAt === "object" &&
        "toDate" in ad.createdAt
          ? (
              ad.createdAt as {
                toDate: () => Date;
              }
            )
              .toDate()
              .toISOString()
          : ad.createdAt ?? null,

      updatedAt:
        ad.updatedAt &&
        typeof ad.updatedAt === "object" &&
        "toDate" in ad.updatedAt
          ? (
              ad.updatedAt as {
                toDate: () => Date;
              }
            )
              .toDate()
              .toISOString()
          : ad.updatedAt ?? null,
    }))
    .sort(
      (a, b) =>
        (b.priority ?? 1) -
        (a.priority ?? 1)
    );

  // ======================================
  // NATIVE ADS
  //
  // NO POSITION
  // ======================================

  type PlainNativeAd = {
    id: string;
    type: "native";
    title: string;
    image: string;
    link: string;
    active: boolean;
    priority: number;
    mobileEnabled: boolean;
    desktopEnabled: boolean;
    openInNewTab: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };

  const nativeAdsPlain: PlainNativeAd[] =
    nativeAds
      .filter(
        (
          ad
        ): ad is NativeAd & { id: string } =>
          ad.type === "native" &&
          ad.active
      )
      .map((ad) => ({
        id: ad.id,

        type: "native" as const,

        title:
          ad.title || "",

        image:
          ad.image || "",

        link:
          ad.link || "",

        active:
          ad.active,

        priority:
          ad.priority ?? 1,

        mobileEnabled:
          ad.mobileEnabled ?? true,

        desktopEnabled:
          ad.desktopEnabled ?? true,

        openInNewTab:
          ad.openInNewTab ?? true,

        createdAt:
          ad.createdAt &&
          typeof ad.createdAt === "object" &&
          "toDate" in ad.createdAt
            ? (
                ad.createdAt as {
                  toDate: () => Date;
                }
              )
                .toDate()
                .toISOString()
            : null,

        updatedAt:
          ad.updatedAt &&
          typeof ad.updatedAt === "object" &&
          "toDate" in ad.updatedAt
            ? (
                ad.updatedAt as {
                  toDate: () => Date;
                }
              )
                .toDate()
                .toISOString()
            : null,
      }))
      .sort(
        (a, b) =>
          (b.priority ?? 1) -
          (a.priority ?? 1)
      );

  // ======================================
  // CATEGORY MAP
  // categoryId -> category
  // ======================================

  const categoryMap = new Map(
    categories.map(
      (category) => [
        category.id,
        category,
      ]
    )
  );

  // ======================================
  // FEATURED ARTICLES
  // Attach category information
  // ======================================

  const featuredWithCategory =
    featured.map(
      (article) => {
        const category =
          categoryMap.get(
            article.categoryId
          );

        return {
          ...article,

          category:
            category?.name ||
            "News",

          categoryHi:
            category?.nameHi ||
            "समाचार",
        };
      }
    );

  // ======================================
  // LATEST ITEMS
  // Articles + Videos
  // ======================================

  const latestItems = [
    // ----------------------------------
    // ARTICLES
    // ----------------------------------

    ...articles.map(
      (article) => {
        const category =
          categoryMap.get(
            article.categoryId
          );

        return {
          ...article,

          category:
            category?.name ||
            "News",

          categoryHi:
            category?.nameHi ||
            "समाचार",

          type:
            "article" as const,
        };
      }
    ),

    // ----------------------------------
    // VIDEOS
    // ----------------------------------

    ...videos.map(
      (video) => {
        const category =
          categoryMap.get(
            video.categoryId
          );

        return {
          ...video,

          category:
            category?.name ||
            "Video",

          categoryHi:
            category?.nameHi ||
            "वीडियो",

          type:
            "video" as const,
        };
      }
    ),
  ]

    // ==================================
    // SORT LATEST
    // ==================================

    .sort(
      (a, b) => {
        const dateA =
          new Date(
            a.createdAt || 0
          ).getTime();

        const dateB =
          new Date(
            b.createdAt || 0
          ).getTime();

        return dateB - dateA;
      }
    )

    .slice(0, 3);

  // ======================================
  // CATEGORY DATA
  // ======================================

  const categoryData =
    await Promise.all(
      categories.map(
        async (category) => {
          const categoryId =
            category.id;

          const [
            articles,
            videos,
          ] = await Promise.all([
            getPublishedArticlesByCategory(
              categoryId
            ),

            getPublishedVideosByCategory(
              categoryId
            ),
          ]);

          return {
            ...category,

            articles,

            videos,
          };
        }
      )
    );

  // ======================================
  // PAGE
  // ======================================

  return (
    <main
      className="
        min-h-screen
        bg-white
      "
    >
      {/* ================================
          BREAKING NEWS
      ================================= */}

      <BreakingStrip
  news={breakingNews}
/>

      {/* ================================
          BANNER AD
      ================================= */}

      <BannerAd
        ads={bannerAdsPlain}
      />

      {/* ================================
          HERO
      ================================= */}

      <section
        className="
          container-news
          mt-5
        "
      >
        <HeroSection
          featured={
            featuredWithCategory
          }
        />
      </section>

      {/* ================================
          LATEST NEWS
      ================================= */}

      <section
        className="
          container-news
          mt-12
        "
      >
        <NewsGrid
          articles={latestItems}
          nativeAds={nativeAdsPlain}
        />

        {/* ================================
            YOUTUBE SHORTS
        ================================= */}

        <ShortsSection
          shorts={shorts}
        />
      </section>

      {/* ================================
          CATEGORY SECTIONS
      ================================= */}

      <div
        className="
          container-news
          mt-16
          space-y-20
        "
      >
        {categoryData.map(
          (category) => (
            <CategorySection
              key={category.id}
              name={category.name}
              nameHi={category.nameHi}
              slug={category.slug}
              articles={category.articles}
              videos={category.videos}
              nativeAds={nativeAdsPlain}
            />
          )
        )}
      </div>
    </main>
  );
}