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

const LIVE_TV_PATH =
  "public/data/live-tv.json";

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
// GET ALL FIREBASE LIVE TV
// ======================================================

async function getAllFirebaseLiveTv() {

  const snapshot =
    await adminDb
      .collection("liveTv")
      .get();

  const channels =
    snapshot.docs.map(
      (doc) => {

        return serializeValue({

          id:
            doc.id,

          ...doc.data(),

        });

      }
    );

  // Always keep same order as admin order

  channels.sort(
    (a: any, b: any) =>
      Number(a?.order ?? 0) -
      Number(b?.order ?? 0)
  );

  return channels;
}

// ======================================================
// GET CURRENT GITHUB FILE
// ======================================================

async function getGitHubLiveTvFile() {

  validateConfig();

  const response =
    await fetch(
      githubUrl(
        LIVE_TV_PATH
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

  // File does not exist

  if (
    response.status === 404
  ) {

    console.log(
      "live-tv.json DOES NOT EXIST - WILL CREATE"
    );

    return {

      exists:
        false,

      sha:
        undefined,

    };

  }

  if (
    !response.ok
  ) {

    const error =
      await response.text();

    throw new Error(
      `GitHub GET live-tv.json failed: ` +
      `${response.status} ${error}`
    );

  }

  const data =
    await response.json();

  return {

    exists:
      true,

    sha:
      data.sha,

  };

}

// ======================================================
// WRITE LIVE TV JSON
// ======================================================

async function writeLiveTvJson(
  channels: any[]
) {

  validateConfig();

  console.log(
    "=========================================="
  );

  console.log(
    "LIVE TV GITHUB SYNC START"
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
    LIVE_TV_PATH
  );

  console.log(
    "CHANNEL COUNT:",
    channels.length
  );

  console.log(
    "=========================================="
  );

  // Existing file

  const file =
    await getGitHubLiveTvFile();

  console.log(
    "GitHub file exists:",
    file.exists
  );

  console.log(
    "GitHub SHA:",
    file.sha
  );

  // JSON

  const json =
    JSON.stringify(
      channels,
      null,
      2
    );

  // Base64

  const content =
    Buffer
      .from(
        json,
        "utf-8"
      )
      .toString(
        "base64"
      );

  // GitHub body

  const body: Record<
    string,
    any
  > = {

    message:
      "Sync live-tv.json from Firebase",

    content,

    branch:
      GITHUB_BRANCH,

  };

  // Existing file requires SHA

  if (
    file.sha
  ) {

    body.sha =
      file.sha;

  }

  console.log(
    "SENDING LIVE TV FILE TO GITHUB..."
  );

  // PUT

  const response =
    await fetch(
      githubUrl(
        LIVE_TV_PATH
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

  if (
    !response.ok
  ) {

    const error =
      await response.text();

    console.error(
      "=========================================="
    );

    console.error(
      "LIVE TV GITHUB SYNC FAILED"
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
      `GitHub live TV sync failed: ` +
      `${response.status} ${error}`
    );

  }

  const result =
    await response.json();

  console.log(
    "=========================================="
  );

  console.log(
    "LIVE TV GITHUB SYNC SUCCESS"
  );

  console.log(
    "PATH:",
    LIVE_TV_PATH
  );

  console.log(
    "COUNT:",
    channels.length
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
// MAIN LIVE TV SYNC
// ======================================================

export async function
syncLiveTvFromFirebase() {

  console.log(
    "STARTING FIREBASE -> GITHUB LIVE TV SYNC"
  );

  // 1. Firebase

  const channels =
    await getAllFirebaseLiveTv();

  console.log(
    "Firebase live TV channels:",
    channels.length
  );

  // 2. GitHub

  const result =
    await writeLiveTvJson(
      channels
    );

  return {

    success:
      true,

    count:
      channels.length,

    sha:
      result?.content?.sha,

  };

}