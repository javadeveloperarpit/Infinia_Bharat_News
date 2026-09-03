type ArticleKeywordInput = {
  keywords?: string[];
  slug?: string;
  category?: string;
  categoryHi?: string;
  categorySlug?: string;
};

const GENERIC_NEWS_KEYWORDS = [
  "भारत समाचार",
  "हिंदी समाचार",
  "ताजा खबर",
  "आज की खबर",
  "ब्रेकिंग न्यूज़",
];

const BRAND_KEYWORDS = [
  "INFINIA BHARAT NEWS",
];

function uniqueKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const keyword of keywords) {
    const value = keyword.trim();

    if (!value) continue;

    const normalized = value.toLowerCase();

    if (seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(value);
  }

  return result;
}

function getSlugKeywords(slug?: string): string[] {
  if (!slug) return [];

  let decodedSlug = slug;

  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    // Keep original slug if decoding fails.
  }

  return decodedSlug
    .replace(/[-_]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1)
    .filter((word) => !/^\d+$/.test(word));
}

export function getArticleKeywords(
  article: ArticleKeywordInput
): string[] {
  const manualKeywords = Array.isArray(article.keywords)
    ? article.keywords
        .map((keyword) => String(keyword).trim())
        .filter(Boolean)
    : [];

  // Manual keywords always have priority.
  // Do NOT add fallback keywords when manual keywords exist.
  if (manualKeywords.length > 0) {
    return uniqueKeywords(manualKeywords);
  }

  const fallbackKeywords = [
    ...getSlugKeywords(article.slug),
    article.categoryHi || "",
    article.category || "",
    article.categorySlug || "",
    ...GENERIC_NEWS_KEYWORDS,
    ...BRAND_KEYWORDS,
  ];

  return uniqueKeywords(fallbackKeywords);
}