import { adminDb } from "@/lib/firebase/firebase-admin";

interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

const GITHUB_API =
  "https://api.github.com";

function getGithubConfig() {
  const token =
    process.env.GITHUB_TOKEN;

  const owner =
    process.env.GITHUB_OWNER;

  const repo =
    process.env.GITHUB_REPO;

  const branch =
    process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    throw new Error(
      "GitHub environment variables are missing."
    );
  }

  return {
    token,
    owner,
    repo,
    branch,
  };
}

// ======================================================
// FIREBASE → GITHUB JSON
// ======================================================

export async function syncLiveTvToGithub() {
  const {
    token,
    owner,
    repo,
    branch,
  } = getGithubConfig();

  // ----------------------------------------------------
  // READ COMPLETE LIVE TV COLLECTION
  // ----------------------------------------------------

  const snapshot =
    await adminDb
      .collection("liveTv")
      .get();

  const channels: LiveTvChannel[] =
    snapshot.docs
      .map((doc) => {
        const data =
          doc.data();

        return {
          id: doc.id,

          title:
            typeof data.title ===
            "string"
              ? data.title
              : "",

          youtubeUrl:
            typeof data.youtubeUrl ===
            "string"
              ? data.youtubeUrl
              : "",

          enabled:
            data.enabled === true,

          order:
            Number(
              data.order ?? 0
            ),

          ...(typeof data.logo ===
            "string" &&
          data.logo.trim()
            ? {
                logo:
                  data.logo.trim(),
              }
            : {}),
        };
      })
      .sort(
        (a, b) =>
          Number(a.order ?? 0) -
          Number(b.order ?? 0)
      );

  // ----------------------------------------------------
  // JSON CONTENT
  // ----------------------------------------------------

  const jsonContent =
    JSON.stringify(
      channels,
      null,
      2
    ) + "\n";

  const filePath =
  "public/data/live-tv.json";

  const fileUrl =
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`;

  const headers = {
    Accept:
      "application/vnd.github+json",

    Authorization:
      `Bearer ${token}`,

    "X-GitHub-Api-Version":
      "2022-11-28",

    "Content-Type":
      "application/json",
  };

  // ----------------------------------------------------
  // GET CURRENT FILE
  // ----------------------------------------------------

  const currentResponse =
    await fetch(
      `${fileUrl}?ref=${encodeURIComponent(
        branch
      )}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

  let sha:
    | string
    | undefined;

  if (
    currentResponse.ok
  ) {
    const currentFile =
      await currentResponse.json();

    sha =
      currentFile?.sha;
  } else if (
    currentResponse.status !==
    404
  ) {
    const errorText =
      await currentResponse.text();

    throw new Error(
      `GitHub file read failed: ${currentResponse.status} ${errorText}`
    );
  }

  // ----------------------------------------------------
  // CREATE / UPDATE FILE
  // ----------------------------------------------------

  const response =
    await fetch(
      fileUrl,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message:
            "sync: update live TV data",

          content:
            Buffer.from(
              jsonContent,
              "utf-8"
            ).toString(
              "base64"
            ),

          branch,

          ...(sha
            ? { sha }
            : {}),
        }),
        cache: "no-store",
      }
    );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `GitHub sync failed: ${response.status} ${errorText}`
    );
  }

  const result =
    await response.json();

  return {
    success: true,

    count:
      channels.length,

    path: filePath,

    commit:
      result?.commit?.sha ||
      null,
  };
}