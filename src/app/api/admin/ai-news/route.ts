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
// GET ORIGINAL NEWS IMAGE
// ============================================================

async function getOriginalImage(
  articleUrl: string
): Promise<string> {
  if (!articleUrl) {
    return "";
  }

  try {
    const html =
      await fetchPage(
        articleUrl
      );

    const imageUrl =
      extractImageFromHtml(
        html,
        articleUrl
      );

    console.log(
      "Original article image:",
      imageUrl
    );

    return imageUrl;
  } catch (error) {
    console.error(
      "Original image extraction failed:",
      error
    );

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

  if (sourceUrl) {
    originalImageUrl =
      await getOriginalImage(
        sourceUrl
      );
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
${sourceUrl || "Not available"}

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

write the article content similar to the source article.

Avoid clickbait.

Title must be informative and strong without misleading readers.

Use Hindi naturally while retaining official names, organizations, places and technical terms where appropriate.

============================================================
SEO
============================================================

Create:

- title
- seoTitle
- seoDescription
- shortDescription
- slug
- suggestedCategory
- content
- imagePrompt

SEO title:

- approximately 50-60 characters when practical
- main keyword near the beginning

SEO description:

- approximately 140-160 characters when practical
- clearly communicate what the reader will learn
- encourage clicks without clickbait

Short description:

- 2-3 concise sentences
- suitable for article cards and social previews

============================================================
IMPORTANT: ENGLISH URL SLUG
============================================================

The "slug" field is ONLY for the article URL.

The article itself can remain completely Hindi.

The slug MUST be written in English words high seo url only.

STRICT RULES FOR slug:

1. ONLY lowercase English letters a-z.
2. Numbers 0-9 are allowed.
3. Hyphens "-" are allowed.
4. NEVER use Hindi characters.
5. NEVER use Devanagari.
6. NEVER use Unicode characters.
7. NEVER use punctuation.
8. NEVER use "/" or "\".
9. NEVER use spaces.
10. NEVER URL-encode the slug.
11. NEVER transliterate Hindi characters directly into Unicode.
12. Translate the important meaning of the Hindi title/topic into concise English words.
13. Keep it short and SEO-friendly.
14. Prefer keywords that are likely to be searched by readers in English.
15. Do not include unnecessary words such as "latest", "news", "today" unless genuinely useful.
16. Use the main news keyword near the beginning.

Example:

Hindi title:
"झारखंड में परीक्षाओं में देरी और रिश्वत के आरोपों पर प्रदर्शन"

Correct slug:
"jharkhand-exam-delay-bribery-protests"

The final slug MUST already be clean English words suitable for a URL.

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
  "slug": "",
  "content": "",
  "suggestedCategory": "",
  "imagePrompt": ""
}

IMPORTANT:

suggestedCategory MUST contain ONLY the exact Firestore category slug.

slug MUST contain ONLY lowercase ASCII English characters, numbers and hyphens.
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
  // SANITIZE GEMINI SLUG
  // ==========================================================

  let slug =
    sanitizeEnglishSlug(
      article.slug
    );

  // ----------------------------------------------------------
  // FALLBACK IF GEMINI RETURNS BAD/EMPTY SLUG
  // ----------------------------------------------------------

  if (!slug) {
    throw new Error(
      "AI generated an invalid English slug"
    );
  }

  console.log(
    "Generated English slug:",
    slug
  );

  // ==========================================================
  // FINAL RESULT
  // ==========================================================

  return {
    title:
      String(
        article.title || ""
      ),

    seoTitle:
      String(
        article.seoTitle || ""
      ),

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

    content:
      String(
        article.content || ""
      ),

    // IMPORTANT:
    // This is the clean English URL slug.
    slug,

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

