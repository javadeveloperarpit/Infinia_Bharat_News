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
  syncBreakingNewsFromFirebase,
} from "@/lib/github/breaking-news-github-sync";


// ======================================================
// CREATE BREAKING NEWS
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {

    // ==================================================
    // AUTH
    // ==================================================

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


    // ==================================================
    // BODY
    // ==================================================

    const body =
      await request.json();

    const text =
      String(
        body?.text || ""
      ).trim();

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Breaking news text is required",
        },
        {
          status: 400,
        }
      );
    }


    // ==================================================
    // FIREBASE CREATE
    // ==================================================

    const newsData = {

      text,

      active:
        body?.active !== false,

      expiry:
        body?.expiry ||
        "24h",

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),

    };


    const ref =
      await adminDb
        .collection(
          "breakingNews"
        )
        .add(
          newsData
        );


    console.log(
      "BREAKING NEWS CREATED:",
      ref.id
    );


    // ==================================================
    // GITHUB SYNC
    // ==================================================

    let githubSynced =
      false;

    let githubCount =
      0;

    let githubError =
      "";


    try {

      const result =
        await syncBreakingNewsFromFirebase();

      githubSynced =
        result.success;

      githubCount =
        result.count;

    } catch (
      error: any
    ) {

      githubError =
        error?.message ||
        "GitHub sync failed";

      console.error(
        "BREAKING NEWS CREATE GITHUB ERROR:",
        error
      );

    }


    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        id:
          ref.id,

        githubSynced,

        githubCount,

        githubError,
      },
      {
        status: 200,
      }
    );

  } catch (
    error: any
  ) {

    console.error(
      "CREATE BREAKING NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to create breaking news",
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// GET BREAKING NEWS
// ======================================================
//
// Admin listing
//
// Firebase direct read is okay.
// Public website GitHub JSON read karegi.
// ======================================================

export async function GET() {

  try {

    const snapshot =
      await adminDb
        .collection(
          "breakingNews"
        )
        .get();


    const news =
      snapshot.docs.map(
        (doc) => ({
          id:
            doc.id,

          ...doc.data(),
        })
      );


    return NextResponse.json(
      news
    );

  } catch (
    error: any
  ) {

    console.error(
      "GET BREAKING NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to fetch breaking news",
      },
      {
        status: 500,
      }
    );
  }
}