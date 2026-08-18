import {
  promises as fs,
} from "fs";

import path from "path";

// ==========================================
// SHORT ITEM
// ==========================================

export interface PublicShort {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  publishedAt?: string;
}

// ==========================================
// GET PUBLIC SHORTS
// ==========================================

export async function getPublishedShorts(): Promise<
  PublicShort[]
> {
  try {
    const filePath =
      path.join(
        process.cwd(),
        "public",
        "data",
        "shorts.json"
      );

    const file =
      await fs.readFile(
        filePath,
        "utf-8"
      );

    const data =
      JSON.parse(file);

    const shorts =
      Array.isArray(data)
        ? data
        : Array.isArray(data?.shorts)
          ? data.shorts
          : Array.isArray(data?.videos)
            ? data.videos
            : [];

    return shorts
      .filter(
        (item: any) =>
          item &&
          typeof item.id ===
            "string"
      )
      .map(
        (item: any) => ({
          id:
            item.id.trim(),

          title:
            typeof item.title ===
            "string"
              ? item.title.trim()
              : "",

          url:
            typeof item.url ===
              "string" &&
            item.url.trim()
              ? item.url.trim()
              : `https://www.youtube.com/shorts/${item.id}`,

          thumbnail:
            typeof item.thumbnail ===
              "string" &&
            item.thumbnail.trim()
              ? item.thumbnail.trim()
              : `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,

          publishedAt:
            typeof item.publishedAt ===
            "string"
              ? item.publishedAt
              : undefined,
        })
      );

  } catch (error) {

    console.error(
      "GET PUBLIC SHORTS ERROR:",
      error
    );

    return [];
  }
}