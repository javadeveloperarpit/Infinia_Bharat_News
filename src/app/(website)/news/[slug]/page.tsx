import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getArticleBySlug,
  getRelatedArticles,
  getPublishedArticles,
} from "@/services/public/article.public.service";


import ArticleHeader from "@/components/article/article-header";
import ArticleContent from "@/components/article/article-content";
import ArticleBreadcrumb from "@/components/article/article-breadcrumb";
import ShareButtons from "@/components/article/share-buttons";
import AuthorBox from "@/components/article/author-box";
import RelatedNews from "@/components/article/related-news";
import ArticleSidebar from "@/components/article/article-sidebar";
import CommentsList from "@/components/comments/comments-list";
import ArticleAudioPlayer from "@/components/article/article-audio-player";

import {
  getAdsByType,
} from "@/services/public/ads.public.service";

import type {
  NativeAd,
} from "@/services/ads.service";

import { siteConfig } from "@/config/site";

import {
  getCategories,
} from "@/services/public/category.public.service";

// ==========================================================
// METADATA
// ==========================================================

// ==========================================================
// METADATA
// ==========================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);

  // ========================================================
  // ARTICLE NOT FOUND
  // ========================================================

  if (!article) {
    return {
      title: "News Not Found",

      description:
        "यह खबर उपलब्ध नहीं है।",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // ========================================================
  // BASIC SEO DATA
  // ========================================================

  const articleUrl =
    `${siteConfig.url}/news/${article.slug}`;

  const title =
    article.title;

  const description =
    article.seoDescription?.trim() ||
    article.shortDescription?.trim() ||
    `${article.title} - ${siteConfig.name}`;

  const image =
    article.thumbnail ||
    `${siteConfig.url}${siteConfig.logo}`;

  const contentImages = Array.from(
  article.content?.matchAll(
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  ) || []
).map((match) => match[1]);

const allImages = [
  image,
  ...contentImages,
].filter(
  (value, index, self) =>
    Boolean(value) &&
    self.indexOf(value) === index
);

  // ========================================================
  // AUTHOR SEO DATA
  // ========================================================

  const authorName =
    article.author?.name ||
    siteConfig.name;

  const authorUrl =
    article.author?.slug
      ? `${siteConfig.url}/author/${article.author.slug}`
      : undefined;

  // ========================================================
  // METADATA
  // ========================================================

  return {
    // ======================================================
    // TITLE
    // ======================================================

    title,

    // ======================================================
    // DESCRIPTION
    // ======================================================

    description,

    // ======================================================
    // KEYWORDS
    // ======================================================

    keywords: [
      article.category || "",
      article.categoryHi || "",
      "भारत समाचार",
      "हिंदी समाचार",
      "ताजा खबर",
      "ब्रेकिंग न्यूज़",
      siteConfig.name,
    ].filter(Boolean),

    // ======================================================
    // AUTHOR
    // ======================================================

    authors: [
      {
        name: authorName,

        ...(authorUrl
          ? {
              url: authorUrl,
            }
          : {}),
      },
    ],

    // ======================================================
    // CREATOR
    // ======================================================

    creator: authorName,

    // ======================================================
    // PUBLISHER
    // ======================================================

    publisher: siteConfig.name,

    // ======================================================
    // CANONICAL
    // ======================================================

    alternates: {
      canonical: articleUrl,
      types: {
    "application/amphtml": `${siteConfig.url}/amp/news/${article.slug}`,
  },
    },

    // ======================================================
    // ROBOTS
    // ======================================================

    robots: {
      index:
        article.status === "published",

      follow: true,

      googleBot: {
        index:
          article.status === "published",

        follow: true,

        "max-image-preview": "large",

        "max-video-preview": -1,

        "max-snippet": -1,
      },
    },

    // ======================================================
    // OPEN GRAPH
    // ======================================================

    openGraph: {
      type: "article",

      locale:
        siteConfig.locale,

      url:
        articleUrl,

      siteName:
        siteConfig.name,

      title,

      description,

      publishedTime:
        article.createdAt,

      modifiedTime:
        article.updatedAt ||
        article.createdAt,

      // IMPORTANT:
      // Author profile URL
      authors:
        authorUrl
          ? [authorUrl]
          : [authorName],

      section:
        article.categoryHi ||
        article.category ||
        "समाचार",

      images: allImages.map(
  (imageUrl) => ({
    url: imageUrl,
    alt: article.title,
  })
),
    },

    // ======================================================
    // TWITTER
    // ======================================================

    twitter: {
      card:
        "summary_large_image",

      title,

      description,

      images: allImages,
    },
  };
}

// ==========================================================
// NEWS PAGE
// ==========================================================

export default async function NewsPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  // ========================================================
  // PARAMS
  // ========================================================

  const {
    slug,
  } = await params;

  // ========================================================
  // ARTICLE
  // ========================================================

  const article =
    await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // ========================================================
  // RELATED + LATEST + ADS + CATEGORIES
  // ========================================================

  const [
    related,
    latestArticles,
    nativeAds,
    categories,
  ] = await Promise.all([
    getRelatedArticles(
      article.categoryId,
      article.slug
    ),

    getPublishedArticles(),

    getAdsByType("native"),

    getCategories(),
  ]);

  // ========================================================
  // NATIVE ADS
  // ========================================================

  const nativeAdsPlain =
    nativeAds
      .filter(
        (
          ad
        ): ad is NativeAd & {
          id: string;
        } =>
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

  // ========================================================
  // ARTICLE SEO DATA
  // ========================================================

  const articleImage =
    article.thumbnail ||
    `${siteConfig.url}${siteConfig.logo}`;

  const articleUrl =
    `${siteConfig.url}/news/${article.slug}`;
  
  const ampUrl =
  `${siteConfig.url}/amp/news/${article.slug}`;


    // ==========================================================
// ARTICLE CONTENT IMAGES
// ==========================================================

function extractArticleImages(
  html: string
) {
  if (!html) {
    return [];
  }

  const imageRegex =
    /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

  const images: {
    url: string;
    alt?: string;
  }[] = [];

  let match;

  while (
    (match =
      imageRegex.exec(html)) !== null
  ) {
    const fullTag =
      match[0];

    const imageUrl =
      match[1];

    const altMatch =
      fullTag.match(
        /alt=["']([^"']*)["']/i
      );

    if (
      imageUrl &&
      !images.some(
        (image) =>
          image.url === imageUrl
      )
    ) {
      images.push({
        url: imageUrl,

       alt:
  altMatch?.[1] ||
  article?.title ||
  "Article image",
      });
    }
  }

  return images;
}


const contentImages =
  extractArticleImages(
    article.content || ""
  );

  // ========================================================
  // CATEGORY
  //
  // article.categoryId = Firebase document ID
  // ========================================================

  const category =
    categories.find(
      (item) =>
        item.id === article.categoryId
    );

  const categoryName =
    article.categoryHi ||
    article.category ||
    category?.name ||
    "समाचार";

  const categorySlug =
    category?.slug;

  const categoryUrl =
    categorySlug
      ? `${siteConfig.url}/category/${categorySlug}`
      : `${siteConfig.url}/category`;

  // ========================================================
  // BREADCRUMB SCHEMA
  // ========================================================

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

      ...(categorySlug
        ? [
            {
              "@type": "ListItem",

              position: 2,

              name: categoryName,

              item: categoryUrl,
            },
          ]
        : []),

      {
        "@type": "ListItem",

        position:
          categorySlug ? 3 : 2,

        name: article.title,

        item: articleUrl,
      },
    ],
  };

  function extractYouTubeVideos(html: string) {
  if (!html) return [];

  const videos: {
    id: string;
    embedUrl: string;
    thumbnailUrl: string;
  }[] = [];

  const regex =
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const id = match[1];

    if (!id) continue;

    if (
      videos.some(
        (video) => video.id === id
      )
    ) {
      continue;
    }

    videos.push({
      id,

      embedUrl:
        `https://www.youtube.com/embed/${id}`,

      thumbnailUrl:
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }

  return videos;
}


const youtubeVideos =
  extractYouTubeVideos(
    article.content || ""
  );
  // ========================================================
  // NEWS ARTICLE SCHEMA
  // ========================================================

  const articleSchema = {
  "@context": "https://schema.org",

  "@type": "NewsArticle",

  "@id":
    `${articleUrl}#newsarticle`,

  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": articleUrl,
  },

  headline:
    article.title,

  description:
    article.seoDescription?.trim() ||
    article.shortDescription?.trim() ||
    "",

  image: [
    {
      "@type": "ImageObject",

      url: articleImage,

      width: 1200,

      height: 630,

      caption: article.title,
    },

    ...contentImages.map(
      (image) => ({
        "@type": "ImageObject",

        url: image.url,

        caption:
          image.alt ||
          article.title,
      })
    ),
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
      siteConfig.name,

    ...(article.author?.slug
      ? {
          url:
            `${siteConfig.url}/author/${article.author.slug}`,
        }
      : {}),
  },

  publisher: {
    "@type":
      "NewsMediaOrganization",

    "@id":
      `${siteConfig.url}/#organization`,

    name:
      siteConfig.name,

    url:
      siteConfig.url,

    logo: {
      "@type":
        "ImageObject",

      url:
        `${siteConfig.url}/logos/logo-light.webp`,

      width: 1200,

      height: 630,
    },
  },

  articleSection:
    categoryName,

  inLanguage:
    siteConfig.language,

  isAccessibleForFree:
    true,

  ...(youtubeVideos.length > 0
    ? {
        video:
          youtubeVideos.map(
            (video) => ({
              "@type":
                "VideoObject",

              "@id":
                `${articleUrl}#video-${video.id}`,

              name:
                article.title,

              description:
                article.seoDescription?.trim() ||
                article.shortDescription?.trim() ||
                article.title,

              thumbnailUrl:
                video.thumbnailUrl,

              embedUrl:
                video.embedUrl,

              uploadDate:
                article.createdAt,
            })
          ),
      }
    : {}),
};

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <main className="container-news py-8">

      {/* ==================================================
          NEWS ARTICLE SCHEMA
      ================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              articleSchema
            ),
        }}
      />

      {/* ==================================================
          BREADCRUMB SCHEMA
      ================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              breadcrumbSchema
            ),
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
            DESKTOP SHARE
        ================================================== */}

        <aside
          className="
            hidden
            lg:col-span-1
            lg:block
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

          {/* ==================================================
              BREADCRUMB
          ================================================== */}

          <ArticleBreadcrumb
            article={article}
            category={category}
          />

          {/* ==================================================
              ARTICLE HEADER
          ================================================== */}

          <ArticleHeader
            article={article}
          />


            
          {/* ==================================================
              MOBILE SHARE
          ================================================== */}

          <div
            className="
              sticky
              top-16
              z-40
              mb-6
              border-y
              bg-white
              py-3
              lg:hidden
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
           <ArticleAudioPlayer
  title={article.title}
  content={article.content}
  language={
    /^[\x00-\x7F\s]+$/.test(
      `${article.title} ${article.content || ""}`
        .replace(/<[^>]*>/g, "")
        .slice(0, 1000)
    )
      ? "en-US"
      : "hi-IN"
  }
/>
          {/* ==================================================
              ARTICLE CONTENT
          ================================================== */}

          <ArticleContent
            article={article}
          />

          {/* ==================================================
              MOBILE TRENDING
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
              trending={
                latestArticles
              }
            />
          </div>

          {/* ==================================================
              RELATED NEWS + ADS
          ================================================== */}

          <RelatedNews
            articles={related}
            nativeAds={
              nativeAdsPlain
            }
          />

        </article>

        {/* ==================================================
            DESKTOP TRENDING
        ================================================== */}

        <aside
          className="
            hidden
            w-full
            min-w-0
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
              trending={
                latestArticles
              }
            />
          </div>
        </aside>

      </div>

    </main>
  );
}