import LeadersXCarousel from "./leaders-x-carousel";

interface XPost {
  person: string;
  handle: string;
  title: string;
  link: string;
  pubDate: string;
  image?: string;
}

const PEOPLE = [
  {
    person: "Narendra Modi",
    handle: "narendramodi",
  },
  {
    person: "President of India",
    handle: "rashtrapatibhvn",
  },
  {
    person: "Amit Shah",
    handle: "AmitShah",
  },
  {
    person: "Rahul Gandhi",
    handle: "RahulGandhi",
  },
];

function decodeHtml(text: string) {
  return text
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .trim();
}

function extractTag(item: string, tag: string) {
  const regex = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  return item.match(regex)?.[1] || "";
}

function extractImage(item: string) {
  const patterns = [
    /<media:content[^>]+url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]+url=["']([^"']+)["']/i,
    /<enclosure[^>]+url=["']([^"']+)["']/i,
    /<img[^>]+src=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const match = item.match(pattern);

    if (match?.[1]) {
      return decodeHtml(match[1]);
    }
  }

  return "";
}

function looksLikeReply(title: string) {
  const text = title.replace(/\s+/g, " ").trim();

  const replyPatterns = [
    /^replying to\s+@/i,
    /^reply to\s+@/i,
    /^in reply to\s+@/i,
    /^re:\s*@/i,
    /^@\w+\s/i,
    /^thank you .+ ji\b/i,
    /^thank you @/i,
    /^thanks @/i,
    /^congratulations @/i,
    /^congrats @/i,
    /^well done @/i,
    /^appreciate .+ @/i,
    /^grateful to @/i,
  ];

  return replyPatterns.some((pattern) => pattern.test(text));
}

async function fetchGoogleNewsXPosts(
  person: string,
  handle: string
): Promise<XPost[]> {
  const query = encodeURIComponent(
    `site:x.com/${handle}/status`
  );

  const url =
    `https://news.google.com/rss/search?q=${query}` +
    `&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        `Google News HTTP error ${handle}:`,
        response.status
      );

      return [];
    }

    const xml = await response.text();

    const items =
      xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const posts = items
      .map((item) => {
        const title = decodeHtml(
          extractTag(item, "title")
        );

        const link = decodeHtml(
          extractTag(item, "link")
        );

        const pubDate = decodeHtml(
          extractTag(item, "pubDate")
        );

        const image = extractImage(item);

        return {
          person,
          handle,
          title,
          link,
          pubDate,
          image,
        };
      })
      .filter((post) => {
        if (!post.title || !post.link) {
          return false;
        }

        const isXResult =
          /-\s*x\.com\s*$/i.test(post.title) ||
          post.title.toLowerCase().includes("x.com");

        if (!isXResult) {
          return false;
        }

        const cleanTitle = post.title
          .replace(/\s*-\s*x\.com\s*$/i, "")
          .trim();

        if (cleanTitle.length < 100) {
          return false;
        }

        const words = cleanTitle
          .split(/\s+/)
          .filter(Boolean);

        if (words.length < 15) {
          return false;
        }

        if (looksLikeReply(cleanTitle)) {
          return false;
        }

        return true;
      })
      .map((post) => ({
        ...post,
        title: post.title
          .replace(/\s*-\s*x\.com\s*$/i, "")
          .trim(),
      }));

    posts.sort(
      (a, b) =>
        new Date(b.pubDate).getTime() -
        new Date(a.pubDate).getTime()
    );

    return posts.slice(0, 2);
  } catch (error) {
    console.error(
      `Google News fetch failed for ${handle}:`,
      error
    );

    return [];
  }
}

export default async function LeadersOnX() {
  const results = await Promise.all(
    PEOPLE.map((person) =>
      fetchGoogleNewsXPosts(
        person.person,
        person.handle
      )
    )
  );

  const posts = results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.pubDate).getTime() -
        new Date(a.pubDate).getTime()
    );

  if (!posts.length) {
    return null;
  }

  return <LeadersXCarousel posts={posts} />;
}