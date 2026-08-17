import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  FieldValue,
} from "firebase-admin/firestore";

import {
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    console.log(
      "ADVERTISING INQUIRY:",
      body
    );

    const {
      name,
      company,
      email,
      phone,
      website,
      advertisingType,
      budget,
      message,
    } = body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    const inquiryRef =
      await commentsAdminDb
        .collection(
          "advertisingInquiries"
        )
        .add({
          name: name.trim(),

          company:
            company?.trim() || "",

          email:
            email.trim().toLowerCase(),

          phone:
            phone?.trim() || "",

          website:
            website?.trim() || "",

          advertisingType:
            advertisingType?.trim() || "",

          budget:
            budget?.trim() || "",

          message:
            message.trim(),

          status: "pending",

          source: "advertise-page",

          createdAt:
            FieldValue.serverTimestamp(),

          updatedAt:
            FieldValue.serverTimestamp(),
        });

    console.log(
      "ADVERTISING INQUIRY SAVED:",
      inquiryRef.id
    );

    return NextResponse.json(
      {
        success: true,
        id: inquiryRef.id,
        message:
          "Advertising inquiry submitted successfully.",
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(
      "ADVERTISING INQUIRY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to save advertising inquiry.",
      },
      {
        status: 500,
      }
    );
  }
}