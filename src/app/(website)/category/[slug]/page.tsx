import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

import {
  getCategoryBySlug,
  getCategoryArticles,
  getCategoryVideos,
} from "@/services/public/category.public.service";

import CategoryGrid from "@/components/category/category-grid";
import CategoryVideos from "@/components/category/category-videos";


// ============================================================
// TYPES
// ============================================================

interface Props {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lang?: "hi" | "en";
  }>;
}


// ============================================================
// METADATA
// ============================================================

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "यह कैटेगरी उपलब्ध नहीं है।",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name =
    category.nameHi ||
    category.name ||
    "समाचार";

  // ============================================================
  // GET CATEGORY ARTICLES
  // ============================================================

  const articles =
    await getCategoryArticles(category.id);

  // ============================================================
  // SORT LATEST ARTICLES
  // ============================================================

  const latestArticles = [...articles]
    .sort((a, b) => {
      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();

      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // ============================================================
  // ARTICLE TITLES
  // ============================================================

  const latestTitles =
    latestArticles
      .map((article) =>
        article.title?.trim()
      )
      .filter(Boolean);

  // ============================================================
  // DYNAMIC CATEGORY DESCRIPTION
  // ============================================================

  const description =
    latestTitles.length > 0
      ? `${name} की ताज़ा खबरें: ${latestTitles.join(
          " | "
        )} | ${siteConfig.name} पर पढ़ें ${name} से जुड़ी हर बड़ी खबर और लेटेस्ट अपडेट।`
      : `${name} से जुड़ी ताज़ा खबरें, ब्रेकिंग न्यूज़ और लेटेस्ट अपडेट ${siteConfig.name} पर पढ़ें।`;

  const url =
    `${siteConfig.url}/category/${category.slug}`;

  const title =
    `${name} News`;

  return {
    title,

    description,

    keywords: [
      name,
      `${name} news`,
      `${name} समाचार`,
      "भारत समाचार",
      "हिंदी समाचार",
      "ब्रेकिंग न्यूज़",
      siteConfig.name,
    ],

    alternates: {
      canonical: url,
    },

    icons: {
      icon: [
        {
          url: "/favicon.ico",
          type: "image/x-icon",
        },
        {
          url: "/icon.svg",
          type: "image/svg+xml",
        },
      ],
      shortcut: "/favicon.ico",
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "website",

      title:
        `${name} News | ${siteConfig.name}`,

      description,

      url,

      siteName:
        siteConfig.name,

      locale:
        siteConfig.locale,

      images: [
        {
          url:
            `${siteConfig.url}${siteConfig.logo}`,

          width: 1200,

          height: 630,

          alt:
            `${name} | ${siteConfig.name}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title:
        `${name} News | ${siteConfig.name}`,

      description,

      images: [
        `${siteConfig.url}${siteConfig.logo}`,
      ],
    },
  };
}


// ============================================================
// LABELS
// ============================================================

const labels = {

  hi: {

    articles:
      "ताज़ा खबरें",

    videos:
      "वीडियो",

    view:
      "सभी देखें",


    articleSub:
      "इस कैटेगरी की बड़ी खबरें",

    videoSub:
      "लेटेस्ट वीडियो अपडेट",


    noArticle:
      "अभी कोई खबर उपलब्ध नहीं है",

    noVideo:
      "अभी कोई वीडियो उपलब्ध नहीं है",


    articleDesc:
      "हमारी न्यूज़ टीम नई खबरों पर काम कर रही है। जल्द ही अपडेट मिलेगा।",

    videoDesc:
      "इस कैटेगरी के वीडियो अपडेट जल्द उपलब्ध होंगे।",

  },


  en: {

    articles:
      "Latest Articles",

    videos:
      "Videos",

    view:
      "View All",


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


// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {

  return (

    <div className="w-full min-w-0">

      <div
        className="
          flex
          items-center
          gap-3
          min-w-0
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


// ============================================================
// EMPTY STATE
// ============================================================

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


// ============================================================
// CATEGORY PAGE
// ============================================================

export default async function CategoryPage({
  params,
  searchParams,
}: Props) {


  // ==========================================================
  // PARAMS
  // ==========================================================

  const { slug } =
    await params;


  const {
    lang = "hi",
  } = await searchParams;


  // ==========================================================
  // CATEGORY
  // ==========================================================
  //
  // IMPORTANT:
  //
  // Category comes from:
  //
  // public/data/categories.json
  //
  // NO FIREBASE REQUEST
  //
  // ==========================================================

  const category =
    await getCategoryBySlug(slug);


  if (!category) {

    notFound();

  }

  const categoryUrl =
  `${siteConfig.url}/category/${category.slug}`;

const categoryName =
  category.nameHi ||
  category.name ||
  "समाचार";

const categoryDescription =
  `${categoryName} से जुड़ी ताज़ा खबरें, ब्रेकिंग न्यूज़ और लेटेस्ट अपडेट ${siteConfig.name} पर पढ़ें।`;

const categorySchema = {
  "@context": "https://schema.org",

  "@type": "CollectionPage",

  "@id": `${categoryUrl}#webpage`,

  url: categoryUrl,

  name:
    `${categoryName} News | ${siteConfig.name}`,

  description:
    categoryDescription,

  inLanguage:
    siteConfig.language,

  isPartOf: {
    "@type": "WebSite",

    "@id":
      `${siteConfig.url}/#website`,
  },

  publisher: {
    "@type": "NewsMediaOrganization",

    "@id":
      `${siteConfig.url}/#organization`,

    name:
      siteConfig.name,

    url:
      siteConfig.url,

    logo: {
      "@type": "ImageObject",

      url:
        `${siteConfig.url}/logos/logo-light.webp`,
    },
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",

  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "होम",
      item: siteConfig.url,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: categoryName,
      item: categoryUrl,
    },
  ],
};

  // ==========================================================
  // CATEGORY CONTENT
  // ==========================================================
  //
  // Articles:
  // public/data/articles.json
  //
  // Videos:
  // public/data/videos.json
  //
  // NO FIREBASE REQUEST
  //
  // ==========================================================

  const [
    articles,
    videos,
  ] = await Promise.all([

    getCategoryArticles(
      category.id
    ),

    getCategoryVideos(
      category.id
    ),

  ]);


  // ==========================================================
  // LANGUAGE
  // ==========================================================

  const t =
    labels[
      lang === "en"
        ? "en"
        : "hi"
    ];


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          categorySchema
        ),
      }}
    />
    <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(breadcrumbSchema),
  }}
/>

    <main
      className="
        w-full
        min-w-0
        overflow-hidden
      "
    >

<div className="container-news pt-5">
  <nav
    aria-label="Breadcrumb"
    className="w-full"
  >
    <ol
      className="
        flex
        items-center
        gap-2
        overflow-hidden
        text-sm
        font-medium
      "
    >
      {/* HOME */}
      <li className="shrink-0">
        <a
          href="/"
          className="
            text-zinc-500
            transition-colors
            hover:text-red-600
          "
        >
          होम
        </a>
      </li>

      {/* SEPARATOR */}
      <li
        aria-hidden="true"
        className="
          shrink-0
          text-zinc-300
          select-none
        "
      >
        /
      </li>

      {/* CURRENT CATEGORY */}
      <li
        aria-current="page"
        className="
          min-w-0
          max-w-[75vw]
          sm:max-w-none
          shrink
        "
      >
        <span
          className="
            inline-flex
            max-w-full
            items-center
            bg-red-600
            px-3
            py-1.5
            text-xs
            sm:text-sm
            font-bold
            text-white
            tracking-wide
            truncate
          "
          title={categoryName}
        >
          {categoryName}
        </span>
      </li>
    </ol>
  </nav>
</div>
      


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <div
        className="
          container-news
          w-full
          min-w-0
          py-10
          md:py-14
        "
      >


        {/* ==================================================
            ARTICLES
        ================================================== */}

        <section
          className="
            mb-16
            w-full
            min-w-0
          "
        >

          <SectionTitle
            title={
              t.articles
            }
            subtitle={
              t.articleSub
            }
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
                articles={
                  articles
                }
              />

            </div>

          ) : (

            <EmptyState
              icon="📰"
              title={
                t.noArticle
              }
              description={
                t.articleDesc
              }
            />

          )}

        </section>


        {/* ==================================================
            VIDEOS
        ================================================== */}

        <section
          className="
            w-full
            min-w-0
          "
        >

          <SectionTitle
            title={
              t.videos
            }
            subtitle={
              t.videoSub
            }
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
                videos={
                  videos
                }
              />

            </div>

          ) : (

            <EmptyState
              icon="🎥"
              title={
                t.noVideo
              }
              description={
                t.videoDesc
              }
            />

          )}

        </section>

      </div>

    </main>
    </>

  );

}