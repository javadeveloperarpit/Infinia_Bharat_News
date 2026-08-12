// ======================================================
// CATEGORY SYNC
// Firebase -> GitHub
// ======================================================

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  serializeValue,
  writeGitHubJson,
} from "./github-utils";

// ======================================================
// PATH
// ======================================================

const CATEGORIES_PATH =
  "public/data/categories.json";

// ======================================================
// GET ALL CATEGORIES
// ======================================================

async function getAllFirebaseCategories() {
  const snapshot =
    await adminDb
      .collection("categories")
      .get();

  return snapshot.docs.map(
    (doc) =>
      serializeValue({
        id: doc.id,
        ...doc.data(),
      })
  );
}

// ======================================================
// MAIN SYNC
// ======================================================

export async function syncCategoriesFromFirebase() {
  console.log(
    "=========================================="
  );

  console.log(
    "CATEGORY SYNC START"
  );

  console.log(
    "=========================================="
  );

  const categories =
    await getAllFirebaseCategories();

  console.log(
    "Firebase categories:",
    categories.length
  );

  await writeGitHubJson(
    CATEGORIES_PATH,
    categories,
    "Sync categories.json from Firebase"
  );

  console.log(
    "CATEGORY SYNC SUCCESS:",
    categories.length
  );

  return {
    success: true,
    count: categories.length,
  };
}

// ======================================================
// ALIASES
// ======================================================

export async function syncCategoryCreate(
  _category?: Record<string, any>
) {
  return syncCategoriesFromFirebase();
}

export async function syncCategoryUpdate(
  _category?: Record<string, any>
) {
  return syncCategoriesFromFirebase();
}

export async function syncCategoryDelete(
  _categoryId?: string
) {
  return syncCategoriesFromFirebase();
}