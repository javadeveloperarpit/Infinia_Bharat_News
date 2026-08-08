import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";


// ======================================
// PUBLIC VIDEO
// ======================================

export interface PublicVideo {
  id: string;

  title: string;

  youtubeUrl: string;

  thumbnail: string;

  description: string;

  categoryId: string;

  category?: string;

  categoryHi?: string;

  status: string;

  createdAt?: string;

  updatedAt?: string;

  views?: number;
}


// ======================================
// TIMESTAMP FORMAT
// ======================================

function formatTimestamp(value: any) {

  if (!value) {
    return undefined;
  }


  // Firestore Timestamp
  if (typeof value?.toDate === "function") {

    return value
      .toDate()
      .toISOString();

  }


  // Firestore serialized Timestamp
  if (value?.seconds) {

    return new Date(
      value.seconds * 1000
    ).toISOString();

  }


  // Normal date/string
  const date = new Date(value);


  if (isNaN(date.getTime())) {
    return undefined;
  }


  return date.toISOString();
}


// ======================================
// YOUTUBE THUMBNAIL
// ======================================

function getYoutubeThumbnail(
  url: string
) {

  if (!url) {
    return "";
  }


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


// ======================================
// GET CATEGORY
// ======================================

async function getCategoryById(
  categoryId: string
) {

  if (!categoryId) {
    return null;
  }


  const categoryRef =
    doc(
      db,
      "categories",
      categoryId
    );


  const snapshot =
    await getDoc(categoryRef);


  if (!snapshot.exists()) {
    return null;
  }


  return snapshot.data();
}


// ======================================
// FORMAT VIDEO
// ======================================

function formatVideo(
  docSnap: any,
  category?: any
): PublicVideo {

  const data =
    docSnap.data();


  return {

    id:
      docSnap.id,


    title:
      data.title || "",


    youtubeUrl:
      data.youtubeUrl || "",


    thumbnail:
      data.thumbnail ||
      getYoutubeThumbnail(
        data.youtubeUrl
      ),


    description:
      data.description || "",


    categoryId:
      data.categoryId || "",


    category:
      category?.name || "",


    categoryHi:
      category?.nameHi || "",


    status:
      data.status || "draft",


    createdAt:
      formatTimestamp(
        data.createdAt
      ),


    updatedAt:
      formatTimestamp(
        data.updatedAt
      ),


    views:
      data.views || 0,

  };

}


// ======================================
// CATEGORY VIDEOS
//
// Existing index:
// categoryId + status + createdAt
// ======================================

export async function
getPublishedVideosByCategory(
  categoryId: string
): Promise<PublicVideo[]> {


  const q =
    query(

      collection(
        db,
        "videos"
      ),


      where(
        "categoryId",
        "==",
        categoryId
      ),


      where(
        "status",
        "==",
        "published"
      ),


      orderBy(
        "createdAt",
        "desc"
      ),


      limit(18)

    );


  const snap =
    await getDocs(q);


  // Category already known by ID
  const category =
    await getCategoryById(
      categoryId
    );


  return snap.docs.map(
    (docSnap) =>
      formatVideo(
        docSnap,
        category
      )
  );

}


// ======================================
// ALL PUBLISHED VIDEOS
//
// No composite index required
// ======================================

export async function
getPublishedVideos()
: Promise<PublicVideo[]> {


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


      limit(50)

    );


  const snap =
    await getDocs(q);


  /*
   * Get unique category IDs
   * so we don't repeatedly fetch
   * the same category.
   */

  const categoryIds =
    [
      ...new Set(
        snap.docs
          .map(
            docSnap =>
              docSnap.data()
                .categoryId
          )
          .filter(Boolean)
      )
    ];


  const categoryEntries =
    await Promise.all(

      categoryIds.map(
        async (categoryId) => {

          const category =
            await getCategoryById(
              categoryId
            );


          return [
            categoryId,
            category
          ] as const;

        }
      )

    );


  const categoryMap =
    new Map(
      categoryEntries
    );


  return snap.docs

    .map(
      (docSnap) => {

        const categoryId =
          docSnap.data()
            .categoryId;


        return formatVideo(
          docSnap,
          categoryMap.get(
            categoryId
          )
        );

      }
    )

    .sort(
      (a, b) => {

        const dateA =
          new Date(
            a.createdAt || 0
          ).getTime();


        const dateB =
          new Date(
            b.createdAt || 0
          ).getTime();


        return dateB - dateA;

      }
    )

    .slice(0, 20);

}


// ======================================
// SINGLE VIDEO BY ID
// ======================================

export async function
getVideoById(
  id: string
): Promise<PublicVideo | null> {


  if (!id) {
    return null;
  }


  const snap =
    await getDoc(

      doc(
        db,
        "videos",
        id
      )

    );


  if (!snap.exists()) {
    return null;
  }


  const data =
    snap.data();


  const category =
    await getCategoryById(
      data.categoryId
    );


  return formatVideo(
    snap,
    category
  );

}


// ======================================
// RELATED VIDEOS
//
// Existing index:
// categoryId + status + createdAt
// ======================================

export async function
getRelatedVideos(

  categoryId: string,

  currentId: string

): Promise<PublicVideo[]> {


  const q =
    query(

      collection(
        db,
        "videos"
      ),


      where(
        "categoryId",
        "==",
        categoryId
      ),


      where(
        "status",
        "==",
        "published"
      ),


      orderBy(
        "createdAt",
        "desc"
      ),


      limit(10)

    );


  const snap =
    await getDocs(q);


  const category =
    await getCategoryById(
      categoryId
    );


  return snap.docs

    .map(
      (docSnap) =>
        formatVideo(
          docSnap,
          category
        )
    )

    .filter(
      (video) =>
        video.id !== currentId
    )

    .slice(0, 6);

}

