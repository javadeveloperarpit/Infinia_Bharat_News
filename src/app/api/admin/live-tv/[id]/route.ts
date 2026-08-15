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
// PUT - UPDATE
// ======================================================

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await verifyAdmin(
      request
    );

    const {
      id,
    } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Channel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const reference =
      adminDb
        .collection("liveTv")
        .doc(id);

    const existing =
      await reference.get();

    if (!existing.exists) {
      return NextResponse.json(
        {
          message:
            "Live TV channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    const updateData: Record<
      string,
      any
    > = {
      updatedAt:
        new Date(),
    };

    if (
      typeof body.title ===
      "string"
    ) {
      updateData.title =
        body.title.trim();
    }

    if (
      typeof body.youtubeUrl ===
      "string"
    ) {
      updateData.youtubeUrl =
        body.youtubeUrl.trim();
    }

    if (
      typeof body.enabled ===
      "boolean"
    ) {
      updateData.enabled =
        body.enabled;
    }

    if (
      typeof body.order ===
      "number"
    ) {
      updateData.order =
        body.order;
    }

    if (
      typeof body.logo ===
      "string"
    ) {
      updateData.logo =
        body.logo.trim();
    }

    await reference.update(
      updateData
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

      return NextResponse.json(
        {
          success: true,

          id,

          message:
            "Channel updated in Firebase, but GitHub sync failed.",

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

        message:
          "Live TV channel updated successfully.",

        id,

        sync:
          syncResult,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Update Live TV Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Failed to update Live TV channel.",
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

// ======================================================
// DELETE
// ======================================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await verifyAdmin(
      request
    );

    const {
      id,
    } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Channel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const reference =
      adminDb
        .collection("liveTv")
        .doc(id);

    const existing =
      await reference.get();

    if (!existing.exists) {
      return NextResponse.json(
        {
          message:
            "Live TV channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------
    // FIREBASE DELETE
    // --------------------------------------------------

    await reference.delete();

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

      return NextResponse.json(
        {
          success: true,

          id,

          message:
            "Channel deleted from Firebase, but GitHub sync failed.",

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

        message:
          "Live TV channel deleted successfully.",

        id,

        sync:
          syncResult,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Delete Live TV Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Failed to delete Live TV channel.",
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