export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import {
  adminAuth,
  adminDb,
} from "@/lib/firebase/firebase-admin";

import {
  FieldValue,
} from "firebase-admin/firestore";


// ==========================================
// CREATE SLUG
// ==========================================

function createSlug(text: string) {

  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const now = new Date();

  const suffix =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  return `${base}-${suffix}`;
}


// ==========================================
// VERIFY ADMIN
// ==========================================

async function verifyAdmin(
  request: NextRequest
) {

  const authHeader =
    request.headers.get("authorization");

  if (!authHeader) {

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      ),
    };

  }


  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );


  const decoded =
    await adminAuth.verifyIdToken(
      token
    );


  const userDoc =
    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();


  if (!userDoc.exists) {

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      ),
    };

  }


  const user =
    userDoc.data();


  if (
    user?.role !== "admin" &&
    user?.role !== "editor" &&
    user?.role !== "superAdmin"
  ) {

    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        {
          status: 403,
        }
      ),
    };

  }


  return {
    decoded,
    user,
  };

}


// ==========================================
// GET USERS
// ==========================================

export async function GET(
  request: NextRequest
) {

  try {

    const auth =
      await verifyAdmin(
        request
      );


    if (auth.error) {
      return auth.error;
    }


    const snapshot =
      await adminDb
        .collection("users")
        .get();


    const users =
      snapshot.docs.map(
        (doc) => {

          const data =
            doc.data();


          return {

            id: doc.id,

            uid:
              data.uid ||
              doc.id,

            name:
              data.name ||
              "",

            email:
              data.email ||
              "",

            role:
              data.role ||
              "editor",

            status:
              data.status ||
              "active",

            createdAt:
              data.createdAt?.toDate
                ? data.createdAt
                    .toDate()
                    .toISOString()
                : undefined,

            updatedAt:
              data.updatedAt?.toDate
                ? data.updatedAt
                    .toDate()
                    .toISOString()
                : undefined,

          };

        }
      );


    return NextResponse.json(
      users,
      {
        status: 200,
      }
    );


  } catch (error: any) {

    console.error(
      "GET USERS ERROR:",
      error
    );


    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to fetch users",
      },
      {
        status: 500,
      }
    );

  }

}


// ==========================================
// CREATE ARTICLE
// ==========================================

export async function POST(
  request: NextRequest
) {

  try {

    const auth =
      await verifyAdmin(
        request
      );


    if (auth.error) {
      return auth.error;
    }


    const {
      decoded,
      user,
    } = auth;


    const body =
      await request.json();


    const slug =
      createSlug(
        body.seoTitle ||
        body.title
      );


    const ref =
      await adminDb
        .collection("articles")
        .add({

          title:
            body.title,

          categoryId:
            body.categoryId,

          thumbnail:
            body.thumbnail,

          shortDescription:
            body.shortDescription,

          content:
            body.content,

          seoTitle:
            body.seoTitle,

          seoDescription:
            body.seoDescription,

          slug,

          featured:
            body.featured ||
            false,

          breaking:
            body.breaking ||
            false,

          priority:
            body.priority ||
            0,

          status:
            body.status ||
            "draft",

          author: {

            uid:
              decoded.uid,

            name:
              user?.name ||
              "",

            email:
              user?.email ||
              "",

            role:
              user?.role ||
              "editor",

          },

          createdAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),

        });


    return NextResponse.json(
      {
        success: true,

        id:
          ref.id,

        slug,

      },
      {
        status: 201,
      }
    );


  } catch (error: any) {

    console.error(
      "POST ERROR:",
      error
    );


    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Something went wrong",
      },
      {
        status: 500,
      }
    );

  }

}