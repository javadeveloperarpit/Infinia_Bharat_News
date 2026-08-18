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

  if (
    url.hostname === "youtube.com" ||
    url.hostname === "www.youtube.com" ||
    url.hostname === "m.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      videoId =
        url.searchParams.get("v") || "";
    }

    if (
      url.pathname.startsWith("/embed/")
    ) {
      videoId =
        url.pathname.split("/embed/")[1] ||
        "";
    }

    if (
      url.pathname.startsWith("/shorts/")
    ) {
      videoId =
        url.pathname.split("/shorts/")[1] ||
        "";
    }

    if (
      url.pathname.startsWith("/live/")
    ) {
      videoId =
        url.pathname.split("/live/")[1] ||
        "";
    }
  }

  if (url.hostname === "youtu.be") {
    videoId =
      url.pathname.slice(1);
  }

  return videoId.split(/[?&#]/)[0];
}

/* =========================================================
   VIMEO
========================================================= */

function getVimeoId(url: URL) {
  if (
    url.hostname === "vimeo.com" ||
    url.hostname === "www.vimeo.com"
  ) {
    return (
      url.pathname
        .split("/")
        .filter(Boolean)[0] || ""
    );
  }

  if (
    url.hostname ===
    "player.vimeo.com"
  ) {
    const parts =
      url.pathname
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

function convertMediaEmbeds(
  html: string
) {
  if (!html) return "";

  return html.replace(
    /<figure[^>]*class=["'][^"']*\bmedia\b[^"']*["'][^>]*>\s*<oembed[^>]*url=["']([^"']+)["'][^>]*>\s*<\/oembed>\s*<\/figure>/gi,
    (_, rawUrl: string) => {
      try {
        const url =
          new URL(rawUrl);

        const hostname =
          url.hostname.toLowerCase();

        /* =================================================
           YOUTUBE
        ================================================= */

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

        /* =================================================
           VIMEO
        ================================================= */

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

        /* =================================================
           DAILYMOTION
        ================================================= */

        if (
          hostname ===
            "dailymotion.com" ||
          hostname ===
            "www.dailymotion.com"
        ) {
          const match =
            url.pathname.match(
              /\/video\/([^_/?]+)/
            );

          const videoId =
            match?.[1];

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

        /* =================================================
           SPOTIFY
        ================================================= */

        if (
          hostname ===
            "open.spotify.com" ||
          hostname ===
            "www.open.spotify.com"
        ) {
          const parts =
            url.pathname
              .split("/")
              .filter(Boolean);

          if (parts.length >= 2) {
            const type =
              parts[0];

            const id =
              parts[1];

            return `
              <figure class="article-media article-spotify">
                <div class="article-spotify-wrapper">
                  <iframe
                    src="https://open.spotify.com/embed/${encodeURIComponent(
                      type
                    )}/${encodeURIComponent(
                      id
                    )}"
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

        /* =================================================
           SOUNDCLOUD
        ================================================= */

        if (
          hostname ===
            "soundcloud.com" ||
          hostname ===
            "www.soundcloud.com"
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

        /* =================================================
           INSTAGRAM
        ================================================= */

        if (
          hostname ===
            "instagram.com" ||
          hostname ===
            "www.instagram.com"
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

        /* =================================================
           X / TWITTER
        ================================================= */

        if (
          hostname ===
            "twitter.com" ||
          hostname ===
            "www.twitter.com" ||
          hostname === "x.com" ||
          hostname === "www.x.com"
        ) {
          return `
            <figure class="article-media article-twitter">
              <blockquote class="twitter-tweet">
                <a
                  href="${escapeHtml(
                    url.href
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View post on X
                </a>
              </blockquote>
            </figure>
          `;
        }

        /* =================================================
           DIRECT VIDEO
        ================================================= */

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
              pathname.endsWith(
                extension
              )
          );

        if (isVideoFile) {
          return `
            <figure class="article-media article-direct-video">
              <video
                controls
                playsinline
                preload="metadata"
                src="${escapeHtml(
                  url.href
                )}"
              ></video>
            </figure>
          `;
        }

        /* =================================================
           UNKNOWN
        ================================================= */

        return `
          <figure class="article-media article-unknown-media">
            <a
              href="${escapeHtml(
                url.href
              )}"
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

/* =========================================================
   ADD AUDIO TARGETS
========================================================= */

function prepareAudioContent(
  html: string
) {
  if (!html) return "";

  const parser =
    new DOMParser();

  const doc =
    parser.parseFromString(
      html,
      "text/html"
    );

  /*
   * Only actual readable article
   * elements get audio targets.
   *
   * Images, videos, embeds etc.
   * are intentionally ignored.
   */

  const readableSelectors = [
    "p",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "li",
  ];

  let index = 0;

  doc
    .querySelectorAll(
      readableSelectors.join(",")
    )
    .forEach((element) => {
      const text =
        element.textContent
          ?.replace(/\s+/g, " ")
          .trim();

      if (!text) return;

      /*
       * Don't attach audio highlighting
       * to media-related text.
       */

      if (
        element.closest(
          "figure, iframe, video"
        )
      ) {
        return;
      }

      element.setAttribute(
        "data-audio-index",
        String(index)
      );

      index++;
    });

  return doc.body.innerHTML;
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

      /*
       * Find the corresponding
       * article element.
       */

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
     UPDATE HIGHLIGHT
  ======================================================= */

  useEffect(() => {
    const elements =
      document.querySelectorAll(
        "[data-audio-index]"
      );

    elements.forEach(
      (element) => {
        const elementIndex =
          Number(
            element.getAttribute(
              "data-audio-index"
            )
          );

        if (
          elementIndex ===
          activeIndex
        ) {
          element.classList.add(
            "article-audio-active"
          );
        } else {
          element.classList.remove(
            "article-audio-active"
          );
        }
      }
    );
  }, [activeIndex, content]);

  return (
    <>
      <style jsx global>{`
        .article-content
          [data-audio-index] {
          transition:
            background-color 220ms
              ease,
            box-shadow 220ms ease,
            color 220ms ease;
          }

        .article-content
          .article-audio-active {
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

          /*
           * Small horizontal breathing
           * room so the highlight doesn't
           * touch the text.
           */

          padding-left: 5px;
          padding-right: 5px;

          margin-left: -5px;
          margin-right: -5px;
        }

        /*
         * Don't highlight media content.
         */

        .article-content
          figure.article-media
          .article-audio-active {
          background: transparent;
          box-shadow: none;
        }

        /*
         * Mobile: softer highlight.
         */

        @media (max-width: 640px) {
          .article-content
            .article-audio-active {
            background:
              rgba(
                255,
                235,
                59,
                0.34
              );

            box-shadow:
              0 0 0 3px
                rgba(
                  255,
                  235,
                  59,
                  0.1
                );
          }
        }

        /*
         * Respect reduced motion.
         */

        @media (
          prefers-reduced-motion: reduce
        ) {
          .article-content
            [data-audio-index] {
            transition: none;
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