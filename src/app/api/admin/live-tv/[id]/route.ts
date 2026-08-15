import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";


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
// PUT - UPDATE CHANNEL
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


    const {
      title,
      youtubeUrl,
      enabled,
      order,
      logo,
    } = body;


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
      typeof title ===
      "string"
    ) {

      updateData.title =
        title.trim();

    }


    if (
      typeof youtubeUrl ===
      "string"
    ) {

      updateData.youtubeUrl =
        youtubeUrl.trim();

    }


    if (
      typeof enabled ===
      "boolean"
    ) {

      updateData.enabled =
        enabled;

    }


    if (
      typeof order ===
      "number"
    ) {

      updateData.order =
        order;

    }


    if (
      typeof logo ===
      "string"
    ) {

      updateData.logo =
        logo.trim();

    }


    await reference.update(
      updateData
    );


    return NextResponse.json({

      success: true,

      message:
        "Live TV channel updated successfully.",

      id,

    });

  }
  catch (error: any) {

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
// DELETE - DELETE CHANNEL
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


    await reference.delete();


    return NextResponse.json({

      success: true,

      message:
        "Live TV channel deleted successfully.",

      id,

    });

  }
  catch (error: any) {

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