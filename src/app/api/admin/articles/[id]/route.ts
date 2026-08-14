export const runtime = "nodejs";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  verifyRole,
} from "@/lib/auth/verify-role";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  createSlug,
} from "@/lib/utils/create-slug";

import {
  syncArticleCreate,
  syncArticleUpdate,
  syncArticleDelete,
} from "@/lib/github/article-sync";


// ======================================================
// UPDATE ARTICLE
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

    // ==================================================
    // ARTICLE ID
    // ==================================================

    const {
      id,
    } = await context.params;

    console.log(
      "UPDATE ARTICLE ID:",
      id
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Article ID missing",
        },
        {
          status: 400,
        }
      );
    }


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


    // ==================================================
    // VERIFY ROLE
    // ==================================================

    const user: any =
      await verifyRole(
        token,
        [
          "admin",
          "editor",
          "superAdmin",
        ]
      );


    // ==================================================
    // REQUEST BODY
    // ==================================================

    const body =
      await request.json();


    // ==================================================
    // FIREBASE REFERENCE
    // ==================================================

    const ref =
      adminDb
        .collection("articles")
        .doc(id);


    // ==================================================
    // GET OLD ARTICLE
    // ==================================================

    const old =
      await ref.get();

    if (!old.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Article not found",
        },
        {
          status: 404,
        }
      );
    }


    const oldData =
      old.data() || {};


    // ==================================================
    // SLUG
    // ==================================================

    const slug =
  body.seoTitle
    ? createSlug(body.seoTitle)
    : oldData.slug || "";


    // ==================================================
    // AUTHOR
    // ==================================================

    const author =
      oldData.author || {
        uid:
          user?.uid || "",

        name:
          user?.name ||
          "INFINIA BHARAT NEWS",

        email:
          user?.email || "",

        role:
          user?.role || "admin",
      };


    // ==================================================
    // FIREBASE UPDATE
    // ==================================================

    await ref.update({

      ...body,

      slug,

      author,

      updatedAt:
        FieldValue.serverTimestamp(),
    });


    // ==================================================
    // GITHUB ARTICLE
    // ==================================================

    const githubArticle = {

      id,

      ...body,

      slug,

      author,

      createdAt:
        oldData.createdAt &&
        typeof oldData.createdAt === "object" &&
        "toDate" in oldData.createdAt
          ? (
              oldData.createdAt as {
                toDate: () => Date;
              }
            )
              .toDate()
              .toISOString()
          : typeof oldData.createdAt === "string"
          ? oldData.createdAt
          : new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };


    // ==================================================
    // SYNC TO GITHUB
    // ==================================================

    let githubSynced = false;

    try {

      await syncArticleUpdate(
        githubArticle
      );

      githubSynced = true;

      console.log(
        "ARTICLE GITHUB UPDATE SUCCESS:",
        id
      );

    } catch (githubError) {

      console.error(
        "ARTICLE GITHUB UPDATE FAILED:",
        githubError
      );

      /*
       * Firebase update already succeeded.
       *
       * Therefore we don't return 500.
       */
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({

      success: true,

      message:
        "Updated successfully",

      githubSynced,

    });

  } catch (error: any) {

    console.error(
      "UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to update article",
      },
      {
        status: 500,
      }
    );
  }
}
// ======================================================
// DELETE ARTICLE
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

    // ==================================================
    // ARTICLE ID
    // ==================================================

    const {
      id,
    } = await context.params;

    console.log(
      "DELETE ARTICLE ID:",
      id
    );

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Article ID missing",
        },
        {
          status: 400,
        }
      );
    }


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


    // ==================================================
    // VERIFY ROLE
    // ==================================================

    await verifyRole(
      token,
      [
        "admin",
        "editor",
        "superAdmin",
      ]
    );


    // ==================================================
    // FIREBASE REFERENCE
    // ==================================================

    const ref =
      adminDb
        .collection("articles")
        .doc(id);


    // ==================================================
    // CHECK ARTICLE
    // ==================================================

    const article =
      await ref.get();

    if (!article.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Article not found",
        },
        {
          status: 404,
        }
      );
    }


    // ==================================================
    // DELETE FROM FIREBASE
    // ==================================================

    await ref.delete();


    // ==================================================
    // DELETE FROM GITHUB JSON
    // ==================================================

    let githubSynced = false;

    try {

      await syncArticleDelete(
        id
      );

      githubSynced = true;

      console.log(
        "ARTICLE GITHUB DELETE SUCCESS:",
        id
      );

    } catch (githubError) {

      console.error(
        "ARTICLE GITHUB DELETE FAILED:",
        githubError
      );

      /*
       * Firebase deletion already succeeded.
       *
       * Therefore don't report the whole operation
       * as a 500 error.
       */
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({

      success: true,

      message:
        "Article deleted successfully",

      githubSynced,

    });

  } catch (error: any) {

    console.error(
      "DELETE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to delete article",
      },
      {
        status: 500,
      }
    );
  }
}