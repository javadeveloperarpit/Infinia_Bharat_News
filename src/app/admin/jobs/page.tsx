import JobsManager from "@/components/admin/jobs/jobs-manager";

export const dynamic = "force-dynamic";

export default function JobsAdminPage() {
  return (
    <div className="w-full min-w-0">
      <JobsManager />
    </div>
  );
}