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
  createSlug,
} from "@/lib/utils/create-slug";

// ======================================
// GET SINGLE VIDEO
// ======================================

export async function GET(
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
    const { id } = await params;

    const doc = await adminDb
      .collection("videos")
      .doc(id)
      .get();

    if (!doc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Video not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================
// UPDATE VIDEO
// ======================================

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
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

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

    await verifyRole(token, [
      "admin",
      "editor",
      "superAdmin",
    ]);

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Video ID missing",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    await adminDb
      .collection("videos")
      .doc(id)
      .update({
        ...body,
        slug: createSlug(body.title),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("UPDATE VIDEO ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================
// DELETE VIDEO
// ======================================

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
    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

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

    await verifyRole(token, [
      "admin",
      "superAdmin",
    ]);

    const { id } = await params;

    await adminDb
      .collection("videos")
      .doc(id)
      .delete();

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}