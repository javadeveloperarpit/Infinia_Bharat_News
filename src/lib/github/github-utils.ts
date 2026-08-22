// ======================================================
// GITHUB UTILS
// ======================================================

import {
  GITHUB_TOKEN,
  GITHUB_OWNER,
  GITHUB_REPO,
  GITHUB_BRANCH,
  validateGitHubConfig,
} from "./github-config";

// ======================================================
// FIREBASE VALUE -> JSON SAFE
// ======================================================

// ======================================================
// FIREBASE VALUE -> JSON SAFE
// ======================================================

export function serializeValue(
  value: any
): any {

  // ================================================
  // NULL / UNDEFINED
  // ================================================

  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }


  // ================================================
  // FIRESTORE TIMESTAMP
  //
  // IMPORTANT:
  // Convert BEFORE generic object recursion.
  // ================================================

  if (
    typeof value === "object" &&
    typeof value?.toDate === "function"
  ) {

    try {

      return value
        .toDate()
        .toISOString();

    } catch (error) {

      console.error(
        "TIMESTAMP SERIALIZATION ERROR:",
        error
      );

      return null;

    }

  }


  // ================================================
  // FIRESTORE TIMESTAMP FALLBACK
  //
  // Handles objects like:
  //
  // {
  //   seconds: 1787404771,
  //   nanoseconds: 679000000
  // }
  // ================================================

  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.seconds === "number"
  ) {

    const milliseconds =
      value.seconds * 1000 +
      Math.floor(
        (value.nanoseconds || 0) /
        1_000_000
      );

    const date =
      new Date(milliseconds);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return date
        .toISOString();

    }

  }


  // ================================================
  // JAVASCRIPT DATE
  // ================================================

  if (
    value instanceof Date
  ) {

    return value
      .toISOString();

  }


  // ================================================
  // ARRAY
  // ================================================

  if (
    Array.isArray(value)
  ) {

    return value.map(
      serializeValue
    );

  }


  // ================================================
  // OBJECT
  // ================================================

  if (
    typeof value === "object"
  ) {

    const result:
      Record<string, any> =
      {};

    for (
      const [key, item]
      of Object.entries(value)
    ) {

      result[key] =
        serializeValue(item);

    }

    return result;

  }


  // ================================================
  // PRIMITIVE
  // ================================================

  return value;

}
// ======================================================
// GITHUB URL
// ======================================================

export function githubUrl(
  path: string
) {

  validateGitHubConfig();

  return (
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/` +
    `${GITHUB_REPO}/` +
    `contents/` +
    `${path}`
  );
}

// ======================================================
// GET FILE
// ======================================================

export async function getGitHubFile(
  path: string
) {

  validateGitHubConfig();

  const response =
    await fetch(
      githubUrl(path),
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

  if (response.status === 404) {

    return {
      exists: false,
      sha: undefined,
    };
  }

  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(
      `GitHub GET failed: ` +
      `${response.status} ${error}`
    );
  }

  const data =
    await response.json();

  return {
    exists: true,
    sha: data.sha as string,
  };
}

// ======================================================
// WRITE JSON FILE
// ======================================================

export async function writeGitHubJson(
  path: string,
  data: any[],
  message: string
) {

  validateGitHubConfig();

  const file =
    await getGitHubFile(path);

  const json =
    JSON.stringify(
      data,
      null,
      2
    );

  const content =
    Buffer
      .from(json, "utf-8")
      .toString("base64");

  const body: Record<string, any> = {

    message,

    content,

    branch:
      GITHUB_BRANCH,
  };

  if (file.sha) {
    body.sha =
      file.sha;
  }

  console.log(
    "================================="
  );

  console.log(
    "GITHUB JSON WRITE"
  );

  console.log(
    "PATH:",
    path
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
    "FILE EXISTS:",
    file.exists
  );

  console.log(
    "SHA:",
    file.sha
  );

  console.log(
    "ITEM COUNT:",
    data.length
  );

  console.log(
    "================================="
  );

  const response =
    await fetch(
      githubUrl(path),
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
          JSON.stringify(body),

        cache: "no-store",
      }
    );

  if (!response.ok) {

    const error =
      await response.text();

    console.error(
      "GITHUB WRITE FAILED:",
      {
        status:
          response.status,

        path,

        error,
      }
    );

    throw new Error(
      `GitHub PUT failed: ` +
      `${response.status} ${error}`
    );
  }

  const result =
    await response.json();

  console.log(
    "GITHUB WRITE SUCCESS:",
    path
  );

  return result;
}