import {
  getCollection,
  setDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firebase/firestore";

export interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

const COLLECTION_NAME = "liveTv";

// ======================================================
// GET
// ======================================================

export async function getLiveTv(): Promise<
  LiveTvChannel[]
> {
  try {
    const data =
      await getCollection(
        COLLECTION_NAME
      );

    return (data as LiveTvChannel[]).sort(
      (a, b) =>
        Number(a.order ?? 0) -
        Number(b.order ?? 0)
    );
  } catch (error) {
    console.error(
      "Firebase Live TV GET Error:",
      error
    );

    throw error;
  }
}

// ======================================================
// SYNC GITHUB
// ======================================================

async function syncLiveTvToGitHub() {
  const response =
    await fetch(
      "/api/admin/live-tv/sync",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "GitHub Live TV sync failed."
    );
  }

  return data;
}

// ======================================================
// CREATE
// ======================================================

export async function createLiveTv(
  channel: Omit<
    LiveTvChannel,
    "id"
  >
) {
  try {
    const id =
      crypto.randomUUID();

    const data: LiveTvChannel = {
      id,

      title:
        channel.title.trim(),

      youtubeUrl:
        channel.youtubeUrl.trim(),

      enabled:
        channel.enabled !== false,

      order:
        Number(
          channel.order ?? 0
        ),

      ...(channel.logo
        ? {
            logo:
              channel.logo,
          }
        : {}),
    };

    await setDocument(
      COLLECTION_NAME,
      id,
      data
    );

    await syncLiveTvToGitHub();

    return data;
  } catch (error) {
    console.error(
      "Live TV CREATE Error:",
      error
    );

    throw error;
  }
}

// ======================================================
// UPDATE
// ======================================================

export async function updateLiveTv(
  id: string,
  channel: Partial<
    LiveTvChannel
  >
) {
  try {
    const updateData: Partial<
      LiveTvChannel
    > = {
      ...channel,
    };

    delete updateData.id;

    if (
      updateData.title !==
      undefined
    ) {
      updateData.title =
        updateData.title.trim();
    }

    if (
      updateData.youtubeUrl !==
      undefined
    ) {
      updateData.youtubeUrl =
        updateData.youtubeUrl.trim();
    }

    if (
      updateData.order !==
      undefined
    ) {
      updateData.order =
        Number(
          updateData.order
        );
    }

    await updateDocument(
      COLLECTION_NAME,
      id,
      updateData
    );

    await syncLiveTvToGitHub();

    return {
      id,
      ...updateData,
    };
  } catch (error) {
    console.error(
      "Live TV UPDATE Error:",
      error
    );

    throw error;
  }
}

// ======================================================
// DELETE
// ======================================================

export async function deleteLiveTv(
  id: string
) {
  try {
    await deleteDocument(
      COLLECTION_NAME,
      id
    );

    await syncLiveTvToGitHub();

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "Live TV DELETE Error:",
      error
    );

    throw error;
  }
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
