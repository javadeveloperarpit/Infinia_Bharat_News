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

// ==========================================
// TYPES
// ==========================================

type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

// ==========================================
// AUTH + ROLE CHECK
// ==========================================

async function verifyAdmin(
  request: NextRequest
) {

  const authorization =
    request.headers.get(
      "authorization"
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    throw new Error(
      "Unauthorized"
    );
  }

  const idToken =
    authorization.substring(7);

  const decodedToken =
    await adminAuth.verifyIdToken(
      idToken
    );

  const uid =
    decodedToken.uid;

  const userSnapshot =
    await adminDb
      .collection("users")
      .doc(uid)
      .get();

  if (
    !userSnapshot.exists
  ) {
    throw new Error(
      "User profile not found."
    );
  }

  const userData =
    userSnapshot.data();

  const role =
    userData?.role;

  if (
    role !== "admin" &&
    role !== "editor"
  ) {
    throw new Error(
      "Access denied."
    );
  }

  return {
    uid,
    role,
  };
}

// ==========================================
// PATCH REPORT
// ==========================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      reportId: string;
    }>;
  }
) {

  try {

    await verifyAdmin(
      request
    );

    const {
      reportId,
    } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Report ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const status =
      body?.status as ReportStatus;

    const validStatuses:
      ReportStatus[] = [
        "pending",
        "reviewed",
        "resolved",
        "rejected",
      ];

    if (
      !validStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid report status.",
        },
        {
          status: 400,
        }
      );
    }

    const reportRef =
      commentsAdminDb
        .collection(
          "commentReports"
        )
        .doc(reportId);

    const reportSnapshot =
      await reportRef.get();

    if (
      !reportSnapshot.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Report not found.",
        },
        {
          status: 404,
        }
      );
    }

    await reportRef.update({
      status,

      updatedAt:
        new Date(),
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Report status updated.",

        reportId,

        status,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "UPDATE COMMENT REPORT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update report.";

    const statusCode =
      message === "Unauthorized"
        ? 401
        : message ===
            "Access denied."
          ? 403
          : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          statusCode,
      }
    );
  }
}

// ==========================================
// DELETE REPORT
// ==========================================

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      reportId: string;
    }>;
  }
) {

  try {

    await verifyAdmin(
      request
    );

    const {
      reportId,
    } = await context.params;

    if (!reportId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Report ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const reportRef =
      commentsAdminDb
        .collection(
          "commentReports"
        )
        .doc(reportId);

    const reportSnapshot =
      await reportRef.get();

    if (
      !reportSnapshot.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Report not found.",
        },
        {
          status: 404,
        }
      );
    }

    await reportRef.delete();

    return NextResponse.json(
      {
        success: true,

        message:
          "Report deleted.",

        reportId,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "DELETE COMMENT REPORT ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete report.";

    const statusCode =
      message === "Unauthorized"
        ? 401
        : message ===
            "Access denied."
          ? 403
          : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          statusCode,
      }
    );
  }
}