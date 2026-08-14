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


  // =====================================================
  // ARTICLES
  // =====================================================

  const articleUrls: MetadataRoute.Sitemap =
    articles
      .filter((article) => article.slug)
      .map((article) => ({
        url:
          `${siteConfig.url}/news/${article.slug}`,

        lastModified:
          article.updatedAt ||
          article.createdAt
            ? new Date(
                article.updatedAt ||
                article.createdAt!
              )
            : undefined,

        changeFrequency: "daily",

        priority: 0.8,
      }));


  // =====================================================
  // VIDEOS
  // =====================================================

  const videoUrls: MetadataRoute.Sitemap =
    videos
      .filter((video) => video.id)
      .map((video) => ({
        url:
          `${siteConfig.url}/video/${video.id}`,

        lastModified:
          video.updatedAt ||
          video.createdAt
            ? new Date(
                video.updatedAt ||
                video.createdAt!
              )
            : undefined,

        changeFrequency: "daily",

        priority: 0.7,
      }));


  // =====================================================
  // REELS / SHORTS
  // =====================================================

  const reelUrls: MetadataRoute.Sitemap =
  shorts
    .filter((short) => short.id)
    .map((short) => ({
      url:
        `${siteConfig.url}/reel/${encodeURIComponent(
          short.id
        )}`,

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


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categoryUrls: MetadataRoute.Sitemap =
    categories
      .filter((category) => category.slug)
      .map((category) => ({
        url:
          `${siteConfig.url}/category/${category.slug}`,

        changeFrequency: "daily",

        priority: 0.7,
      }));


  // =====================================================
  // STATIC PAGES
  // =====================================================

  const staticUrls: MetadataRoute.Sitemap = [

    {
  url: siteConfig.url,

  changeFrequency: "hourly",

  priority: 1,
},

    {
      url:
        `${siteConfig.url}/latest`,

      changeFrequency: "hourly",

      priority: 0.9,
    },

    {
      url:
        `${siteConfig.url}/video`,

      changeFrequency: "daily",

      priority: 0.7,
    },

    {
      url:
        `${siteConfig.url}/live-tv`,

      changeFrequency: "daily",

      priority: 0.6,
    },

    {
      url:
        `${siteConfig.url}/reels`,

      changeFrequency: "daily",

      priority: 0.6,
    },

  ];


  // =====================================================
  // FINAL SITEMAP
  // =====================================================

  return [

    ...staticUrls,

    ...categoryUrls,

    ...articleUrls,

    ...videoUrls,

    ...reelUrls,

  ];
}