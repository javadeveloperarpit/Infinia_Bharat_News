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
  process.env.GITHUB_BRANCH || "main";

// ======================================================
// PATH
// ======================================================

const AUTHORS_PATH =
  "public/data/authors.json";

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
  filePath: string
) {
  return (
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/` +
    `${GITHUB_REPO}/contents/` +
    `${filePath}`
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
// CREATE AUTHOR SLUG
// ======================================================

function createAuthorSlug(
  name: string
) {

  return name
    .toLowerCase()
    .trim()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}

// ======================================================
// GET ALL FIREBASE AUTHORS
// ======================================================

async function getAllFirebaseAuthors() {

  const snapshot =
    await adminDb
      .collection("users")
      .get();

  const authors =
    snapshot.docs.map(
      (doc) => {

        const data =
          doc.data();

        return serializeValue({

          id:
            doc.id,

          uid:
            data.uid ||
            doc.id,

          name:
            data.name ||
            "",

          email:
            data.email ||
            "",

          role:
            data.role ||
            "editor",

          status:
            data.status ||
            "active",

          photo:
            data.photo ||
            "",

          bio:
            data.bio ||
            "",

          slug:
            data.slug ||
            createAuthorSlug(
              data.name || ""
            ),

          createdAt:
            data.createdAt,

          updatedAt:
            data.updatedAt,

        });

      }
    );

  // Stable ordering
  return authors.sort(
    (a, b) =>
      String(a.name || "")
        .localeCompare(
          String(b.name || "")
        )
  );
}

// ======================================================
// GET CURRENT GITHUB FILE
// ======================================================

async function getGitHubAuthorFile() {

  validateConfig();

  const response =
    await fetch(
      githubUrl(
        AUTHORS_PATH
      ),
      {
        method: "GET",

        headers: {
          Authorization:
            `Bearer ${GITHUB_TOKEN}`,

          Accept:
            "application/vnd.github+json",

          "X-GitHub-Api-Version":
            "2022-11-28",
        },

        cache: "no-store",
      }
    );

  // File doesn't exist
  if (
    response.status === 404
  ) {

    console.log(
      "authors.json DOES NOT EXIST - WILL CREATE"
    );

    return {
      exists: false,
      sha: undefined,
    };
  }

  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(
      `GitHub GET authors.json failed: ` +
      `${response.status} ${error}`
    );
  }

  const data =
    await response.json();

  return {
    exists: true,
    sha: data.sha,
  };
}

// ======================================================
// WRITE AUTHORS.JSON
// ======================================================

async function writeAuthorsJson(
  authors: any[]
) {

  validateConfig();

  console.log(
    "=========================================="
  );

  console.log(
    "AUTHOR GITHUB SYNC START"
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
    AUTHORS_PATH
  );

  console.log(
    "AUTHOR COUNT:",
    authors.length
  );

  console.log(
    "=========================================="
  );

  // Existing GitHub file
  const file =
    await getGitHubAuthorFile();

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
      authors,
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
      "Sync authors.json from Firebase",

    content,

    branch:
      GITHUB_BRANCH,
  };

  // Existing file requires SHA
  if (file.sha) {
    body.sha =
      file.sha;
  }

  const response =
    await fetch(
      githubUrl(
        AUTHORS_PATH
      ),
      {

        method: "PUT",

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

        cache: "no-store",
      }
    );

  if (!response.ok) {

    const error =
      await response.text();

    console.error(
      "AUTHOR GITHUB SYNC FAILED"
    );

    console.error(
      "STATUS:",
      response.status
    );

    console.error(
      "ERROR:",
      error
    );

    throw new Error(
      `GitHub author sync failed: ` +
      `${response.status} ${error}`
    );
  }

  const result =
    await response.json();

  console.log(
    "=========================================="
  );

  console.log(
    "AUTHOR GITHUB SYNC SUCCESS"
  );

  console.log(
    "PATH:",
    AUTHORS_PATH
  );

  console.log(
    "COUNT:",
    authors.length
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
// MAIN AUTHOR SYNC
// ======================================================

export async function
syncAuthorsFromFirebase() {

  console.log(
    "STARTING FIREBASE -> GITHUB AUTHOR SYNC"
  );

  const authors =
    await getAllFirebaseAuthors();

  console.log(
    "Firebase authors:",
    authors.length
  );

  const result =
    await writeAuthorsJson(
      authors
    );

  return {

    success: true,

    count:
      authors.length,

    sha:
      result?.content?.sha,
  };
}