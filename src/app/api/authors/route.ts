import { NextResponse } from "next/server";

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

// ==========================================
// CREATE SLUG
// ==========================================

function createAuthorSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ==========================================
// GET PUBLIC AUTHORS
// ==========================================

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("users")
      .where("status", "==", "active")
      .get();

    const authors = snapshot.docs
      .map((doc) => {
        const data = doc.data();

        const name = String(data.name || "").trim();

        // Invalid/nameless users ko public authors list mein mat dikhana
        if (!name) return null;

        return {
          id: doc.id,

          uid: data.uid || doc.id,

          name,

          photo: data.photo || data.avatar || "",

          bio: data.bio || "",

          slug:
            data.slug ||
            createAuthorSlug(name),

          role: data.role || "Author",

          status: data.status || "active",
        };
      })
      .filter(Boolean);

    // Name ke according sorting
    authors.sort((a: any, b: any) =>
      a.name.localeCompare(b.name)
    );

    return NextResponse.json(
      {
        success: true,
        count: authors.length,
        authors,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error(
      "GET PUBLIC AUTHORS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch authors",
        authors: [],
      },
      {
        status: 500,
      }
    );
  }
}