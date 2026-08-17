import type { Metadata } from "next";
import Link from "next/link";

import {
  getCategories,
} from "@/services/public/category.public.service";

import {
  getPublishedArticles,
} from "@/services/public/article.public.service";


export const metadata: Metadata = {
  title: "English News Categories | Infinia Bharat News",
  description:
    "Explore English news categories including India, World, Politics, Business, Sports, Technology, Entertainment, Health, Science, Education, Lifestyle, Auto and Viral news.",
  alternates: {
    canonical: "/english-articles",
  },
};


// ============================================================
// CATEGORY ARTWORK
// ============================================================

const categoryData: Record<
  string,
  {
    image: string;
    description: string;
  }
> = {

  "english-india": {
    image: "/images/english-categories/india.png",
    description:
      "Latest developments, national affairs and major stories from across India.",
  },

  "english-world": {
    image: "/images/english-categories/world.png",
    description:
      "International affairs and important stories from around the world.",
  },

  "english-politics": {
    image: "/images/english-categories/politics.png",
    description:
      "Government, elections, political leaders and policy developments.",
  },

  "english-business": {
    image: "/images/english-categories/business.png",
    description:
      "Markets, economy, companies, finance and business developments.",
  },

  "english-sports": {
    image: "/images/english-categories/sports.png",
    description:
      "Matches, players, tournaments, records and sporting stories.",
  },

  "english-entertainment": {
    image: "/images/english-categories/entertainment.png",
    description:
      "Movies, television, music, celebrities and entertainment stories.",
  },

  "english-technology": {
    image: "/images/english-categories/technology.png",
    description:
      "AI, gadgets, apps, startups and technology developments.",
  },

  "english-health": {
    image: "/images/english-categories/health.png",
    description:
      "Health, wellness, medical developments and healthcare stories.",
  },

  "english-science": {
    image: "/images/english-categories/science.png",
    description:
      "Scientific discoveries, research, space and breakthrough developments.",
  },

  "english-education": {
    image: "/images/english-categories/education.png",
    description:
      "Exams, results, universities, careers and education updates.",
  },

  "english-lifestyle": {
    image: "/images/english-categories/lifestyle.png",
    description:
      "Travel, food, fashion, culture, wellness and modern living.",
  },

  "english-auto": {
    image: "/images/english-categories/auto.png",
    description:
      "Cars, bikes, EVs, launches, reviews and automobile news.",
  },

  "english-viral": {
    image: "/images/english-categories/viral.png",
    description:
      "Trending stories, internet sensations and viral moments.",
  },

};


// ============================================================
// PAGE
// ============================================================

export default async function EnglishArticlesPage() {

  const [
    categories,
    articles,
  ] = await Promise.all([
    getCategories(),
    getPublishedArticles(),
  ]);


  // ==========================================================
  // ENGLISH CATEGORIES
  // ==========================================================

  const englishCategories =
    categories.filter((category) => {

      const slug =
        String(category.slug || "")
          .trim()
          .toLowerCase();

      const name =
        String(category.name || "")
          .trim()
          .toLowerCase();

      return (
        category.status === "active" &&
        (
          slug.startsWith("english-") ||
          name.startsWith("english ")
        )
      );

    });


  // ==========================================================
  // ARTICLE COUNTS
  // ==========================================================

  const articleCounts =
    new Map<string, number>();


  articles.forEach((article) => {

    if (!article.categoryId) {
      return;
    }

    articleCounts.set(
      article.categoryId,
      (articleCounts.get(article.categoryId) || 0) + 1
    );

  });


  return (

    <main
      className="
        min-h-screen
        bg-white
        text-[#111]
      "
    >

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section
        className="
          container-news
          px-4
          py-8
          md:py-12
        "
      >

        <div className="mb-6">

          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-[#151515]
              md:text-2xl
            "
          >
            English Categories
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-zinc-500
              md:text-sm
            "
          >
            Choose a section to explore the latest stories.
          </p>

        </div>


        {/* ====================================================
            CATEGORY CARDS

            SAME DESIGN ON:
            MOBILE
            TABLET
            DESKTOP
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-4
          "
        >

          {englishCategories.map(
            (category) => {

              const slug =
                String(
                  category.slug || ""
                )
                  .trim()
                  .toLowerCase();


              const data =
                categoryData[slug];


              const displayName =
                category.name.replace(
                  /^English\s*/i,
                  ""
                );


              const count =
                articleCounts.get(
                  category.id
                ) || 0;


              return (

                <Link
                  key={category.id}
                  href={`/category/${slug}`}
                  className="
                    group
                    relative
                    min-h-[150px]
                    overflow-hidden
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    p-5
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#d71920]/50
                    hover:shadow-lg
                  "
                >

                  {/* ==================================================
                      CATEGORY IMAGE
                  ================================================== */}

                  {data?.image && (

                    <img
                      src={data.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="
                        pointer-events-none
                        absolute
                        bottom-0
                        right-0
                        h-full
                        w-[62%]
                        object-contain
                        object-right-bottom
                        opacity-25
                        transition-all
                        duration-300
                        group-hover:scale-105
                        group-hover:opacity-45
                      "
                    />

                  )}


                  {/* ==================================================
                      SUBTLE IMAGE FADE

                      Very light so text remains readable.
                  ================================================== */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-white
                      via-white/90
                      to-transparent
                    "
                  />


                  {/* ==================================================
                      CARD CONTENT
                  ================================================== */}

                  <div
                    className="
                      relative
                      z-10
                      max-w-[75%]
                    "
                  >

                    {/* CATEGORY LABEL */}

                    <span
                      className="
                        inline-block
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-[#d71920]
                      "
                    >
                      {slug
                        .replace(
                          "english-",
                          ""
                        )
                        .toUpperCase()}
                    </span>


                    {/* CATEGORY NAME */}

                    <h3
                      className="
                        mt-1
                        text-xl
                        font-extrabold
                        leading-tight
                        text-[#111]
                        transition-colors
                        duration-200
                        group-hover:text-[#d71920]
                        md:text-2xl
                      "
                    >
                      {displayName}
                    </h3>


                    {/* DESCRIPTION */}

                    {data?.description && (

                      <p
                        className="
                          mt-2
                          line-clamp-2
                          text-xs
                          leading-relaxed
                          text-zinc-500
                        "
                      >
                        {data.description}
                      </p>

                    )}


                    {/* ARTICLE COUNT */}

                    <span
                      className="
                        mt-3
                        block
                        w-fit
                        text-[11px]
                        font-semibold
                        text-zinc-600
                      "
                    >
                      {count}{" "}
                      {count === 1
                        ? "Article"
                        : "Articles"}
                    </span>

                  </div>


                  {/* ==================================================
                      ARROW
                  ================================================== */}

                  <span
                    className="
                      absolute
                      bottom-4
                      right-4
                      z-20
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-zinc-200
                      bg-white/90
                      text-lg
                      text-zinc-400
                      shadow-sm
                      transition-all
                      duration-300
                      group-hover:translate-x-1
                      group-hover:border-[#d71920]
                      group-hover:bg-[#d71920]
                      group-hover:text-white
                    "
                  >
                    →
                  </span>

                </Link>

              );

            }
          )}

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <section
        className="
          container-news
          px-4
          pb-10
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-zinc-200
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                font-semibold
                text-zinc-700
              "
            >
              Infinia Bharat News — English Desk
            </p>

            <p
              className="
                mt-1
                text-[11px]
                text-zinc-400
              "
            >
              News and stories across major categories.
            </p>

          </div>


          <Link
            href="/"
            className="
              flex
              w-fit
              items-center
              gap-2
              text-xs
              font-semibold
              text-[#d71920]
              transition
              hover:text-[#111]
            "
          >
            Back to Home
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>

  );

}