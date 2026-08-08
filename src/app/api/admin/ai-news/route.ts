export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/firebase-admin";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

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

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(" "));
  const wordsB = new Set(normalize(b).split(" "));

  const common = [...wordsA].filter(
    (word) =>
      word.length > 3 &&
      wordsB.has(word)
  );

  return (
    common.length /
    Math.max(
      1,
      Math.min(wordsA.size, wordsB.size)
    )
  );
}

async function getGoogleNews() {
  const url =
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Google News could not be loaded"
    );
  }

  const xml = await response.text();

  const items: {
    title: string;
    link: string;
    pubDate: string;
    source: string;
  }[] = [];

  const blocks =
    xml.match(/<item>[\s\S]*?<\/item>/g) || [];

  for (const block of blocks.slice(0, 20)) {
    const title =
      block.match(
        /<title>([\s\S]*?)<\/title>/
      )?.[1] || "";

    const link =
      block.match(
        /<link>([\s\S]*?)<\/link>/
      )?.[1] || "";

    const pubDate =
      block.match(
        /<pubDate>([\s\S]*?)<\/pubDate>/
      )?.[1] || "";

    const source =
      block.match(
        /<source[^>]*>([\s\S]*?)<\/source>/
      )?.[1] || "";

    if (!title) continue;

    items.push({
      title: cleanText(title),
      link: link.trim(),
      pubDate,
      source: cleanText(source),
    });
  }

  return items;
}

async function getExistingArticles() {
  const snapshot =
    await adminDb
      .collection("articles")
      .limit(200)
      .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title || "",
      seoTitle: data.seoTitle || "",
    };
  });
}

async function getTrendingNews() {
  const googleNews =
    await getGoogleNews();

  const existing =
    await getExistingArticles();

  const filtered =
    googleNews.filter((news) => {
      const duplicate =
        existing.some((article) => {
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
        });

      return !duplicate;
    });

  return filtered.slice(0, 10);
}

async function generateArticle(
  topic: string,
  source?: string
) {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is missing"
    );
  }

  const prompt = `
You are the senior digital editor and SEO strategist of an Indian Hindi news website called "INFINIA BHARAT NEWS".

Your job is to create a publication-ready Hindi news article from the trending topic below.

========================
TRENDING TOPIC
========================

${topic}

========================
SOURCE
========================

${source || "Google News"}

========================
EDITORIAL RULES
========================

1. Write the article in natural, professional Hindi.

2. The writing must sound like a real Indian digital newsroom, NOT like AI-generated content.

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

5. If the available information is limited, write only what can reasonably be established from the topic and clearly avoid unsupported claims.

6. Do not use phrases such as:
   "इस खबर के अनुसार"
   "AI के अनुसार"
   "यह आर्टिकल"
   "हमने पाया"
   "ChatGPT"
   "Gemini"

7. Avoid unnecessary repetition of the main keyword.

8. Use the main topic naturally throughout the article.

9. Article should satisfy Google search intent and Google Discover-style readability.

10. Use short paragraphs of 2-4 sentences.

11. Avoid clickbait.

12. Title should be informative, strong and curiosity-driven without misleading the reader.

13. Use Hindi naturally, but retain important official names, organizations, places and technical terms in their commonly recognized form where appropriate.

========================
SEO REQUIREMENTS
========================

Create:

- SEO-friendly title
- SEO title
- SEO description
- short description
- suggested category
- complete article
- professional thumbnail/image prompt

SEO title:
- approximately 50-60 characters when practical
- main keyword/topic should appear naturally near the beginning

SEO description:
- approximately 140-160 characters when practical
- should clearly communicate what the reader will learn
- should encourage clicks without clickbait

Short description:
- 2-3 concise sentences
- suitable for article cards and social previews

========================
ARTICLE STRUCTURE
========================

The HTML content must contain:

<h2> sections where genuinely useful.

Use paragraphs like:

<p>...</p>

Use <strong> only for genuinely important facts, names or keywords.

Use <ul><li>...</li></ul> only when a list actually improves readability.

Do NOT create unnecessary headings just to increase length.

The opening paragraph must immediately explain the most important part of the news.

The article should normally contain around 700-1000 words when the available facts support that length.

Do NOT artificially add information just to reach the word count.

Suggested structure:

1. Strong opening paragraph
2. Main development
3. Important details/context
4. What this means for readers/public
5. Relevant background
6. What happens next / current status, only if supported
7. Concise conclusion

========================
IMAGE PROMPT REQUIREMENTS
========================

Create an extremely detailed professional prompt for generating a 16:9 HD Indian television-news style thumbnail.

The image prompt MUST:

- describe the actual news subject
- specify the main visual subject
- specify environment/location if relevant
- specify important people/objects only if factually relevant
- use realistic editorial photography
- dramatic but believable lighting
- premium Indian news channel aesthetic
- strong visual hierarchy
- cinematic composition
- sharp subject
- realistic details
- clean background separation
- red, black, white and subtle gold newsroom color palette
- 16:9 landscape composition
- 4K quality
- photorealistic
- suitable for a professional news website

IMPORTANT:

Do NOT ask the image generator to write:
- headline
- article title
- logo
- watermark
- fake text
- fake newspaper
- fake statistics

Do NOT create sensational or misleading visuals.

If a person is involved, describe their real-world appearance only from generally known public visual characteristics and do not invent actions or expressions that are not supported.

The thumbnail should look like a premium editorial news photograph, NOT a poster, NOT a cartoon, NOT an illustration.

========================
OUTPUT
========================

Return ONLY valid JSON.

Do not use markdown fences.

Use exactly this structure:

{
  "title": "",
  "seoTitle": "",
  "seoDescription": "",
  "shortDescription": "",
  "content": "",
  "suggestedCategory": "",
  "imagePrompt": ""
}
`;

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
              parts: [
                {
                  text: prompt,
                },
              ],
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

  const text =
    data?.candidates?.[0]
      ?.content?.parts?.[0]
      ?.text;

  if (!text) {
    throw new Error(
      "AI returned empty response"
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error(
      "Invalid Gemini JSON:",
      text
    );

    throw new Error(
      "AI returned invalid JSON"
    );
  }
}

export async function GET() {
  try {
    const news =
      await getTrendingNews();

    return NextResponse.json({
      success: true,
      news,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to load trending news",
      },
      {
        status: 500,
      }
    );
  }
}

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
        body.source
      );

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "AI generation failed",
      },
      {
        status: 500,
      }
    );
  }
}