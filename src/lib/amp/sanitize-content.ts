// ============================================================
// AMP CONTENT SANITIZER
// ============================================================
//
// CKEditor 5 se aaya raw HTML (article.content) ko
// AMP-valid HTML me convert karta hai:
//
//   <img>     -> <amp-img>   (width/height + layout mandatory)
//   <iframe>  -> strip (raw iframe AMP me allowed nahi)
//   <script>  -> strip
//   on*=""    -> strip (inline event handlers)
//   empty <p> -> strip
//
// ============================================================

export interface ExtractedImage {
  url: string;
  alt: string;
  width: string;
  height: string;
}

export interface ExtractedVideo {
  id: string;
  embedUrl: string;
  thumbnailUrl: string;
}

// ------------------------------------------------------------
// Basic HTML attribute escaper (for use inside "" attributes)
// ------------------------------------------------------------

export function escapeAttr(value: string): string {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ------------------------------------------------------------
// Escape text safely for JSON-LD <script> blocks
// ------------------------------------------------------------

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// ------------------------------------------------------------
// Extract <img> tags from raw HTML (for OG / schema use)
// ------------------------------------------------------------

export function extractContentImages(html: string): ExtractedImage[] {
  if (!html) return [];

  const images: ExtractedImage[] = [];
  const imgRegex = /<img[^>]+>/gi;
  let match: RegExpExecArray | null;

  while ((match = imgRegex.exec(html)) !== null) {
    const tag = match[0];

    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;

    const altMatch = tag.match(/alt=["']([^"']*)["']/i);
    const widthMatch = tag.match(/width=["']?(\d+)["']?/i);
    const heightMatch = tag.match(/height=["']?(\d+)["']?/i);

    if (images.some((img) => img.url === srcMatch[1])) continue;

    images.push({
      url: srcMatch[1],
      alt: altMatch?.[1] || "",
      width: widthMatch?.[1] || "800",
      height: heightMatch?.[1] || "450",
    });
  }

  return images;
}

// ------------------------------------------------------------
// Extract YouTube video IDs mentioned in content
// ------------------------------------------------------------

export function extractYoutubeVideos(html: string): ExtractedVideo[] {
  if (!html) return [];

  const videos: ExtractedVideo[] = [];

  const regex =
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/gi;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const id = match[1];
    if (!id) continue;
    if (videos.some((v) => v.id === id)) continue;

    videos.push({
      id,
      embedUrl: `https://www.youtube.com/embed/${id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    });
  }

  return videos;
}

// ------------------------------------------------------------
// Convert raw CKEditor HTML -> AMP-safe HTML
// ------------------------------------------------------------

export function convertToAmpHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  let html = rawHtml;

  // Strip scripts / style blocks / inline event handlers / js: hrefs
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
  html = html.replace(/\son\w+=("[^"]*"|'[^']*')/gi, "");
  html = html.replace(/href=(["'])javascript:[^"']*\1/gi, 'href="#"');

  // AMP does not allow raw <iframe> (needs amp-iframe/amp-youtube) -> strip
  html = html.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

  // Remove empty CKEditor spacer paragraphs
  html = html.replace(/<p>(&nbsp;|\s)*<\/p>/gi, "");

  // Convert every <img> to <amp-img>
  html = html.replace(/<img([^>]*)>/gi, (_full, attrsStr: string) => {
    const getAttr = (name: string) => {
      const m = attrsStr.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
      return m ? m[1] : "";
    };

    const src = getAttr("src");
    if (!src) return "";

    const alt = getAttr("alt");
    const width = getAttr("width") || "800";
    const height = getAttr("height") || "450";

    return (
      `<amp-img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" ` +
      `width="${width}" height="${height}" layout="responsive" ` +
      `class="amp-content-img"></amp-img>`
    );
  });

  return html.trim();
}

// ------------------------------------------------------------
// Strip all HTML tags (for word count / plain-text preview)
// ------------------------------------------------------------

export function stripHtml(html: string): string {
  return String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ------------------------------------------------------------
// Approx read time in minutes (Hindi/English mixed content)
// ------------------------------------------------------------

export function calculateReadTime(html: string): number {
  const text = stripHtml(html);
  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

// ------------------------------------------------------------
// Format date in Hindi long form, e.g. "20 अगस्त 2026"
// ------------------------------------------------------------

export function formatHindiDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatHindiDateTime(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
