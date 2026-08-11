import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

import {
  db,
} from "@/lib/firebase/firebase";


// ==========================================
// DASHBOARD STATS
// ==========================================

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
  const adTypes = [
    "banner",
    "cube",
    "popup",
    "page_transition",
    "shorts_video",
    "floating_tv",
    "sticky_bottom",
    "native",
  ] as const;

  const [
    articlesSnapshot,
    videosSnapshot,
    usersSnapshot,
    breakingNewsSnapshot,
    liveTvSnapshot,
    ...adSnapshots
  ] = await Promise.all([
    getCountFromServer(
      collection(db, "articles")
    ),

    getCountFromServer(
      collection(db, "videos")
    ),

    getCountFromServer(
      collection(db, "users")
    ),

    getCountFromServer(
      collection(db, "breakingNews")
    ),

    getCountFromServer(
      collection(db, "liveTv")
    ),

    ...adTypes.map((type) =>
      getCountFromServer(
        collection(
          db,
          "businessAds",
          type,
          "ads"
        )
      )
    ),
  ]);

  const ads = adSnapshots.reduce(
    (total, snapshot) =>
      total + snapshot.data().count,
    0
  );

  return {
    articles:
      articlesSnapshot.data().count,

    videos:
      videosSnapshot.data().count,

    users:
      usersSnapshot.data().count,

    breakingNews:
      breakingNewsSnapshot.data().count,

    liveTv:
      liveTvSnapshot.data().count,

    ads,
  };
}



// ==========================================
// RECENT ACTIVITY TYPE
// ==========================================

export interface RecentActivity {

  id: string;

  type:
    | "article"
    | "video"
    | "breaking"
    | "user"
    | "liveTv"
    | "ad";

  title: string;

  description: string;

  createdAt?: string;

}



// ==========================================
// TIMESTAMP FORMATTER
// ==========================================

function formatTimestamp(
  value: any
): string | undefined {

  if (!value) {
    return undefined;
  }


  // Firestore Timestamp

  if (
    typeof value?.toDate === "function"
  ) {

    return value
      .toDate()
      .toISOString();

  }


  // Firestore timestamp object

  if (
    typeof value?.seconds === "number"
  ) {

    return new Date(
      value.seconds * 1000
    ).toISOString();

  }


  // Normal date/string

  const date =
    new Date(value);


  if (
    isNaN(date.getTime())
  ) {

    return undefined;

  }


  return date.toISOString();

}



// ==========================================
// FETCH COLLECTION ACTIVITY
// ==========================================

async function getCollectionActivity(

  collectionName: string,

  type: RecentActivity["type"],

  titleFallback: string,

  description: string

): Promise<RecentActivity[]> {


  try {


    const q = query(

      collection(
        db,
        collectionName
      ),

      orderBy(
        "createdAt",
        "desc"
      ),

      limit(5)

    );


    const snapshot =
      await getDocs(q);


    return snapshot.docs.map(
      (doc) => {

        const data =
          doc.data();


        return {

          id: doc.id,

          type,

          title:
            data.title ||
            data.name ||
            data.email ||
            titleFallback,

          description,

          createdAt:
            formatTimestamp(
              data.createdAt
            ),

        };

      }
    );


  } catch (error) {


    console.error(
      `Recent Activity Error [${collectionName}]:`,
      error
    );


    return [];

  }

}



// ==========================================
// RECENT ACTIVITIES
// ==========================================

export async function getRecentActivities()
: Promise<RecentActivity[]> {


  const [

    articles,

    videos,

    breakingNews,

    users,

    liveTv,

    ads,

  ] = await Promise.all([


    getCollectionActivity(

      "articles",

      "article",

      "Untitled Article",

      "New article added"

    ),


    getCollectionActivity(

      "videos",

      "video",

      "Untitled Video",

      "New video added"

    ),


    getCollectionActivity(

      "breakingNews",

      "breaking",

      "Breaking News",

      "Breaking news updated"

    ),


    getCollectionActivity(

      "users",

      "user",

      "New User",

      "New user registered"

    ),


    getCollectionActivity(

      "liveTv",

      "liveTv",

      "Live TV",

      "Live TV updated"

    ),


    getCollectionActivity(

      "businessAds",

      "ad",

      "Business Advertisement",

      "Advertisement added"

    ),

  ]);



  return [

    ...articles,

    ...videos,

    ...breakingNews,

    ...users,

    ...liveTv,

    ...ads,

  ]

    .sort((a, b) => {

      const dateA =
        new Date(
          a.createdAt || 0
        ).getTime();


      const dateB =
        new Date(
          b.createdAt || 0
        ).getTime();


      return dateB - dateA;

    })

    .slice(0, 10);

}

