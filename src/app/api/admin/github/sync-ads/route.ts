import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/firebase-admin";

export const runtime = "nodejs";

// ======================================================
// ENV
// ======================================================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

const GITHUB_ADS_PATH =
  process.env.GITHUB_ADS_PATH || "data/ads.json";

// ======================================================
// TYPES
// ======================================================

interface GitHubFileResponse {
  sha?: string;
  content?: string;
  encoding?: string;
}

// ======================================================
// GET ALL ADS FROM FIRESTORE
// ======================================================

async function getAllAds() {
  const types = [
    "banner",
    "cube",
    "popup",
    "page_transition",
    "shorts_video",
    "floating_tv",
    "sticky_bottom",
    "native",
  ];

  const ads: any[] = [];

  for (const type of types) {
    const snapshot = await adminDb
      .collection("businessAds")
      .doc(type)
      .collection("ads")
      .get();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      ads.push({
        id: doc.id,
        ...serializeFirestoreData(data),
      });
    });
  }

  return ads;
}

// ======================================================
// FIRESTORE DATA SERIALIZER
//
// GitHub JSON cannot store Firestore Timestamp objects.
// ======================================================

function serializeFirestoreData(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value === "object" &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeFirestoreData);
  }

  if (typeof value === "object") {
    const result: Record<string, any> = {};

    for (const [key, item] of Object.entries(value)) {
      result[key] = serializeFirestoreData(item);
    }

    return result;
  }

  return value;
}

// ======================================================
// GITHUB REQUEST
// ======================================================

async function githubRequest(
  url: string,
  options: RequestInit = {}
) {
  return fetch(url, {
    ...options,

    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },

    cache: "no-store",
  });
}

// ======================================================
// GET EXISTING GITHUB FILE
// ======================================================

async function getExistingGitHubFile() {
  const url =
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/${GITHUB_REPO}/contents/` +
    `${GITHUB_ADS_PATH}`;

  const response = await githubRequest(url);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `GitHub file lookup failed: ${response.status} ${error}`
    );
  }

  const data =
    (await response.json()) as GitHubFileResponse;

  return data;
}

// ======================================================
// SYNC ADS TO GITHUB
// ======================================================

async function syncAdsToGitHub() {
  if (
    !GITHUB_TOKEN ||
    !GITHUB_OWNER ||
    !GITHUB_REPO
  ) {
    throw new Error(
      "GitHub configuration is missing. Please check GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO."
    );
  }

  // ----------------------------------------------------
  // GET ADS FROM FIRESTORE
  // ----------------------------------------------------

  const ads = await getAllAds();

  // ----------------------------------------------------
  // CREATE JSON
  // ----------------------------------------------------

  const payload = {
    updatedAt: new Date().toISOString(),
    ads,
  };

  const jsonContent =
    JSON.stringify(payload, null, 2) + "\n";

  // ----------------------------------------------------
  // BASE64
  // ----------------------------------------------------

  const encodedContent =
    Buffer.from(jsonContent, "utf8").toString(
      "base64"
    );

  // ----------------------------------------------------
  // CHECK EXISTING FILE
  // ----------------------------------------------------

  const existingFile =
    await getExistingGitHubFile();

  // ----------------------------------------------------
  // GITHUB API URL
  // ----------------------------------------------------

  const url =
    `https://api.github.com/repos/` +
    `${GITHUB_OWNER}/${GITHUB_REPO}/contents/` +
    `${GITHUB_ADS_PATH}`;

  // ----------------------------------------------------
  // REQUEST BODY
  // ----------------------------------------------------

  const body: Record<string, any> = {
    message:
      `sync: update advertisements (${new Date().toISOString()})`,

    content: encodedContent,

    branch:
      process.env.GITHUB_BRANCH || "main",
  };

  // Existing file requires SHA
  if (existingFile?.sha) {
    body.sha = existingFile.sha;
  }

  // ----------------------------------------------------
  // CREATE / UPDATE FILE
  // ----------------------------------------------------

  const response =
    await githubRequest(url, {
      method: "PUT",
      body: JSON.stringify(body),
    });

  if (!response.ok) {
    const error =
      await response.text();

    throw new Error(
      `GitHub sync failed: ${response.status} ${error}`
    );
  }

  const result =
    await response.json();

  return {
    success: true,

    adsCount: ads.length,

    path: GITHUB_ADS_PATH,

    commit:
      result?.commit?.sha || null,

    url:
      result?.content?.html_url || null,
  };
}

// ======================================================
// POST
// ======================================================

export async function POST() {
  try {
    const result =
      await syncAdsToGitHub();

    return NextResponse.json({
      message:
        "Advertisements synced to GitHub successfully.",

      ...result,
    });
  } catch (error: any) {
    console.error(
      "GITHUB ADS SYNC ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to sync advertisements to GitHub.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// GET
// ======================================================

export async function GET() {
  return NextResponse.json({
    success: true,

    message:
      "GitHub Ads Sync API is running.",

    path:
      GITHUB_ADS_PATH,
  });
}