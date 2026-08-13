import Image from "next/image";
import Link from "next/link";

import {
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

interface TrendingArticle {
  id: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  category?: string;
  categoryHi?: string;
  createdAt?: string | Date | any;
}

function getTime(value: any): number {
  if (!value) return 0;

  try {
    if (
      value &&
      typeof value.toDate === "function"
    ) {
      return value.toDate().getTime();
    }

    if (
      typeof value === "object" &&
      typeof value.seconds === "number"
    ) {
      return value.seconds * 1000;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 0
      : date.getTime();

  } catch {
    return 0;
  }
}

function formatDate(value: any): string {
  const time = getTime(value);

  if (!time) return "";

  return new Date(time).toLocaleDateString(
    "hi-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
}

export default function ArticleSidebar({
  trending = [],
}: {
  trending: TrendingArticle[];
}) {

  /*
   * GLOBAL LATEST NEWS
   *
   * Article page se related articles nahi,
   * puri website ki latest published news.
   */
  const latestNews = [...trending]
    .sort(
      (a, b) =>
        getTime(b.createdAt) -
        getTime(a.createdAt)
    )
    .slice(0, 5);

  return (
    <aside
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        border-zinc-200
        bg-white
        shadow-sm
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          w-full
          items-center
          justify-between
          border-b
          border-zinc-200
          px-4
          py-4
          sm:px-5
        "
      >

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-50
            "
          >
            <TrendingUp
              size={19}
              className="text-red-600"
            />
          </div>

          <div className="min-w-0">

            <h2
              className="
                text-base
                font-black
                leading-tight
                text-zinc-900
                sm:text-lg
              "
            >
              Trending News
            </h2>

            <p
              className="
                mt-0.5
                text-[10px]
                font-medium
                text-zinc-500
                sm:text-[11px]
              "
            >
              अभी की ताज़ा खबरें
            </p>

          </div>

        </div>

        <span
          className="
            shrink-0
            rounded-full
            bg-red-600
            px-2
            py-1
            text-[8px]
            font-black
            uppercase
            tracking-wider
            text-white
            sm:px-2.5
            sm:text-[9px]
          "
        >
          LIVE
        </span>

      </div>


      {/* NEWS */}

      <div className="w-full divide-y divide-zinc-100">

        {latestNews.length > 0 ? (

          latestNews.map(
            (item, index) => {

              const href =
                item.slug
                  ? `/news/${item.slug}`
                  : "#";

              const category =
                item.categoryHi ||
                item.category ||
                "समाचार";

              return (

                <Link
                  key={item.id}
                  href={href}
                  className="
                    group
                    flex
                    w-full
                    min-w-0
                    items-start
                    gap-3
                    px-4
                    py-4
                    transition
                    hover:bg-zinc-50
                    sm:px-5
                  "
                >

                  {/* NUMBER */}

                  <div
                    className="
                      flex
                      w-6
                      shrink-0
                      justify-center
                      pt-0.5
                      sm:w-7
                    "
                  >
                    <span
                      className={`
                        text-xl
                        font-black
                        leading-none
                        sm:text-2xl
                        ${
                          index === 0
                            ? "text-red-600"
                            : "text-zinc-300"
                        }
                      `}
                    >
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>
                  </div>


                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      h-[64px]
                      w-[88px]
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      bg-zinc-100
                      sm:h-[68px]
                      sm:w-[96px]
                    "
                  >

                    {item.thumbnail ? (

                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="
                          (max-width: 640px) 88px,
                          96px
                        "
                        className="
                          object-cover
                          transition-transform
                          duration-300
                          group-hover:scale-105
                        "
                      />

                    ) : (

                      <div
                        className="
                          absolute
                          inset-0
                          bg-zinc-200
                        "
                      />

                    )}

                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <div
                      className="
                        mb-1
                        flex
                        min-w-0
                        items-center
                        gap-2
                      "
                    >

                      <span
                        className="
                          max-w-[100px]
                          truncate
                          text-[8px]
                          font-black
                          uppercase
                          tracking-wide
                          text-red-600
                          sm:text-[9px]
                        "
                      >
                        {category}
                      </span>

                      {item.createdAt && (
                        <>
                          <span
                            className="
                              h-1
                              w-1
                              shrink-0
                              rounded-full
                              bg-zinc-300
                            "
                          />

                          <span
                            className="
                              shrink-0
                              text-[8px]
                              text-zinc-400
                              sm:text-[9px]
                            "
                          >
                            {formatDate(
                              item.createdAt
                            )}
                          </span>
                        </>
                      )}

                    </div>


                    <h3
                      className="
                        line-clamp-2
                        text-[12px]
                        font-bold
                        leading-[1.4]
                        text-zinc-900
                        transition-colors
                        group-hover:text-red-600
                        sm:text-[13px]
                      "
                    >
                      {item.title}
                    </h3>

                  </div>


                  {/* ARROW */}

                  <ArrowUpRight
                    size={14}
                    className="
                      mt-1
                      hidden
                      shrink-0
                      text-zinc-300
                      opacity-0
                      transition
                      group-hover:text-red-600
                      group-hover:opacity-100
                      sm:block
                    "
                  />

                </Link>

              );
            }
          )

        ) : (

          <div
            className="
              w-full
              px-5
              py-10
              text-center
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-zinc-500
              "
            >
              अभी कोई trending news नहीं है।
            </p>
          </div>

        )}

      </div>


      {/* FOOTER */}

      {latestNews.length > 0 && (

        <div
          className="
            w-full
            border-t
            border-zinc-200
            px-4
            py-3
            sm:px-5
          "
        >

          <Link
            href="/latest"
            className="
              group
              flex
              w-full
              items-center
              justify-between
              text-[11px]
              font-bold
              text-zinc-600
              transition
              hover:text-red-600
              sm:text-xs
            "
          >

            <span>
              सभी ताज़ा खबरें देखें
            </span>

            <ArrowUpRight
              size={14}
              className="
                transition-transform
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
              "
            />

          </Link>

        </div>

      )}

    </aside>
  );
}