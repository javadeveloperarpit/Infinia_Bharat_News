"use client";

import SectionHeader from "./section-header";
import NewsCard from "./news-card";
import VideoCard from "./video-card";

import {
  useLanguageStore,
} from "@/store/language-store";

interface Article {
  id: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  slug?: string;
  categoryId: string;
  createdAt?: string;
  views?: number;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
  categoryId: string;
  createdAt?: string;
  views?: number;
}

interface Props {
  name: string;
  nameHi: string;
  slug: string;
  articles: Article[];
  videos: Video[];
  nativeAds?: NativeAdItem[];
}

type NativeAdItem = {
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

export default function CategorySection({
  name,
  nameHi,
  slug,
  articles,
  videos,
  nativeAds = [],
}: Props) {
  const language = useLanguageStore(
    (state) => state.language
  );

  // ======================================
  // NO CONTENT = DON'T RENDER CATEGORY
  // ======================================

  if (
    (!articles || articles.length === 0) &&
    (!videos || videos.length === 0)
  ) {
    return null;
  }

  // ======================================
  // CONTENT LIMIT
  //
  // Desktop:
  // Articles = 10
  // Videos = 6
  // ======================================

  const articleList =
    articles?.slice(0, 10) || [];

  const videoList =
    videos?.slice(0, 6) || [];

  // ======================================
  // CREATE CONTENT CARDS
  //
  // Every 3rd content item = Video
  // ======================================

  const cards: any[] = [];

  let a = 0;
  let v = 0;

  const totalContent =
    articleList.length +
    videoList.length;

  for (
    let i = 0;
    i < totalContent;
    i++
  ) {
    // Every 3rd item try video
    if (
      (i + 1) % 3 === 0 &&
      v < videoList.length
    ) {
      cards.push({
        type: "video",
        data: videoList[v++],
      });
    }

    // Otherwise article
    else if (
      a < articleList.length
    ) {
      cards.push({
        type: "article",
        data: articleList[a++],
      });
    }

    // If articles finished, use videos
    else if (
      v < videoList.length
    ) {
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
              nativeIndex %
                nativeAds.length
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
    // ------------------------------------
    // NATIVE AD
    // ------------------------------------

    if (item.type === "native") {
      return (
        <NewsCard
          key={`native-${item.data.id}-${index}`}
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

    // ------------------------------------
    // ARTICLE
    // ------------------------------------

    if (item.type === "article") {
      return (
        <NewsCard
          key={item.data.id}
          article={item.data}
        />
      );
    }

    // ------------------------------------
    // VIDEO
    // ------------------------------------

    if (item.type === "video") {
      return (
        <VideoCard
          key={item.data.id}
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
    <section>
      {/* ==================================
          SECTION HEADER
      ================================== */}

      <SectionHeader
        title={
          language === "hi"
            ? nameHi
            : name
        }
        slug={slug}
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
        {mobileCards.map(
          renderCard
        )}
      </div>

      {/* ==================================
          DESKTOP
          MAX:
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
                  ? `native-desktop-${item.data.id}-${index}`
                  : item.data.id
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