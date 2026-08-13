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
// UPDATE BREAKING NEWS
// ======================================================

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
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
    // ID
    // ==================================================

    const {
      id,
    } = await params;


    if (!id) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Breaking News ID missing",
        },
        {
          status: 400,
        }
      );

    }


    // ==================================================
    // BODY
    // ==================================================

    const body =
      await request.json();


    // ==================================================
    // FIREBASE REF
    // ==================================================

    const ref =
      adminDb
        .collection(
          "breakingNews"
        )
        .doc(id);


    const old =
      await ref.get();


    if (!old.exists) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Breaking news not found",
        },
        {
          status: 404,
        }
      );

    }


    // ==================================================
    // UPDATE
    // ==================================================

    const updateData: Record<
      string,
      any
    > = {

      updatedAt:
        FieldValue.serverTimestamp(),

    };


    if (
      body?.text !== undefined
    ) {

      updateData.text =
        String(
          body.text
        ).trim();

    }


    if (
      body?.active !== undefined
    ) {

      updateData.active =
        Boolean(
          body.active
        );

    }


    if (
      body?.expiry !== undefined
    ) {

      updateData.expiry =
        body.expiry;

    }


    await ref.update(
      updateData
    );


    console.log(
      "BREAKING NEWS UPDATED:",
      id
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
        "BREAKING NEWS UPDATE GITHUB ERROR:",
        error
      );

    }


    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Breaking news updated successfully",

        githubSynced,

        githubCount,

        githubError,
      }
    );

  } catch (
    error: any
  ) {

    console.error(
      "UPDATE BREAKING NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to update breaking news",
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// DELETE BREAKING NEWS
// ======================================================

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
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
    // ID
    // ==================================================

    const {
      id,
    } = await params;


    if (!id) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Breaking News ID missing",
        },
        {
          status: 400,
        }
      );

    }


    // ==================================================
    // FIREBASE REF
    // ==================================================

    const ref =
      adminDb
        .collection(
          "breakingNews"
        )
        .doc(id);


    const old =
      await ref.get();


    if (!old.exists) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Breaking news not found",
        },
        {
          status: 404,
        }
      );

    }


    // ==================================================
    // DELETE FIREBASE
    // ==================================================

    await ref.delete();


    console.log(
      "BREAKING NEWS DELETED:",
      id
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
        "BREAKING NEWS DELETE GITHUB ERROR:",
        error
      );

    }


    // ==================================================
    // RESPONSE
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Breaking news deleted successfully",

        githubSynced,

        githubCount,

        githubError,
      }
    );

  } catch (
    error: any
  ) {

    console.error(
      "DELETE BREAKING NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to delete breaking news",
      },
      {
        status: 500,
      }
    );
  }
}