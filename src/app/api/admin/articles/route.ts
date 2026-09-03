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

import {
  syncArticleCreate,
  syncArticleUpdate,
  syncArticleDelete,
} from "@/lib/github/article-sync";


// ======================================================
// CREATE ARTICLE
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {

    // ==================================================
    // AUTH TOKEN
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

const keywords = Array.isArray(body.keywords)
  ? body.keywords
      .map((keyword: unknown) => String(keyword).trim())
      .filter(Boolean)
  : typeof body.keywords === "string"
    ? body.keywords
        .split(",")
        .map((keyword: string) => keyword.trim())
        .filter(Boolean)
    : [];
    // ==================================================
    // SLUG
    // ==================================================

    const slug =
  createSlug(
    body.seoTitle
  );

    // ==================================================
    // TIME FOR GITHUB JSON
    // ==================================================

    const now =
      new Date().toISOString();


    // ==================================================
    // FIREBASE ARTICLE DATA
    // ==================================================

    const articleData = {

      ...body,
      keywords,

      slug,

      author: {
        uid:
          user?.uid || "",

        name:
          user?.name || "",

        email:
          user?.email || "",

        role:
          user?.role || "",
      },

      createdAt:
        FieldValue.serverTimestamp(),

      updatedAt:
        FieldValue.serverTimestamp(),
    };


    // ==================================================
    // CREATE ARTICLE IN FIREBASE
    // ==================================================

    const ref =
      await adminDb
        .collection("articles")
        .add(articleData);


    // ==================================================
    // ARTICLE FOR GITHUB JSON
    // ==================================================

    const githubArticle = {

      id:
        ref.id,

      ...body,

      keywords,

      slug,

      author: {
        uid:
          user?.uid || "",

        name:
          user?.name || "",

        email:
          user?.email || "",

        role:
          user?.role || "",
      },

      createdAt:
        now,

      updatedAt:
        now,
    };


    // ==================================================
    // SYNC FIREBASE ARTICLE → GITHUB
    // ==================================================

    let githubSynced = false;

    try {

      await syncArticleCreate(
        githubArticle
      );

      githubSynced = true;

      console.log(
        "ARTICLE GITHUB SYNC SUCCESS:",
        ref.id
      );

    } catch (githubError) {

      console.error(
        "ARTICLE GITHUB SYNC FAILED:",
        githubError
      );

      /*
       * Firebase article already exists.
       *
       * We don't return 500 here because
       * the Firebase creation itself succeeded.
       */
    }


    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({

      success: true,

      id:
        ref.id,

      slug,

      githubSynced,

    });

  } catch (error: any) {

    console.error(
      "CREATE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to create article",
      },
      {
        status: 500,
      }
    );
  }
}


// ======================================================
// GET ARTICLES
// ======================================================

export async function GET() {

  try {

    const snapshot =
      await adminDb
        .collection("articles")
        .get();


    const articles =
      snapshot.docs.map(
        (doc) => ({

          id:
            doc.id,

          ...doc.data(),

        })
      );


    return NextResponse.json(
      articles
    );

  } catch (error: any) {

    console.error(
      "GET ARTICLES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Failed to fetch articles",
      },
      {
        status: 500,
      }
    );
  }
}