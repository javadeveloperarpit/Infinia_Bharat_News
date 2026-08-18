"use client";

import Link from "next/link";
import NewsCard from "@/components/home/news-card";
import VideoCard from "@/components/home/video-card";

interface EnglishArticle {
  id: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  slug?: string;
  categoryId: string;
  createdAt?: string;
  views?: number;
  categoryName?: string;
  categorySlug?: string;
}

interface EnglishVideo {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  categoryId: string;
  createdAt?: string;
  views?: number;
}

interface NativeAdItem {
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
}

interface Props {
  articles: EnglishArticle[];
  videos?: EnglishVideo[];
  nativeAds?: NativeAdItem[];
}

export default function EnglishArticlesSection({
  articles,
  videos = [],
  nativeAds = [],
}: Props) {
  // ======================================
  // NO CONTENT
  // ======================================

  if (
    (!articles || articles.length === 0) &&
    (!videos || videos.length === 0)
  ) {
    return null;
  }

  // ======================================
  // CONTENT LIMIT
  // ======================================

  const articleList = articles?.slice(0, 10) || [];
  const videoList = videos?.slice(0, 6) || [];

  // ======================================
  // CREATE CONTENT CARDS
  // Every 3rd content item = Video
  // ======================================

  const cards: any[] = [];

  let a = 0;
  let v = 0;

  const totalContent =
    articleList.length + videoList.length;

  for (let i = 0; i < totalContent; i++) {
    if (
      (i + 1) % 3 === 0 &&
      v < videoList.length
    ) {
      cards.push({
        type: "video",
        data: videoList[v++],
      });
    } else if (a < articleList.length) {
      cards.push({
        type: "article",
        data: articleList[a++],
      });
    } else if (v < videoList.length) {
      cards.push({
        type: "video",
        data: videoList[v++],
      });
    }
  }

  // ======================================
  // INSERT NATIVE ADS
  // AFTER EVERY 3 CONTENT ITEMS
  // ======================================

  let nativeIndex = 0;

  const cardsWithAds: any[] = [];

  let realContentCount = 0;

  cards.forEach((item) => {
    cardsWithAds.push(item);

    if (
      item.type === "article" ||
      item.type === "video"
    ) {
      realContentCount++;

      if (
        realContentCount % 3 === 0 &&
        nativeAds.length > 0
      ) {
        cardsWithAds.push({
          type: "native",
          data:
            nativeAds[
              nativeIndex % nativeAds.length
            ],
        });

        nativeIndex++;
      }
    }
  });

  // ======================================
  // MOBILE
  // ======================================

  const mobileCards =
    cardsWithAds.slice(0, 6);

  // ======================================
  // RENDER CARD
  // ======================================

  function renderCard(
    item: any,
    index: number
  ) {
    // NATIVE AD
    if (item.type === "native") {
      return (
        <NewsCard
          key={`english-native-${item.data.id}-${index}`}
          article={{
            id: item.data.id,
            title: item.data.title,
            thumbnail: item.data.image,
            isNativeAd: true,
            adLink: item.data.link,
            openInNewTab:
              item.data.openInNewTab,
          }}
        />
      );
    }

    // ARTICLE
    // ARTICLE
if (item.type === "article") {
  return (
    <NewsCard
      key={`english-article-${item.data.id}`}
      article={{
        ...item.data,
        category: item.data.categoryName || "ENGLISH NEWS",
      }}
    />
  );
}

    // VIDEO
    if (item.type === "video") {
      return (
        <VideoCard
          key={`english-video-${item.data.id}`}
          {...item.data}
        />
      );
    }

    return null;
  }

  // ======================================
  // PAGE
  // ======================================

  return (
    <section className="container-news mt-10 md:mt-14">

      {/* ==================================
          CUSTOM ENGLISH HEADER
          VIEW ALL -> /english-articles
      ================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              w-1.5
              h-9
              bg-red-600
              rounded-full
              shrink-0
            "
          />

          <div>
            <h2
              className="
                text-2xl
                md:text-3xl
                font-black
                text-zinc-900
                tracking-tight
              "
            >
              Latest English News
            </h2>

            <p
              className="
                text-sm
                text-zinc-500
                font-medium
                mt-1
              "
            >
              Latest news and updates in English
            </p>
          </div>
        </div>

        {/* CORRECT URL */}
        <Link
          href="/english-articles"
          className="
            flex
            items-center
            gap-1
            text-red-600
            font-bold
            text-sm
            hover:gap-2
            transition-all
            whitespace-nowrap
          "
        >
          View All
          <span className="text-lg leading-none">
            →
          </span>
        </Link>
      </div>

      {/* RED LINE */}

      <div
        className="
          h-[3px]
          bg-red-600
          w-full
          mb-6
          rounded-full
        "
      />

      {/* ==================================
          MOBILE
      ================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          xl:hidden
        "
      >
        {mobileCards.map(renderCard)}
      </div>

      {/* ==================================
          DESKTOP
          10 ARTICLES
          6 VIDEOS
      ================================== */}

      <div
        className="
          hidden
          xl:grid
          xl:grid-cols-3
          gap-5
        "
      >
        {cardsWithAds.map(
          (item, index) => (
            <div
              key={
                item.type === "native"
                  ? `english-native-desktop-${item.data.id}-${index}`
                  : `english-${item.type}-${item.data.id}`
              }
              className="col-span-1"
            >
              {renderCard(
                item,
                index
              )}
            </div>
          )
        )}
      </div>

    </section>
  );
}