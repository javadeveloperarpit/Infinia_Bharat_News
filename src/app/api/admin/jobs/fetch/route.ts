import { NextRequest, NextResponse } from "next/server";

import {
  commentsAdminAuth,
} from "@/lib/firebase/firebase-comments-admin";

import {
  collectAllLiveJobs,
} from "@/services/public/jobs.public.service";

async function verifyAdmin(
  request: NextRequest
) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token =
    authorization
      .slice("Bearer ".length)
      .trim();

  if (!token) {
    throw new Error("Unauthorized");
  }

  return commentsAdminAuth.verifyIdToken(
    token
  );
}

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    await verifyAdmin(request);

    /*
     * IMPORTANT:
     * This uses the existing public Jobs collector.
     * We are NOT changing the public /jobs page or
     * jobs.public.service.ts.
     *
     * Generate is an explicit admin action, so the
     * live collection happens only when admin asks
     * for latest jobs.
     */

    const result =
      await collectAllLiveJobs();

    const jobs = Array.isArray(result?.jobs)
      ? result.jobs
      : [];

    return NextResponse.json({
      success: true,

      jobs,

      stats: result?.stats ?? {
        total: jobs.length,
        private: jobs.filter(
          (job) => job.type === "private"
        ).length,
        remote: jobs.filter(
          (job) => job.type === "remote"
        ).length,
        government: jobs.filter(
          (job) => job.type === "government"
        ).length,
      },

      collectedAt:
        result?.collectedAt ??
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[ADMIN JOBS FETCH]",
      error
    );

    if (
      error instanceof Error &&
      error.message === "Unauthorized"
    ) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to generate latest jobs.",
      500
    );
  }
}