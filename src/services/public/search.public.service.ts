import fs from "fs/promises";
import path from "path";

import { PublicArticle } from "./article.public.service";
import { PublicVideo } from "./video.public.service";

// ============================================================
// SEARCH CONFIG
// ============================================================

const MAX_RESULTS = 20;

// ============================================================
// LOAD ARTICLES
// ============================================================

async function loadArticles(): Promise<any[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "articles.json"
    );

    const file = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(file);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SEARCH LOAD ARTICLES ERROR:", error);
    return [];
  }
}

// ============================================================
// LOAD VIDEOS
// ============================================================

async function loadVideos(): Promise<any[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "videos.json"
    );

    const file = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(file);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SEARCH LOAD VIDEOS ERROR:", error);
    return [];
  }
}

// ============================================================
// FORMAT TIMESTAMP
// ============================================================

function formatTimestamp(value: any): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value?.seconds === "number") {
    return new Date(value.seconds * 1000).toISOString();
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

// ============================================================
// NORMALIZE SEARCH TEXT
// ============================================================

function normalizeText(value: any): string {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ============================================================
// TOKENIZE
// ============================================================

function tokenize(value: any): string[] {
  const normalized = normalizeText(value);

  if (!normalized) {
    return [];
  }

  return normalized.split(" ").filter(Boolean);
}

// ============================================================
// LEVENSHTEIN DISTANCE
// ============================================================

function levenshteinDistance(
  a: string,
  b: string,
  maxDistance = Infinity
): number {
  if (a === b) {
    return 0;
  }

  if (!a) {
    return Array.from(b).length;
  }

  if (!b) {
    return Array.from(a).length;
  }

  const aChars = Array.from(a);
  const bChars = Array.from(b);

  if (Math.abs(aChars.length - bChars.length) > maxDistance) {
    return maxDistance + 1;
  }

  // Keep the shorter string in the columns.
  if (aChars.length > bChars.length) {
    return levenshteinDistance(
      b,
      a,
      maxDistance
    );
  }

  let previous = Array.from(
    { length: aChars.length + 1 },
    (_, index) => index
  );

  let current = new Array<number>(
    aChars.length + 1
  );

  for (let j = 1; j <= bChars.length; j++) {
    current[0] = j;

    let rowMin = current[0];

    for (let i = 1; i <= aChars.length; i++) {
      const substitutionCost =
        aChars[i - 1] === bChars[j - 1]
          ? 0
          : 1;

      current[i] = Math.min(
        current[i - 1] + 1,
        previous[i] + 1,
        previous[i - 1] + substitutionCost
      );

      rowMin = Math.min(
        rowMin,
        current[i]
      );
    }

    if (rowMin > maxDistance) {
      return maxDistance + 1;
    }

    [previous, current] = [
      current,
      previous,
    ];
  }

  return previous[aChars.length];
}

// ============================================================
// MAX FUZZY DISTANCE
// ============================================================

function getMaxDistance(
  token: string
): number {
  const length = Array.from(token).length;

  if (length <= 2) {
    return 0;
  }

  if (length <= 4) {
    return 1;
  }

  if (length <= 7) {
    return 2;
  }

  if (length <= 12) {
    return 3;
  }

  return 4;
}

// ============================================================
// TOKEN SIMILARITY
// ============================================================

function tokenSimilarity(
  queryToken: string,
  candidateToken: string
): number {
  if (
    !queryToken ||
    !candidateToken
  ) {
    return 0;
  }

  if (queryToken === candidateToken) {
    return 1;
  }

  // Prefix / partial matching.
  if (
    candidateToken.startsWith(queryToken) ||
    queryToken.startsWith(candidateToken)
  ) {
    const shorter = Math.min(
      Array.from(queryToken).length,
      Array.from(candidateToken).length
    );

    const longer = Math.max(
      Array.from(queryToken).length,
      Array.from(candidateToken).length
    );

    if (shorter >= 3) {
      return 0.88 + (shorter / longer) * 0.08;
    }
  }

  const maxDistance =
    getMaxDistance(queryToken);

  if (maxDistance === 0) {
    return 0;
  }

  const queryLength =
    Array.from(queryToken).length;

  const candidateLength =
    Array.from(candidateToken).length;

  if (
    Math.abs(
      queryLength -
        candidateLength
    ) > maxDistance
  ) {
    return 0;
  }

  const distance =
    levenshteinDistance(
      queryToken,
      candidateToken,
      maxDistance
    );

  if (distance > maxDistance) {
    return 0;
  }

  const maxLength = Math.max(
    queryLength,
    candidateLength
  );

  return Math.max(
    0,
    1 - distance / maxLength
  );
}

// ============================================================
// FIELD SCORE
// ============================================================

function scoreField(
  queryTokens: string[],
  fieldValue: any
): number {
  const normalizedField =
    normalizeText(fieldValue);

  if (!normalizedField) {
    return 0;
  }

  // Highest priority: exact complete phrase.
  const normalizedQuery =
    queryTokens.join(" ");

  if (
    normalizedQuery &&
    normalizedField.includes(
      normalizedQuery
    )
  ) {
    return 1;
  }

  const candidateTokens =
    tokenize(normalizedField);

  if (!candidateTokens.length) {
    return 0;
  }

  let totalScore = 0;
  let matchedTokens = 0;

  for (const queryToken of queryTokens) {
    let bestMatch = 0;

    for (const candidateToken of candidateTokens) {
      const similarity =
        tokenSimilarity(
          queryToken,
          candidateToken
        );

      if (similarity > bestMatch) {
        bestMatch = similarity;
      }

      if (bestMatch === 1) {
        break;
      }
    }

    // Ignore extremely weak fuzzy matches.
    if (bestMatch >= 0.55) {
      totalScore += bestMatch;
      matchedTokens++;
    }
  }

  if (!matchedTokens) {
    return 0;
  }

  // Require every query word for multi-word searches
  // unless the query has only one word.
  if (
    queryTokens.length > 1 &&
    matchedTokens < queryTokens.length
  ) {
    return 0;
  }

  return (
    totalScore /
    queryTokens.length
  );
}

// ============================================================
// COMPLETE SEARCH SCORE
// ============================================================

function scoreArticle(
  article: any,
  queryTokens: string[]
): number {
  const titleScore = scoreField(
    queryTokens,
    article?.title
  );

  const shortDescriptionScore =
    scoreField(
      queryTokens,
      article?.shortDescription
    );

  const seoTitleScore = scoreField(
    queryTokens,
    article?.seoTitle
  );

  const seoDescriptionScore =
    scoreField(
      queryTokens,
      article?.seoDescription
    );

  const categoryScore = Math.max(
    scoreField(
      queryTokens,
      article?.category
    ),
    scoreField(
      queryTokens,
      article?.categoryHi
    )
  );

  // Content is deliberately checked last.
  // This prevents a random mention deep inside
  // an article from outranking a title match.
  const contentScore = scoreField(
    queryTokens,
    article?.content
  );

  return (
    titleScore * 100 +
    seoTitleScore * 70 +
    shortDescriptionScore * 55 +
    seoDescriptionScore * 40 +
    categoryScore * 30 +
    contentScore * 20
  );
}

// ============================================================
// COMPLETE VIDEO SCORE
// ============================================================

function scoreVideo(
  video: any,
  queryTokens: string[]
): number {
  const titleScore = scoreField(
    queryTokens,
    video?.title
  );

  const descriptionScore =
    scoreField(
      queryTokens,
      video?.description ||
        video?.shortDescription
    );

  const categoryScore = Math.max(
    scoreField(
      queryTokens,
      video?.category
    ),
    scoreField(
      queryTokens,
      video?.categoryHi
    )
  );

  return (
    titleScore * 100 +
    descriptionScore * 50 +
    categoryScore * 30
  );
}

// ============================================================
// DATE SORT FALLBACK
// ============================================================

function getTime(value: any): number {
  const formatted =
    formatTimestamp(value);

  if (!formatted) {
    return 0;
  }

  const time = new Date(
    formatted
  ).getTime();

  return Number.isFinite(time)
    ? time
    : 0;
}

// ============================================================
// SEARCH ARTICLES
// ============================================================

export async function searchArticles(
  keyword: string
): Promise<PublicArticle[]> {
  const search =
    normalizeText(keyword);

  if (!search) {
    return [];
  }

  const queryTokens =
    tokenize(search);

  if (!queryTokens.length) {
    return [];
  }

  const rawArticles =
    await loadArticles();

  return rawArticles
    // ONLY PUBLISHED
    .filter(
      (article) =>
        article?.status ===
        "published"
    )

    // SCORE
    .map((article) => ({
      article,
      score: scoreArticle(
        article,
        queryTokens
      ),
    }))

    // REMOVE NON-MATCHES
    .filter(
      ({ score }) =>
        score > 0
    )

    // BEST MATCH FIRST
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        getTime(
          b.article?.createdAt
        ) -
        getTime(
          a.article?.createdAt
        )
      );
    })

    // FORMAT
    .slice(0, MAX_RESULTS)

    .map(
      ({ article }): PublicArticle => ({
        id: String(
          article?.id || ""
        ),

        title:
          article?.title || "",

        slug:
          article?.slug || "",

        thumbnail:
          article?.thumbnail || "",

        shortDescription:
          article?.shortDescription ||
          "",

        content:
          article?.content || "",

        seoTitle:
          article?.seoTitle || "",

        seoDescription:
          article?.seoDescription ||
          "",

        categoryId:
          article?.categoryId || "",

        category:
          article?.category || "",

        categoryHi:
          article?.categoryHi || "",

        featured:
          Boolean(
            article?.featured
          ),

        breaking:
          Boolean(
            article?.breaking
          ),

        priority:
          Number(
            article?.priority || 0
          ),

        status:
          "published",

        author:
          article?.author,

        createdAt:
          formatTimestamp(
            article?.createdAt
          ),

        updatedAt:
          formatTimestamp(
            article?.updatedAt
          ),
      })
    );
}

// ============================================================
// SEARCH VIDEOS
// ============================================================

export async function searchVideos(
  keyword: string
): Promise<PublicVideo[]> {
  const search =
    normalizeText(keyword);

  if (!search) {
    return [];
  }

  const queryTokens =
    tokenize(search);

  if (!queryTokens.length) {
    return [];
  }

  const rawVideos =
    await loadVideos();

  return rawVideos
    // ONLY PUBLISHED
    .filter(
      (video) =>
        video?.status ===
        "published"
    )

    // SCORE
    .map((video) => ({
      video,
      score: scoreVideo(
        video,
        queryTokens
      ),
    }))

    // REMOVE NON-MATCHES
    .filter(
      ({ score }) =>
        score > 0
    )

    // BEST MATCH FIRST
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        getTime(
          b.video?.createdAt
        ) -
        getTime(
          a.video?.createdAt
        )
      );
    })

    // LIMIT
    .slice(0, MAX_RESULTS)

    // FORMAT
    .map(
      ({ video }): PublicVideo => {
        const youtubeUrl =
          video?.youtubeUrl ||
          video?.url ||
          "";

        return {
          id: String(
            video?.id || ""
          ),

          title:
            video?.title || "",

          youtubeUrl,

          thumbnail:
            video?.thumbnail ||
            video?.image ||
            getYoutubeThumbnail(
              youtubeUrl
            ),

          description:
            video?.description ||
            video?.shortDescription ||
            "",

          categoryId:
            video?.categoryId || "",

          category:
            video?.category || "",

          categoryHi:
            video?.categoryHi || "",

          status:
            "published",

          createdAt:
            formatTimestamp(
              video?.createdAt
            ),

          updatedAt:
            formatTimestamp(
              video?.updatedAt
            ),

          views:
            Number(
              video?.views || 0
            ),
        };
      }
    );
}

// ============================================================
// YOUTUBE THUMBNAIL
// ============================================================

function getYoutubeThumbnail(
  url: string
): string {
  if (!url) {
    return "";
  }

  try {
    const parsed =
      new URL(url);

    const videoId =
      parsed.searchParams.get(
        "v"
      );

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      const id =
        parsed.pathname
          .replace("/", "")
          .trim();

      if (id) {
        return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
      }
    }

    const shortsMatch =
      parsed.pathname.match(
        /\/shorts\/([^/]+)/
      );

    if (shortsMatch?.[1]) {
      return `https://img.youtube.com/vi/${shortsMatch[1]}/maxresdefault.jpg`;
    }

    const embedMatch =
      parsed.pathname.match(
        /\/embed\/([^/]+)/
      );

    if (embedMatch?.[1]) {
      return `https://img.youtube.com/vi/${embedMatch[1]}/maxresdefault.jpg`;
    }
  } catch {
    return "";
  }

  return "";
}

