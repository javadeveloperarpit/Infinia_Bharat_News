import ReelsFeed from "@/components/reels/reels-feed";

import {
  getPublishedShorts,
} from "@/services/public/shorts.public.service";

interface ReelPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReelPage({
  params,
}: ReelPageProps) {
  const { id } = await params;

  const shorts =
    await getPublishedShorts();

  const startIndex =
    shorts.findIndex(
      (item) => item.id === id
    );

  if (startIndex < 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Reel not found
          </h1>

          <p className="mt-2 text-white/60">
            This reel does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-black">
      <ReelsFeed
        shorts={shorts}
        initialIndex={startIndex}
      />
    </main>
  );
}