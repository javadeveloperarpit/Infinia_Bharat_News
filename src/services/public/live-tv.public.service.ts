// ======================================================
// PUBLIC LIVE TV SERVICE
// ======================================================

export interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

// ======================================================
// GET PUBLIC LIVE TV
// ======================================================

export async function getPublicLiveTv(): Promise<
  LiveTvChannel[]
> {
  try {
    const response = await fetch(
      "/data/live-tv.json",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Public Live TV JSON Error:",
        response.status
      );

      return [];
    }

    const data =
      await response.json();

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (channel): channel is LiveTvChannel =>
          channel &&
          typeof channel === "object" &&
          typeof channel.id === "string" &&
          typeof channel.title === "string" &&
          typeof channel.youtubeUrl === "string" &&
          channel.enabled === true
      )
      .sort(
        (a, b) =>
          Number(a.order ?? 0) -
          Number(b.order ?? 0)
      );
  } catch (error) {
    console.error(
      "Public Live TV Error:",
      error
    );

    return [];
  }
}