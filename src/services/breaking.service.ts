import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

// ======================================================
// TYPES
// ======================================================

export interface BreakingNewsData {
  id: string;
  text: string;
  active: boolean;
  expiry: string;
  createdAt?: any;
  updatedAt?: any;
}

// ======================================================
// CREATE BREAKING NEWS
// ======================================================

export async function createBreakingNews(
  data: Omit<BreakingNewsData, "id" | "createdAt" | "updatedAt">
) {
  const ref = await addDoc(
    collection(db, "breakingNews"),
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  return ref.id;
}

// ======================================================
// GET BREAKING NEWS
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

      // IMPORTANT:
      // Firestore document ID must ALWAYS win.
      id: item.id,
    } as BreakingNewsData;
  });
}

// ======================================================
// DELETE BREAKING NEWS
// ======================================================

export async function deleteBreakingNews(
  id: string
) {
  if (!id || !id.trim()) {
    throw new Error(
      "Invalid Breaking News document ID."
    );
  }

  await deleteDoc(
    doc(
      db,
      "breakingNews",
      id
    )
  );
}

// ======================================================
// UPDATE BREAKING NEWS
// ======================================================

export async function updateBreakingNews(
  id: string,
  data: Partial<BreakingNewsData>
) {
  if (!id || !id.trim()) {
    throw new Error(
      "Invalid Breaking News document ID."
    );
  }

  await updateDoc(
    doc(
      db,
      "breakingNews",
      id
    ),
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  );
}

