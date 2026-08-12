import Image from "next/image";
import Link from "next/link";

import type { NativeAd } from "@/services/ads.service";


// ======================================================
// TYPES
// ======================================================

interface Props {
  articles: any[];
  nativeAds?: (NativeAd & { id: string })[];
}


// ======================================================
// COMPONENT
// ======================================================

export default function RelatedNews({
  articles,
  nativeAds = [],
}: Props) {

  // ----------------------------------------------------
  // Empty
  // ----------------------------------------------------

  if (!articles?.length) {
    return null;
  }


  // ----------------------------------------------------
  // BUILD ITEMS
  // ----------------------------------------------------

  const items: Array<{
    type: "article" | "native";
    data: any;
  }> = [];

  let nativeIndex = 0;


  articles.forEach((article, index) => {

    items.push({
      type: "article",
      data: article,
    });


    // Native ad after every 3 articles

    if (
      (index + 1) % 3 === 0 &&
      nativeAds.length > 0
    ) {
      items.push({
        type: "native",
        data:
          nativeAds[
            nativeIndex % nativeAds.length
          ],
      });

      nativeIndex++;
    }

  });


  // ----------------------------------------------------
  // LESS THAN 3 ARTICLES
  // ----------------------------------------------------

  if (
    articles.length < 3 &&
    nativeAds.length > 0
  ) {

    items.push({
      type: "native",
      data:
        nativeAds[
          nativeIndex % nativeAds.length
        ],
    });

  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <section
      className="
        mt-12
        sm:mt-14
        lg:mt-16
        w-full
        min-w-0
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-6
          sm:mb-8
          flex
          items-center
        "
      >

        <h2
          className="
            border-l-4
            border-red-600
            pl-3
            sm:pl-4
            text-xl
            sm:text-2xl
            lg:text-3xl
            font-black
            leading-tight
          "
        >
          Related News
        </h2>

      </div>


      {/* =================================================
          GRID
      ================================================= */}

      <div
        className="
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-4
          sm:gap-5
          md:grid-cols-2
          lg:grid-cols-3
          items-stretch
        "
      >

        {items.map((item, index) => {

          // =================================================
          // NATIVE AD
          // =================================================

          if (item.type === "native") {

            const ad = item.data;

            if (
              !ad?.id ||
              !ad?.image
            ) {
              return null;
            }


            const adLink =
              ad.link || "#";


            return (

              <Link
                key={`related-native-${ad.id}-${index}`}
                href={adLink}
                target={
                  ad.openInNewTab !== false
                    ? "_blank"
                    : undefined
                }
                rel={
                  ad.openInNewTab !== false
                    ? "noopener noreferrer"
                    : undefined
                }
                className="
                  group
                  block
                  min-w-0
                  w-full
                  h-full
                  max-w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >

                {/* =================================================
                    SAME IMAGE AREA AS RELATED ARTICLE
                ================================================= */}

                <div
                  className="
                    relative
                    aspect-video
                    w-full
                    overflow-hidden
                    bg-zinc-100
                  "
                >

                  <Image
                    src={ad.image}
                    alt={
                      ad.title ||
                      "Sponsored content"
                    }
                    fill
                    sizes="
                      (max-width:639px) 100vw,
                      (max-width:1023px) 50vw,
                      33vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />


                  {/* AD LABEL */}

                  <span
                    className="
                      absolute
                      top-2
                      right-2
                      z-10
                      rounded
                      bg-black/75
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                    "
                  >
                    Advertisement
                  </span>

                </div>


                {/* =================================================
                    SAME CONTENT AREA AS RELATED ARTICLE
                ================================================= */}

                <div
                  className="
                    min-w-0
                    p-4
                    sm:p-5
                  "
                >

                  {/* Sponsored */}

                  <div
                    className="
                      mb-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-red-600
                    "
                  >
                    Sponsored
                  </div>


                  {/* TITLE */}

                  <h3
                    className="
                      min-w-0
                      text-base
                      sm:text-lg
                      font-black
                      leading-snug
                      text-zinc-900
                      break-words
                      line-clamp-3
                      transition-colors
                      group-hover:text-red-600
                    "
                  >
                    {ad.title ||
                      "Sponsored Content"}
                  </h3>

                </div>

              </Link>

            );
          }


          // =================================================
          // ARTICLE
          // =================================================

          const article = item.data;


          if (!article?.id) {
            return null;
          }


          return (

            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="
                group
                block
                min-w-0
                w-full
                h-full
                max-w-full
                overflow-hidden
                rounded-2xl
                border
                border-zinc-200
                bg-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
                focus:ring-offset-2
              "
            >

              {/* =================================================
                  IMAGE
              ================================================= */}

              <div
                className="
                  relative
                  aspect-video
                  w-full
                  overflow-hidden
                  bg-zinc-100
                "
              >

                {article.thumbnail ? (

                  <Image
                    src={article.thumbnail}
                    alt={
                      article.title ||
                      "Related news"
                    }
                    fill
                    sizes="
                      (max-width:639px) 100vw,
                      (max-width:1023px) 50vw,
                      33vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      bg-zinc-100
                      text-sm
                      text-zinc-400
                    "
                  >
                    No Image
                  </div>

                )}

              </div>


              {/* =================================================
                  CONTENT
              ================================================= */}

              <div
                className="
                  min-w-0
                  p-4
                  sm:p-5
                "
              >

                {/* CATEGORY */}

                {article.category && (

                  <div
                    className="
                      mb-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-red-600
                    "
                  >
                    {article.category}
                  </div>

                )}


                {/* TITLE */}

                <h3
                  className="
                    min-w-0
                    text-base
                    sm:text-lg
                    font-black
                    leading-snug
                    text-zinc-900
                    break-words
                    line-clamp-3
                    transition-colors
                    group-hover:text-red-600
                  "
                >
                  {article.title}
                </h3>

              </div>

            </Link>

          );

        })}

      </div>

    </section>

  );
}