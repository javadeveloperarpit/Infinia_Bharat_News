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
] = await Promise.all([
  getPublishedArticles(),
  getFeaturedArticles(),
  getCategories(),
  getPublishedVideos(),
  getPublishedShorts(),
]);


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
  // Attach category information
  // ======================================

  const latestItems = [

    // ------------------------------
    // ARTICLES
    // ------------------------------

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


    // ------------------------------
    // VIDEOS
    // ------------------------------

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

      <BreakingStrip />


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
          articles={
            latestItems
          }
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

        {
          categoryData.map(
            (category) => (

              <CategorySection

                key={
                  category.id
                }

                name={
                  category.name
                }

                nameHi={
                  category.nameHi
                }

                slug={
                  category.slug
                }

                articles={
                  category.articles
                }

                videos={
                  category.videos
                }

              />

            )
          )
        }

      </div>

    </main>

  );

}