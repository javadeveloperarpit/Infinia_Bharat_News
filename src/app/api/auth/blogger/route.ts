import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      {
        success: false,
        message: "GOOGLE_CLIENT_ID is missing",
      },
      { status: 500 }
    );
  }

  const redirectUri =
    "http://localhost:3000/api/auth/blogger/callback";

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",

    scope:
      "https://www.googleapis.com/auth/blogger",

    access_type: "offline",

    prompt: "consent",
  });

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}