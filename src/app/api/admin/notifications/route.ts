export const runtime = "nodejs";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import { verifyAdmin } from "@/lib/auth/verify-admin";

// ======================================================
// CLOUDFLARE PUSH WORKER
// ======================================================

const PUSH_API =
  "https://infinia-push.infiniabharatnews.workers.dev";

// ======================================================
// DEFAULT ASSETS
// ======================================================

const DEFAULT_ICON =
  "https://infiniabharatnews.vercel.app/loader.webp";

const DEFAULT_BADGE =
  "https://infiniabharatnews.vercel.app/loader.webp";

const DEFAULT_URL =
  "https://infiniabharatnews.vercel.app/";

// ======================================================
// NOTIFICATION TYPES
// ======================================================

const ALLOWED_TYPES = [
  "article",
  "breaking",
  "video",
  "custom",
  "card",
] as const;

type NotificationType =
  (typeof ALLOWED_TYPES)[number];

// ======================================================
// POST
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    // ==================================================
    // FIREBASE ADMIN AUTH
    // ==================================================

    const token =
      request.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "")
        .trim();

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    try {
      await verifyAdmin(token);
    } catch (error) {
      console.error(
        "NOTIFICATION ADMIN AUTH ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Admin access required.",
        },
        { status: 403 }
      );
    }

    // ==================================================
    // REQUEST BODY
    // ==================================================

    const body =
      await request.json();

    // ==================================================
    // TYPE
    // ==================================================

    const type =
      String(
        body?.type || "custom"
      ).trim() as NotificationType;

    if (
      !ALLOWED_TYPES.includes(type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid notification type.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // BASIC FIELDS
    // ==================================================

    const title =
      String(
        body?.title || ""
      ).trim();

    const message =
      String(
        body?.body || ""
      ).trim();

    const url =
      String(
        body?.url || ""
      ).trim();

    const image =
      String(
        body?.image || ""
      ).trim();

    const category =
      String(
        body?.category || ""
      ).trim();

    const tag =
      String(
        body?.tag ||
          `infinia-${type}-${Date.now()}`
      ).trim();

    const ctaText =
      String(
        body?.ctaText || ""
      ).trim();

    // ==================================================
    // CARD FIELDS
    // ==================================================

    const heading =
      String(
        body?.heading ||
          title
      ).trim();

    const description =
      String(
        body?.description ||
          message
      ).trim();

    // ==================================================
    // REQUIRED TITLE
    // ==================================================

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification title is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // REQUIRED BODY
    // ==================================================

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Notification message is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // TYPE-SPECIFIC VALIDATION
    // ==================================================

    if (
      type === "article" &&
      !category
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Article notification category is required.",
        },
        { status: 400 }
      );
    }

    if (
      type === "card" &&
      !ctaText
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Card notification CTA text is required.",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // SERVER-SIDE PUSH KEY
    // ==================================================

    const adminPushKey =
      process.env.ADMIN_PUSH_KEY;

    if (!adminPushKey) {
      console.error(
        "ADMIN_PUSH_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Push notification server configuration is missing.",
        },
        { status: 500 }
      );
    }

    // ==================================================
    // BUILD STRUCTURED PAYLOAD
    // ==================================================

    const payload = {
      type,

      title,

      body: message,

      // ----------------------------------------------
      // Navigation
      // ----------------------------------------------

      url:
        url ||
        DEFAULT_URL,

      // ----------------------------------------------
      // Browser notification assets
      // ----------------------------------------------

      icon:
        String(
          body?.icon || ""
        ).trim() ||
        DEFAULT_ICON,

      badge:
        String(
          body?.badge || ""
        ).trim() ||
        DEFAULT_BADGE,

      // ----------------------------------------------
      // Rich image
      // ----------------------------------------------

      image:
        image || "",

      // ----------------------------------------------
      // Classification
      // ----------------------------------------------

      category,

      tag,

      // ----------------------------------------------
      // CTA
      // ----------------------------------------------

      ctaText:

        ctaText ||

        (
          type === "article"
            ? "Read Story"
            : type === "video"
              ? "Watch Video"
              : type === "breaking"
                ? "Read Now"
                : "Open"
        ),

      // ----------------------------------------------
      // Structured Card
      // ----------------------------------------------

      heading,

      description,
    };

    // ==================================================
    // SEND TO CLOUDFLARE WORKER
    // ==================================================

    const pushResponse =
      await fetch(
        `${PUSH_API}/send`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${adminPushKey}`,
          },

          body:
            JSON.stringify(
              payload
            ),

          cache: "no-store",
        }
      );

    // ==================================================
    // WORKER RESPONSE
    // ==================================================

    let result: any;

    try {
      result =
        await pushResponse.json();
    } catch {
      result = {
        success: false,

        message:
          "Invalid response from push worker.",
      };
    }

    // ==================================================
    // WORKER ERROR
    // ==================================================

    if (
      !pushResponse.ok ||
      !result?.success
    ) {
      console.error(
        "PUSH WORKER ERROR:",
        result
      );

      return NextResponse.json(
        {
          success: false,

          message:
            result?.message ||
            "Notification sending failed.",
        },
        {
          status:
            pushResponse.status >= 400 &&
            pushResponse.status < 600
              ? pushResponse.status
              : 500,
        }
      );
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    return NextResponse.json({
      success: true,

      message:
        "Notification sent successfully.",

      type,

      total:
        result.total ?? 0,

      sent:
        result.sent ?? 0,

      failed:
        result.failed ?? 0,

      removed:
        result.removed ?? 0,
    });
  } catch (error) {
    console.error(
      "ADMIN NOTIFICATION API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}