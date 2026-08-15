import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  syncLiveTvToGithub,
} from "@/lib/github/live-tv-sync";

// ======================================================
// AUTH
// ======================================================

async function verifyAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const token =
    authorization.substring(
      7
    );

  if (!token) {
    throw new Error(
      "Unauthorized"
    );
  }

  return adminAuth.verifyIdToken(
    token
  );
}

// ======================================================
// GET
// ======================================================
// IMPORTANT:
// GET Firebase ko read nahi karega.
// Public JSON/API data source later file se hoga.
// ======================================================

export async function GET() {
  try {
    const snapshot =
      await adminDb
        .collection("liveTv")
        .get();

    const channels =
      snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort(
          (a: any, b: any) =>
            Number(
              a.order ?? 0
            ) -
            Number(
              b.order ?? 0
            )
        );

    return NextResponse.json(
      channels,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Live TV GET Error:",
      error
    );

    return NextResponse.json(
      [],
      {
        status: 200,
      }
    );
  }
}

// ======================================================
// POST - CREATE
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    await verifyAdmin(
      request
    );

    const body =
      await request.json();

    if (
      !body?.title ||
      !body?.youtubeUrl
    ) {
      return NextResponse.json(
        {
          message:
            "Title and YouTube URL are required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------
    // FIREBASE CREATE
    // --------------------------------------------------

    const reference =
      adminDb
        .collection("liveTv")
        .doc();

    const channel = {
      title:
        String(
          body.title
        ).trim(),

      youtubeUrl:
        String(
          body.youtubeUrl
        ).trim(),

      enabled:
        body.enabled !== false,

      order:
        Number(
          body.order ?? 0
        ),

      ...(typeof body.logo ===
        "string" &&
      body.logo.trim()
        ? {
            logo:
              body.logo.trim(),
          }
        : {}),

      createdAt:
        new Date(),

      updatedAt:
        new Date(),
    };

    await reference.set(
      channel
    );

    // --------------------------------------------------
    // FIREBASE → GITHUB
    // --------------------------------------------------

    let syncResult;

    try {
      syncResult =
        await syncLiveTvToGithub();
    } catch (syncError) {
      console.error(
        "Live TV GitHub Sync Error:",
        syncError
      );

      // Firebase creation successful
      // but sync failed.
      return NextResponse.json(
        {
          success: true,

          id:
            reference.id,

          message:
            "Channel created in Firebase, but GitHub sync failed.",

          syncError:
            syncError instanceof
            Error
              ? syncError.message
              : "Unknown sync error.",
        },
        {
          status: 207,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        id:
          reference.id,

        channel: {
          id:
            reference.id,

          ...channel,
        },

        sync:
          syncResult,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Create Live TV Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Failed to create Live TV channel.",
      },
      {
        status:
          error?.message ===
          "Unauthorized"
            ? 401
            : 500,
      }
    );
  }
}