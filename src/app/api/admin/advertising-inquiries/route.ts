import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

async function verifyAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    throw new Error("Unauthorized");
  }

  const token =
    authorization.substring(7);

  const decodedToken =
    await adminAuth.verifyIdToken(token);

  const userSnapshot =
    await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

  if (!userSnapshot.exists) {
    throw new Error("User profile not found.");
  }

  const userData =
    userSnapshot.data();

  if (
    userData?.role !== "admin" &&
    userData?.role !== "editor"
  ) {
    throw new Error("Access denied.");
  }

  return decodedToken;
}

// ==========================================
// GET ADVERTISING INQUIRIES
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    const snapshot =
      await commentsAdminDb
        .collection("advertisingInquiries")
        .where("status", "==", "pending")
        .get();

    const inquiries =
      snapshot.docs
        .map((doc) => {
          const data = doc.data();

          return {
            id: doc.id,
            ...data,

            createdAt:
              data.createdAt?.toDate?.()?.toISOString() ??
              data.createdAt ??
              null,

            updatedAt:
              data.updatedAt?.toDate?.()?.toISOString() ??
              data.updatedAt ??
              null,
          };
        })
        .sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;

          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;

          return dateB - dateA;
        });

    return NextResponse.json(
      {
        success: true,
        count: inquiries.length,
        inquiries,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {

    console.error(
      "ADVERTISING INQUIRIES GET ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to load advertising inquiries.";

    const status =
      message === "Unauthorized"
        ? 401
        : message === "Access denied."
        ? 403
        : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      }
    );
  }
}

// ==========================================
// PATCH - UPDATE STATUS
// ==========================================

export async function PATCH(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    const body =
      await request.json();

    const {
      id,
      status,
    } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inquiry ID and status are required.",
        },
        { status: 400 }
      );
    }

    if (
      ![
        "pending",
        "contacted",
        "resolved",
      ].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status.",
        },
        { status: 400 }
      );
    }

    await commentsAdminDb
      .collection("advertisingInquiries")
      .doc(id)
      .update({
        status,
      });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(
      "ADVERTISING INQUIRY UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update inquiry.",
      },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE
// ==========================================

export async function DELETE(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    const body =
      await request.json();

    const {
      id,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Inquiry ID is required.",
        },
        { status: 400 }
      );
    }

    await commentsAdminDb
      .collection("advertisingInquiries")
      .doc(id)
      .delete();

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(
      "ADVERTISING INQUIRY DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete inquiry.",
      },
      { status: 500 }
    );
  }
}