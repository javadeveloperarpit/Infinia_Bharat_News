export const runtime = "nodejs";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  verifyRole,
} from "@/lib/auth/verify-role";

import {
  syncCategoriesFromFirebase,
} from "@/lib/github/category-github-sync";

// ======================================================
// CREATE CATEGORY
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    const token =
      request.headers
        .get("authorization")
        ?.replace(
          "Bearer ",
          ""
        );

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    await verifyRole(
      token,
      [
        "admin",
        "editor",
        "superAdmin",
      ]
    );

    const body =
      await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!body.nameHi?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hindi category name is required",
        },
        {
          status: 400,
        }
      );
    }

    const categoryData = {
      name:
        body.name.trim(),

      nameHi:
        body.nameHi.trim(),

      slug:
        body.slug ||
        body.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-"),

      status:
        body.status || "active",

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    const ref =
      await adminDb
        .collection("categories")
        .add(categoryData);

    console.log(
      "CATEGORY CREATED:",
      ref.id
    );

    // ==================================================
    // GITHUB SYNC
    // ==================================================

    let githubSynced = false;
    let githubCount = 0;
    let githubError = "";

    try {
      const result =
        await syncCategoriesFromFirebase();

      githubSynced =
        result.success;

      githubCount =
        result.count;
    } catch (error: any) {
      githubError =
        error?.message ||
        "GitHub sync failed";

      console.error(
        "CATEGORY CREATE GITHUB ERROR:",
        error
      );
    }

    return NextResponse.json({
      success: true,

      id: ref.id,

      githubSynced,

      githubCount,

      githubError,
    });
  } catch (error: any) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to create category",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// GET ALL CATEGORIES
// ======================================================

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .collection("categories")
        .get();

    const categories =
      snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

    return NextResponse.json(
      categories
    );
  } catch (error: any) {
    console.error(
      "GET CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch categories",
      },
      {
        status: 500,
      }
    );
  }
}