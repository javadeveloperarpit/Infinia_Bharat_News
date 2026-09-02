import type { Metadata } from "next";
import JobsBrowser from "@/components/jobs/jobs-browser";
import { collectAllLiveJobs } from "@/services/public/jobs.public.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Jobs - Private, Government & Remote Jobs | Infinia Bharat News",
  description: "Find verified jobs in India, government vacancies, private company openings and remote jobs with direct source links and powerful filters.",
};

export default async function JobsPage() {
  const result = await collectAllLiveJobs();
  return <div className="w-full min-w-0 overflow-x-hidden"><JobsBrowser jobs={result.jobs} stats={result.stats} collectedAt={result.collectedAt} /></div>;
}
