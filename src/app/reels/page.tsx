import { getPublishedShorts } from "@/services/public/shorts.public.service";

import ReelsFeed from "@/components/reels/reels-feed";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const shorts =
    await getPublishedShorts();

  return (
    <main className="h-[100dvh] bg-black">
      <ReelsFeed shorts={shorts} />
    </main>
  );
}