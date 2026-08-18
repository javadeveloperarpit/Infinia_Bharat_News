import { getAllPublishedArticles } from "@/services/public/article.public.service";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

const NEWS_SITEMAP_DAYS = 4;
const MAX_NEWS_URLS = 1000;

export async function GET() {
  const articles = await getAllPublishedArticles();

  const now = Date.now();

  const recentArticles = articles
    .filter((article) => {
      if (!article.slug || !article.createdAt) {
        return false;
      }

      const publishedTime =
        new Date(article.createdAt).getTime();

      if (Number.isNaN(publishedTime)) {
        return false;
      }

      return (
        publishedTime <= now &&
        now - publishedTime <=
          NEWS_SITEMAP_DAYS *
            24 *
            60 *
            60 *
            1000
      );
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() -
        new Date(a.createdAt!).getTime()
    )
    .slice(0, MAX_NEWS_URLS);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
>
${recentArticles
  .map((article) => {
    const publishedAt = new Date(
      article.createdAt!
    ).toISOString();

    return `  <url>
    <loc>${siteConfig.url}/news/${escapeXml(article.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteConfig.name)}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${publishedAt}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type":
        "application/xml; charset=utf-8",

      "Cache-Control":
        "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}

function escapeXml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}