import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

import {
  getAllPublishedArticles,
} from "@/services/public/article.public.service";

import {
  getAllPublishedVideos,
} from "@/services/public/video.public.service";

import {
  getCategories,
} from "@/services/public/category.public.service";

import {
  getPublishedShorts,
} from "@/services/public/shorts.public.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    articles,
    videos,
    categories,
    shorts,
  ] = await Promise.all([
    getAllPublishedArticles(),
    getAllPublishedVideos(),
    getCategories(),
    getPublishedShorts(),
  ]);

  // ==========================================================
  // ARTICLES
  // ==========================================================

  const articleUrls: MetadataRoute.Sitemap =
    articles
      .filter((article) => article.slug)
      .map((article) => ({
        url: `${siteConfig.url}/news/${article.slug}`,

        lastModified:
          article.updatedAt || article.createdAt
            ? new Date(
                article.updatedAt ||
                  article.createdAt!
              )
            : undefined,

        changeFrequency: "daily",

        priority: 0.8,
      }));

  // ==========================================================
  // VIDEOS
  // ==========================================================

  const videoUrls: MetadataRoute.Sitemap =
    videos
      .filter((video) => video.id)
      .map((video) => ({
        url: `${siteConfig.url}/video/${video.id}`,

        lastModified:
          video.updatedAt || video.createdAt
            ? new Date(
                video.updatedAt ||
                  video.createdAt!
              )
            : undefined,

        changeFrequency: "daily",

        priority: 0.7,
      }));

  // ==========================================================
  // REELS / SHORTS
  // ==========================================================

  const reelUrls: MetadataRoute.Sitemap =
    shorts
      .filter((short) => short.id)
      .map((short) => ({
        url:
          `${siteConfig.url}/reel/` +
          encodeURIComponent(short.id),

        lastModified:
          short.publishedAt &&
          !isNaN(
            new Date(
              short.publishedAt
            ).getTime()
          )
            ? new Date(
                short.publishedAt
              )
            : undefined,

        changeFrequency: "daily",

        priority: 0.7,
      }));

  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categoryUrls: MetadataRoute.Sitemap =
    categories
      .filter((category) => category.slug)
      .map((category) => ({
        url:
          `${siteConfig.url}/category/` +
          category.slug,

        changeFrequency: "daily",

        priority: 0.7,
      }));

  // ==========================================================
  // AUTHORS
  // ==========================================================

  const authorUrls: MetadataRoute.Sitemap =
    articles
      .filter(
        (article) =>
          article.author?.slug
      )
      .map((article) => ({
        url:
          `${siteConfig.url}/author/` +
          article.author!.slug,

        changeFrequency: "weekly",

        priority: 0.6,
      }));

  // Remove duplicate author URLs
  const uniqueAuthorUrls =
    Array.from(
      new Map(
        authorUrls.map((item) => [
          item.url,
          item,
        ])
      ).values()
    );

  // ==========================================================
  // STATIC PUBLIC PAGES
  // ==========================================================

  const staticUrls: MetadataRoute.Sitemap = [
    // HOME
    {
      url: siteConfig.url,
      changeFrequency: "hourly",
      priority: 1,
    },

    // LATEST
    {
      url: `${siteConfig.url}/latest`,
      changeFrequency: "hourly",
      priority: 0.9,
    },

    // VIDEO
    {
      url: `${siteConfig.url}/video`,
      changeFrequency: "daily",
      priority: 0.7,
    },

    // LIVE TV
    {
      url: `${siteConfig.url}/live-tv`,
      changeFrequency: "daily",
      priority: 0.6,
    },

    // REELS
    {
      url: `${siteConfig.url}/reels`,
      changeFrequency: "daily",
      priority: 0.7,
    },

    // AUTHORS
    {
      url: `${siteConfig.url}/author`,
      changeFrequency: "weekly",
      priority: 0.6,
    },

    // ENGLISH ARTICLES
    {
      url:
        `${siteConfig.url}/english-articles`,
      changeFrequency: "daily",
      priority: 0.7,
    },

    // ABOUT
    {
      url: `${siteConfig.url}/about`,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // ADVERTISE
    {
      url: `${siteConfig.url}/advertise`,
      changeFrequency: "monthly",
      priority: 0.5,
    },

    // CONTACT
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "monthly",
      priority: 0.4,
    },

    // PRIVACY
    {
      url:
        `${siteConfig.url}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },

    // TERMS
    {
      url:
        `${siteConfig.url}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ==========================================================
  // FINAL SITEMAP
  // ==========================================================

  return [
    ...staticUrls,

    ...categoryUrls,

    ...uniqueAuthorUrls,

    ...articleUrls,

    ...videoUrls,

    ...reelUrls,
  ];
}