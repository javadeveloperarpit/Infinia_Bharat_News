import { notFound } from "next/navigation";

import {
  getArticleBySlug,
  getRelatedArticles,
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
    nativeAds,
  ] = await Promise.all([
    getRelatedArticles(
      article.categoryId,
      article.slug
    ),

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

  return (
    <main className="container-news py-8">

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
              RELATED NEWS + NATIVE ADS
          ================================================== */}

          <RelatedNews
            articles={related}
            nativeAds={nativeAdsPlain}
          />

        </article>


        {/* ==================================================
            RIGHT SIDEBAR
        ================================================== */}

        <aside
          className="
            hidden
            min-w-0
            lg:block
            lg:col-span-3
          "
        >
          <ArticleSidebar
            related={related}
          />
        </aside>

      </div>

    </main>
  );
}