import type { PublicArticle } from "@/services/public/article.public.service";

import {
  convertToAmpHtml,
  extractContentImages,
  extractYoutubeVideos,
  calculateReadTime,
  formatHindiDate,
  escapeAttr,
  safeJsonLd,
} from "./sanitize-content";

// ============================================================
// TYPES
// ============================================================

interface SiteConfigLike {
  url: string;
  name: string;
  logo: string;
  locale?: string;
  language?: string;
}

interface CategoryLike {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
}

interface RenderAmpArticleInput {
  article: PublicArticle;
  related: PublicArticle[];
  category?: CategoryLike;
  categories?: CategoryLike[];
  siteConfig: SiteConfigLike;
}

// ============================================================
// BRAND TOKENS
// ============================================================

const HEADER_DARK = "#111111";
const HEADER_DARK_2 = "#181818";

const FOOTER_DARK = "#0b0b0b";

const RED_600 = "#dc2626";
const RED_700 = "#b91c1c";

const FOOTER_GOLD = "#d4af37";

const PRIMARY = "#730708";
const BRAND_GOLD = "#ECCA6D";

const BG = "#FDF8F8";
const FOREGROUND = "#18181B";
const MUTED = "#71717A";
const BORDER = "#E4E4E7";

// ============================================================
// HARD-CODED HINDI CATEGORIES
// ============================================================
//
// AMP page ko categories prop par dependent nahi rakha gaya.
// Isliye categories hamesha render hongi.
//
// English categories intentionally navigation se hatai gayi hain.
//

const AMP_CATEGORIES: Array<{
  name: string;
  slug: string;
}> = [
  {
    name: "भारत",
    slug: "india",
  },
  {
    name: "दुनिया",
    slug: "world",
  },
  {
    name: "राजनीति",
    slug: "politics",
  },
  {
    name: "बिजनेस",
    slug: "business",
  },
  {
    name: "खेल",
    slug: "sports",
  },
  {
    name: "मनोरंजन",
    slug: "entertainment",
  },
  {
    name: "टेक्नोलॉजी",
    slug: "technology",
  },
  {
    name: "स्वास्थ्य",
    slug: "health",
  },
  {
    name: "शिक्षा",
    slug: "education",
  },
  {
    name: "राज्य समाचार",
    slug: "state-news",
  },
  {
    name: "अपराध",
    slug: "crime",
  },
  {
    name: "लाइफस्टाइल",
    slug: "lifestyle",
  },
  {
    name: "विज्ञान",
    slug: "science",
  },
  {
    name: "धर्म",
    slug: "religion",
  },
  {
    name: "वायरल",
    slug: "viral",
  },
  {
    name: "ऑटो",
    slug: "auto",
  },
];

// ============================================================
// MAIN BUILDER
// ============================================================

export function renderAmpArticle({
  article,
  related,
  category,
  siteConfig,
}: RenderAmpArticleInput): string {
  const articleUrl = `${siteConfig.url}/news/${article.slug}`;

  const title = article.title;

  const description =
    article.seoDescription?.trim() ||
    article.shortDescription?.trim() ||
    `${article.title} - ${siteConfig.name}`;

  const heroImage =
    article.thumbnail || `${siteConfig.url}${siteConfig.logo}`;

  const categoryName =
    article.categoryHi ||
    article.category ||
    category?.nameHi ||
    category?.name ||
    "समाचार";

  const categoryUrl = category?.slug
    ? `${siteConfig.url}/category/${category.slug}`
    : `${siteConfig.url}/category`;

  const authorName = article.author?.name || siteConfig.name;
  const authorPhoto = article.author?.photo || "";
  const authorSlug = article.author?.slug;

  const authorUrl = authorSlug
    ? `${siteConfig.url}/author/${authorSlug}`
    : undefined;

  const authorBio = (article.author?.bio || "").trim();

  const publishedDate = formatHindiDate(article.createdAt);
  const updatedDate = formatHindiDate(
    article.updatedAt || article.createdAt
  );

  const readTime = calculateReadTime(article.content);

  const contentImages = extractContentImages(article.content || "");
  const youtubeVideos = extractYoutubeVideos(article.content || "");
  const ampBody = convertToAmpHtml(article.content || "");

  const needsYoutube = youtubeVideos.length > 0;

  // ==========================================================
  // SCHEMA
  // ==========================================================

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",

    "@id": `${articleUrl}#newsarticle`,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    headline: article.title,

    description,

    image: [
      {
        "@type": "ImageObject",
        url: heroImage,
        width: 1200,
        height: 630,
        caption: article.title,
      },

      ...contentImages.map((img) => ({
        "@type": "ImageObject",
        url: img.url,
        caption: img.alt || article.title,
      })),
    ],

    datePublished: article.createdAt,

    dateModified: article.updatedAt || article.createdAt,

    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },

    publisher: {
      "@type": "NewsMediaOrganization",

      "@id": `${siteConfig.url}/#organization`,

      name: siteConfig.name,

      url: siteConfig.url,

      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logos/logo-light.webp`,
        width: 1200,
        height: 630,
      },
    },

    articleSection: categoryName,

    inLanguage: siteConfig.language || "hi",

    isAccessibleForFree: true,
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

      ...(category?.slug
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
        position: category?.slug ? 3 : 2,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  // ==========================================================
  // CATEGORY NAV
  // ==========================================================

  const categoryNavHtml = AMP_CATEGORIES.map(
    (item) => `
      <a
        class="desktop-category-link"
        href="${siteConfig.url}/category/${escapeAttr(item.slug)}"
      >
        ${escapeAttr(item.name)}
      </a>
    `
  ).join("");

  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  const mobileCategoryHtml = AMP_CATEGORIES.map(
    (item) => `
      <a
        class="mobile-menu-link"
        href="${siteConfig.url}/category/${escapeAttr(item.slug)}"
      >
        <span>${escapeAttr(item.name)}</span>
        <span class="menu-arrow">›</span>
      </a>
    `
  ).join("");

  // ==========================================================
  // BREAKING
  // ==========================================================

  const breakingBadge = article.breaking
    ? `<span class="badge badge-breaking">ब्रेकिंग</span>`
    : "";

  // ==========================================================
  // AUTHOR
  // ==========================================================

  const authorAvatarHtml = authorPhoto
    ? `
      <amp-img
        src="${escapeAttr(authorPhoto)}"
        alt="${escapeAttr(authorName)}"
        width="40"
        height="40"
        layout="fixed"
        class="author-avatar">
      </amp-img>
    `
    : `
      <span class="author-avatar author-avatar--fallback">
        ${escapeAttr(authorName.charAt(0))}
      </span>
    `;

  const authorBioHtml = authorBio
    ? authorBio
        .split(/\n{2,}/)
        .map(
          (para) =>
            `<p>${escapeAttr(para).replace(/\n/g, "<br>")}</p>`
        )
        .join("")
    : "";

  // ==========================================================
  // YOUTUBE
  // ==========================================================

  const youtubeSectionHtml = needsYoutube
    ? `
      <section class="block-section">

        <h2 class="section-title">
          वीडियो देखें
        </h2>

        ${youtubeVideos
          .map(
            (video) => `
              <amp-youtube
                data-videoid="${escapeAttr(video.id)}"
                layout="responsive"
                width="480"
                height="270"
                class="youtube-embed">
              </amp-youtube>
            `
          )
          .join("")}

      </section>
    `
    : "";

  // ==========================================================
  // RELATED
  // ==========================================================

  const relatedItemsHtml =
    related.length > 0
      ? related
          .slice(0, 6)
          .map((item) => {
            const rImg = item.thumbnail || heroImage;

            return `
              <a
                class="related-card"
                href="${siteConfig.url}/amp/news/${escapeAttr(item.slug)}"
              >

                <amp-img
                  src="${escapeAttr(rImg)}"
                  alt="${escapeAttr(item.title)}"
                  width="300"
                  height="180"
                  layout="responsive"
                  class="related-img">
                </amp-img>

                <span class="related-title">
                  ${escapeAttr(item.title)}
                </span>

              </a>
            `;
          })
          .join("")
      : "";

  // ==========================================================
  // FULL DOCUMENT
  // ==========================================================

  return `<!doctype html>

<html ⚡ lang="${siteConfig.language || "hi"}">

<head>

<meta charset="utf-8">

<script
  async
  src="https://cdn.ampproject.org/v0.js">
</script>

<title>${escapeAttr(title)}</title>

<link
  rel="canonical"
  href="${articleUrl}">

<meta
  name="viewport"
  content="width=device-width,minimum-scale=1,initial-scale=1">

<meta
  name="description"
  content="${escapeAttr(description)}">

<meta
  name="robots"
  content="${
    article.status === "published"
      ? "index,follow"
      : "noindex,nofollow"
  }">

<meta
  name="theme-color"
  content="${HEADER_DARK}">

<meta
  property="og:type"
  content="article">

<meta
  property="og:url"
  content="${articleUrl}">

<meta
  property="og:site_name"
  content="${escapeAttr(siteConfig.name)}">

<meta
  property="og:title"
  content="${escapeAttr(title)}">

<meta
  property="og:description"
  content="${escapeAttr(description)}">

<meta
  property="og:image"
  content="${escapeAttr(heroImage)}">

<meta
  property="article:published_time"
  content="${article.createdAt || ""}">

<meta
  property="article:modified_time"
  content="${article.updatedAt || article.createdAt || ""}">

<meta
  property="article:section"
  content="${escapeAttr(categoryName)}">

<meta
  name="twitter:card"
  content="summary_large_image">

<meta
  name="twitter:title"
  content="${escapeAttr(title)}">

<meta
  name="twitter:description"
  content="${escapeAttr(description)}">

<meta
  name="twitter:image"
  content="${escapeAttr(heroImage)}">

<!-- AMP SIDEBAR -->

<script
  async
  custom-element="amp-sidebar"
  src="https://cdn.ampproject.org/v0/amp-sidebar-0.1.js">
</script>

<!-- AMP SOCIAL SHARE -->

<script
  async
  custom-element="amp-social-share"
  src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js">
</script>

${
  needsYoutube
    ? `
<script
  async
  custom-element="amp-youtube"
  src="https://cdn.ampproject.org/v0/amp-youtube-0.1.js">
</script>
`
    : ""
}

<style amp-boilerplate>
body {
  -webkit-animation: -amp-start 8s steps(1,end) 0s 1 normal both;
  -moz-animation: -amp-start 8s steps(1,end) 0s 1 normal both;
  -ms-animation: -amp-start 8s steps(1,end) 0s 1 normal both;
  animation: -amp-start 8s steps(1,end) 0s 1 normal both;
}

@-webkit-keyframes -amp-start {
  from { visibility:hidden }
  to { visibility:visible }
}

@-moz-keyframes -amp-start {
  from { visibility:hidden }
  to { visibility:visible }
}

@-ms-keyframes -amp-start {
  from { visibility:hidden }
  to { visibility:visible }
}

@-o-keyframes -amp-start {
  from { visibility:hidden }
  to { visibility:visible }
}

@keyframes -amp-start {
  from { visibility:hidden }
  to { visibility:visible }
}
</style>

<noscript>
<style amp-boilerplate>
body {
  -webkit-animation:none;
  -moz-animation:none;
  -ms-animation:none;
  animation:none;
}
</style>
</noscript>

<script type="application/ld+json">
${safeJsonLd(articleSchema)}
</script>

<script type="application/ld+json">
${safeJsonLd(breadcrumbSchema)}
</script>

<style amp-custom>

/* ============================================================
   RESET
============================================================ */

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;

  background: ${BG};
  color: ${FOREGROUND};

  font-family:
    Arial,
    Helvetica,
    sans-serif;

  -webkit-font-smoothing: antialiased;
}

body {
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

/* ============================================================
   PAGE WRAPPER
============================================================ */

.wrap {
  width: 100%;
  max-width: 1400px;

  margin: 0 auto;

  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 768px) {

  .wrap {
    padding-left: 28px;
    padding-right: 28px;
  }

}

@media (min-width: 1024px) {

  .wrap {
    padding-left: 40px;
    padding-right: 40px;
  }

}

/* ============================================================
   TOP STRIP
============================================================ */

.top-strip {
  background: #f7f7f7;

  border-bottom:
    1px solid #e4e4e7;
}

.top-strip .wrap {

  min-height: 34px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  font-size: 11px;

  font-weight: 600;

  color: #52525b;
}

.top-strip-right {
  text-align: right;
}

@media (max-width: 600px) {

  .top-strip .wrap {
    justify-content: center;
  }

  .top-strip-right {
    display: none;
  }

}

/* ============================================================
   MAIN HEADER
============================================================ */

.site-header {
  background:
    linear-gradient(
      180deg,
      ${HEADER_DARK_2} 0%,
      ${HEADER_DARK} 100%
    );

  border-bottom:
    1px solid rgba(255,255,255,0.09);

  box-shadow:
    0 2px 8px rgba(0,0,0,0.12);
}

.site-header .wrap {

  min-height: 70px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;
}

.header-left {

  display: flex;

  align-items: center;

  min-width: 0;

  gap: 12px;
}

.header-logo {

  display: block;

  flex-shrink: 0;
}

.header-logo amp-img {
  display: block;
}

.header-logo amp-img {
  display: block;
  width: 170px;
  height: 54px;
}
  @media (max-width: 767px) {
  .header-logo amp-img {
    width: 155px;
    height: 49px;
  }
}
/* ============================================================
   HAMBURGER
============================================================ */

.menu-button {

  width: 42px;
  height: 42px;

  display: none;

  align-items: center;
  justify-content: center;

  border: 1px solid rgba(255,255,255,0.16);

  border-radius: 8px;

  background:
    rgba(255,255,255,0.06);

  color: #ffffff;

  font-size: 23px;

  font-weight: 700;

  line-height: 1;

  cursor: pointer;
}

.menu-icon {

  display: block;

  width: 20px;
  height: 14px;

  position: relative;
}

.menu-icon::before,
.menu-icon::after,
.menu-icon {

  background: transparent;
}

.menu-line {

  position: absolute;

  left: 0;

  width: 20px;
  height: 2px;

  background: #ffffff;

  border-radius: 2px;
}

.menu-line:nth-child(1) {
  top: 0;
}

.menu-line:nth-child(2) {
  top: 6px;
}

.menu-line:nth-child(3) {
  top: 12px;
}

@media (max-width: 767px) {

  .menu-button {
    display: flex;
  }

}

/* ============================================================
   PROFESSIONAL REELS BUTTON
============================================================ */

.reels-btn {
  display: inline-flex;

  align-items: center;
  justify-content: center;

  gap: 8px;

  min-height: 42px;

  padding: 0 16px;

  background:
    linear-gradient(
      135deg,
      #8b1113 0%,
      #c8102e 100%
    );

  border: 1px solid rgba(255,255,255,0.18);

  border-radius: 9px;

  color: #ffffff;

  font-size: 12px;

  font-weight: 900;

  letter-spacing: 0.06em;

  box-shadow:
    0 5px 16px rgba(200,16,46,0.28);

  white-space: nowrap;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.reels-btn:active {
  transform: scale(0.97);
}

.reels-icon {
  width: 22px;
  height: 22px;

  display: inline-flex;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: rgba(255,255,255,0.16);

  color: #ffffff;

  font-size: 9px;

  line-height: 1;
}

.reels-text {
  white-space: nowrap;
}

@media (max-width: 420px) {

  .reels-btn {
    min-height: 39px;

    padding: 0 11px;

    gap: 6px;

    font-size: 10.5px;

    border-radius: 8px;
  }

  .reels-icon {
    width: 20px;
    height: 20px;
  }

}

/* ============================================================
   DESKTOP CATEGORY NAV
============================================================ */

.nav-strip {

  background:
    ${HEADER_DARK};

  border-bottom:
    1px solid rgba(255,255,255,0.09);

  overflow-x: auto;

  white-space: nowrap;

  -webkit-overflow-scrolling: touch;

  scrollbar-width: none;
}

.nav-strip::-webkit-scrollbar {
  display: none;
}

.nav-inner {

  min-height: 44px;

  display: flex;

  align-items: center;

  gap: 0;
}

.nav-inner a {

  display: inline-flex;

  align-items: center;

  min-height: 44px;

  position: relative;

  padding:
    0 13px;

  color:
    #d4d4d8;

  font-size:
    13px;

  font-weight:
    700;
}

.nav-inner a:first-child {
  padding-left: 0;
}

.nav-inner a:hover {
  color: #ffffff;
}

.nav-inner a::after {

  content: "";

  position: absolute;

  left: 13px;
  right: 13px;
  bottom: 0;

  height: 2px;

  background: ${BRAND_GOLD};

  transform: scaleX(0);

}

.nav-inner a:hover::after {
  transform: scaleX(1);
}

@media (max-width: 767px) {

  .nav-strip {
    display: none;
  }

}

/* ============================================================
   AMP MOBILE SIDEBAR
============================================================ */

#mobile-menu {

  width: 300px;
  max-width: 88vw;

  background: #ffffff;

  color: ${FOREGROUND};
}

.mobile-menu-header {

  min-height: 70px;

  padding:
    0 18px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  background:
    ${HEADER_DARK};

  color: #ffffff;
}

.mobile-menu-title {

  font-size: 17px;

  font-weight: 800;
}

.mobile-menu-close {

  width: 38px;
  height: 38px;

  display: flex;

  align-items: center;
  justify-content: center;

  border:
    1px solid rgba(255,255,255,0.15);

  border-radius: 7px;

  color: #ffffff;

  font-size: 25px;

  font-weight: 300;

  line-height: 1;

  background:
    rgba(255,255,255,0.06);
}

.mobile-menu-body {

  padding:
    8px 14px 24px;
}

.mobile-menu-link {

  min-height: 48px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    0 8px;

  border-bottom:
    1px solid #eeeeee;

  color: #27272a;

  font-size: 14px;

  font-weight: 700;
}

.mobile-menu-link:last-child {
  border-bottom: none;
}

.menu-arrow {

  color: #a1a1aa;

  font-size: 21px;

  line-height: 1;
}

.mobile-menu-home {

  background:
    #faf5f5;

  color:
    ${PRIMARY};

  border-radius:
    7px;

  margin-bottom:
    5px;

  padding-left:
    12px;

  padding-right:
    12px;
}

/* ============================================================
   ARTICLE SHELL
============================================================ */

.layout {

  display: flex;

  flex-direction: column;

  padding:
    22px 0 0;
}

.article-head {
  order: 1;
}

.share-rail {
  order: 2;
}

.article-body {
  order: 3;
}

.related-rail {

  order: 4;

  margin-top:
    34px;
}

@media (min-width: 1024px) {

  .layout {

    display: grid;

    grid-template-columns:
      56px
      minmax(0,1fr)
      300px;

    gap: 32px;

    align-items: start;

    padding-top:
      32px;
  }

  .share-rail {

    grid-column: 1;
    grid-row: 1 / span 2;

    position: sticky;

    top: 120px;

    flex-direction: column;
  }

  .article-head {

    grid-column: 2;
    grid-row: 1;
  }

  .article-body {

    grid-column: 2;
    grid-row: 2;
  }

  .related-rail {

    grid-column: 3;
    grid-row: 1 / span 2;

    position: sticky;

    top: 120px;

    margin-top: 0;
  }

}

/* ============================================================
   ARTICLE HEADER
============================================================ */

.badge {

  display: inline-block;

  font-size: 11px;

  font-weight: 800;

  letter-spacing: 0.04em;

  padding:
    4px 10px;

  border-radius:
    999px;

  margin-right:
    6px;

  margin-bottom:
    10px;
}

.badge-breaking {

  background:
    ${BRAND_GOLD};

  color:
    ${PRIMARY};
}

.badge-category {

  background:
    rgba(115,7,8,0.08);

  color:
    ${PRIMARY};

  border:
    1px solid rgba(115,7,8,0.25);
}

h1.title {

  font-size:
    26px;

  line-height:
    1.32;

  font-weight:
    900;

  margin:
    6px 0 14px;

  color:
    ${FOREGROUND};
}

@media (min-width: 1024px) {

  h1.title {
    font-size: 32px;
  }

}

.meta-row {

  display:
    flex;

  align-items:
    center;

  gap:
    10px;

  padding:
    10px 0;

  border-top:
    1px solid ${BORDER};

  border-bottom:
    1px solid ${BORDER};
}

.author-avatar {

  border-radius:
    999px;

  overflow:
    hidden;

  background:
    ${BRAND_GOLD};
}

.author-avatar--fallback {

  width:
    40px;

  height:
    40px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  font-weight:
    800;

  color:
    ${PRIMARY};
}

.meta-text {

  font-size:
    13px;

  line-height:
    1.5;
}

.meta-text .author-name {

  font-weight:
    700;

  color:
    ${FOREGROUND};
}

.meta-text .meta-sub {

  color:
    ${MUTED};
}

/* ============================================================
   SHARE
============================================================ */

.share-rail {

  display:
    flex;

  gap:
    10px;

  align-items:
    center;
}

.share-rail amp-social-share {

  width:
    36px;

  height:
    36px;

  border-radius:
    8px;
}

@media (max-width: 1023px) {

  .share-rail {

    position:
      sticky;

    top:
      0;

    z-index:
      40;

    background:
      ${BG};

    padding:
      10px 16px;

    margin:
      0 -16px;

    border-bottom:
      1px solid ${BORDER};
  }

}

@media (min-width: 1024px) {

  .share-rail amp-social-share {

    width:
      40px;

    height:
      40px;
  }

}

/* ============================================================
   HERO
============================================================ */

.hero-figure {

  margin:
    18px 0 8px;
}

@media (min-width: 1024px) {

  .hero-figure {
    margin-top: 0;
  }

}

.hero-figure amp-img {

  border-radius:
    10px;
}

.hero-caption {

  font-size:
    12px;

  color:
    ${MUTED};

  margin:
    8px 0 20px;

  text-align:
    center;
}

/* ============================================================
   CONTENT
============================================================ */

.content {

  width:
    100%;

  max-width:
    100%;

  color:
    #27272a;

  overflow-wrap:
    anywhere;

  word-break:
    break-word;

  line-height:
    1.9;
}

.content p {

  font-size:
    18px;

  line-height:
    1.85;

  margin-top:
    0;

  margin-bottom:
    1rem;

  overflow-wrap:
    anywhere;
}

.content h1,
.content h2,
.content h3 {

  font-weight:
    800;

  line-height:
    1.3;

  color:
    inherit;

  margin-top:
    1.8rem;

  margin-bottom:
    1rem;
}

.content h1 {

  font-size:
    28px;

  font-weight:
    900;

  line-height:
    1.25;

  margin-top:
    36px;

  margin-bottom:
    20px;
}

.content h2 {
  font-size: 22px;
}

.content h3 {
  font-size: 19px;
}

.content strong {
  font-weight: 800;
}

.content a {

  color:
    ${PRIMARY};

  text-decoration:
    underline;

  overflow-wrap:
    anywhere;

  word-break:
    break-word;
}

.content ul {

  list-style-type:
    disc;

  padding-left:
    1.5rem;

  margin:
    1rem 0;
}

.content ol {

  list-style-type:
    decimal;

  padding-left:
    1.5rem;

  margin:
    1rem 0;
}

.content li {

  font-size:
    17px;

  line-height:
    1.8;

  margin:
    10px 0 0.35rem;

  overflow-wrap:
    anywhere;
}

.content blockquote {

  margin:
    1.5rem 0;

  padding:
    20px 25px;

  border-left:
    5px solid ${PRIMARY};

  background:
    #faf5f5;

  border-radius:
    10px;

  font-style:
    italic;
}

.content hr {

  border:
    0;

  border-top:
    1px solid #d4d4d8;

  margin:
    2rem 0;
}

.content figure {

  width:
    100%;

  max-width:
    100%;

  margin-left:
    0;

  margin-right:
    0;
}

.content figure.image {

  margin:
    1.5rem auto;

  max-width:
    100%;
}

.content figure.image.image_resized {
  max-width: 100%;
}

.content figure.image .amp-content-img {

  display:
    block;

  height:
    auto;

  max-width:
    100%;

  border-radius:
    8px;
}

.content figure.image.image-style-side {

  float:
    right;

  margin-left:
    1.5rem;

  margin-bottom:
    1rem;
}

.content figcaption {

  text-align:
    center;

  font-size:
    0.875rem;

  opacity:
    0.7;

  margin-top:
    0.5rem;
}

.content table {

  display:
    block;

  width:
    100%;

  max-width:
    100%;

  overflow-x:
    auto;

  border-collapse:
    collapse;

  -webkit-overflow-scrolling:
    touch;
}

.content figure.table {

  width:
    100%;

  max-width:
    100%;

  overflow-x:
    auto;

  margin:
    1.5rem 0;

  -webkit-overflow-scrolling:
    touch;
}

.content figure.table table {

  width:
    100%;

  border-collapse:
    collapse;
}

.content figure.table th,
.content figure.table td {

  border:
    1px solid #d4d4d8;

  padding:
    0.6rem 0.75rem;

  text-align:
    left;
}

.content pre {

  max-width:
    100%;

  overflow-x:
    auto;

  padding:
    1rem;

  border-radius:
    0.75rem;

  background:
    #18181b;

  color:
    #fff;

  white-space:
    pre-wrap;

  overflow-wrap:
    anywhere;
}

.content code {
  overflow-wrap: anywhere;
}

@media (min-width: 1024px) {

  .content p {

    font-size:
      19px;

    line-height:
      1.9;
  }

  .content h2 {
    font-size: 26px;
  }

  .content h3 {
    font-size: 21px;
  }

  .content li {
    font-size: 18px;
  }

}

@media (max-width: 640px) {

  .content figure.image.image-style-side {

    float:
      none;

    margin-left:
      0;

    margin-right:
      0;
  }

}

/* ============================================================
   BLOCK SECTION
============================================================ */

.block-section {
  margin:
    34px 0;
}

.section-title {

  font-size:
    19px;

  font-weight:
    800;

  display:
    flex;

  align-items:
    center;

  gap:
    10px;

  color:
    ${PRIMARY};

  margin:
    0 0 14px;
}

.section-title::before {

  content:
    "";

  width:
    5px;

  height:
    22px;

  background:
    ${BRAND_GOLD};

  border-radius:
    10px;
}

.youtube-embed {

  border-radius:
    10px;

  margin-bottom:
    14px;
}

/* ============================================================
   AUTHOR BOX
============================================================ */

.author-box {

  margin:
    34px 0 0;

  padding:
    18px;

  background:
    ${BG};

  border:
    1px solid ${BORDER};

  border-radius:
    12px;
}

.author-box-head {

  display:
    flex;

  align-items:
    center;

  gap:
    12px;

  margin-bottom:
    10px;
}

.author-box-name {

  font-weight:
    800;

  font-size:
    15px;
}

.author-box-role {

  font-size:
    12px;

  color:
    ${MUTED};
}

.author-box p {

  font-size:
    13.5px;

  line-height:
    1.7;

  color:
    #333;

  margin:
    0 0 10px;
}

/* ============================================================
   RELATED
============================================================ */

.related-rail .section-title {
  font-size: 16px;
}

.related-list {

  display:
    grid;

  grid-template-columns:
    1fr 1fr;

  gap:
    12px;
}

@media (min-width: 1024px) {

  .related-list {

    display:
      flex;

    flex-direction:
      column;

    gap:
      18px;
  }

}

.related-card {
  display: block;
}

.related-img {

  border-radius:
    8px;

  margin-bottom:
    6px;
}

.related-title {

  font-size:
    13.5px;

  font-weight:
    600;

  line-height:
    1.4;

  display:
    block;

  color:
    ${FOREGROUND};
}

/* ============================================================
   FOOTER
============================================================ */

.site-footer {

  margin-top:
    48px;

  background:
    ${FOOTER_DARK};

  color:
    #a1a1aa;
}

.footer-inner {

  padding:
    42px 16px 28px;
}

@media (min-width: 768px) {

  .footer-inner {

    padding:
      44px 28px 30px;
  }

}

@media (min-width: 1024px) {

  .footer-inner {

    padding:
      48px 40px 32px;
  }

}

/* ============================================================
   FOOTER BRAND
============================================================ */

.footer-brand {

  max-width:
    560px;

  margin-bottom:
    28px;
}

.footer-brand amp-img {

  display:
    block;

  margin-bottom:
    16px;
}

.footer-brand p {

  font-size:
    13px;

  line-height:
    1.8;

  color:
    #a1a1aa;

  max-width:
    520px;

  margin:
    0;
}

/* ============================================================
   FOOTER COLUMNS
============================================================ */

.footer-cols {

  display:
    grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap:
    28px;

  margin:
    30px 0 8px;
}

.footer-col h3 {

  font-size:
    12px;

  font-weight:
    800;

  letter-spacing:
    0.08em;

  text-transform:
    uppercase;

  color:
    ${FOOTER_GOLD};

  margin:
    0 0 14px;
}

.footer-col a {

  display:
    block;

  font-size:
    13px;

  line-height:
    1.5;

  color:
    #a1a1aa;

  margin-bottom:
    10px;
}

.footer-col a:hover {
  color: #ffffff;
}

/* ============================================================
   MOBILE FOOTER
============================================================ */

@media (max-width: 600px) {

  .footer-inner {

    padding:
      34px 22px 26px;
  }

  .footer-brand {

    width:
      100%;

    margin-bottom:
      30px;
  }

  .footer-brand p {

    font-size:
      13px;

    line-height:
      1.75;
  }

  .footer-cols {

    display:
      grid;

    grid-template-columns:
      1fr 1fr;

    gap:
      28px 24px;

    margin-top:
      26px;
  }

  .footer-col:last-child {

    grid-column:
      1 / -1;

    padding-top:
      4px;
  }

  .footer-col h3 {

    font-size:
      11px;

    margin-bottom:
      12px;
  }

  .footer-col a {

    font-size:
      13px;

    margin-bottom:
      9px;
  }

}

/* ============================================================
   FOOTER BOTTOM
============================================================ */

.footer-bottom {

  border-top:
    1px solid rgba(255,255,255,0.1);

  padding:
    17px 16px 26px;

  text-align:
    center;

  font-size:
    11.5px;

  line-height:
    1.7;

  color:
    #71717a;
}

.footer-bottom b {
  color:
    ${FOOTER_GOLD};
}

.footer-bottom a {
  color:
    #a1a1aa;
}

@media (max-width: 600px) {

  .footer-bottom {

    padding:
      16px 22px 28px;

    font-size:
      11px;
  }

}

/* ============================================================
   MOBILE ARTICLE SPACING
============================================================ */

@media (max-width: 600px) {

  .layout {

    padding-top:
      18px;
  }

  h1.title {

    font-size:
      25px;

    line-height:
      1.34;
  }

  .hero-figure {

    margin-top:
      16px;
  }

}

/* ============================================================
   SMALL SCREEN SAFETY
============================================================ */

@media (max-width: 360px) {

  .wrap {

    padding-left:
      13px;

    padding-right:
      13px;
  }

  .site-header .wrap {

    padding-left:
      13px;

    padding-right:
      13px;
  }

  .live-btn {

    padding:
      0 9px;

    font-size:
      10px;
  }

  .menu-button {

    width:
      39px;

    height:
      39px;
  }

}

.author-profile-link {
  color: inherit;
  text-decoration: none;
}

.meta-text .author-name.author-profile-link {
  display: inline-block;
}

.meta-text .author-name.author-profile-link:hover {
  color: ${PRIMARY};
  text-decoration: underline;
}

.author-box-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.author-box-link:hover .author-box-name {
  color: ${PRIMARY};
  text-decoration: underline;
}

</style>

</head>

<body>

<!-- ==========================================================
     MOBILE SIDEBAR
=========================================================== -->

<amp-sidebar
  id="mobile-menu"
  layout="nodisplay"
  side="left"
  class="mobile-sidebar">

  <div class="mobile-menu-header">

    <span class="mobile-menu-title">
      ${escapeAttr(siteConfig.name)}
    </span>

    <button 
  class="mobile-menu-close" 
  on="tap:mobile-menu.close" 
  aria-label="मेन्यू बंद करें"
  type="button">
  ×
 </button>


  </div>

  <div class="mobile-menu-body">

    <a
      class="mobile-menu-link mobile-menu-home"
      href="${siteConfig.url}">
      <span>होम</span>
      <span class="menu-arrow">›</span>
    </a>

    <a
      class="mobile-menu-link"
      href="${siteConfig.url}/latest">
      <span>ताज़ा खबरें</span>
      <span class="menu-arrow">›</span>
    </a>

    ${mobileCategoryHtml}

    <a
      class="mobile-menu-link"
      href="${siteConfig.url}/video">
      <span>वीडियो</span>
      <span class="menu-arrow">›</span>
    </a>

    <a
      class="mobile-menu-link"
      href="${siteConfig.url}/reels">
      <span>रील्स</span>
      <span class="menu-arrow">›</span>
    </a>

    <a
      class="mobile-menu-link"
      href="${siteConfig.url}/live-tv">
      <span>लाइव टीवी</span>
      <span class="menu-arrow">›</span>
    </a>

  </div>

</amp-sidebar>

<!-- ==========================================================
     TOP STRIP
=========================================================== -->

<div class="top-strip">

  <div class="wrap">

    <span>
      ${escapeAttr(siteConfig.name)}
    </span>

    <span class="top-strip-right">
      स्वतंत्र डिजिटल न्यूज़ प्लेटफ़ॉर्म
    </span>

  </div>

</div>

<!-- ==========================================================
     HEADER
=========================================================== -->

<header class="site-header">

  <div class="wrap">

    <div class="header-left">

      <!-- MOBILE HAMBURGER -->

      <button 
  class="menu-button" 
  on="tap:mobile-menu.toggle" 
  aria-label="मेन्यू खोलें"
  type="button">

        <span class="menu-icon">

          <span class="menu-line"></span>
          <span class="menu-line"></span>
          <span class="menu-line"></span>

        </span>

      </button>

      <!-- LOGO -->

      <a
        class="header-logo"
        href="${siteConfig.url}"
        aria-label="${escapeAttr(siteConfig.name)}">

        <amp-img
          src="${escapeAttr(
            `${siteConfig.url}${siteConfig.logo}`
          )}"
          width="170"
          height="54"
          alt="${escapeAttr(siteConfig.name)}"
          layout="fixed">
        </amp-img>

      </a>

    </div>

    <a 
  class="reels-btn" 
  href="${siteConfig.url}/reels"
  aria-label="रील्स देखें">

  <span class="reels-icon">▶</span>

  <span class="reels-text">
    REELS
  </span>

</a>

  </div>

</header>

<!-- ==========================================================
     DESKTOP NAVIGATION
=========================================================== -->

<nav
  class="nav-strip"
  aria-label="मुख्य नेविगेशन">

  <div class="wrap nav-inner">

    <a
      href="${siteConfig.url}">
      होम
    </a>

    <a
      href="${siteConfig.url}/latest">
      ताज़ा खबरें
    </a>

    ${categoryNavHtml}

    <a
      href="${siteConfig.url}/video">
      वीडियो
    </a>

    <a
      href="${siteConfig.url}/reels">
      रील्स
    </a>

    <a
      href="${siteConfig.url}/live-tv">
      लाइव टीवी
    </a>

  </div>

</nav>

<!-- ==========================================================
     MAIN
=========================================================== -->

<main class="wrap">

  <article>

    <div class="layout">

      <!-- ====================================================
           ARTICLE HEAD
      ===================================================== -->

      <div class="article-head">

        ${breakingBadge}

        <a
          class="badge badge-category"
          href="${categoryUrl}">
          ${escapeAttr(categoryName)}
        </a>

        <h1 class="title">
          ${escapeAttr(title)}
        </h1>

        <div class="meta-row">

  ${
    authorUrl
      ? `
        <a
          class="author-profile-link"
          href="${escapeAttr(authorUrl)}"
          aria-label="${escapeAttr(authorName)} की प्रोफाइल देखें"
        >
          ${authorAvatarHtml}
        </a>
      `
      : authorAvatarHtml
  }

  <div class="meta-text">

    ${
      authorUrl
        ? `
          <a
            class="author-name author-profile-link"
            href="${escapeAttr(authorUrl)}"
          >
            ${escapeAttr(authorName)}
          </a>
        `
        : `
          <div class="author-name">
            ${escapeAttr(authorName)}
          </div>
        `
    }

    <div class="meta-sub">

              ${publishedDate}

              ${
                updatedDate &&
                updatedDate !== publishedDate
                  ? ` · अपडेट: ${updatedDate}`
                  : ""
              }

              · ${readTime} मिनट में पढ़ें

            </div>

          </div>

        </div>

      </div>

      <!-- ====================================================
           SHARE
      ===================================================== -->

      <div class="share-rail">

        <amp-social-share
          type="whatsapp"
          data-param-text="${escapeAttr(title)}"
          data-param-url="${articleUrl}">
        </amp-social-share>

        <amp-social-share
          type="facebook"
          data-param-app_id="000000000000000"
          data-param-href="${articleUrl}">
        </amp-social-share>

        <amp-social-share
          type="twitter"
          data-param-text="${escapeAttr(title)}"
          data-param-url="${articleUrl}">
        </amp-social-share>

        <amp-social-share
          type="system">
        </amp-social-share>

      </div>

      <!-- ====================================================
           ARTICLE BODY
      ===================================================== -->

      <div class="article-body">

        <!-- HERO -->

        <figure class="hero-figure">

          <amp-img
            src="${escapeAttr(heroImage)}"
            alt="${escapeAttr(title)}"
            width="1200"
            height="630"
            layout="responsive"
            data-hero
            class="hero-img">
          </amp-img>

          <figcaption class="hero-caption">
            ${escapeAttr(title)}
          </figcaption>

        </figure>

        <!-- CONTENT -->

        <div class="content">

          ${ampBody}

        </div>

        <!-- YOUTUBE -->

        ${youtubeSectionHtml}

        <!-- AUTHOR -->

       <section class="author-box">

  ${
    authorUrl
      ? `
        <a
          class="author-box-link"
          href="${escapeAttr(authorUrl)}"
          aria-label="${escapeAttr(authorName)} की प्रोफाइल देखें"
        >

          <div class="author-box-head">

            ${authorAvatarHtml}

            <div>

              <div class="author-box-name">
                ${escapeAttr(authorName)}
              </div>

              <div class="author-box-role">

                ${escapeAttr(
                  article.author?.role || "Editor"
                )},

                ${escapeAttr(siteConfig.name)}

              </div>

            </div>

          </div>

        </a>
      `
      : `
        <div class="author-box-head">

          ${authorAvatarHtml}

          <div>

            <div class="author-box-name">
              ${escapeAttr(authorName)}
            </div>

            <div class="author-box-role">

              ${escapeAttr(
                article.author?.role || "Editor"
              )},

              ${escapeAttr(siteConfig.name)}

            </div>

          </div>

        </div>
      `
  }

  ${authorBioHtml}

</section>

      </div>

      <!-- ====================================================
           RELATED
      ===================================================== -->

      ${
        relatedItemsHtml
          ? `
            <aside class="related-rail">

              <h2 class="section-title">
                और खबरें
              </h2>

              <div class="related-list">

                ${relatedItemsHtml}

              </div>

            </aside>
          `
          : ""
      }

    </div>

  </article>

</main>

<!-- ==========================================================
     FOOTER
=========================================================== -->

<footer class="site-footer">

  <div class="wrap footer-inner">

    <!-- BRAND -->

    <div class="footer-brand">

      <amp-img
        src="${escapeAttr(
          `${siteConfig.url}${siteConfig.logo}`
        )}"
        width="150"
        height="47"
        alt="${escapeAttr(siteConfig.name)}"
        layout="fixed">
      </amp-img>

      <p>
        ${escapeAttr(siteConfig.name)}
        एक डिजिटल न्यूज़ प्लेटफ़ॉर्म है जो भारत और दुनिया
        भर की महत्वपूर्ण खबरें लेकर आता है।
      </p>

    </div>

    <!-- FOOTER COLUMNS -->

    <div class="footer-cols">

      <!-- NEWS -->

      <div class="footer-col">

        <h3>
          News
        </h3>

        <a href="${siteConfig.url}/latest">
          Latest News
        </a>

        <a href="${siteConfig.url}/category/india">
          भारत
        </a>

        <a href="${siteConfig.url}/category/world">
          दुनिया
        </a>

        <a href="${siteConfig.url}/category/politics">
          राजनीति
        </a>

        <a href="${siteConfig.url}/category/sports">
          खेल
        </a>

      </div>

      <!-- EXPLORE -->

      <div class="footer-col">

        <h3>
          Explore
        </h3>

        <a href="${siteConfig.url}/video">
          Videos
        </a>

        <a href="${siteConfig.url}/reels">
          Reels
        </a>

        <a href="${siteConfig.url}/live-tv">
          Live TV
        </a>

        <a href="${siteConfig.url}/author">
          Authors
        </a>

        <a href="${siteConfig.url}/contact">
          Contact
        </a>

      </div>

      <!-- LEGAL -->

      <div class="footer-col">

        <h3>
          Legal
        </h3>

        <a href="${siteConfig.url}/privacy-policy">
          Privacy Policy
        </a>

        <a href="${siteConfig.url}/terms">
          Terms &amp; Conditions
        </a>

        <a href="${siteConfig.url}/about">
          About Us
        </a>

      </div>

    </div>

  </div>

  <!-- FOOTER BOTTOM -->

  <div class="footer-bottom">

    © ${new Date().getFullYear()}

    <b>
      ${escapeAttr(siteConfig.name)}
    </b>

    . All rights reserved.

    ·

    <a href="${articleUrl}">
      पूरी वेबसाइट पर पढ़ें
    </a>

  </div>

</footer>

</body>

</html>`;
}