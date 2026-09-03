import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  commentsAdminAuth,
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

import { adminDb } from "@/lib/firebase/firebase-admin";

import { sendEmail } from "@/lib/email/gmail";

import {
  createCommentNotificationEmail,
} from "@/lib/email/comment-notification-template";

const ADMIN_EMAIL =
  "social.infiniabharatnews@gmail.com";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://infiniabharatnews.vercel.app";


// ==========================================
// VERIFY USER
// ==========================================

async function verifyUser(
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
    return await commentsAdminAuth.verifyIdToken(
      token
    );
  } catch (error) {
    console.error(
      "COMMENTS AUTH VERIFY ERROR:",
      error
    );

    return null;
  }
}


// ==========================================
// GET ARTICLE
// ==========================================

type ArticleData = {
  id: string;
  title?: string;
  thumbnail?: string;
  shortDescription?: string;
  seoDescription?: string;
  slug?: string;
};

async function getArticle(
  articleId: string,
  articleSlug: string
): Promise<ArticleData | null> {
  // First try article ID
  if (articleId) {
    const byId = await adminDb
      .collection("articles")
      .doc(articleId)
      .get();

    if (byId.exists) {
      return {
        id: byId.id,
        ...(byId.data() as Omit<ArticleData, "id">),
      };
    }
  }

  // Fallback: article slug
  if (articleSlug) {
    const bySlug = await adminDb
      .collection("articles")
      .where("slug", "==", articleSlug)
      .limit(1)
      .get();

    if (!bySlug.empty) {
      const doc = bySlug.docs[0];

      return {
        id: doc.id,
        ...(doc.data() as Omit<ArticleData, "id">),
      };
    }
  }

  return null;
}


// ==========================================
// POST
// ==========================================

export async function POST(
  request: NextRequest
) {
  try {

    // ======================================
    // AUTH
    // ======================================

    const user =
      await verifyUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }


    // ======================================
    // BODY
    // ======================================

    const body =
      await request.json();

    const commentId =
      String(body?.commentId || "").trim();

    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          message: "commentId is required.",
        },
        { status: 400 }
      );
    }


    // ======================================
    // GET COMMENT
    // ======================================

    const commentSnapshot =
      await commentsAdminDb
        .collection("comments")
        .doc(commentId)
        .get();

    if (!commentSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment not found.",
        },
        { status: 404 }
      );
    }

    const comment =
      commentSnapshot.data() || {};


    // ======================================
    // SECURITY
    // ======================================

    if (
      comment.userId !== user.uid
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }


    // ======================================
    // ONLY TOP LEVEL COMMENTS
    // ======================================

    if (comment.parentId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message:
          "Reply notifications are handled separately.",
      });
    }


    // ======================================
    // ARTICLE
    // ======================================

    const article =
      await getArticle(
        String(comment.articleId || ""),
        String(comment.articleSlug || "")
      );


    const articleTitle =
      String(
        article?.title ||
        "INFINIA BHARAT NEWS"
      );

    const articleThumbnail =
      String(
        article?.thumbnail || ""
      );

    const articleDescription =
      String(
        article?.shortDescription ||
        article?.seoDescription ||
        ""
      );

    const articleSlug =
      String(
        article?.slug ||
        comment.articleSlug ||
        ""
      );


    const articleUrl =
      `${SITE_URL}/news/${articleSlug}#comment-${commentId}`;


    // ======================================
    // EMAIL TEMPLATE
    // ======================================

    const email =
      createCommentNotificationEmail({
        type: "comment",

        articleTitle,

        articleDescription,

        articleThumbnail,

        articleUrl,

        senderName:
          String(
            comment.userName ||
            user.name ||
            "Reader"
          ),

        messageText:
          String(
            comment.text || ""
          ),
      });


    // ======================================
    // SEND EMAIL
    // ======================================

    await sendEmail({
      to: ADMIN_EMAIL,

      subject: email.subject,

      html: email.html,
    });


    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json({
      success: true,
      message:
        "Admin notification sent.",
    });

  } catch (error) {

    console.error(
      "NOTIFY ADMIN ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send notification.",
      },
      { status: 500 }
    );
  }
}