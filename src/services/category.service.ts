import {
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase/firebase";

// ======================================================
// TYPES
// ======================================================

export interface CategoryData {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: "active" | "inactive";
}

// ======================================================
// AUTH TOKEN
// ======================================================

async function getAuthToken() {
  const user =
    auth.currentUser;

  if (!user) {
    throw new Error(
      "Not logged in"
    );
  }

  return user.getIdToken();
}

// ======================================================
// GET CATEGORY BY ID
// ======================================================

export async function getCategoryById(
  id: string
): Promise<CategoryData | null> {
  const snapshot =
    await getDoc(
      doc(
        db,
        "categories",
        id
      )
    );

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as CategoryData;
}

// ======================================================
// CREATE CATEGORY
//
// Client
// ↓
// API
// ↓
// Firebase
// ↓
// GitHub
// ======================================================

export async function createCategory(
  data: Omit<CategoryData, "id">
) {
  const token =
    await getAuthToken();

  const response =
    await fetch(
      "/api/admin/categories",
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
      "Failed to create category"
    );
  }

  return result;
}

// ======================================================
// GET CATEGORIES
//
// Admin listing ke liye Firebase read
// ======================================================

export async function getCategories() {
  const snapshot =
    await getDocs(
      collection(
        db,
        "categories"
      )
    );

  return snapshot.docs.map(
    (item) => ({
      id: item.id,
      ...item.data(),
    })
  ) as CategoryData[];
}

// ======================================================
// UPDATE CATEGORY
// ======================================================

export async function updateCategory(
  id: string,
  data: Partial<CategoryData>
) {
  if (!id) {
    throw new Error(
      "Category ID missing"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/categories/${id}`,
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
      "Failed to update category"
    );
  }

  return result;
}

// ======================================================
// DELETE CATEGORY
// ======================================================

export async function deleteCategory(
  id: string
) {
  if (!id) {
    throw new Error(
      "Category ID missing"
    );
  }

  const token =
    await getAuthToken();

  const response =
    await fetch(
      `/api/admin/categories/${id}`,
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
      "Failed to delete category"
    );
  }

  return result;
}