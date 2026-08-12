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

async function getAuthToken() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Not logged in");
  }

  return user.getIdToken();
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
  const token = await getAuthToken();

  const response = await fetch(
    "/api/admin/breaking-news",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

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

export async function getBreakingNews(): Promise<
  BreakingNewsData[]
> {
  const snapshot = await getDocs(
    collection(db, "breakingNews")
  );

  return snapshot.docs.map((item) => {
    const data = item.data();

    return {
      ...data,
      id: item.id,
    } as BreakingNewsData;
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

  const token = await getAuthToken();

  const response = await fetch(
    `/api/admin/breaking-news/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

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

  const token = await getAuthToken();

  const response = await fetch(
    `/api/admin/breaking-news/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      "Failed to delete breaking news"
    );
  }

  return result;
}