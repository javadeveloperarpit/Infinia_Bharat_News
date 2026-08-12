import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GITHUB_ADS_URL =
  "https://raw.githubusercontent.com/javadeveloperarpit/Infinia_Bharat_News/main/public/data/ads.json";

export async function GET() {
  try {
    const response = await fetch(GITHUB_ADS_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `GitHub returned ${response.status}`
      );
    }

    const data = await response.json();

const ads = Array.isArray(data)
  ? data
  : Array.isArray(data?.ads)
    ? data.ads
    : [];

return NextResponse.json({
  success: true,
  ads,
});
  } catch (error: any) {
    console.error(
      "GitHub Ads GET Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to load ads from GitHub",
        ads: [],
      },
      {
        status: 500,
      }
    );
  }
}