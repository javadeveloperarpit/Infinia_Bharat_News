import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  searchArticles,
  searchVideos,
} from "@/services/public/search.public.service";

export const metadata: Metadata = {
  title: "Search News | Infinia Bharat News",
  description:
    "Search the latest news, articles and videos on Infinia Bharat News.",
  robots: {
    index: false,
    follow: true,
  },
};

const quickLinks = [
  { title: "Home", href: "/" },
  { title: "Latest", href: "/latest" },
  { title: "India", href: "/category/india" },
  { title: "World", href: "/category/world" },
  { title: "Politics", href: "/category/politics" },
  { title: "Business", href: "/category/business" },
  { title: "Sports", href: "/category/sports" },
  { title: "Videos", href: "/video" },
  { title: "Reels", href: "/reels" },
  { title: "Live TV", href: "/live-tv" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
  }>;
}) {
  const { q } = await searchParams;

  const keyword = q?.trim() || "";

  /*
   * Empty query par database/search service ko call mat karo.
   */
  const [articles, videos] = keyword
    ? await Promise.all([
        searchArticles(keyword),
        searchVideos(keyword),
      ])
    : [[], []];

  const totalResults = articles.length + videos.length;

  return (
    <main className="min-h-screen bg-white text-[#111]">

      {/* RED SEARCH BAR */}
      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-hidden px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
         <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-black text-red-600">
            SEARCH
          </span>

          <span className="truncate">
            Search Infinia Bharat News for the latest news, stories and videos
          </span>
        </div>
      </div>
 
      {/* SEARCH CONTENT */}
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">

        {/* SEARCH FORM */}
        <section className="mb-10">

          <div className="mb-5">

            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
              Search News
            </h1>
          </div>

          <form
            action="/search"
            method="GET"
            className="flex max-w-4xl gap-2"
          >
            <input
              type="search"
              name="q"
              defaultValue={keyword}
              placeholder="Search news, politics, sports, India..."
              aria-label="Search news"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-100"
            />

            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700"
            >
              Search
            </button>
          </form>
        </section>

        {/* QUERY INFO */}
        {keyword && (
          <div className="mb-10 border-l-4 border-red-600 bg-[#f7f7f7] px-5 py-4">
            <p className="text-sm text-zinc-500">
              Showing results for
            </p>

            <p className="mt-1 break-words text-xl font-black text-zinc-950">
              "{keyword}"
            </p>

            {totalResults > 0 && (
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                {totalResults} result{totalResults !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        )}

        {/* EMPTY QUERY */}
        {!keyword && (
          <div className="border border-zinc-200 bg-[#f7f7f7] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-black">
              Search for a story
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Enter a keyword above to find the latest news, articles and
              videos on Infinia Bharat News.
            </p>
          </div>
        )}

        {/* ARTICLES */}
        {articles.length > 0 && (
          <section>

            <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">
              <h2 className="text-2xl font-black">
                📰 News
              </h2>

              <span className="text-sm font-semibold text-zinc-500">
                {articles.length} Results
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group flex gap-4 border border-zinc-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
                >

                  <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg bg-zinc-100">

                    <Image
                      src={
                        article.thumbnail ||
                        "/placeholder-news.jpg"
                      }
                      alt={article.title}
                      fill
                      sizes="144px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />

                  </div>

                  <div className="flex min-w-0 flex-col">

                    <h3 className="line-clamp-2 font-black leading-6 transition group-hover:text-red-600">
                      {article.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
                      {article.shortDescription}
                    </p>

                  </div>

                </Link>
              ))}

            </div>
          </section>
        )}

        {/* VIDEOS */}
        {videos.length > 0 && (
          <section className="mt-14">

            <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4">

              <h2 className="text-2xl font-black">
                ▶ Videos
              </h2>

              <span className="text-sm font-semibold text-zinc-500">
                {videos.length} Results
              </span>

            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/video/${video.id}`}
                  className="group"
                >

                  <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">

                    <div className="relative aspect-video overflow-hidden bg-zinc-100">

                      <Image
                        src={
                          video.thumbnail ||
                          "/placeholder-video.jpg"
                        }
                        alt={video.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute bottom-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black text-white">
                        VIDEO
                      </div>

                    </div>

                    <div className="p-4">

                      <h3 className="line-clamp-2 font-black leading-6 transition group-hover:text-red-600">
                        {video.title}
                      </h3>

                      <p className="mt-3 text-[10px] font-bold tracking-wide text-zinc-400">
                        INFINIA BHARAT NEWS
                      </p>

                    </div>

                  </article>

                </Link>
              ))}

            </div>
          </section>
        )}

        {/* NO RESULTS */}
        {keyword && !articles.length && !videos.length && (
          <div className="border border-zinc-200 bg-[#f7f7f7] px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-zinc-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </div>

            <h2 className="mt-5 text-2xl font-black">
              No Results Found
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              We couldn't find any news or videos matching "{keyword}".
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Try another keyword or check your spelling.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}