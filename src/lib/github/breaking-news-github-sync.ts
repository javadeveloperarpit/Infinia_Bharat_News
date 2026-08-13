import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";


const BREAKING_NEWS_PATH =
  "public/data/breakingNews.json";


// ======================================================
// GET ALL NON-EXPIRED FIREBASE BREAKING NEWS
// ======================================================

async function getAllFirebaseBreakingNews() {

  const snapshot =
    await adminDb
      .collection("breakingNews")
      .get();


  const now =
    Date.now();


  const validNews: any[] = [];


  // ======================================================
  // CHECK EACH NEWS
  // ======================================================

  for (const doc of snapshot.docs) {

    const data =
      doc.data();


    let expired =
      false;


    // ====================================================
    // CHECK expiresAt
    // ====================================================

    if (data?.expiresAt) {

      let expiresAtDate: Date | null =
        null;


      // Firestore Timestamp
      if (
        typeof data.expiresAt?.toDate ===
        "function"
      ) {

        expiresAtDate =
          data.expiresAt.toDate();

      }

      // JS Date
      else if (
        data.expiresAt instanceof Date
      ) {

        expiresAtDate =
          data.expiresAt;

      }

      // Serialized timestamp
      else if (
        typeof data.expiresAt === "object" &&
        typeof data.expiresAt?.seconds ===
          "number"
      ) {

        expiresAtDate =
          new Date(
            data.expiresAt.seconds * 1000
          );

      }

      // String / number
      else {

        const parsed =
          new Date(
            data.expiresAt
          );

        if (
          !isNaN(
            parsed.getTime()
          )
        ) {

          expiresAtDate =
            parsed;

        }

      }


      // ==================================================
      // EXPIRED
      // ==================================================

      if (
        expiresAtDate &&
        !isNaN(
          expiresAtDate.getTime()
        ) &&
        expiresAtDate.getTime() <= now
      ) {

        expired =
          true;

      }

    }


    // ====================================================
    // EXPIRED NEWS
    // ====================================================

    if (expired) {

      console.log(
        "BREAKING NEWS EXPIRED:",
        doc.id
      );


      // -----------------------------------------------
      // Firebase inactive
      // -----------------------------------------------

      if (data.active !== false) {

        await doc.ref.update({
          active: false,
        });

      }


      // -----------------------------------------------
      // Do NOT add to GitHub JSON
      // -----------------------------------------------

      continue;

    }


    // ====================================================
    // INACTIVE NEWS
    // ====================================================

    if (data.active !== true) {

      continue;

    }


    // ====================================================
    // VALID NEWS
    // ====================================================

    validNews.push(
      serializeValue({
        id: doc.id,
        ...data,
      })
    );

  }


  return validNews;

}


// ======================================================
// MAIN SYNC
// ======================================================

export async function syncBreakingNewsFromFirebase() {

  console.log(
    "=========================================="
  );

  console.log(
    "BREAKING NEWS SYNC START"
  );

  console.log(
    "=========================================="
  );


  const news =
    await getAllFirebaseBreakingNews();


  console.log(
    "Valid breaking news:",
    news.length
  );


  // ====================================================
  // WRITE ONLY ACTIVE + NON-EXPIRED NEWS
  // ====================================================

  await writeGitHubJson(
    BREAKING_NEWS_PATH,
    news,
    "Sync breakingNews.json from Firebase"
  );


  console.log(
    "BREAKING NEWS SYNC SUCCESS:",
    news.length
  );


  return {
    success: true,
    count: news.length,
  };

}


// ======================================================
// CREATE
// ======================================================

export async function syncBreakingNewsCreate(
  _news?: Record<string, any>
) {

  return syncBreakingNewsFromFirebase();

}


// ======================================================
// UPDATE
// ======================================================

export async function syncBreakingNewsUpdate(
  _news?: Record<string, any>
) {

  return syncBreakingNewsFromFirebase();

}


// ======================================================
// DELETE
// ======================================================

export async function syncBreakingNewsDelete(
  _id?: string
) {

  return syncBreakingNewsFromFirebase();

}