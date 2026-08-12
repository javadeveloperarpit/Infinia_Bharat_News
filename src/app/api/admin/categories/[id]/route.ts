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
  syncCategoriesFromFirebase,
} from "@/lib/github/category-github-sync";

// ======================================================
// UPDATE CATEGORY
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

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category ID missing",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const ref =
      adminDb
        .collection("categories")
        .doc(id);

    const old =
      await ref.get();

    if (!old.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found",
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
      ...body,

      updatedAt:
        FieldValue.serverTimestamp(),
    };

    if (body.name) {
      updateData.slug =
        body.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
    }

    await ref.update(
      updateData
    );

    console.log(
      "CATEGORY UPDATED:",
      id
    );

    // ==================================================
    // GITHUB SYNC
    // ==================================================

    let githubSynced = false;
    let githubCount = 0;
    let githubError = "";

    try {
      const result =
        await syncCategoriesFromFirebase();

      githubSynced =
        result.success;

      githubCount =
        result.count;
    } catch (error: any) {
      githubError =
        error?.message ||
        "GitHub sync failed";

      console.error(
        "CATEGORY UPDATE GITHUB ERROR:",
        error
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Category updated successfully",

      githubSynced,

      githubCount,

      githubError,
    });
  } catch (error: any) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to update category",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE CATEGORY
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
        "superAdmin",
      ]
    );

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category ID missing",
        },
        {
          status: 400,
        }
      );
    }

    const ref =
      adminDb
        .collection("categories")
        .doc(id);

    const old =
      await ref.get();

    if (!old.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found",
        },
        {
          status: 404,
        }
      );
    }

    await ref.delete();

    console.log(
      "CATEGORY DELETED:",
      id
    );

    // ==================================================
    // GITHUB SYNC
    // ==================================================

    let githubSynced = false;
    let githubCount = 0;
    let githubError = "";

    try {
      const result =
        await syncCategoriesFromFirebase();

      githubSynced =
        result.success;

      githubCount =
        result.count;
    } catch (error: any) {
      githubError =
        error?.message ||
        "GitHub sync failed";

      console.error(
        "CATEGORY DELETE GITHUB ERROR:",
        error
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Category deleted successfully",

      githubSynced,

      githubCount,

      githubError,
    });
  } catch (error: any) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to delete category",
      },
      {
        status: 500,
      }
    );
  }
}