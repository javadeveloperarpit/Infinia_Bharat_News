import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase/firebase";

export interface BreakingNewsData {
  id: string;
  text: string;
  active: boolean;
  expiry: string;
  createdAt?: any;
  updatedAt?: any;
}

// ======================================================
// AUTH TOKEN
// ======================================================

async function getAuthToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not logged in");
  }

  return user.getIdToken();
}

// ======================================================
// EXPIRY CHECK
// ======================================================
//
// Breaking news expires 24 hours after createdAt.
//
// IMPORTANT:
// expiry field is currently "24h".
//
// ======================================================

function isExpired(
  item: BreakingNewsData
): boolean {

  // Only 24h expiry is currently supported
  if (item.expiry !== "24h") {
    return false;
  }

  if (!item.createdAt) {
    return false;
  }

  let createdTime = 0;

  // Firestore Timestamp
  if (
    typeof item.createdAt?.toMillis ===
    "function"
  ) {
    createdTime =
      item.createdAt.toMillis();
  }

  // Firestore Timestamp-like object
  else if (
    typeof item.createdAt === "object" &&
    typeof item.createdAt?.seconds ===
      "number"
  ) {
    createdTime =
      item.createdAt.seconds * 1000;
  }

  // Date / string / number
  else {
    const date =
      new Date(item.createdAt);

    if (
      !isNaN(
        date.getTime()
      )
    ) {
      createdTime =
        date.getTime();
    }
  }

  // Invalid createdAt
  if (!createdTime) {
    return false;
  }

  const expiryTime =
    createdTime +
    24 * 60 * 60 * 1000;

  return (
    Date.now() >= expiryTime
  );
}

// ======================================================
// CREATE
// ======================================================

export async function createBreakingNews(
  data: Omit<
    BreakingNewsData,
    "id" | "createdAt" | "updatedAt"
  >
) {

  const token =
    await getAuthToken();

  const response =
    await fetch(
      "/api/admin/breaking-news",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(data),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Failed to create breaking news"
    );
  }

  return result;
}

// ======================================================
// GET
// ======================================================
//
// Returns only ACTIVE + NON-EXPIRED news.
//
// ======================================================

export async function getBreakingNews(): Promise<
  BreakingNewsData[]
> {

  const snapshot =
    await getDocs(
      collection(
        db,
        "breakingNews"
      )
    );

  return snapshot.docs
    .map((item) => {

      const data =
        item.data();

      return {
        ...data,
        id: item.id,
      } as BreakingNewsData;

    })
    .filter((item) => {

      // Must be active
      if (!item.active) {
        return false;
      }

      // Must not be expired
      if (isExpired(item)) {
        return false;
      }

      return true;

    });
}

// ======================================================
// UPDATE
// ======================================================

export async function updateBreakingNews(
  id: string,
  data: Partial<BreakingNewsData>
) {

  if (!id) {
    throw new Error(
      "Breaking News ID missing"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/breaking-news/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(data),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Failed to update breaking news"
    );
  }

  return result;
}

// ======================================================
// DELETE
// ======================================================

export async function deleteBreakingNews(
  id: string
) {

  if (!id) {
    throw new Error(
      "Breaking News ID missing"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/breaking-news/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Failed to delete breaking news"
    );
  }

  return result;
}