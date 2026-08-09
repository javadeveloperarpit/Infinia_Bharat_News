import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  commentsAdminAuth,
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

// ==========================================
// TYPES
// ==========================================

interface AdminShort {
  id: string;
  url: string;
  title?: string;
  thumbnail?: string;
  publishedAt?: string;
}

// ==========================================
// VERIFY COMMENTS ADMIN
// ==========================================

async function verifyAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return null;
  }

  const token =
    authorization.substring(7).trim();

  if (!token) {
    return null;
  }

  try {
    const decodedToken =
      await commentsAdminAuth.verifyIdToken(
        token
      );

    return decodedToken;
  } catch (error) {
    console.error(
      "COMMENTS AUTH VERIFY ERROR:",
      error
    );

    return null;
  }
}

// ==========================================
// GET SHORTS
// ==========================================

export async function GET(
  request: NextRequest
) {
  try {
    // ======================================
    // AUTH
    // ======================================

    const user =
      await verifyAdmin(request);

    if (!user) {
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

    // ======================================
    // FIRESTORE
    // ======================================

    const snapshot =
      await commentsAdminDb
        .collection("shorts")
        .doc("config")
        .get();

    // ======================================
    // EMPTY
    // ======================================

    if (!snapshot.exists) {
      return NextResponse.json({
        success: true,
        videos: [],
        updatedAt: undefined,
      });
    }

    const data =
      snapshot.data() || {};

    // ======================================
    // SUPPORT BOTH STRUCTURES
    //
    // shorts: [...]
    // videos: [...]
    // ======================================

    const videos: AdminShort[] =
      Array.isArray(data.shorts)
        ? data.shorts
        : Array.isArray(data.videos)
        ? data.videos
        : [];

    // ======================================
    // UPDATED AT
    // ======================================

    let updatedAt:
      | string
      | undefined;

    const timestamp =
      data.updatedAt;

    if (
      timestamp &&
      typeof timestamp.toDate ===
        "function"
    ) {
      updatedAt =
        timestamp
          .toDate()
          .toISOString();
    }

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json({
      success: true,
      videos,
      updatedAt,
    });
  } catch (error) {
    console.error(
      "GET SHORTS CONFIG ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Shorts config load nahi ho paaya.",
      },
      {
        status: 500,
      }
    );
  }
}

// ==========================================
// UPDATE SHORTS
// ==========================================

export async function PUT(
  request: NextRequest
) {
  try {
    // ======================================
    // AUTH
    // ======================================

    const user =
      await verifyAdmin(request);

    if (!user) {
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

    // ======================================
    // BODY
    // ======================================

    const body =
      await request.json();

    const shorts =
      body?.shorts;

    if (!Array.isArray(shorts)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid shorts JSON",
        },
        {
          status: 400,
        }
      );
    }

    // ======================================
    // VALIDATE + CLEAN
    // ======================================

    const cleanedShorts:
      AdminShort[] =
      shorts.map(
        (
          item: any,
          index: number
        ) => {
          if (
            !item ||
            typeof item !== "object"
          ) {
            throw new Error(
              `Item ${
                index + 1
              } invalid hai.`
            );
          }

          // -------------------------------
          // ID
          // -------------------------------

          if (
            typeof item.id !== "string" ||
            !item.id.trim()
          ) {
            throw new Error(
              `Item ${
                index + 1
              } ka id missing hai.`
            );
          }

          // -------------------------------
          // URL
          // -------------------------------

          if (
            typeof item.url !== "string" ||
            !item.url.trim()
          ) {
            throw new Error(
              `Item ${
                index + 1
              } ka url missing hai.`
            );
          }

          // -------------------------------
          // CLEAN OBJECT
          // -------------------------------

          const cleaned: AdminShort = {
            id: item.id.trim(),
            url: item.url.trim(),
          };

          // -------------------------------
          // TITLE
          // -------------------------------

          if (
            typeof item.title === "string"
          ) {
            cleaned.title =
              item.title.trim();
          }

          // -------------------------------
          // THUMBNAIL
          // -------------------------------

          if (
            typeof item.thumbnail ===
            "string"
          ) {
            cleaned.thumbnail =
              item.thumbnail.trim();
          }

          // -------------------------------
          // PUBLISHED AT
          //
          // NEVER send undefined
          // -------------------------------

          if (
            typeof item.publishedAt ===
              "string" &&
            item.publishedAt.trim()
          ) {
            cleaned.publishedAt =
              item.publishedAt.trim();
          }

          return cleaned;
        }
      );

    // ======================================
    // SAVE
    // ======================================

    await commentsAdminDb
      .collection("shorts")
      .doc("config")
      .set(
        {
          shorts: cleanedShorts,
          updatedAt:
            FieldValue.serverTimestamp(),
        },
        {
          merge: true,
        }
      );

    // ======================================
    // RESPONSE
    // ======================================

    return NextResponse.json({
      success: true,
      message:
        "Shorts saved successfully.",
      count:
        cleanedShorts.length,
    });
  } catch (error) {
    console.error(
      "UPDATE SHORTS CONFIG ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Shorts save nahi ho paaye.",
      },
      {
        status: 500,
      }
    );
  }
}