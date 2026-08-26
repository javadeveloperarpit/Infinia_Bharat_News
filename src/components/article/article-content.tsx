"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

interface Props {
  article: any;
}

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* =========================================================
   YOUTUBE
========================================================= */

function getYouTubeId(url: URL) {
  let videoId = "";

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v") || "";
    }

    if (url.pathname.startsWith("/embed/")) {
      videoId =
        url.pathname.split("/embed/")[1] || "";
    }

    if (url.pathname.startsWith("/shorts/")) {
      videoId =
        url.pathname.split("/shorts/")[1] || "";
    }

    if (url.pathname.startsWith("/live/")) {
      videoId =
        url.pathname.split("/live/")[1] || "";
    }
  }

  if (hostname === "youtu.be") {
    videoId = url.pathname.slice(1);
  }

  return videoId.split(/[?&#]/)[0];
}

/* =========================================================
   VIMEO
========================================================= */

function getVimeoId(url: URL) {
  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "vimeo.com" ||
    hostname === "www.vimeo.com"
  ) {
    return (
      url.pathname
        .split("/")
        .filter(Boolean)[0] || ""
    );
  }

  if (hostname === "player.vimeo.com") {
    const parts = url.pathname
      .split("/")
      .filter(Boolean);

    const index =
      parts.indexOf("video");

    if (index !== -1) {
      return parts[index + 1] || "";
    }
  }

  return "";
}

/* =========================================================
   MEDIA EMBEDS
========================================================= */

function convertMediaEmbeds(html: string) {
  if (!html) return "";

  /* ================================================
   NORMALIZE CKEDITOR SAVED MEDIA PREVIEWS
================================================ */

html = html.replace(
  /<figure([^>]*)class=["']([^"']*\bmedia\b[^"']*)["']([^>]*)>\s*<div([^>]*)data-oembed-url=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/div>\s*<\/figure>/gi,
  (
    _,
    beforeClass,
    className,
    afterClass,
    beforeUrl,
    mediaUrl
  ) => {
    return `
      <figure class="media">
        <oembed
          url="${escapeHtml(mediaUrl)}"
        ></oembed>
      </figure>
    `;
  }
);

  return html.replace(
    /<figure[^>]*class=["'][^"']*\bmedia\b[^"']*["'][^>]*>\s*<oembed[^>]*url=["']([^"']+)["'][^>]*>\s*<\/oembed>\s*<\/figure>/gi,
    (_, rawUrl: string) => {
      try {
        const url = new URL(rawUrl);
        const hostname =
          url.hostname.toLowerCase();

        /* ================================
           YOUTUBE
        ================================= */

        const youtubeId =
          getYouTubeId(url);

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

        /* ================================
           VIMEO
        ================================= */

        const vimeoId =
          getVimeoId(url);

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

        /* ================================
           DAILYMOTION
        ================================= */

        if (
          hostname === "dailymotion.com" ||
          hostname === "www.dailymotion.com"
        ) {
          const match =
            url.pathname.match(
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

        /* ================================
           SPOTIFY
        ================================= */

        if (
          hostname === "open.spotify.com" ||
          hostname === "www.open.spotify.com"
        ) {
          const parts =
            url.pathname
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

        /* ================================
           SOUNDCLOUD
        ================================= */

        if (
          hostname === "soundcloud.com" ||
          hostname === "www.soundcloud.com"
        ) {
          return `
            <figure class="article-media article-soundcloud">
              <div class="article-soundcloud-wrapper">
                <iframe
                  src="https://w.soundcloud.com/player/?url=${encodeURIComponent(
                    url.href
                  )}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false"
                  title="SoundCloud player"
                  loading="lazy"
                  allow="autoplay"
                ></iframe>
              </div>
            </figure>
          `;
        }

        /* ================================
           INSTAGRAM
        ================================= */

        if (
          hostname === "instagram.com" ||
          hostname === "www.instagram.com"
        ) {
          const path =
            url.pathname;

          if (
            path.startsWith("/p/") ||
            path.startsWith("/reel/") ||
            path.startsWith("/tv/")
          ) {
            const cleanUrl =
              escapeHtml(
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

        /* ================================
           X / TWITTER
        ================================= */

        if (
          hostname === "twitter.com" ||
          hostname === "www.twitter.com" ||
          hostname === "x.com" ||
          hostname === "www.x.com"
        ) {
          return `
            <figure class="article-media article-twitter">
              <blockquote class="twitter-tweet">
                <a
                  href="${escapeHtml(url.href)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View post on X
                </a>
              </blockquote>
            </figure>
          `;
        }

        /* ================================
           DIRECT VIDEO
        ================================= */

        const pathname =
          url.pathname.toLowerCase();

        const videoExtensions = [
          ".mp4",
          ".webm",
          ".ogg",
          ".ogv",
          ".mov",
          ".m4v",
        ];

        const isVideoFile =
          videoExtensions.some(
            (extension) =>
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
              ></video>
            </figure>
          `;
        }

        /* ================================
   ANY OTHER URL
================================= */

return `
  <figure class="article-media article-any-url">
    <div
      class="article-any-url-wrapper"
      data-media-url="${escapeHtml(url.href)}"
    >
      <iframe
        src="${escapeHtml(url.href)}"
        title="Embedded content"
        loading="lazy"
        width="1280"
        height="720"
        style="
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        "
        allow="
          autoplay;
          encrypted-media;
          fullscreen;
          picture-in-picture;
          clipboard-write
        "
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
  </figure>
`;
      } catch {
        return "";
      }
    }
  );
}

/* =========================================================
   ADD AUDIO TARGETS
   NO DOMParser — SSR SAFE
========================================================= */

function prepareAudioContent(html: string) {
  if (!html) return "";

  const readableTags =
    "(?:p|h2|h3|h4|blockquote|li)";

  const readableElementRegex =
    new RegExp(
      `<(${readableTags})([^>]*)>([\\s\\S]*?)<\\/\\1>`,
      "gi"
    );

  let index = 0;

  return html.replace(
    readableElementRegex,
    (
      fullMatch,
      tagName: string,
      attributes: string,
      innerHtml: string
    ) => {
      /* =============================================
         Ignore elements inside media containers.
      ============================================== */

      if (
        /\barticle-media\b/i.test(attributes)
      ) {
        return fullMatch;
      }

      /* =============================================
         Get readable text without HTML tags.
      ============================================== */

      const text = innerHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();

      if (!text) {
        return fullMatch;
      }

      /* =============================================
         Prevent duplicate attributes.
      ============================================== */

      const cleanAttributes =
        attributes.replace(
          /\sdata-audio-index=["'][^"']*["']/gi,
          ""
        );

      const currentIndex = index;
      index++;

      return `<${tagName}${cleanAttributes} data-audio-index="${currentIndex}">${innerHtml}</${tagName}>`;
    }
  );
}

/* =========================================================
   ARTICLE CONTENT
========================================================= */

export default function ArticleContent({
  article,
}: Props) {
  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const content = useMemo(() => {
    const converted =
      convertMediaEmbeds(
        article?.content || ""
      );

    return prepareAudioContent(
      converted
    );
  }, [article?.content]);

  /* =======================================================
     AUDIO EVENT LISTENER
  ======================================================= */

  useEffect(() => {
    const handleAudioProgress = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          index?: number;
        }>;

      const index =
        customEvent.detail?.index;

      if (
        typeof index !== "number"
      ) {
        return;
      }

      setActiveIndex(index);

      requestAnimationFrame(() => {
        const target =
          document.querySelector(
            `[data-audio-index="${index}"]`
          );

        if (!target) return;

        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    };

    window.addEventListener(
      "article-audio-progress",
      handleAudioProgress
    );

    return () => {
      window.removeEventListener(
        "article-audio-progress",
        handleAudioProgress
      );
    };
  }, []);

  /* =======================================================
     UPDATE AUDIO HIGHLIGHT
  ======================================================= */

  useEffect(() => {
    const elements =
      document.querySelectorAll(
        ".article-content [data-audio-index]"
      );

    elements.forEach((element) => {
      const elementIndex =
        Number(
          element.getAttribute(
            "data-audio-index"
          )
        );

      if (
        elementIndex === activeIndex
      ) {
        element.classList.add(
          "article-audio-active"
        );
      } else {
        element.classList.remove(
          "article-audio-active"
        );
      }
    });
  }, [activeIndex, content]);

  return (
    <>
      <style jsx global>{`

        /* =================================================
           AUDIO HIGHLIGHT
        ================================================= */

        .article-content [data-audio-index] {
          transition:
            background-color 220ms ease,
            box-shadow 220ms ease,
            color 220ms ease;
        }

        .article-content .article-audio-active {
          background:
            linear-gradient(
              90deg,
              rgba(255, 235, 59, 0.28),
              rgba(255, 235, 59, 0.48),
              rgba(255, 235, 59, 0.28)
            );

          box-shadow:
            0 0 0 4px
              rgba(255, 235, 59, 0.12);

          border-radius: 7px;

          padding-left: 5px;
          padding-right: 5px;

          margin-left: -5px;
          margin-right: -5px;
        }

        @media (max-width: 640px) {
          .article-content .article-audio-active {
            background:
              rgba(255, 235, 59, 0.34);

            box-shadow:
              0 0 0 3px
                rgba(255, 235, 59, 0.1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .article-content [data-audio-index] {
            transition: none;
          }
        }


        /* =================================================
           CKEDITOR BASE CONTENT
        ================================================= */

        .article-content {
          width: 100%;
          max-width: 100%;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .article-content p {
          margin-top: 0;
          margin-bottom: 1.25rem;
        }

        .article-content h2,
        .article-content h3,
        .article-content h4 {
          clear: both;
        }


        /* =================================================
           CKEDITOR IMAGES
        ================================================= */

        .article-content figure.image {
          display: table;
          clear: both;
          max-width: 100%;
          margin: 1.5rem auto;
        }

        .article-content figure.image img {
          display: block;
          max-width: 100%;
          height: auto;
          box-sizing: border-box;
        }


        /* =================================================
           DEFAULT / BLOCK IMAGE
        ================================================= */

        .article-content figure.image.image-style-block {
          margin-left: auto;
          margin-right: auto;
        }

        .article-content figure.image.image-style-block img {
          margin-left: auto;
          margin-right: auto;
        }


        /* =================================================
           INLINE / LEFT IMAGE
        ================================================= */

        .article-content
          figure.image.image-style-inline {
          float: left;

          margin-top: 0.4rem;
          margin-right: 1.5rem;
          margin-bottom: 1rem;
          margin-left: 0;
        }


        /* =================================================
           SIDE / RIGHT IMAGE
        ================================================= */

        .article-content
          figure.image.image-style-side {
          float: right;

          margin-top: 0.4rem;
          margin-right: 0;
          margin-bottom: 1rem;
          margin-left: 1.5rem;
        }


        /* =================================================
           CKEDITOR RESIZED IMAGES

           IMPORTANT:
           Old Firebase content stores width on figure:

           <figure
             class="image image_resized"
             style="width:75.32%;"
           >

           We preserve that exact figure width.
        ================================================= */

        .article-content
          figure.image.image_resized {
          display: table;
          max-width: 100%;
        }

        .article-content
          figure.image.image_resized img {
          width: 100%;
          max-width: 100%;
        }


        /* =================================================
           ANY CKEDITOR IMAGE WITH INLINE WIDTH
        ================================================= */

        .article-content
          figure.image[style] {
          max-width: 100%;
        }

        .article-content
          figure.image[style] img {
          width: 100%;
          max-width: 100%;
        }


        /* =================================================
           IMAGE CAPTION
        ================================================= */

        .article-content figure.image figcaption {
          display: table-caption;
          caption-side: bottom;

          padding-top: 0.6rem;

          font-size: 0.875rem;
          line-height: 1.5;

          color: rgb(113 113 122);

          text-align: center;
        }


        /* =================================================
           CKEDITOR TABLES
        ================================================= */

        .article-content figure.table {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }

        .article-content table td,
        .article-content table th {
          border: 1px solid
            rgba(113, 113, 122, 0.35);

          padding: 0.75rem;

          vertical-align: top;
        }


        /* =================================================
           BLOCKQUOTE
        ================================================= */

        .article-content blockquote {
          margin: 1.5rem 0;

          padding:
            0.9rem
            1.25rem;

          border-left:
            4px solid
            rgba(200, 16, 46, 0.8);

          background:
            rgba(0, 0, 0, 0.03);

          font-style: italic;
        }


        /* =================================================
           LISTS
        ================================================= */

        .article-content ul,
        .article-content ol {
          margin:
            1rem 0
            1.25rem 1.5rem;

          padding-left: 1.25rem;
        }

        .article-content li {
          margin-bottom: 0.5rem;
        }


        /* =================================================
           LINKS
        ================================================= */

        .article-content a {
          overflow-wrap: anywhere;
        }


        /* =================================================
           MEDIA
        ================================================= */

        .article-content
          figure.article-media {
          clear: both;

          width: 100%;
          max-width: 100%;

          margin: 1.5rem 0;
        }

        .article-content
          .article-media-wrapper {
          position: relative;

          width: 100%;

          aspect-ratio: 16 / 9;

          overflow: hidden;
        }

        .article-content
          .article-media-wrapper iframe {
          position: absolute;

          top: 0;
          left: 0;

          width: 100%;
          height: 100%;

          border: 0;
        }

        .article-content
          .article-direct-video video {
          display: block;

          width: 100%;
          max-width: 100%;

          height: auto;
        }


        /* =================================================
           SPOTIFY
        ================================================= */

        .article-content
          .article-spotify-wrapper iframe {
          display: block;

          width: 100%;
          min-height: 152px;

          border: 0;

          border-radius: 12px;
        }


        /* =================================================
           SOUNDCLOUD
        ================================================= */

        .article-content
          .article-soundcloud-wrapper iframe {
          display: block;

          width: 100%;
          height: 166px;

          border: 0;
        }


        /* =================================================
           INSTAGRAM
        ================================================= */

        .article-content
          .article-social-wrapper {
          width: 100%;
          max-width: 540px;

          margin: 0 auto;
        }

        .article-content
          .article-social-wrapper iframe {
          display: block;

          width: 100%;
          min-height: 560px;

          border: 0;
        }


        /* =================================================
           CLEAR FLOATS
        ================================================= */

        .article-content::after {
          content: "";

          display: block;

          clear: both;
        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 640px) {

          .article-content figure.image,
          .article-content
            figure.image.image-style-inline,
          .article-content
            figure.image.image-style-side,
          .article-content
            figure.image.image_resized {
            float: none !important;

            width: 100% !important;

            max-width: 100% !important;

            margin:
              1.25rem 0 !important;
          }

          .article-content figure.image img {
            width: 100% !important;

            max-width: 100%;
          }

          .article-content table {
            display: block;

            max-width: 100%;

            overflow-x: auto;
          }

          .article-content
            .article-social-wrapper iframe {
            min-height: 500px;
          }
        }

      `}</style>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      />
    </>
  );
}