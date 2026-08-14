import NewsCard from "./news-card";
import VideoCard from "./video-card";
import type { NativeAd } from "@/services/ads.service";


interface Props {
  articles: any[];
  nativeAds?: (NativeAd & { id: string })[];
}

export default function NewsGrid({
  articles,
  nativeAds = [],
}: Props) {
  if (!articles?.length) {
    return null;
  }

  const items: any[] = [];

  let nativeIndex = 0;

  articles.forEach((item, index) => {
  items.push({
    type: item.type,
    data: item,
  });

  // Every 3 content cards
  if (
    (index + 1) % 3 === 0 &&
    nativeAds.length > 0
  ) {
    items.push({
      type: "native",
      data:
        nativeAds[
          nativeIndex %
            nativeAds.length
        ],
    });

    nativeIndex++;
  }
});

// If less than 3 content items,
// still show one native ad after the content.
if (
  articles.length < 3 &&
  articles.length > 0 &&
  nativeAds.length > 0
) {
  items.push({
    type: "native",
    data:
      nativeAds[
        nativeIndex %
          nativeAds.length
      ],
  });
}

  return (
    <section className="mb-12">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex items-center gap-3 mb-6">

        <div
          className="
            w-1.5
            h-9
            bg-red-600
            rounded-full
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
             ताज़ा खबरें
          </h2>

          <p
            className="
              text-sm
              text-zinc-500
              font-medium
            "
          >
            देश और दुनिया की ताज़ा खबरें
          </p>

        </div>

      </div>

      {/* RED LINE */}

      <div
        className="
          h-[3px]
          bg-red-600
          w-full
          mb-6
        "
      />

      {/* ==========================================
          GRID
      ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-6
        "
      >

        {items.map((item, index) => (
  <div
    key={
      item.type === "native"
        ? `native-${item.data.id}-${index}`
        : item.data.id
    }
    className="
      min-w-0
      w-full
      h-full
    "
  >

    {item.type === "native" ? (

      <NewsCard
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

    ) : item.type === "video" ? (

      <VideoCard
        {...item.data}
      />

    ) : (

      <NewsCard
        article={item.data}
      />

    )}

  </div>
))}

      </div>

    </section>
  );
}

