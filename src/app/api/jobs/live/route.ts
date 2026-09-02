import { NextResponse } from "next/server";
import { collectAllLiveJobs } from "@/services/public/jobs.public.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await collectAllLiveJobs();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
  });
}
