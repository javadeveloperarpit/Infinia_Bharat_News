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

    const replyId =
      String(body?.replyId || "").trim();

    const parentId =
      String(body?.parentId || "").trim();

    if (!replyId || !parentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "replyId and parentId are required.",
        },
        { status: 400 }
      );
    }


    // ======================================
    // GET PARENT
    // ======================================

    const parentSnapshot =
      await commentsAdminDb
        .collection("comments")
        .doc(parentId)
        .get();

    if (!parentSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Parent comment not found.",
        },
        { status: 404 }
      );
    }

    const parent =
      parentSnapshot.data() || {};


    // ======================================
    // SELF REPLY
    // ======================================

    if (
      parent.userId === user.uid
    ) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message:
          "No notification required for self reply.",
      });
    }


    // ======================================
    // GET REPLY
    // ======================================

    const replySnapshot =
      await commentsAdminDb
        .collection("comments")
        .doc(replyId)
        .get();

    if (!replySnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Reply not found.",
        },
        { status: 404 }
      );
    }

    const reply =
      replySnapshot.data() || {};


    // ======================================
    // SECURITY
    // ======================================

    if (
      reply.userId !== user.uid
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden.",
        },
        { status: 403 }
      );
    }


    if (
      reply.parentId !== parentId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Reply does not belong to this comment.",
        },
        { status: 400 }
      );
    }


    // ======================================
    // TARGET USER EMAIL
    // ======================================

    const targetUser =
      await commentsAdminAuth.getUser(
        String(parent.userId)
      );

    const targetEmail =
      targetUser.email;

    if (!targetEmail) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message:
          "Target user does not have an email.",
      });
    }


    // ======================================
    // ARTICLE
    // ======================================

    const article =
      await getArticle(
        String(
          reply.articleId ||
          parent.articleId ||
          ""
        ),

        String(
          reply.articleSlug ||
          parent.articleSlug ||
          ""
        )
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
        reply.articleSlug ||
        parent.articleSlug ||
        ""
      );


    // ======================================
    // LINK
    // ======================================

    const articleUrl =
      `${SITE_URL}/news/${articleSlug}#comment-${parentId}`;


    // ======================================
    // EMAIL
    // ======================================

    const email =
      createCommentNotificationEmail({
        type: "reply",

        articleTitle,

        articleDescription,

        articleThumbnail,

        articleUrl,

        senderName:
          String(
            reply.userName ||
            user.name ||
            "Reader"
          ),

        messageText:
          String(
            reply.text || ""
          ),

        originalComment:
          String(
            parent.text || ""
          ),
      });


    // ======================================
    // SEND
    // ======================================

    await sendEmail({
      to: targetEmail,

      subject: email.subject,

      html: email.html,
    });


    // ======================================
    // SUCCESS
    // ======================================

    return NextResponse.json({
      success: true,
      message:
        "Reply notification sent.",
    });

  } catch (error) {

    console.error(
      "NOTIFY REPLY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send reply notification.",
      },
      { status: 500 }
    );
  }
}