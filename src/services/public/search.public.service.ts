import {
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import {
  PublicArticle,
} from "./article.public.service";

import {
  PublicVideo,
} from "./video.public.service";



// ================================
// TIMESTAMP FORMAT
// ================================

function formatTimestamp(
  value: any
): string | undefined {

  if (!value) {
    return undefined;
  }

  // Firebase Timestamp

  if (
    typeof value?.toDate ===
    "function"
  ) {
    return value
      .toDate()
      .toISOString();
  }

  // Timestamp seconds object

  if (
    typeof value?.seconds ===
    "number"
  ) {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  // Normal date/string

  const date =
    new Date(value);

  if (
    isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date.toISOString();
}



// ================================
// SEARCH ARTICLES
// ================================

export async function searchArticles(
  keyword: string
): Promise<PublicArticle[]> {

  if (!keyword?.trim()) {
    return [];
  }

  // ==========================================
  // IMPORTANT
  // ==========================================
  //
  // We are intentionally using only:
  //
  // status == published
  //
  // No additional Firestore where()
  // is added, so no new composite index
  // is required.
  //
  // Search itself is performed in JavaScript.
  // ==========================================

  const q =
    query(
      collection(
        db,
        "articles"
      ),

      where(
        "status",
        "==",
        "published"
      ),

      limit(100)
    );

  const snap =
    await getDocs(q);

  const search =
    keyword
      .trim()
      .toLowerCase();


  return snap.docs

    .map((doc: any) => {

      const data =
        doc.data();

      return {

        id:
          doc.id,

        title:
          data.title || "",

        slug:
          data.slug || "",

        thumbnail:
          data.thumbnail || "",

        shortDescription:
          data.shortDescription || "",

        content:
          data.content || "",

        seoTitle:
          data.seoTitle || "",

        seoDescription:
          data.seoDescription || "",

        categoryId:
          data.categoryId || "",

        category:
          data.category || "",

        categoryHi:
          data.categoryHi || "",

        featured:
          data.featured || false,

        breaking:
          data.breaking || false,

        priority:
          data.priority || 0,

        status:
          data.status,

        createdAt:
          formatTimestamp(
            data.createdAt
          ),

      };

    })

    // ==========================================
    // SEARCH ALL IMPORTANT ARTICLE FIELDS
    // ==========================================

    .filter(
      (article) => {

        const title =
          String(
            article.title || ""
          ).toLowerCase();

        const shortDescription =
          String(
            article.shortDescription || ""
          ).toLowerCase();

        const content =
          String(
            article.content || ""
          ).toLowerCase();

        const seoTitle =
          String(
            article.seoTitle || ""
          ).toLowerCase();

        const seoDescription =
          String(
            article.seoDescription || ""
          ).toLowerCase();

        const category =
          String(
            article.category || ""
          ).toLowerCase();

        const categoryHi =
          String(
            article.categoryHi || ""
          ).toLowerCase();


        return (

          title.includes(search)

          ||

          shortDescription.includes(search)

          ||

          content.includes(search)

          ||

          seoTitle.includes(search)

          ||

          seoDescription.includes(search)

          ||

          category.includes(search)

          ||

          categoryHi.includes(search)

        );

      }
    )

    .slice(
      0,
      20
    );

}



// ================================
// SEARCH VIDEOS
// ================================

export async function searchVideos(
  keyword: string
): Promise<PublicVideo[]> {

  if (!keyword?.trim()) {
    return [];
  }


  const q =
    query(
      collection(
        db,
        "videos"
      ),

      where(
        "status",
        "==",
        "published"
      ),

      limit(100)
    );


  const snap =
    await getDocs(q);


  const search =
    keyword
      .trim()
      .toLowerCase();


  // ==========================================
  // YOUTUBE THUMBNAIL
  // ==========================================

  function getYoutubeThumbnail(
    url: string
  ) {

    try {

      const videoId =
        new URL(url)
          .searchParams
          .get("v");

      if (videoId) {

        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      }

    } catch {

      return "";

    }

    return "";

  }


  return snap.docs

    .map((doc: any) => {

      const data =
        doc.data();


      return {

        id:
          doc.id,

        title:
          data.title || "",

        youtubeUrl:
          data.youtubeUrl || "",

        thumbnail:
          data.thumbnail ||
          getYoutubeThumbnail(
            data.youtubeUrl || ""
          ),

        description:
          data.description || "",

        categoryId:
          data.categoryId || "",

        status:
          data.status,

        createdAt:
          formatTimestamp(
            data.createdAt
          ),

      };

    })


    // ==========================================
    // SEARCH VIDEO TITLE + DESCRIPTION
    // ==========================================

    .filter(
      (video) => {

        const title =
          String(
            video.title || ""
          ).toLowerCase();

        const description =
          String(
            video.description || ""
          ).toLowerCase();


        return (

          title.includes(search)

          ||

          description.includes(search)

        );

      }
    )


    .slice(
      0,
      20
    );

}

