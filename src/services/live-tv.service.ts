// ======================================================
// TYPES
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
// GET LIVE TV
// ======================================================

export async function getLiveTv(): Promise<
  LiveTvChannel[]
> {
  try {
    const response =
      await fetch(
        "/api/live-tv",
        {
          method: "GET",
          cache: "no-store",
        }
      );

    if (!response.ok) {
      console.error(
        "Live TV API Error:",
        response.status
      );

      return [];
    }

    const data =
      await response.json();

    // Empty / invalid response = []
    if (!Array.isArray(data)) {
      return [];
    }

    return data as LiveTvChannel[];
  } catch (error) {
    console.error(
      "getLiveTv Error:",
      error
    );

    // IMPORTANT:
    // Never crash page when JSON is empty.
    return [];
  }
}

// ======================================================
// CREATE
// ======================================================

export async function createLiveTv(
  data: Omit<
    LiveTvChannel,
    "id"
  >
) {
  const response =
    await fetch(
      "/api/live-tv",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          data
        ),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to create Live TV channel."
    );
  }

  return result;
}

// ======================================================
// UPDATE
// ======================================================

export async function updateLiveTv(
  id: string,
  data: Partial<
    Omit<
      LiveTvChannel,
      "id"
    >
  >
) {
  const response =
    await fetch(
      "/api/live-tv",
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          id,
          ...data,
        }),
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to update Live TV channel."
    );
  }

  return result;
}

// ======================================================
// DELETE
// ======================================================

export async function deleteLiveTv(
  id: string
) {
  const response =
    await fetch(
      `/api/live-tv?id=${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",
      }
    );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Failed to delete Live TV channel."
    );
  }

  return result;
}

// ======================================================
// TOGGLE
// ======================================================

export async function toggleLiveTv(
  id: string,
  enabled: boolean
) {
  return updateLiveTv(
    id,
    {
      enabled,
    }
  );
}