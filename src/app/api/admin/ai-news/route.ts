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
    .replace(/&#39;/g, "'")
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

  return tag.match(regex)?.[1] || "";
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

  const ogMatches =
    html.match(
      /<meta\b[^>]*>/gi
    ) || [];

  for (const tag of ogMatches) {
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

  for (const tag of ogMatches) {
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
      /<article[\s\S]{0,20000}?>[\s\S]*?<img\b[^>]*>/i
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

    // Prevent sending extremely large images
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

    // Gemini-supported fallback
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
      /<item>[\s\S]*?<\/item>/g
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
  // GET ORIGINAL IMAGE
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
  // DOWNLOAD ORIGINAL IMAGE
  // ----------------------------------------------------------

  const originalImage =
    await downloadImageAsBase64(
      originalImageUrl
    );

  const hasImage =
    !!originalImage;

  // ----------------------------------------------------------
  // IMAGE ANALYSIS INSTRUCTIONS
  // ----------------------------------------------------------

  const imageAnalysisInstruction =
    hasImage
      ? `
IMPORTANT ORIGINAL NEWS IMAGE:

The following image is the actual image associated with the selected source article.

You MUST inspect this image carefully.

Use it as visual reference only.

Analyze:

1. Who or what is the primary subject?
2. What people are visible?
3. What objects are visible?
4. What environment/location is visible?
5. What event or context does the image visually suggest?
6. What is the camera perspective?
7. How are the subjects positioned?
8. What lighting is used?
9. What colors dominate?
10. What background elements are visible?
11. What visual details are genuinely supported by the image?

DO NOT blindly assume that everything in the image is factually connected to the news.

The image is only supporting visual evidence.

Do NOT invent facts from the image.

For the final imagePrompt, create a NEW image concept inspired by the actual source image and news topic.

Do NOT request an exact copy of the source image.

Do NOT mention the source image URL in imagePrompt.
`
      : `
No original source image could be retrieved.

In this case, create the imagePrompt from the news topic and generated title only.

Do not invent unsupported details.
`;

  // ----------------------------------------------------------
  // GEMINI PROMPT
  // ----------------------------------------------------------

  const prompt = `
You are the senior digital editor and SEO strategist of an Indian Hindi news website called "INFINIA BHARAT NEWS".

Create a publication-ready Hindi news article from the selected trending topic.

============================================================
NEWS TOPIC
============================================================

${topic}

============================================================
SOURCE
============================================================

${source || "Google News"}

============================================================
SOURCE URL
============================================================

${sourceUrl || "Not available"}

============================================================
CATEGORY LIST
============================================================

You MUST select exactly ONE category from this list:

${categoryList}

CATEGORY RULES:

1. Do NOT create a new category.
2. Do NOT invent a category.
3. Do NOT return a category outside this list.
4. Return the category using its EXACT slug.
5. The slug MUST exactly match one of the supplied slugs.
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
EDITORIAL RULES
============================================================

1. Write the article in natural, professional Hindi.

2. The writing must sound like a real Indian digital newsroom.

3. Do NOT copy the source article.

4. Do NOT invent:

- facts
- statistics
- names
- quotes
- government statements
- dates
- locations
- events

5. If available information is limited, write only what can reasonably be established.

6. Never pretend to know information that is not available.

7. Do not use:

"इस खबर के अनुसार"

"AI के अनुसार"

"यह आर्टिकल"

"हमने पाया"

"ChatGPT"

"Gemini"

8. Avoid unnecessary keyword repetition.

9. Write for Google search intent and Google Discover-style readability.

10. Use short paragraphs of 2-4 sentences.

11. Avoid clickbait.

12. Title must be informative and strong without misleading readers.

13. Use Hindi naturally while retaining official names, organizations, places and technical terms where appropriate.

============================================================
SEO
============================================================

Create:

- title
- seoTitle
- seoDescription
- shortDescription
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
ARTICLE
============================================================

The content field MUST contain valid HTML.

Use:

<h2>...</h2>

<p>...</p>

<strong>...</strong>

<ul>
<li>...</li>
</ul>

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
IMAGE PROMPT
============================================================

${imageAnalysisInstruction}

The generated article TITLE is extremely important for the image prompt.

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

If the original image contains a recognizable public figure, use that person only when their identity is genuinely relevant to the news.

If the original image contains people whose identities are unknown, describe them generically.

Never invent a person's identity.

If the original image shows a building, location or object, only describe it specifically when the visual evidence supports it.

============================================================
IMAGE STYLE
============================================================

Create a premium Indian digital-news editorial photograph.

Style:

- photorealistic
- highly detailed
- realistic skin texture
- natural facial features
- realistic environment
- professional editorial photography
- cinematic but believable lighting
- strong subject separation
- controlled depth of field
- sharp primary subject
- subtle background blur
- dramatic but credible composition
- premium television-news visual quality
- modern Indian digital newsroom aesthetic
- sophisticated red, black, white and subtle gold palette
- high contrast
- clean composition
- 16:9 landscape
- photorealistic 4K quality

The image must look like professional news photography, not an advertisement.

============================================================
IMAGE ACCURACY
============================================================

Never invent:

- people
- names
- events
- locations
- buildings
- uniforms
- government symbols
- police actions
- military actions
- disasters
- protests
- statistics
- fictional situations presented as real

If exact visual details are unknown, use a realistic contextual representation.

Do not make unsupported visual claims.

============================================================
DO NOT RENDER TEXT
============================================================

Do NOT render:

- article title
- SEO title
- headline
- captions
- subtitles
- logos
- watermarks
- channel names
- fake newspaper text
- fake statistics
- fake banners
- fake UI
- fake social media posts
- readable text

============================================================
AVOID
============================================================

Do NOT create:

- cartoon
- illustration
- anime
- 3D render
- fantasy
- poster design
- advertising style
- excessive HDR
- excessive saturation
- fake explosions
- unnecessary crowds
- random people
- random politicians
- generic microphones
- generic newsroom backgrounds
- clickbait imagery
- misleading symbolism
- distorted hands
- duplicate people
- unnatural objects

============================================================
FINAL IMAGE PROMPT
============================================================

The imagePrompt MUST be ONE detailed paragraph.

It must combine:

- actual news topic
- generated article title
- primary subject
- relevant people/objects
- relevant location/environment
- supported visual context
- camera perspective
- composition
- lighting
- color grading
- editorial photography style
- 16:9 landscape
- photorealistic 4K quality

Do not make the prompt generic.

Do not simply say:

"Create a professional news thumbnail."

============================================================
OUTPUT
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
  "imagePrompt": ""
}

IMPORTANT:

suggestedCategory MUST contain ONLY the exact Firestore category slug.

============================================================
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
  // ADD ORIGINAL IMAGE TO GEMINI
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

    // Try removing accidental markdown fences
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

  // ----------------------------------------------------------
  // NORMALIZE CATEGORY
  // ----------------------------------------------------------

  const suggestedCategory =
    String(
      article.suggestedCategory ||
        ""
    )
      .trim()
      .toLowerCase();

  // ----------------------------------------------------------
  // FIND CATEGORY BY SLUG
  // ----------------------------------------------------------

  let selectedCategory =
    categories.find(
      (category) =>
        category.slug
          .toLowerCase() ===
        suggestedCategory
    );

  // ----------------------------------------------------------
  // FALLBACK BY ENGLISH NAME
  // ----------------------------------------------------------

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.name
            .toLowerCase() ===
          suggestedCategory
      );
  }

  // ----------------------------------------------------------
  // FALLBACK BY HINDI NAME
  // ----------------------------------------------------------

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.nameHi
            .toLowerCase() ===
          suggestedCategory
      );
  }

  // ----------------------------------------------------------
  // FINAL CATEGORY FALLBACK
  // ----------------------------------------------------------

  if (!selectedCategory) {
    selectedCategory =
      categories.find(
        (category) =>
          category.slug ===
          "india"
      ) ||
      categories[0];
  }

  // ----------------------------------------------------------
  // FINAL RESULT
  // ----------------------------------------------------------

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

    // Useful for debugging / UI
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