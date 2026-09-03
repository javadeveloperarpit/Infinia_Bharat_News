export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/firebase-admin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

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
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// NORMALIZE
// ============================================================

function normalize(text: string) {
  return text
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

function sanitizeEnglishSlug(
  value: string
): string {
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
// GET FIRESTORE CATEGORIES
// ============================================================

async function getCategories(): Promise<Category[]> {
  const snapshot = await adminDb
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

async function fetchPage(
  url: string
): Promise<string> {
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

function extractArticleText(
  html: string
): string {
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
      const parsed = JSON.parse(
        jsonText
      );

      const objects = Array.isArray(
        parsed
      )
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
          const article = item[
            "@graph"
          ].find(
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

  return text.slice(
    0,
    30000
  );
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

  return (
    tag.match(regex)?.[1] || ""
  );
}

// ============================================================
// EXTRACT IMAGE URL FROM HTML
// ============================================================

function extractImageFromHtml(
  html: string,
  pageUrl: string
): string {
  // ----------------------------------------------------------
  // OG IMAGE
  // ----------------------------------------------------------

  const metaTags =
    html.match(
      /<meta\b[^>]*>/gi
    ) || [];

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
    html.match(
      /<link\b[^>]*>/gi
    ) || [];

  for (const tag of linkTags) {
    const rel =
      extractAttribute(
        tag,
        "rel"
      ).toLowerCase();

    if (
      rel.includes("image_src")
    ) {
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
  // ARTICLE IMAGE FALLBACK
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
// RESOLVE RELATIVE URL
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
// DOWNLOAD IMAGE FOR GEMINI
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
            "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
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
      !contentType.startsWith(
        "image/"
      )
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
      mimeType =
        "image/jpeg";
    }

    return {
      data:
        buffer.toString(
          "base64"
        ),

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

  const items: TrendingNews[] =
    [];

  const blocks =
    xml.match(
      /<item>[\s\S]*?<\/item>/gi
    ) || [];

  for (
    const block of blocks.slice(
      0,
      30
    )
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
      title:
        cleanText(title),

      link:
        link.trim(),

      pubDate,

      source:
        cleanText(source),
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

  return filtered.slice(
    0,
    10
  );
}

// ============================================================
// GENERATE ARTICLE
// ============================================================

async function generateArticle(
  topic: string,
  source?: string,
  sourceUrl?: string
) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing"
    );
  }

  // ----------------------------------------------------------
  // LOAD CATEGORIES
  // ----------------------------------------------------------

  const categories =
    await getCategories();

  if (
    categories.length === 0
  ) {
    throw new Error(
      "No active categories found in Firestore"
    );
  }

  // ----------------------------------------------------------
  // CATEGORY LIST
  // ----------------------------------------------------------

  const categoryList =
    categories
      .map(
        (category) =>
          `- ${category.name} | Hindi: ${category.nameHi} | slug: ${category.slug}`
      )
      .join("\n");

  // ----------------------------------------------------------
  // ORIGINAL IMAGE
  // ----------------------------------------------------------
let originalImageUrl = "";
let sourceArticleText = "";

if (sourceUrl) {
  try {
    const sourceHtml =
      await fetchPage(
        sourceUrl
      );

    // Extract article text from the same HTML
    sourceArticleText =
      extractArticleText(
        sourceHtml
      );

    // Extract original image from the same HTML
    originalImageUrl =
      extractImageFromHtml(
        sourceHtml,
        sourceUrl
      );

    console.log(
      "Source article text length:",
      sourceArticleText.length
    );

    console.log(
      "Original image URL:",
      originalImageUrl
    );
  } catch (error) {
    console.error(
      "Source page extraction failed:",
      error
    );
  }
}

  console.log(
    "Selected news:",
    topic
  );

  console.log(
    "Source URL:",
    sourceUrl
  );

  console.log(
    "Original image URL:",
    originalImageUrl
  );

  // ----------------------------------------------------------
  // DOWNLOAD IMAGE
  // ----------------------------------------------------------

  const originalImage =
    await downloadImageAsBase64(
      originalImageUrl
    );

  const hasImage =
    !!originalImage;

  // ----------------------------------------------------------
  // IMAGE ANALYSIS
  // ----------------------------------------------------------

  const imageAnalysisInstruction =
    hasImage
      ? `
IMPORTANT ORIGINAL NEWS IMAGE:

The following image is the actual image associated with the selected source article.

Inspect this image carefully.

Use it only as visual reference.

Analyze:

1. Primary subject
2. Visible people
3. Visible objects
4. Environment/location
5. Visually supported context
6. Camera perspective
7. Subject positioning
8. Lighting
9. Dominant colors
10. Background elements
11. Genuine visual details

Do not assume that every visual detail is factually connected to the news.

Do not invent facts from the image.

Create a NEW image concept inspired by the source image and news topic.

Do not request an exact copy of the source image.

Do not mention the source image URL in imagePrompt.
`
      : `
No original source image could be retrieved.

Create imagePrompt from the news topic and generated title only.

Do not invent unsupported details.
`;

  // ----------------------------------------------------------
  // GEMINI PROMPT
  // ----------------------------------------------------------

  const prompt = `
You are the senior digital editor and SEO strategist of an Indian Hindi news website called "INFINIA BHARAT NEWS".

Create a publication-ready Hindi news article from the selected trending topic.

NEWS TOPIC:
${topic}

SOURCE:
${source || "Google News"}

SOURCE URL:
${sourceUrl || "Not available"}\

SOURCE ARTICLE MATERIAL:

${sourceArticleText || "No source article text could be extracted."}

IMPORTANT:
The source material above is provided only to establish facts and context.

Use only information that can reasonably be supported by this material.

Do not copy its wording.

Do not translate it sentence-by-sentence.

Do not preserve its paragraph structure.

Do not reproduce distinctive phrases.

Do not invent missing information.

If the source material contains conflicting, unclear, or incomplete information, do not guess. Write only what can be safely established.

============================================================
CATEGORY
============================================================

You MUST select exactly ONE category from this list:

${categoryList}

CATEGORY RULES:

1. Do NOT create a new category.
2. Do NOT invent a category.
3. Do NOT return a category outside this list.
4. Return the category using its EXACT slug.
5. The slug MUST exactly match one supplied slug.
6. Do not return the English display name.
7. Do not return the Hindi display name.
8. Do not return "News", "Latest News", "Political News", etc.
9. Return only the slug.

Example:

"politics"

NOT:

"Politics"

NOT:

"राजनीति"

NOT:

"Political News"

============================================================
ARTICLE
============================================================

Write the article in natural, professional Hindi.

The writing must sound like a real Indian digital newsroom.

Do NOT copy the source article.

Do NOT invent:

- facts
- statistics
- names
- quotes
- government statements
- dates
- locations
- events

If available information is limited, write only what can reasonably be established.

Never pretend to know information that is not available.

Do not use:

"इस खबर के अनुसार"
"AI के अनुसार"
"यह आर्टिकल"
"हमने पाया"
"ChatGPT"
"Gemini"

Avoid unnecessary keyword repetition.

Write for Google search intent and Google Discover-style readability.

The source is REFERENCE MATERIAL only. NEVER rewrite, synonymize, translate, lightly paraphrase, or structurally mirror the source article.

Do not reproduce the source wording, sentence order, paragraph order, headline formula, or distinctive phrasing.

First identify the verified facts and the actual news development, then write an independently structured article in your own newsroom language.

If the available information is insufficient for a genuinely useful article, keep the article concise rather than padding it with invented or generic material.

Avoid clickbait.

Title must be informative and strong without misleading readers.

Use Hindi naturally while retaining official names, organizations, places and technical terms where appropriate.

// ============================================================
// SEO
// ============================================================

Create exactly these fields:

- title
- seoTitle
- seoDescription
- shortDescription
- suggestedCategory
- keywords
- content
- imagePrompt


============================================================
ARTICLE KEYWORDS
============================================================

Generate 8-15 highly relevant, article-specific SEO keywords and search phrases in the "keywords" array.

KEYWORD RULES:

1. Every keyword must directly describe THIS article.
2. Include important people, organizations, places, events, schemes, products, laws, issues or entities actually present in the story.
3. Include realistic Hindi search phrases.
4. Include commonly searched official English names or terms where relevant.
5. Prefer 2-5 word search phrases when they better match search intent.
6. Use semantic variations only when genuinely useful.
7. Do NOT invent names, entities, places, statistics or events.
8. Do NOT use unrelated high-volume keywords.
9. Do NOT keyword-stuff.
10. Do NOT use hashtags.
11. Do NOT use complete sentences.
12. Do NOT add "INFINIA BHARAT NEWS" unless the story is specifically about the publication.
13. Avoid generic keywords such as "latest news", "breaking news", "today news" unless genuinely relevant to the exact story.
14. Do not repeat the same keyword with trivial spelling or case variations.
15. Return keywords only as a JSON array of strings.

Example:

"keywords": [
  "दिल्ली भारी बारिश",
  "दिल्ली जलभराव",
  "Delhi heavy rain",
  "Delhi waterlogging"
]

IMPORTANT:

The field "seoTitle" is NOT a normal Hindi SEO title.

In this application, "seoTitle" is stored in Firebase and is used as the
ARTICLE URL SLUG.

Therefore:

seoTitle = ENGLISH URL SLUG ONLY.

Do NOT write a Hindi SEO title in seoTitle.

Do NOT write a Hindi sentence in seoTitle.

Do NOT write Devanagari characters in seoTitle.

Do NOT write a human-readable SEO title in seoTitle.

The article title "title" MUST remain in natural Hindi.

The "seoTitle" MUST be a short, SEO-friendly English URL slug describing
the main news topic.

STRICT seoTitle RULES:

1. ONLY lowercase English ASCII letters a-z.
2. Numbers 0-9 are allowed.
3. Hyphens "-" are allowed.
4. NO spaces.
5. NO Hindi characters.
6. NO Devanagari.
7. NO Unicode characters.
8. NO punctuation.
9. NO slash "/".
10. NO backslash "\\".
11. NO underscores "_".
12. NO colon ":".
13. NO brackets.
14. NO quotes.
15. NO question marks.
16. NO emojis.
17. NEVER URL-encode the value.
18. NEVER transliterate Hindi text character-by-character.
19. Translate the important meaning of the Hindi news into concise English.
20. Use the most important searchable English keywords.
21. Keep it short, normally 3-8 words.
22. Do not add unnecessary words such as "latest", "today", "breaking",
    "news" unless they are genuinely useful.
23. The final value must already be ready to use directly inside an URL.
24. The seoTitle MUST NOT contain a date or timestamp.
25. The seoTitle MUST NOT contain the website name.
26. The seoTitle MUST NOT contain the category name unless it is an important
    part of the actual news topic.

Examples:

Hindi title:
"झारखंड में परीक्षाओं में देरी और रिश्वत के आरोपों पर प्रदर्शन"

Correct seoTitle:
"jharkhand-exam-delay-bribery-protests"

Hindi title:
"एयर इंडिया की फ्लाइट में बड़ी तकनीकी खराबी"

Correct seoTitle:
"air-india-flight-technical-fault"

Hindi title:
"दिल्ली में भारी बारिश से कई इलाकों में जलभराव"

Correct seoTitle:
"delhi-heavy-rain-waterlogging"

Hindi title:
"भारत ने पाकिस्तान के खिलाफ बड़ी जीत दर्ज की"

Correct seoTitle:
"india-defeats-pakistan-major-win"

WRONG seoTitle examples:

"एयर इंडिया की फ्लाइट में बड़ी तकनीकी खराबी"
"Air India की फ्लाइट में तकनीकी खराबी"
"Air India Flight Technical Problem"
"Air India Flight Technical Problem - Latest News"
"air india flight technical problem?"
"air_india_flight_technical_problem"

The ONLY acceptable format is:

"air-india-flight-technical-fault"

IMPORTANT:

Do not confuse "title" and "seoTitle".

"title":
Natural Hindi news headline.

"seoTitle":
English URL slug.

For example:

{
  "title": "एयर इंडिया की फ्लाइट में बड़ी तकनीकी खराबी",
  "seoTitle": "air-india-flight-technical-fault"
}
============================================================
CONTENT HTML
============================================================

The content field MUST contain valid HTML.

Use <strong> only for genuinely important facts.

Use <ul><li>...</li></ul> only when a list improves readability.

Use headings only when genuinely useful.

Do not create unnecessary headings.

The opening paragraph must immediately explain the most important part of the news.

Normally target approximately 700-1000 words only when the available facts support that length.

Do NOT invent information just to increase word count.

Suggested structure:

1. Strong opening paragraph
2. Main development
3. Important details/context
4. What this means for readers/public
5. Relevant background
6. What happens next, only if supported
7. Concise conclusion

============================================================
IMAGE
============================================================

${imageAnalysisInstruction}

The generated article TITLE is extremely important for imagePrompt.

After generating the article title, use the title together with:

- original news topic
- source context
- original image visual information, when available

to create a new professional thumbnail prompt.

The imagePrompt must specifically represent the actual news.

The imagePrompt must identify:

1. Primary visual subject
2. Secondary visual elements
3. Relevant location/environment
4. Supported context
5. Camera composition
6. Lighting
7. Depth
8. Editorial hierarchy

If the original image contains a recognizable public figure, use that person mention in the article.

If the original image shows a building, location or object, only describe it specifically when the visual evidence supports it.

Create a premium Indian digital-news editorial photograph.

Style:

- high reach
- high seo
- high ctr
-exact title suited 
- 16:9 landscape
- photorealistic 4K quality


The imagePrompt MUST be ONE detailed paragraph.

============================================================
JSON
============================================================

Return ONLY valid JSON.

Do not use markdown fences.

Use exactly:

{
  "title": "",
  "seoTitle": "",
  "seoDescription": "",
  "shortDescription": "",
  "content": "",
  "suggestedCategory": "",
  "keywords": [],
  "imagePrompt": ""
}

IMPORTANT:

"seoTitle" is the article URL slug.

"seoTitle" MUST contain ONLY lowercase ASCII English characters,
numbers and hyphens.

"seoTitle" MUST NEVER contain Hindi or Devanagari characters.

Do not return a separate "slug" field.
`;

  // ----------------------------------------------------------
  // GEMINI CONTENT
  // ----------------------------------------------------------

  const parts: any[] = [
    {
      text: prompt,
    },
  ];

  // ----------------------------------------------------------
  // ADD ORIGINAL IMAGE
  // ----------------------------------------------------------

  if (originalImage) {
    parts.push({
      inlineData: {
        mimeType:
          originalImage.mimeType,

        data:
          originalImage.data,
      },
    });
  }

  // ----------------------------------------------------------
  // GEMINI REQUEST
  // ----------------------------------------------------------

  const response =
    await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-goog-api-key":
            GEMINI_API_KEY,
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts,
            },
          ],

          generationConfig: {
            temperature: 0.35,

            responseMimeType:
              "application/json",
          },
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      "Gemini Error:",
      data
    );

    throw new Error(
      data?.error?.message ||
        "AI generation failed"
    );
  }

  // ----------------------------------------------------------
  // GEMINI TEXT
  // ----------------------------------------------------------

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.find(
        (part: any) =>
          typeof part.text ===
          "string"
      )?.text;

  if (!text) {
    throw new Error(
      "AI returned empty response"
    );
  }

  // ----------------------------------------------------------
  // PARSE JSON
  // ----------------------------------------------------------

  let article: any;

  try {
    article =
      JSON.parse(text);
  } catch {
    console.error(
      "Invalid Gemini JSON:",
      text
    );

    try {
      const cleaned =
        text
          .replace(
            /^```json\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /\s*```$/i,
            ""
          )
          .trim();

      article =
        JSON.parse(cleaned);
    } catch {
      throw new Error(
        "AI returned invalid JSON"
      );
    }
  }

  // ==========================================================
  // NORMALIZE CATEGORY
  // ==========================================================

  const suggestedCategory =
    String(
      article.suggestedCategory ||
        ""
    )
      .trim()
      .toLowerCase();

  // ==========================================================
  // FIND CATEGORY BY SLUG
  // ==========================================================

  let selectedCategory =
    categories.find(
      (category) =>
        category.slug
          .toLowerCase() ===
        suggestedCategory
    );

  // ==========================================================
  // FALLBACK BY ENGLISH NAME
  // ==========================================================

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.name
            .toLowerCase() ===
          suggestedCategory
      );
  }

  // ==========================================================
  // FALLBACK BY HINDI NAME
  // ==========================================================

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.nameHi
            .toLowerCase() ===
          suggestedCategory
      );
  }

  // ==========================================================
  // FINAL CATEGORY FALLBACK
  // ==========================================================

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.slug ===
          "india"
      ) ||
      categories[0];
  }

  // ==========================================================
// SANITIZE SEO TITLE AS URL SLUG
// ==========================================================

const seoTitle =
  sanitizeEnglishSlug(
    article.seoTitle
  );

const keywords = Array.isArray(article.keywords)
  ? article.keywords
      .map((keyword: unknown) =>
        String(keyword).trim()
      )
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
            (item) =>
              item.toLowerCase() ===
              keyword.toLowerCase()
          ) === index
      )
      .slice(0, 15)
  : [];

// ----------------------------------------------------------
// VALIDATE SEO TITLE
// ----------------------------------------------------------

if (!seoTitle) {
  throw new Error(
    "AI generated an invalid English seoTitle slug"
  );
}

console.log(
  "Generated English SEO URL slug:",
  seoTitle
);
  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  return {
  title:
    String(
      article.title || ""
    ),

  seoTitle,

  seoDescription:
    String(
      article.seoDescription ||
        ""
    ),

  shortDescription:
    String(
      article.shortDescription ||
        ""
    ),
  
  keywords,
  content:
    String(
      article.content || ""
    ),

  suggestedCategory:
    selectedCategory.slug,

  categoryId:
    selectedCategory.id,

  categoryName:
    selectedCategory.name,

  categoryNameHi:
    selectedCategory.nameHi,

  categorySlug:
    selectedCategory.slug,

  imagePrompt:
    String(
      article.imagePrompt ||
        ""
    ),

  sourceImageUrl:
    originalImageUrl || "",
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

