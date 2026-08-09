import { notFound } from "next/navigation";

import { getCategories } from "@/services/category.service";

import {
  getCategoryArticles,
  getCategoryVideos,
} from "@/services/public/category.public.service";

import CategoryHero from "@/components/category/category-hero";
import CategoryGrid from "@/components/category/category-grid";
import CategoryVideos from "@/components/category/category-videos";

interface Props {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lang?: "hi" | "en";
  }>;
}

const labels = {
  hi: {
    articles: "ताज़ा खबरें",
    videos: "वीडियो",
    view: "सभी देखें",

    articleSub: "इस कैटेगरी की बड़ी खबरें",
    videoSub: "लेटेस्ट वीडियो अपडेट",

    noArticle: "अभी कोई खबर उपलब्ध नहीं है",
    noVideo: "अभी कोई वीडियो उपलब्ध नहीं है",

    articleDesc:
      "हमारी न्यूज़ टीम नई खबरों पर काम कर रही है। जल्द ही अपडेट मिलेगा।",

    videoDesc:
      "इस कैटेगरी के वीडियो अपडेट जल्द उपलब्ध होंगे।",
  },

  en: {
    articles: "Latest Articles",
    videos: "Videos",
    view: "View All",

    articleSub:
      "Top stories from this category",

    videoSub:
      "Latest video updates",

    noArticle:
      "No Articles Available",

    noVideo:
      "No Videos Available",

    articleDesc:
      "Our newsroom is preparing fresh updates. Stay tuned.",

    videoDesc:
      "Videos from this category will be available soon.",
  },
};

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="w-full min-w-0">

      <div className="flex items-center gap-3 min-w-0">

        <div
          className="
            w-1.5
            h-9
            bg-red-600
            rounded-full
            shrink-0
          "
        />

        <div className="min-w-0">

          <h2
            className="
              text-2xl
              md:text-3xl
              font-black
              text-zinc-900
              tracking-tight
            "
          >
            {title}
          </h2>

          <p
            className="
              text-sm
              text-zinc-500
              font-medium
              mt-1
            "
          >
            {subtitle}
          </p>

        </div>

      </div>

      <div
        className="
          mt-4
          h-[3px]
          w-full
          bg-red-600
          rounded-full
        "
      />

    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      className="
        w-full
        min-w-0
        text-center
        py-12
        px-4
      "
    >

      <div className="text-4xl mb-4">
        {icon}
      </div>

      <h3
        className="
          text-lg
          md:text-xl
          font-black
          text-zinc-900
        "
      >
        {title}
      </h3>

      <p
        className="
          max-w-lg
          mx-auto
          mt-2
          text-sm
          leading-6
          text-zinc-500
        "
      >
        {description}
      </p>

    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: Props) {

  const { slug } = await params;

  const { lang = "hi" } =
    await searchParams;

  const categories =
    await getCategories();

  const category =
    categories.find(
      (item: any) =>
        item.slug === slug
    );

  if (!category) {
    notFound();
  }

  const [
    articles,
    videos,
  ] = await Promise.all([
    getCategoryArticles(category.id),
    getCategoryVideos(category.id),
  ]);

  const t = labels[lang];

  return (
    <main className="w-full min-w-0 overflow-hidden">

      {/* CATEGORY HERO */}

      <CategoryHero
        name={category.name}
        nameHi={category.nameHi}
      />


      {/* CONTENT */}

      <div
        className="
          container-news
          w-full
          min-w-0
          py-10
          md:py-14
        "
      >

        {/* ARTICLES */}

        <section className="mb-16 w-full min-w-0">

          <SectionTitle
            title={t.articles}
            subtitle={t.articleSub}
          />

          {articles.length > 0 ? (

           
            <div
              className="
                w-full
                min-w-0
                overflow-hidden
                mt-6
              "
            >
              <CategoryGrid
                articles={articles}
              />
            </div>

          ) : (

            <EmptyState
              icon="📰"
              title={t.noArticle}
              description={t.articleDesc}
            />

          )}

        </section>


        {/* VIDEOS */}

        <section className="w-full min-w-0">

          <SectionTitle
            title={t.videos}
            subtitle={t.videoSub}
          />

          {videos.length > 0 ? (

            <div
              className="
                w-full
                min-w-0
                overflow-hidden
                mt-6
              "
            >
              <CategoryVideos
                videos={videos}
              />
            </div>

          ) : (

            <EmptyState
              icon="🎥"
              title={t.noVideo}
              description={t.videoDesc}
            />

          )}

        </section>

      </div>

    </main>
  );
}

