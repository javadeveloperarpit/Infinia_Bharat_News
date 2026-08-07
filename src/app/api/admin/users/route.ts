export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
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

    const token = authHeader.replace("Bearer ", "");

    const decoded = await adminAuth.verifyIdToken(token);

    const userDoc = await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const user = userDoc.data();

    if (
      user?.role !== "admin" &&
      user?.role !== "editor" &&
      user?.role !== "superAdmin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Permission denied",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const slug = createSlug(
      body.seoTitle || body.title
    );

    const ref = await adminDb
      .collection("articles")
      .add({

        title: body.title,

        categoryId: body.categoryId,

        thumbnail: body.thumbnail,

        shortDescription: body.shortDescription,

        content: body.content,

        seoTitle: body.seoTitle,

        seoDescription: body.seoDescription,

        slug,

        featured: body.featured || false,

        breaking: body.breaking || false,

        priority: body.priority || 0,

        status: body.status || "draft",

        author: {
          uid: decoded.uid,
          name: user?.name || "",
          email: user?.email || "",
          role: user?.role || "editor",
        },

        createdAt: FieldValue.serverTimestamp(),

        updatedAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({
      success: true,
      id: ref.id,
      slug,
    });
  } catch (error: any) {
    console.error(error);

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