import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  getPendingCommentReports,
  getPendingCommentReportCount,
} from "@/services/admin/comment-reports.service";

// ==========================================
// GET COMMENT REPORTS
// ==========================================

export async function GET(
  request: NextRequest
) {

  try {

    // ========================================
    // AUTHORIZATION HEADER
    // ========================================

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

      return NextResponse.json(
        {
          success: false,
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // ID TOKEN
    // ========================================

    const idToken =
      authorization.substring(7);

    // ========================================
    // VERIFY MAIN FIREBASE USER
    // ========================================

    const decodedToken =
      await adminAuth.verifyIdToken(
        idToken
      );

    const uid =
      decodedToken.uid;

    // ========================================
    // GET USER PROFILE
    // ========================================

    const userSnapshot =
      await adminDb
        .collection("users")
        .doc(uid)
        .get();

    if (
      !userSnapshot.exists
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "User profile not found.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // GET USER DATA
    // ========================================

    const userData =
      userSnapshot.data();

    const role =
      userData?.role;

    // ========================================
    // ADMIN / EDITOR ONLY
    // ========================================

    if (
      role !== "admin" &&
      role !== "editor"
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied.",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // LIMIT
    // ========================================

    const searchParams =
      request.nextUrl.searchParams;

    const requestedLimit =
      Number(
        searchParams.get(
          "limit"
        ) || "50"
      );

    const maxResults =
      Math.min(
        Math.max(
          Number.isFinite(
            requestedLimit
          )
            ? requestedLimit
            : 50,
          1
        ),
        100
      );

    // ========================================
    // GET PENDING REPORTS
    // ========================================

    const reports =
      await getPendingCommentReports(
        maxResults
      );

    // ========================================
    // GET ACTUAL PENDING COUNT
    // ========================================

    const count =
      await getPendingCommentReportCount();

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,

        reports,

        count,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      "COMMENT REPORTS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch comment reports.",
      },
      {
        status: 500,
      }
    );
  }
}