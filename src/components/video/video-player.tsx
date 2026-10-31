
interface Props {
  youtubeUrl: string;
}

function getYouTubeVideoId(youtubeUrl: string): string | null {
  if (!youtubeUrl?.trim()) return null;

  try {
    const input = youtubeUrl.trim();

    const parsed = new URL(
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(input)
        ? input
        : `https://${input}`
    );

    const hostname = parsed.hostname.toLowerCase();

    const validHost =
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com") ||
      hostname === "youtube-nocookie.com" ||
      hostname.endsWith(".youtube-nocookie.com");

    if (!validHost) return null;

    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    } else {
      const segments = parsed.pathname.split("/").filter(Boolean);

      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v");
      } else if (
        ["shorts", "live", "embed", "v"].includes(segments[0])
      ) {
        videoId = segments[1] ?? null;
      }
    }

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)
      ? videoId
      : null;
  } catch {
    return null;
  }
}

export default function VideoPlayer({ youtubeUrl }: Props) {
  const videoId = getYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-zinc-950 text-white rounded-xl">
        <p className="text-sm text-zinc-400">
          यह वीडियो अभी उपलब्ध नहीं है।
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-black shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="INFINIA BHARAT NEWS Video Player"
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );
}
