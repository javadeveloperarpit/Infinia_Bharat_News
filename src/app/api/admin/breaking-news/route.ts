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
    // EXPIRY
    //
    // Default = 24 HOURS
    //
    // We store an actual timestamp instead of
    // only storing "24h".
    // ==================================================

    const expiryHours = 24;

    const expiresAt =
      new Date(
        Date.now() +
        expiryHours * 60 * 60 * 1000
      );


    // ==================================================
    // FIREBASE CREATE
    // ==================================================

    const newsData = {

      text,

      active:
        body?.active !== false,

      // Human-readable value
      expiry:
        "24h",

      // Actual expiry timestamp
      expiresAt,

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
      ref.id,
      "EXPIRES AT:",
      expiresAt.toISOString()
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

        expiresAt:
          expiresAt.toISOString(),
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
// Admin listing.
//
// Firebase direct read is okay.
//
// IMPORTANT:
// Expired news are automatically marked inactive
// when admin GET is called.
//
// Public website will receive only non-expired
// news through GitHub sync.
//
// ======================================================

export async function GET() {

  try {

    const snapshot =
      await adminDb
        .collection(
          "breakingNews"
        )
        .get();


    const now =
      Date.now();


    const news =
      snapshot.docs.map(
        (doc) => {

          const data =
            doc.data();


          // ==================================================
          // CHECK EXPIRY
          // ==================================================

          let expired =
            false;


          if (
            data?.expiresAt
          ) {

            const expiresAt =
              data.expiresAt
                ?.toDate
                ? data.expiresAt.toDate()
                : new Date(
                    data.expiresAt
                  );

            if (
              !isNaN(
                expiresAt.getTime()
              ) &&
              expiresAt.getTime() <= now
            ) {

              expired =
                true;

            }

          }


          return {
            id:
              doc.id,

            ...data,

            // Expired news is returned as inactive
            active:
              expired
                ? false
                : Boolean(
                    data?.active
                  ),

            expired,
          };

        }
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