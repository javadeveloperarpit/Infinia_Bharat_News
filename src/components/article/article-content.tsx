"use client";

interface Props {
  article: any;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getYouTubeId(url: URL) {
  let videoId = "";

  if (
    url.hostname === "youtube.com" ||
    url.hostname === "www.youtube.com" ||
    url.hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") || "";
    }

    if (url.pathname.startsWith("/embed/")) {
      videoId = url.pathname.split("/embed/")[1] || "";
    }

    if (url.pathname.startsWith("/shorts/")) {
      videoId = url.pathname.split("/shorts/")[1] || "";
    }

    if (url.pathname.startsWith("/live/")) {
      videoId = url.pathname.split("/live/")[1] || "";
    }
  }

  if (url.hostname === "youtu.be") {
    videoId = url.pathname.slice(1);
  }

  return videoId.split(/[?&#]/)[0];
}

function getVimeoId(url: URL) {
  if (
    url.hostname === "vimeo.com" ||
    url.hostname === "www.vimeo.com"
  ) {
    return url.pathname.split("/").filter(Boolean)[0] || "";
  }

  if (url.hostname === "player.vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);

    const index = parts.indexOf("video");

    if (index !== -1) {
      return parts[index + 1] || "";
    }
  }

  return "";
}

function convertMediaEmbeds(html: string) {
  if (!html) return "";

  return html.replace(
    /<figure[^>]*class=["']media["'][^>]*>\s*<oembed[^>]*url=["']([^"']+)["'][^>]*>\s*<\/oembed>\s*<\/figure>/gi,
    (_, rawUrl: string) => {
      try {
        const url = new URL(rawUrl);

        const hostname = url.hostname.toLowerCase();

        /*
        ============================================================
        YOUTUBE
        ============================================================
        */

        const youtubeId = getYouTubeId(url);

        if (youtubeId) {
          return `
            <figure class="article-media article-youtube-video">
              <div class="article-media-wrapper">
                <iframe
                  src="https://www.youtube.com/embed/${encodeURIComponent(
                    youtubeId
                  )}"
                  title="YouTube video"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              </div>
            </figure>
          `;
        }

        /*
        ============================================================
        VIMEO
        ============================================================
        */

        const vimeoId = getVimeoId(url);

        if (vimeoId) {
          return `
            <figure class="article-media article-vimeo-video">
              <div class="article-media-wrapper">
                <iframe
                  src="https://player.vimeo.com/video/${encodeURIComponent(
                    vimeoId
                  )}"
                  title="Vimeo video"
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
            </figure>
          `;
        }

        /*
        ============================================================
        DAILYMOTION
        ============================================================
        */

        if (
          hostname === "dailymotion.com" ||
          hostname === "www.dailymotion.com"
        ) {
          const match = url.pathname.match(
            /\/video\/([^_/?]+)/
          );

          const videoId = match?.[1];

          if (videoId) {
            return `
              <figure class="article-media article-dailymotion-video">
                <div class="article-media-wrapper">
                  <iframe
                    src="https://www.dailymotion.com/embed/video/${encodeURIComponent(
                      videoId
                    )}"
                    title="Dailymotion video"
                    loading="lazy"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </figure>
            `;
          }
        }

        /*
        ============================================================
        SPOTIFY
        ============================================================
        */

        if (
          hostname === "open.spotify.com" ||
          hostname === "www.open.spotify.com"
        ) {
          const parts = url.pathname
            .split("/")
            .filter(Boolean);

          if (parts.length >= 2) {
            const type = parts[0];
            const id = parts[1];

            return `
              <figure class="article-media article-spotify">
                <div class="article-spotify-wrapper">
                  <iframe
                    src="https://open.spotify.com/embed/${encodeURIComponent(
                      type
                    )}/${encodeURIComponent(id)}"
                    title="Spotify player"
                    loading="lazy"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </figure>
            `;
          }
        }

        /*
        ============================================================
        SOUNDCLOUD
        ============================================================
        */

        if (
          hostname === "soundcloud.com" ||
          hostname === "www.soundcloud.com"
        ) {
          const safeUrl = escapeHtml(url.href);

          return `
            <figure class="article-media article-soundcloud">
              <div class="article-soundcloud-wrapper">
                <iframe
                  src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
                    url.href
                  )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false"
                  title="SoundCloud player"
                  loading="lazy"
                  allow="autoplay"
                ></iframe>
              </div>
            </figure>
          `;
        }

        /*
        ============================================================
        INSTAGRAM
        ============================================================
        */

        if (
          hostname === "instagram.com" ||
          hostname === "www.instagram.com"
        ) {
          const path = url.pathname;

          if (
            path.startsWith("/p/") ||
            path.startsWith("/reel/") ||
            path.startsWith("/tv/")
          ) {
            const cleanUrl = escapeHtml(
              `${url.origin}${url.pathname}`
            );

            return `
              <figure class="article-media article-instagram">
                <div class="article-social-wrapper">
                  <iframe
                    src="${cleanUrl}embed/"
                    title="Instagram post"
                    loading="lazy"
                    allowtransparency="true"
                    scrolling="no"
                    frameborder="0"
                  ></iframe>
                </div>
              </figure>
            `;
          }
        }

        /*
        ============================================================
        X / TWITTER
        ============================================================
        */

        if (
          hostname === "twitter.com" ||
          hostname === "www.twitter.com" ||
          hostname === "x.com" ||
          hostname === "www.x.com"
        ) {
          return `
            <figure class="article-media article-twitter">
              <blockquote class="twitter-tweet">
                <a href="${escapeHtml(url.href)}">
                  View post on X
                </a>
              </blockquote>
            </figure>
          `;
        }

        /*
        ============================================================
        DIRECT VIDEO FILE
        ============================================================
        */

        const pathname = url.pathname.toLowerCase();

        const videoExtensions = [
          ".mp4",
          ".webm",
          ".ogg",
          ".ogv",
          ".mov",
          ".m4v",
        ];

        const isVideoFile = videoExtensions.some((extension) =>
          pathname.endsWith(extension)
        );

        if (isVideoFile) {
          return `
            <figure class="article-media article-direct-video">
              <video
                controls
                playsinline
                preload="metadata"
                src="${escapeHtml(url.href)}"
              >
                Your browser does not support the video tag.
              </video>
            </figure>
          `;
        }

        /*
        ============================================================
        UNKNOWN MEDIA
        ============================================================
        */

        // Unknown URL ko silently delete nahi karenge.
        // Original link preserve karenge.

        return `
          <figure class="article-media article-unknown-media">
            <a
              href="${escapeHtml(url.href)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open media
            </a>
          </figure>
        `;
      } catch {
        return "";
      }
    }
  );
}

export default function ArticleContent({
  article,
}: Props) {
  const content = convertMediaEmbeds(
    article?.content || ""
  );

  return (
    <article
      className="
        article-content

        w-full
        min-w-0
        max-w-full

        overflow-hidden

        prose
        prose-lg
        max-w-none

        break-words
        [overflow-wrap:anywhere]

        prose-headings:max-w-full
        prose-p:max-w-full
        prose-li:max-w-full

        prose-img:mx-auto
        prose-img:block
        prose-img:h-auto
        prose-img:max-w-full

        prose-video:max-w-full
        prose-iframe:max-w-full

        prose-table:w-full
        prose-table:max-w-full

        prose-pre:max-w-full
      "
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}