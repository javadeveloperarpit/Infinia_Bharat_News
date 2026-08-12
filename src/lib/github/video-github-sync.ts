import {
  adminDb,
} from "@/lib/firebase/firebase-admin";


// ======================================================
// ENV
// ======================================================

const GITHUB_TOKEN =
  process.env.GITHUB_TOKEN;

const GITHUB_OWNER =
  process.env.GITHUB_OWNER;

const GITHUB_REPO =
  process.env.GITHUB_REPO;

const GITHUB_BRANCH =
  process.env.GITHUB_BRANCH ||
  "main";


// ======================================================
// PATH
// ======================================================

const VIDEOS_PATH =
  "public/data/videos.json";


// ======================================================
// CONFIG VALIDATION
// ======================================================

function validateConfig() {

  if (!GITHUB_TOKEN) {

    throw new Error(
      "GITHUB_TOKEN is missing"
    );

  }

  if (!GITHUB_OWNER) {

    throw new Error(
      "GITHUB_OWNER is missing"
    );

  }

  if (!GITHUB_REPO) {

    throw new Error(
      "GITHUB_REPO is missing"
    );

  }

}


// ======================================================
// GITHUB URL
// ======================================================

function githubUrl(
  path: string
) {

  return (
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/` +
    `${GITHUB_REPO}/contents/` +
    `${path}`
  );

}


// ======================================================
// SERIALIZE FIREBASE DATA
// ======================================================

function serializeValue(
  value: any
): any {

  if (
    value === null ||
    value === undefined
  ) {

    return null;

  }


  // Firestore Timestamp

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {

    return value
      .toDate()
      .toISOString();

  }


  // Date

  if (
    value instanceof Date
  ) {

    return value.toISOString();

  }


  // Array

  if (
    Array.isArray(value)
  ) {

    return value.map(
      serializeValue
    );

  }


  // Object

  if (
    typeof value === "object"
  ) {

    const result: Record<
      string,
      any
    > = {};


    for (
      const [
        key,
        item
      ] of Object.entries(value)
    ) {

      result[key] =
        serializeValue(item);

    }


    return result;

  }


  return value;

}


// ======================================================
// GET ALL FIREBASE VIDEOS
// ======================================================

async function getAllFirebaseVideos() {

  const snapshot =
    await adminDb
      .collection("videos")
      .get();


  return snapshot.docs.map(
    (doc) => {

      return serializeValue({

        id:
          doc.id,

        ...doc.data(),

      });

    }
  );

}


// ======================================================
// GET CURRENT GITHUB FILE
// ======================================================

async function getGitHubVideoFile() {

  validateConfig();


  const response =
    await fetch(
      githubUrl(
        VIDEOS_PATH
      ),
      {

        method:
          "GET",

        headers: {

          Authorization:
            `Bearer ${GITHUB_TOKEN}`,

          Accept:
            "application/vnd.github+json",

          "X-GitHub-Api-Version":
            "2022-11-28",

        },

        cache:
          "no-store",

      }
    );


  // File doesn't exist yet

  if (
    response.status === 404
  ) {

    console.log(
      "videos.json DOES NOT EXIST - WILL CREATE"
    );


    return {
      exists: false,
      sha: undefined,
    };

  }


  if (
    !response.ok
  ) {

    const error =
      await response.text();


    throw new Error(
      `GitHub GET videos.json failed: ` +
      `${response.status} ${error}`
    );

  }


  const data =
    await response.json();


  return {

    exists: true,

    sha:
      data.sha,

  };

}


// ======================================================
// WRITE VIDEOS.JSON
// ======================================================

async function writeVideosJson(
  videos: any[]
) {

  validateConfig();


  console.log(
    "=========================================="
  );

  console.log(
    "VIDEO GITHUB SYNC START"
  );

  console.log(
    "OWNER:",
    GITHUB_OWNER
  );

  console.log(
    "REPO:",
    GITHUB_REPO
  );

  console.log(
    "BRANCH:",
    GITHUB_BRANCH
  );

  console.log(
    "PATH:",
    VIDEOS_PATH
  );

  console.log(
    "VIDEO COUNT:",
    videos.length
  );

  console.log(
    "=========================================="
  );


  // ----------------------------------------------
  // Existing GitHub file
  // ----------------------------------------------

  const file =
    await getGitHubVideoFile();


  console.log(
    "GitHub file exists:",
    file.exists
  );

  console.log(
    "GitHub SHA:",
    file.sha
  );


  // ----------------------------------------------
  // JSON
  // ----------------------------------------------

  const json =
    JSON.stringify(
      videos,
      null,
      2
    );


  // ----------------------------------------------
  // Base64
  // ----------------------------------------------

  const content =
    Buffer
      .from(
        json,
        "utf-8"
      )
      .toString(
        "base64"
      );


  // ----------------------------------------------
  // GitHub body
  // ----------------------------------------------

  const body: Record<
    string,
    any
  > = {

    message:
      "Sync videos.json from Firebase",

    content,

    branch:
      GITHUB_BRANCH,

  };


  // Existing file => SHA required

  if (
    file.sha
  ) {

    body.sha =
      file.sha;

  }


  console.log(
    "SENDING VIDEO FILE TO GITHUB..."
  );


  // ----------------------------------------------
  // PUT
  // ----------------------------------------------

  const response =
    await fetch(
      githubUrl(
        VIDEOS_PATH
      ),
      {

        method:
          "PUT",

        headers: {

          Authorization:
            `Bearer ${GITHUB_TOKEN}`,

          Accept:
            "application/vnd.github+json",

          "Content-Type":
            "application/json",

          "X-GitHub-Api-Version":
            "2022-11-28",

        },

        body:
          JSON.stringify(
            body
          ),

        cache:
          "no-store",

      }
    );


  // ----------------------------------------------
  // ERROR
  // ----------------------------------------------

  if (
    !response.ok
  ) {

    const error =
      await response.text();


    console.error(
      "=========================================="
    );

    console.error(
      "VIDEO GITHUB SYNC FAILED"
    );

    console.error(
      "STATUS:",
      response.status
    );

    console.error(
      "ERROR:",
      error
    );

    console.error(
      "=========================================="
    );


    throw new Error(
      `GitHub video sync failed: ` +
      `${response.status} ${error}`
    );

  }


  const result =
    await response.json();


  console.log(
    "=========================================="
  );

  console.log(
    "VIDEO GITHUB SYNC SUCCESS"
  );

  console.log(
    "PATH:",
    VIDEOS_PATH
  );

  console.log(
    "COUNT:",
    videos.length
  );

  console.log(
    "SHA:",
    result?.content?.sha
  );

  console.log(
    "=========================================="
  );


  return result;

}


// ======================================================
// MAIN VIDEO SYNC
// ======================================================

export async function
syncVideosFromFirebase() {

  console.log(
    "STARTING FIREBASE -> GITHUB VIDEO SYNC"
  );


  // 1. Firebase

  const videos =
    await getAllFirebaseVideos();


  console.log(
    "Firebase videos:",
    videos.length
  );


  // 2. GitHub

  const result =
    await writeVideosJson(
      videos
    );


  return {

    success:
      true,

    count:
      videos.length,

    sha:
      result?.content?.sha,

  };

}