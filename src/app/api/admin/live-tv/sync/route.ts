import { NextResponse } from "next/server";

import {
  syncLiveTvToGithub,
} from "@/lib/github/live-tv-sync";

export async function POST() {
  try {
    const result =
      await syncLiveTvToGithub();

    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Live TV GitHub Sync Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Failed to sync Live TV to GitHub.",
      },
      {
        status: 500,
      }
    );
  }
}