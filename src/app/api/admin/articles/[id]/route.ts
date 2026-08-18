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
 
    const { id } =
      await context.params;

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
    // FEATURED / PRIORITY VALIDATION
    // ==================================================

    const nextFeatured =
      body.featured !== undefined
        ? body.featured === true
        : oldData.featured === true;


    let nextPriority =
      body.priority !== undefined
        ? body.priority
        : oldData.priority;


    // ==================================================
    // UNFEATURED
    // ==================================================

    if (!nextFeatured) {

      nextPriority = null;

    }


    // ==================================================
    // FEATURED ARTICLE
    // ==================================================

    if (nextFeatured) {

      const priority =
        Number(nextPriority);


      // ----------------------------------------------
      // PRIORITY REQUIRED
      // ----------------------------------------------

      if (
        !Number.isInteger(priority) ||
        priority < 1 ||
        priority > 5
      ) {

        return NextResponse.json(
          {
            success: false,
            message:
              "Priority must be between 1 and 5.",
          },
          {
            status: 400,
          }
        );

      }


      // ----------------------------------------------
      // CHECK DUPLICATE PRIORITY
      // ----------------------------------------------

      const duplicateSnapshot =
        await adminDb
          .collection("articles")
          .where(
            "featured",
            "==",
            true
          )
          .where(
            "priority",
            "==",
            priority
          )
          .get();


      const duplicate =
        duplicateSnapshot.docs.find(
          (item) =>
            item.id !== id
        );


      if (duplicate) {

        return NextResponse.json(
          {
            success: false,
            message:
              `Priority ${priority} is already occupied.`,
          },
          {
            status: 409,
          }
        );

      }


      nextPriority =
        priority;

    }


    // ==================================================
// SLUG
// EXISTING ARTICLE URL MUST NEVER CHANGE
// ==================================================

const slug =
  oldData.slug ||
  (body.seoTitle
    ? createSlug(body.seoTitle)
    : "");

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


   // ======================================================
// PREPARE UPDATE DATA
// ======================================================

const updateData: Record<string, any> = {
  ...body,

  slug,

  author,

  updatedAt:
    FieldValue.serverTimestamp(),
};


// ======================================================
// REMOVE PRIORITY WHEN ARTICLE IS UNFEATURED
// ======================================================

if (body.featured === false) {

  updateData.priority =
    FieldValue.delete();

}


// ======================================================
// FIREBASE UPDATE
// ======================================================

await ref.update(
  updateData
);

    // ==================================================
    // GITHUB ARTICLE
    // ==================================================

    const githubArticle = {

      id,

      ...oldData,

      ...body,

      featured:
        nextFeatured,

      priority:
        nextPriority,

      slug,

      author,

      createdAt:
        oldData.createdAt &&
        typeof oldData.createdAt ===
          "object" &&
        "toDate" in oldData.createdAt

          ? (
              oldData.createdAt as {
                toDate: () => Date;
              }
            )
              .toDate()
              .toISOString()

          : typeof oldData.createdAt ===
              "string"

          ? oldData.createdAt

          : new Date()
              .toISOString(),

      updatedAt:
        new Date()
          .toISOString(),
    };


    // ==================================================
    // SYNC TO GITHUB
    // ==================================================

    let githubSynced =
      false;

    try {

      await syncArticleUpdate(
        githubArticle
      );

      githubSynced =
        true;

      console.log(
        "ARTICLE GITHUB UPDATE SUCCESS:",
        id
      );

    } catch (githubError) {

      console.error(
        "ARTICLE GITHUB UPDATE FAILED:",
        githubError
      );

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Updated successfully",

        githubSynced,
      }
    );

  } catch (error: any) {

    console.error(
      "UPDATE ARTICLE ERROR:",
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

    const { id } =
      await context.params;

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
    // DELETE FROM GITHUB
    // ==================================================

    let githubSynced =
      false;

    try {

      await syncArticleDelete(
        id
      );

      githubSynced =
        true;

      console.log(
        "ARTICLE GITHUB DELETE SUCCESS:",
        id
      );

    } catch (githubError) {

      console.error(
        "ARTICLE GITHUB DELETE FAILED:",
        githubError
      );

    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Article deleted successfully",

        githubSynced,
      }
    );

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