export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/firebase-admin";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const AI_TIMEOUT_MS = 90_000;
const MAX_RESEARCH_SOURCES = 5;
const MAX_SOURCE_CHARS = 12_000;

// ============================================================
// TYPES
// ============================================================

interface TrendingNews {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: string;
}

// ============================================================
// TEXT CLEANER
// ============================================================

function cleanText(text: string) {
  return String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// NORMALIZE
// ============================================================

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// SIMILARITY
// ============================================================

function similarity(a: string, b: string) {
  const normalizedA = normalize(a);
  const normalizedB = normalize(b);

  if (!normalizedA || !normalizedB) {
    return 0;
  }

  const wordsA = new Set(normalizedA.split(" "));
  const wordsB = new Set(normalizedB.split(" "));

  const common = [...wordsA].filter(
    (word) =>
      word.length > 3 &&
      wordsB.has(word)
  );

  return (
    common.length /
    Math.max(
      1,
      Math.min(
        wordsA.size,
        wordsB.size
      )
    )
  );
}

// ============================================================
// ENGLISH SLUG SANITIZER
// ============================================================

function sanitizeEnglishSlug(value: string): string {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ============================================================
// STRIP MARKDOWN FENCES
// ============================================================

function removeMarkdownFences(value: string) {
  return String(value || "")
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ============================================================
// CLEAN GENERATED HTML
// ============================================================

function cleanGeneratedHtml(value: string) {
  let html = removeMarkdownFences(value);

  /*
   * Remove dangerous/non-editor elements.
   * We deliberately preserve normal CKEditor-supported HTML.
   */

  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "");

  /*
   * Remove inline event handlers.
   */

  html = html.replace(
    /\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi,
    ""
  );

  /*
   * Remove javascript URLs.
   */

  html = html.replace(
    /(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi,
    ""
  );

  return html.trim();
}

// ============================================================
// VALIDATE ARTICLE HTML
// ============================================================

function validateArticleHtml(value: string) {
  const html = cleanGeneratedHtml(value);

  const textOnly = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!textOnly) {
    return {
      valid: false,
      html,
      reason: "Article content is empty.",
    };
  }

  /*
   * The AI must produce real editorial structure.
   */

  const paragraphCount =
    (html.match(/<p\b/gi) || []).length;

  const headingCount =
    (html.match(/<h[2-3]\b/gi) || []).length;

  const strongCount =
    (html.match(/<strong\b/gi) || []).length;

  const listCount =
    (html.match(/<(ul|ol)\b/gi) || []).length;

  const tableCount =
    (html.match(/<table\b/gi) || []).length;

  /*
   * Plain-text dump detection.
   */

  const hasHtmlStructure =
    paragraphCount >= 2 ||
    headingCount >= 1 ||
    listCount >= 1 ||
    tableCount >= 1;

  if (!hasHtmlStructure) {
    return {
      valid: false,
      html,
      reason:
        "Article was returned without sufficient HTML editorial structure.",
    };
  }

  /*
   * Minimum amount of useful editorial formatting.
   */

  if (
    textOnly.length > 800 &&
    headingCount === 0
  ) {
    return {
      valid: false,
      html,
      reason:
        "Long article does not contain editorial section headings.",
    };
  }

  /*
   * Strong formatting is encouraged but not mandatory
   * for very short stories.
   */

  return {
    valid: true,
    html,
    reason: "",
    stats: {
      paragraphCount,
      headingCount,
      strongCount,
      listCount,
      tableCount,
      textLength: textOnly.length,
    },
  };
}

// ============================================================
// REPAIR PLAIN ARTICLE
// ============================================================

function repairPlainArticle(
  value: string,
  title: string
) {
  /*
   * This is a fallback only.
   *
   * We do NOT try to "rewrite" the article here.
   * We simply convert obvious plain-text paragraph
   * boundaries into safe HTML.
   */

  const raw = String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!raw) {
    return "";
  }

  const blocks = raw
    .split(/\n{2,}/)
    .map((block) =>
      block
        .replace(/\n+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean);

  if (blocks.length === 0) {
    return "";
  }

  /*
   * If Gemini ignored HTML completely, preserve its wording
   * rather than performing an AI-like rewrite.
   */

  return blocks
    .map((block, index) => {
      /*
       * Avoid adding the title again.
       */

      if (
        index === 0 &&
        normalize(block) === normalize(title)
      ) {
        return "";
      }

      return `<p>${escapeHtml(block)}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

// ============================================================
// GET FIRESTORE CATEGORIES
// ============================================================

async function getCategories(): Promise<Category[]> {
  const snapshot =
    await adminDb
      .collection("categories")
      .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        name: String(data.name || ""),
        nameHi: String(data.nameHi || ""),
        slug: String(data.slug || ""),
        status: String(data.status || ""),
      };
    })
    .filter(
      (category) =>
        category.status === "active"
    );
}

// ============================================================
// FETCH URL
// ============================================================

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",

    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",

      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

      "Accept-Language":
        "en-IN,en;q=0.9,hi;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Source page returned ${response.status}`
    );
  }

  return await response.text();
}

// ============================================================
// EXTRACT SOURCE ARTICLE TEXT
// ============================================================

function extractArticleText(html: string): string {
  let text = "";

  // ----------------------------------------------------------
  // JSON-LD articleBody
  // ----------------------------------------------------------

  const jsonLdBlocks =
    html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi
    ) || [];

  for (const block of jsonLdBlocks) {
    const jsonText = block
      .replace(
        /^<script[^>]*>/i,
        ""
      )
      .replace(
        /<\/script>$/i,
        ""
      )
      .trim();

    try {
      const parsed = JSON.parse(jsonText);

      const objects = Array.isArray(parsed)
        ? parsed
        : [parsed];

      for (const item of objects) {
        if (
          item &&
          typeof item === "object" &&
          typeof item.articleBody === "string"
        ) {
          text = item.articleBody;
          break;
        }

        if (
          item &&
          typeof item === "object" &&
          Array.isArray(item["@graph"])
        ) {
          const article =
            item["@graph"].find(
              (entry: any) =>
                entry &&
                typeof entry.articleBody ===
                  "string"
            );

          if (article) {
            text = article.articleBody;
            break;
          }
        }
      }

      if (text) break;
    } catch {
      // Ignore invalid JSON-LD
    }
  }

  // ----------------------------------------------------------
  // ARTICLE TAG FALLBACK
  // ----------------------------------------------------------

  if (!text) {
    const articleMatch =
      html.match(
        /<article\b[^>]*>([\s\S]*?)<\/article>/i
      );

    if (articleMatch) {
      text = articleMatch[1];
    }
  }

  // ----------------------------------------------------------
  // MAIN CONTENT FALLBACK
  // ----------------------------------------------------------

  if (!text) {
    const mainMatch =
      html.match(
        /<main\b[^>]*>([\s\S]*?)<\/main>/i
      );

    if (mainMatch) {
      text = mainMatch[1];
    }
  }

  // ----------------------------------------------------------
  // REMOVE NON-CONTENT ELEMENTS
  // ----------------------------------------------------------

  text = text
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      " "
    )
    .replace(
      /<style\b[^>]*>[\s\S]*?<\/style>/gi,
      " "
    )
    .replace(
      /<nav\b[^>]*>[\s\S]*?<\/nav>/gi,
      " "
    )
    .replace(
      /<footer\b[^>]*>[\s\S]*?<\/footer>/gi,
      " "
    )
    .replace(
      /<header\b[^>]*>[\s\S]*?<\/header>/gi,
      " "
    )
    .replace(
      /<aside\b[^>]*>[\s\S]*?<\/aside>/gi,
      " "
    );

  // ----------------------------------------------------------
  // CLEAN HTML
  // ----------------------------------------------------------

  text = cleanText(text);

  // ----------------------------------------------------------
  // LIMIT SOURCE TEXT
  // ----------------------------------------------------------

  return text.slice(0, 30000);
}

// ============================================================
// EXTRACT ATTRIBUTE
// ============================================================

function extractAttribute(
  tag: string,
  attribute: string
) {
  const regex = new RegExp(
    `${attribute}\\s*=\\s*["']([^"']+)["']`,
    "i"
  );

  return tag.match(regex)?.[1] || "";
}

// ============================================================
// EXTRACT IMAGE URL
// ============================================================

function extractImageFromHtml(
  html: string,
  pageUrl: string
): string {
  const metaTags =
    html.match(/<meta\b[^>]*>/gi) || [];

  // ----------------------------------------------------------
  // OG IMAGE
  // ----------------------------------------------------------

  for (const tag of metaTags) {
    const property =
      extractAttribute(
        tag,
        "property"
      ).toLowerCase();

    const name =
      extractAttribute(
        tag,
        "name"
      ).toLowerCase();

    if (
      property === "og:image" ||
      property === "og:image:url" ||
      name === "og:image"
    ) {
      const content =
        extractAttribute(
          tag,
          "content"
        );

      if (content) {
        return resolveUrl(
          content,
          pageUrl
        );
      }
    }
  }

  // ----------------------------------------------------------
  // TWITTER IMAGE
  // ----------------------------------------------------------

  for (const tag of metaTags) {
    const name =
      extractAttribute(
        tag,
        "name"
      ).toLowerCase();

    const property =
      extractAttribute(
        tag,
        "property"
      ).toLowerCase();

    if (
      name === "twitter:image" ||
      property === "twitter:image"
    ) {
      const content =
        extractAttribute(
          tag,
          "content"
        );

      if (content) {
        return resolveUrl(
          content,
          pageUrl
        );
      }
    }
  }

  // ----------------------------------------------------------
  // LINK IMAGE
  // ----------------------------------------------------------

  const linkTags =
    html.match(/<link\b[^>]*>/gi) || [];

  for (const tag of linkTags) {
    const rel =
      extractAttribute(
        tag,
        "rel"
      ).toLowerCase();

    if (rel.includes("image_src")) {
      const href =
        extractAttribute(
          tag,
          "href"
        );

      if (href) {
        return resolveUrl(
          href,
          pageUrl
        );
      }
    }
  }

  // ----------------------------------------------------------
  // ARTICLE IMAGE
  // ----------------------------------------------------------

  const articleMatch =
    html.match(
      /<article[\s\S]{0,20000}?<img\b[^>]*>/i
    );

  if (articleMatch) {
    const imgMatch =
      articleMatch[0].match(
        /<img\b[^>]*>/i
      );

    if (imgMatch) {
      const src =
        extractAttribute(
          imgMatch[0],
          "src"
        );

      if (src) {
        return resolveUrl(
          src,
          pageUrl
        );
      }
    }
  }

  // ----------------------------------------------------------
  // GENERAL IMAGE FALLBACK
  // ----------------------------------------------------------

  const images =
    html.match(
      /<img\b[^>]*>/gi
    ) || [];

  for (const tag of images) {
    const src =
      extractAttribute(
        tag,
        "src"
      );

    if (
      src &&
      !src.startsWith("data:") &&
      !src.includes("logo") &&
      !src.includes("icon") &&
      !src.includes("avatar")
    ) {
      return resolveUrl(
        src,
        pageUrl
      );
    }
  }

  return "";
}

// ============================================================
// RESOLVE URL
// ============================================================

function resolveUrl(
  imageUrl: string,
  baseUrl: string
) {
  try {
    return new URL(
      imageUrl,
      baseUrl
    ).toString();
  } catch {
    return "";
  }
}

// ============================================================
// DOWNLOAD IMAGE
// ============================================================

async function downloadImageAsBase64(
  imageUrl: string
): Promise<{
  data: string;
  mimeType: string;
} | null> {
  if (!imageUrl) {
    return null;
  }

  try {
    const response =
      await fetch(imageUrl, {
        cache: "no-store",
        redirect: "follow",

        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",

          Accept:
            "image/avif,image/webp,image/apng,image/svg+xml,image/jpeg,image/png,*/*;q=0.8",
        },
      });

    if (!response.ok) {
      throw new Error(
        `Image returned ${response.status}`
      );
    }

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    if (
      !contentType.startsWith("image/")
    ) {
      throw new Error(
        "URL did not return an image"
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    if (
      buffer.length >
      15 * 1024 * 1024
    ) {
      throw new Error(
        "Source image is too large"
      );
    }

    let mimeType =
      contentType
        .split(";")[0]
        .trim();

    const supportedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !supportedTypes.includes(
        mimeType
      )
    ) {
      mimeType = "image/jpeg";
    }

    return {
      data:
        buffer.toString("base64"),
      mimeType,
    };
  } catch (error) {
    console.error(
      "Image download failed:",
      error
    );

    return null;
  }
}

// ============================================================
// GOOGLE NEWS RSS
// ============================================================

async function getGoogleNews(): Promise<
  TrendingNews[]
> {
  const url =
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";

  const response =
    await fetch(url, {
      cache: "no-store",

      headers: {
        "User-Agent":
          "Mozilla/5.0 NewsReader/1.0",
      },
    });

  if (!response.ok) {
    throw new Error(
      "Google News could not be loaded"
    );
  }

  const xml =
    await response.text();

  const items: TrendingNews[] = [];

  const blocks =
    xml.match(
      /<item>[\s\S]*?<\/item>/gi
    ) || [];

  for (
    const block of blocks.slice(0, 30)
  ) {
    const title =
      block.match(
        /<title>([\s\S]*?)<\/title>/i
      )?.[1] || "";

    const link =
      block.match(
        /<link>([\s\S]*?)<\/link>/i
      )?.[1] || "";

    const pubDate =
      block.match(
        /<pubDate>([\s\S]*?)<\/pubDate>/i
      )?.[1] || "";

    const source =
      block.match(
        /<source[^>]*>([\s\S]*?)<\/source>/i
      )?.[1] || "";

    if (!title) {
      continue;
    }

    items.push({
      title: cleanText(title),
      link: link.trim(),
      pubDate,
      source: cleanText(source),
    });
  }

  return items;
}

// ============================================================
// EXISTING ARTICLES
// ============================================================

async function getExistingArticles() {
  const snapshot =
    await adminDb
      .collection("articles")
      .limit(200)
      .get();

  return snapshot.docs.map(
    (doc) => {
      const data =
        doc.data();

      return {
        id: doc.id,

        title:
          String(
            data.title || ""
          ),

        seoTitle:
          String(
            data.seoTitle || ""
          ),

        slug:
          String(
            data.slug || ""
          ),
      };
    }
  );
}

// ============================================================
// TRENDING NEWS
// ============================================================

async function getTrendingNews() {
  const googleNews =
    await getGoogleNews();

  const existing =
    await getExistingArticles();

  const filtered =
    googleNews.filter(
      (news) => {
        const duplicate =
          existing.some(
            (article) => {
              const score1 =
                similarity(
                  news.title,
                  article.title
                );

              const score2 =
                similarity(
                  news.title,
                  article.seoTitle
                );

              return (
                score1 >= 0.55 ||
                score2 >= 0.55
              );
            }
          );

        return !duplicate;
      }
    );

  return filtered.slice(0, 10);
}

// ============================================================
// MULTI-PROVIDER AI ENGINE
// ============================================================

const ARTICLE_SCHEMA = {
  title: "string",
  seoTitle: "string",
  seoDescription: "string",
  shortDescription: "string",
  content: "string",
  suggestedCategory: "string",
  keywords: ["string"],
  imagePrompt: "string",
};

function extractJsonObject(text: string): any {
  let cleaned = String(text || "")
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first >= 0 && last > first) {
    try {
      return JSON.parse(cleaned.slice(first, last + 1));
    } catch {}
  }

  throw new Error("AI returned invalid JSON");
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = AI_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function callGroq(prompt: string): Promise<any> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is missing");

  const response = await fetchWithTimeout(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional Indian digital newsroom editor. Return only valid JSON. Never invent facts.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.25,
        response_format: { type: "json_object" },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq HTTP ${response.status}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response");

  return extractJsonObject(text);
}

async function callOpenRouter(prompt: string): Promise<any> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing");
  }

  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://infiniabharatnews.vercel.app",
        "X-Title": "Infinia Bharat News",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a professional Indian digital newsroom editor. Return only valid JSON. Never invent facts.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.25,
        response_format: { type: "json_object" },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.error?.message || `OpenRouter HTTP ${response.status}`
    );
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned an empty response");

  return extractJsonObject(text);
}

async function callGemini(
  prompt: string,
  useWebSearch = false
): Promise<any> {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing");

  const body: any = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.25,
      responseMimeType: "application/json",
    },
  };

  if (useWebSearch) {
    body.tools = [{ google_search: {} }];
  }

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data?.error?.message || `Gemini HTTP ${response.status}`
    );
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: any) => part?.text || "")
    .join("")
    .trim();

  if (!text) throw new Error("Gemini returned an empty response");

  return extractJsonObject(text);
}

async function callWriterWithFallback(prompt: string): Promise<any> {
  const providers = [
    ["Groq", () => callGroq(prompt)],
    ["Gemini", () => callGemini(prompt, false)],
    ["OpenRouter", () => callOpenRouter(prompt)],
  ] as const;

  const errors: string[] = [];

  for (const [name, fn] of providers) {
    try {
      const result = await fn();
      console.log(`AI writer provider succeeded: ${name}`);
      return result;
    } catch (error: any) {
      const message = error?.message || String(error);
      errors.push(`${name}: ${message}`);
      console.warn(`AI writer provider failed: ${name}`, message);
    }
  }

  throw new Error(`All AI providers failed. ${errors.join(" | ")}`);
}

async function getGoogleNewsResearch(topic: string) {
  const query = encodeURIComponent(topic.trim());
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; InfiniaBharatNews/1.0)",
      },
    }, 15_000);

    if (!response.ok) return [];

    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
      .slice(0, MAX_RESEARCH_SOURCES)
      .map((match) => match[1])
      .map((item) => ({
        title: cleanText(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || ""),
        link: item.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "",
        source: cleanText(
          item.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || ""
        ),
        pubDate: cleanText(
          item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || ""
        ),
      }))
      .filter((item) => item.title && item.link);

    return items;
  } catch (error) {
    console.warn("Google News research fetch failed:", error);
    return [];
  }
}

async function buildResearchPacket(
  topic: string,
  source?: string,
  sourceUrl?: string,
  sourceArticleText?: string
) {
  const newsItems = await getGoogleNewsResearch(topic);
  const pages: string[] = [];

  const urls = [
    sourceUrl,
    ...newsItems.map((item: any) => item.link),
  ].filter(Boolean) as string[];

  const uniqueUrls = [...new Set(urls)].slice(0, MAX_RESEARCH_SOURCES + 1);

  for (const url of uniqueUrls) {
    try {
      const html = await fetchPage(url);
      const text = extractArticleText(html).slice(0, MAX_SOURCE_CHARS);
      if (text) {
        pages.push(`SOURCE URL: ${url}\nSOURCE TEXT:\n${text}`);
      }
    } catch (error) {
      console.warn("Research source fetch failed:", url);
    }
  }

  return {
    topic,
    initialSource: source || "Google News",
    initialSourceUrl: sourceUrl || "",
    initialLead: sourceArticleText || "",
    googleNewsResults: newsItems,
    fetchedSources: pages,
  };
}

async function researchWithFallback(
  topic: string,
  researchPacket: any
): Promise<any> {
  const researchPrompt = `
You are the RESEARCH EDITOR of INFINIA BHARAT NEWS.

Research the current news development below. This is NOT the final article.
Create a factual dossier for a separate writer.

TOPIC:
${topic}

INITIAL SOURCE:
${researchPacket.initialSource}

INITIAL SOURCE URL:
${researchPacket.initialSourceUrl || "Not available"}

You may use fresh web search if available. When using web search, prioritize:
1. Government of India / PIB / ministries / departments
2. Supreme Court / High Courts / official orders
3. Police / district administration / regulators
4. Official company or organization statements and filings
5. Credible established news organizations

Cross-check important claims. Separate confirmed facts from allegations, claims and speculation.
Never invent names, dates, figures, quotations, locations, legal developments or events.
Do not rewrite the source article.

SERVER-GATHERED MATERIAL:
${JSON.stringify(researchPacket, null, 2)}

Return JSON with these fields:
{
  "centralDevelopment":"",
  "verifiedFacts":[],
  "officialSources":[],
  "secondarySources":[],
  "latestDevelopment":"",
  "background":[],
  "timeline":[],
  "importantPeople":[],
  "importantDates":[],
  "importantNumbers":[],
  "legalContext":[],
  "whyItMatters":[],
  "whatHappensNext":[],
  "sourceNotes":[]
}

Be thorough enough for a 700-1200 word professional Hindi news article when the facts support it.
Return ONLY JSON.
`;

  // Best research route: Gemini gets actual Google Search grounding for free-tier usage.
  if (GEMINI_API_KEY) {
    try {
      const result = await callGemini(researchPrompt, true);
      console.log("AI research provider succeeded: Gemini + Google Search");
      return result;
    } catch (error: any) {
      console.warn("Gemini research failed:", error?.message || error);
    }
  }

  const fallbackPrompt = researchPrompt + `
IMPORTANT: No live AI web-search tool is available in this fallback call.
Use ONLY the server-gathered material above. Do not claim a source was checked unless it appears there.
`;

  const providers = [
    ["Groq", () => callGroq(fallbackPrompt)],
    ["OpenRouter", () => callOpenRouter(fallbackPrompt)],
  ] as const;

  const errors: string[] = [];
  for (const [name, fn] of providers) {
    try {
      const result = await fn();
      console.log(`AI research provider succeeded: ${name}`);
      return result;
    } catch (error: any) {
      errors.push(`${name}: ${error?.message || String(error)}`);
      console.warn(`AI research provider failed: ${name}`, error);
    }
  }

  throw new Error(`All research providers failed. ${errors.join(" | ")}`);
}

// ============================================================
// GENERATE ARTICLE
// ============================================================

async function generateArticle(
  topic: string,
  source?: string,
  sourceUrl?: string
) {
  const categories = await getCategories();

  if (categories.length === 0) {
    throw new Error("No active categories found in Firestore");
  }

  const categoryList = categories
    .map(
      (category) =>
        `- ${category.name} | Hindi: ${category.nameHi} | slug: ${category.slug}`
    )
    .join("\n");

  let originalImageUrl = "";
  let sourceArticleText = "";

  if (sourceUrl) {
    try {
      const sourceHtml = await fetchPage(sourceUrl);
      sourceArticleText = extractArticleText(sourceHtml);
      originalImageUrl = extractImageFromHtml(sourceHtml, sourceUrl);
      console.log("Initial lead text length:", sourceArticleText.length);
      console.log("Original image URL:", originalImageUrl);
    } catch (error) {
      console.error("Source page extraction failed:", error);
    }
  }

  const originalImage = await downloadImageAsBase64(originalImageUrl);
  const researchPacket = await buildResearchPacket(
    topic,
    source,
    sourceUrl,
    sourceArticleText
  );

  const research = await researchWithFallback(topic, researchPacket);

  console.log("Research completed:", {
    facts: research?.verifiedFacts?.length || 0,
    officialSources: research?.officialSources?.length || 0,
    secondarySources: research?.secondarySources?.length || 0,
  });

  const imageInstruction = originalImage
    ? `A source news image is attached separately. Use it only as visual reference. Do not copy it. Do not infer unsupported facts from it. Create a new editorial thumbnail concept.`
    : `No source image is available. Create the imagePrompt only from verified research facts and the final title.`;

  const writerPrompt = `
You are the SENIOR DIGITAL EDITOR of INFINIA BHARAT NEWS, a professional Indian Hindi digital newsroom.

Write the FINAL publication-ready article from the VERIFIED RESEARCH DOSSIER below.
This is NOT rewriting, paraphrasing, translation or synonym substitution.
Write an independently structured story with your own headline, lead, section order, explanations and editorial flow.

TOPIC:
${topic}

ACTIVE CATEGORIES:
${categoryList}

VERIFIED RESEARCH DOSSIER:
${JSON.stringify(research, null, 2)}

EDITORIAL STYLE
- Natural professional Hindi used by a serious Indian digital newsroom.
- Use standard English terms where Indian journalism normally uses them.
- Authoritative, neutral, factual, polished and reader-focused.
- No AI filler, no generic opening, no mention of AI/ChatGPT/Gemini.
- No clickbait.
- Do not force a "निष्कर्ष" section.

FACTUAL SAFETY
- Use ONLY information supported by the research dossier.
- Never invent names, quotations, dates, statistics, locations, court observations, government statements, financial figures, legal proceedings, causes or events.
- Clearly attribute allegations/claims where applicable.
- If a fact is uncertain or unsupported, leave it out.

DEPTH
- Do not return a tiny summary when sufficient facts exist.
- Normal story: about 700-1000 words.
- Substantial political, legal, government, business or national story: about 800-1200 words when facts support it.
- Never pad for length.
- Where supported, naturally cover the main development, key details, context, why it matters, and what happens next.
- Use 2-4 meaningful <h2> sections when useful.
- Use <h3> only when genuinely useful.
- Paragraphs should normally be 2-5 sentences.

HTML HARD REQUIREMENT
- content MUST be valid HTML.
- Allowed: <p>, <h2>, <h3>, <strong>, <ul>, <ol>, <li>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- No Markdown.
- No code fences.
- No plain-text article content.
- No <h1> inside content.
- Opening paragraph must immediately explain the central development.
- Use <strong> selectively.
- Use <blockquote> only for a verified quotation in the dossier.

SEO / GOOGLE NEWS / DISCOVER
- Title: strong, specific Hindi headline, accurate, search-intent clear, non-sensational.
- seoDescription: concise natural Hindi summary.
- shortDescription: concise newsroom/feed summary.
- keywords: 8-15 genuinely relevant Hindi/English search phrases from the story, no hashtags.
- seoTitle: URL slug only; lowercase English letters, numbers and hyphens, normally 3-8 meaningful words, no Hindi, spaces, underscores, punctuation, date or website name.

IMAGE PROMPT
${imageInstruction}
Create one detailed paragraph for imagePrompt: photorealistic professional editorial photography, premium Indian digital-news aesthetic, cinematic realistic lighting, 16:9, 4K, high visual impact, Google Discover suitable. No headline text, captions, fake UI, watermark, logo or invented events/people.

ORIGINALITY
Do not copy or mirror any source wording, paragraph order, headline formula or distinctive phrasing. Understand the verified facts and produce an independently written INFINIA BHARAT NEWS story.

Return ONLY this JSON object:
${JSON.stringify(ARTICLE_SCHEMA, null, 2)}
`;

  const article = await callWriterWithFallback(writerPrompt);

  if (!article || typeof article !== "object") {
    throw new Error("AI returned invalid article object");
  }

  if (!article.title) throw new Error("AI returned empty article title");
  if (!article.content) throw new Error("AI returned empty article content");

  const suggestedCategory = String(article.suggestedCategory || "")
    .trim()
    .toLowerCase();

  let selectedCategory = categories.find(
    (category) => category.slug.toLowerCase() === suggestedCategory
  );

  if (!selectedCategory) {
    selectedCategory = categories.find(
      (category) => category.name.toLowerCase() === suggestedCategory
    );
  }

  if (!selectedCategory) {
    selectedCategory = categories.find(
      (category) => category.nameHi.toLowerCase() === suggestedCategory
    );
  }

  if (!selectedCategory) {
    selectedCategory =
      categories.find((category) => category.slug === "india") ||
      categories[0];
  }

  const seoTitle = sanitizeEnglishSlug(article.seoTitle);
  if (!seoTitle) {
    throw new Error("AI generated an invalid English seoTitle slug");
  }

  const keywords = Array.isArray(article.keywords)
    ? article.keywords
        .map((keyword: unknown) => String(keyword).trim())
        .filter(Boolean)
        .filter(
          (keyword: string) =>
            !keyword.startsWith("#") &&
            keyword.length >= 2 &&
            keyword.split(/\s+/).length <= 6
        )
        .filter(
          (keyword: string, index: number, list: string[]) =>
            list.findIndex(
              (item) => item.toLowerCase() === keyword.toLowerCase()
            ) === index
        )
        .slice(0, 15)
    : [];

  let content = cleanGeneratedHtml(String(article.content));
  const validation = validateArticleHtml(content);

  console.log("Multi-provider HTML validation:", validation);

  if (!validation.valid) {
    console.warn(
      "AI content failed HTML validation. Applying safe HTML fallback:",
      validation.reason
    );

    const repaired = repairPlainArticle(
      String(article.content),
      String(article.title)
    );

    const repairedValidation = validateArticleHtml(repaired);

    if (repairedValidation.valid) {
      content = repairedValidation.html;
    } else {
      throw new Error(
        `AI generated poorly structured article content: ${validation.reason}`
      );
    }
  }

  return {
    title: String(article.title || "").trim(),
    seoTitle,
    seoDescription: String(article.seoDescription || "").trim(),
    shortDescription: String(article.shortDescription || "").trim(),
    keywords,
    content,
    suggestedCategory: selectedCategory.slug,
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    categoryNameHi: selectedCategory.nameHi,
    categorySlug: selectedCategory.slug,
    imagePrompt: String(article.imagePrompt || "").trim(),
    sourceImageUrl: originalImageUrl || "",
  };
}

// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    const news =
      await getTrendingNews();

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error: any) {
    console.error(
      "AI NEWS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to load trending news",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    if (!body.title) {
      return NextResponse.json(
        {
          success: false,

          message:
            "News title is required",
        },
        {
          status: 400,
        }
      );
    }

    const article =
      await generateArticle(
        body.title,
        body.source,
        body.link
      );

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error: any) {
    console.error(
      "AI NEWS POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "AI generation failed",
      },
      {
        status: 500,
      }
    );
  }
}