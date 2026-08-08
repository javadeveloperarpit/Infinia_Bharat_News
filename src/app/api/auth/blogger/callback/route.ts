import { NextRequest } from "next/server";

export const runtime = "nodejs";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET;

export async function GET(
  request: NextRequest
) {
  try {
    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET
    ) {
      return new Response(
        "Google OAuth credentials are missing.",
        {
          status: 500,
        }
      );
    }

    const code =
      request.nextUrl.searchParams.get(
        "code"
      );

    const error =
      request.nextUrl.searchParams.get(
        "error"
      );

    if (error) {
      return new Response(
        `Google OAuth Error: ${error}`,
        {
          status: 400,
        }
      );
    }

    if (!code) {
      return new Response(
        "Authorization code missing.",
        {
          status: 400,
        }
      );
    }

    const redirectUri =
      "http://localhost:3000/api/auth/blogger/callback";

    const tokenResponse =
      await fetch(
        "https://oauth2.googleapis.com/token",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            new URLSearchParams({
              code,
              client_id:
                GOOGLE_CLIENT_ID,
              client_secret:
                GOOGLE_CLIENT_SECRET,
              redirect_uri:
                redirectUri,
              grant_type:
                "authorization_code",
            }).toString(),
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error(
        "Google Token Error:",
        tokenData
      );

      return new Response(
        `Token exchange failed: ${
          tokenData?.error_description ||
          tokenData?.error ||
          "Unknown error"
        }`,
        {
          status: 500,
        }
      );
    }

    const {
      access_token,
      refresh_token,
      expires_in,
      scope,
    } = tokenData;

    console.log(
      "================ BLOGGER OAUTH ================"
    );

    console.log(
      "ACCESS TOKEN:",
      access_token
    );

    console.log(
      "REFRESH TOKEN:",
      refresh_token
    );

    console.log(
      "EXPIRES IN:",
      expires_in
    );

    console.log(
      "SCOPE:",
      scope
    );

    console.log(
      "================================================"
    );

    if (!refresh_token) {
      return new Response(
        `
        <h1>OAuth completed, but no refresh token received.</h1>

        <p>
          Check the terminal.
        </p>

        <p>
          Try authorization again with prompt=consent.
        </p>
        `,
        {
          status: 400,
          headers: {
            "Content-Type":
              "text/html",
          },
        }
      );
    }

    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blogger Connected</title>
        </head>

        <body
          style="
            font-family: Arial;
            padding: 40px;
            background: #f4f4f5;
          "
        >
          <h1>
            ✅ Blogger OAuth Successful
          </h1>

          <p>
            Authorization successful.
          </p>

          <p>
            Your refresh token has been printed
            in the Next.js server terminal.
          </p>

          <p>
            Do not share that token with anyone.
          </p>
        </body>
      </html>
      `,
      {
        headers: {
          "Content-Type":
            "text/html",
        },
      }
    );
  } catch (error) {
    console.error(
      "Blogger OAuth Callback Error:",
      error
    );

    return new Response(
      "Blogger OAuth callback failed.",
      {
        status: 500,
      }
    );
  }
}