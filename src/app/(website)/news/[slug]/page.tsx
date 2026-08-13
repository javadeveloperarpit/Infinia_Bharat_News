import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getArticleBySlug,
  getRelatedArticles,
  getPublishedArticles,
} from "@/services/public/article.public.service";

import ArticleHeader from "@/components/article/article-header";
import ArticleContent from "@/components/article/article-content";
import ShareButtons from "@/components/article/share-buttons";
import AuthorBox from "@/components/article/author-box";
import RelatedNews from "@/components/article/related-news";
import ArticleSidebar from "@/components/article/article-sidebar";
import CommentsList from "@/components/comments/comments-list";

import {
  getAdsByType,
} from "@/services/ads.service";

import type {
  NativeAd,
} from "@/services/ads.service";



export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "News Not Found",
      description: "यह खबर उपलब्ध नहीं है।",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://infiniabharatnews.vercel.app";

  const articleUrl =
    `${siteUrl}/news/${article.slug}`;

  const title =
    article.seoTitle?.trim() ||
    article.title;

  const description =
    article.seoDescription?.trim() ||
    article.shortDescription ||
    `${article.title} - INFINIA BHARAT NEWS`;

  const image =
    article.thumbnail ||
    `${siteUrl}/logos/logo-light.png`;

  return {
    title,

    description,

    keywords: [
      article.category || "",
      article.categoryHi || "",
      "भारत समाचार",
      "हिंदी समाचार",
      "ताजा खबर",
      "ब्रेकिंग न्यूज़",
      "INFINIA BHARAT NEWS",
    ].filter(Boolean),

    authors: [
      {
        name:
          article.author?.name ||
          "INFINIA BHARAT NEWS",
      },
    ],

    creator:
      article.author?.name ||
      "INFINIA BHARAT NEWS",

    publisher:
      "INFINIA BHARAT NEWS",

    alternates: {
      canonical: articleUrl,
    },

    robots: {
      index: article.status === "published",
      follow: true,

      googleBot: {
        index: article.status === "published",
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },

    openGraph: {
      type: "article",

      locale: "hi_IN",

      url: articleUrl,

      siteName: "INFINIA BHARAT NEWS",

      title,

      description,

      publishedTime:
        article.createdAt,

      modifiedTime:
        article.updatedAt,

      authors: [
        article.author?.name ||
          "INFINIA BHARAT NEWS",
      ],

      section:
        article.categoryHi ||
        article.category ||
        "समाचार",

      images: [
        {
          url: image,
          alt: article.title,
          width: 1200,
          height: 675,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: [image],
    },
  };
}


export default async function NewsPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {

  // ======================================================
  // PARAMS
  // ======================================================

  const {
    slug,
  } = await params;


  // ======================================================
  // ARTICLE
  // ======================================================

  const article =
    await getArticleBySlug(slug);


  if (!article) {
    notFound();
  }


  // ======================================================
  // RELATED ARTICLES + NATIVE ADS
  // ======================================================

 const [
  related,
  latestArticles,
  nativeAds,
] = await Promise.all([
  getRelatedArticles(
    article.categoryId,
    article.slug
  ),

  getPublishedArticles(),

  getAdsByType("native"),
]);


  // ======================================================
  // PLAIN NATIVE ADS
  // ======================================================

  const nativeAdsPlain =
    nativeAds
      .filter(
        (
          ad
        ): ad is NativeAd & { id: string } =>
          ad.type === "native" &&
          ad.active
      )
      .map((ad) => ({
        ...ad,

        createdAt:
          ad.createdAt &&
          typeof ad.createdAt === "object" &&
          "toDate" in ad.createdAt
            ? (
                ad.createdAt as {
                  toDate: () => Date;
                }
              )
                .toDate()
                .toISOString()
            : typeof ad.createdAt === "string"
              ? ad.createdAt
              : null,

        updatedAt:
          ad.updatedAt &&
          typeof ad.updatedAt === "object" &&
          "toDate" in ad.updatedAt
            ? (
                ad.updatedAt as {
                  toDate: () => Date;
                }
              )
                .toDate()
                .toISOString()
            : typeof ad.updatedAt === "string"
              ? ad.updatedAt
              : null,
      }))
      .sort(
        (a, b) =>
          (b.priority ?? 1) -
          (a.priority ?? 1)
      );


  // ======================================================
  // ARTICLE URL
  // ======================================================

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://infiniabharatnews.vercel.app";

  const articleUrl =
    `${siteUrl}/news/${article.slug}`;


  // ======================================================
  // PAGE
  // ======================================================


  const articleImage =
  article.thumbnail ||
  `${siteUrl}/icons/fallback.png`;

const articleSchema = {
  "@context": "https://schema.org",

  "@type": "NewsArticle",

  "@id": `${articleUrl}#newsarticle`,

  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": articleUrl,
  },

  headline: article.title,

  description:
    article.seoDescription ||
    article.shortDescription ||
    "",

  image: [
    articleImage,
  ],

  datePublished:
    article.createdAt,

  dateModified:
    article.updatedAt ||
    article.createdAt,

  author: {
    "@type": "Person",

    name:
      article.author?.name ||
      "INFINIA BHARAT NEWS",

    url: article.author?.slug
      ? `${siteUrl}/author/${article.author.slug}`
      : undefined,
  },

  publisher: {
    "@type": "Organization",

    name: "INFINIA BHARAT NEWS",

    url: siteUrl,

    logo: {
      "@type": "ImageObject",

      url:
        `${siteUrl}/logos/logo-light.png`,
    },
  },

  articleSection:
    article.categoryHi ||
    article.category ||
    "समाचार",

  inLanguage: "hi-IN",

  isAccessibleForFree: true,
};
  return (
    <main className="container-news py-8">
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(articleSchema),
  }}
/>

      <div
        className="
          grid
          min-w-0
          grid-cols-12
          gap-4
          lg:gap-8
        "
      >

        {/* ==================================================
            SHARE SIDEBAR
        ================================================== */}

        <aside
          className="
            hidden
            lg:block
            lg:col-span-1
          "
        >
          <ShareButtons
            title={article.title}
            url={articleUrl}
          />
        </aside>


        {/* ==================================================
            ARTICLE
        ================================================== */}

        <article
          className="
            col-span-12
            min-w-0
            lg:col-span-8
          "
        >

          <ArticleHeader
            article={article}
          />


          {/* ==================================================
              MOBILE SHARE
          ================================================== */}

          <div
            className="
              lg:hidden
              sticky
              top-20
              z-40
              bg-white
              py-3
              border-y
              mb-6
            "
          >
            <ShareButtons
              title={article.title}
              url={articleUrl}
            />
          </div>


          {/* ==================================================
              AUTHOR
          ================================================== */}

          <AuthorBox
            article={article}
          />


          {/* ==================================================
              COMMENTS
          ================================================== */}

          <section
            id="comments"
            className="
              mt-10
              border-t
              border-zinc-200
              pt-8
            "
          >
            <CommentsList
              articleId={article.id}
              articleSlug={article.slug}
            />
          </section>


          {/* ==================================================
              ARTICLE CONTENT
          ================================================== */}

          <ArticleContent
            article={article}
          />

{/* ==================================================
    MOBILE TRENDING NEWS
================================================== */}

<div
  className="
    col-span-12
    mt-10
    w-full
    min-w-0
    lg:hidden
  "
>
  <ArticleSidebar
    trending={latestArticles}
  />
</div>

          {/* ==================================================
              RELATED NEWS + NATIVE ADS
          ================================================== */}

          <RelatedNews
            articles={related}
            nativeAds={nativeAdsPlain}
          />

        </article>




        {/* ==================================================
    DESKTOP TRENDING NEWS
================================================== */}

<aside
  className="
    hidden
    min-w-0
    w-full
    lg:col-span-3
    lg:block
  "
>
  <div
    className="
      sticky
      top-24
      w-full
      min-w-0
      self-start
    "
  >
    <ArticleSidebar
      trending={latestArticles}
    />
  </div>
</aside>
      </div>

    </main>
  );
}