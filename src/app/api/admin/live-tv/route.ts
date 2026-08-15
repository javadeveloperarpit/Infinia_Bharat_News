import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// ======================================================
// TYPES
// ======================================================

interface LiveTvChannel {
  id: string;
  title: string;
  youtubeUrl: string;
  enabled: boolean;
  order: number;
  logo?: string;
}

// ======================================================
// FILE PATH
// ======================================================

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "live-tv.json");

// ======================================================
// READ FILE SAFELY
// ======================================================

async function readLiveTv(): Promise<LiveTvChannel[]> {
  try {
    await fs.mkdir(DATA_DIR, {
      recursive: true,
    });

    let raw = "";

    try {
      raw = await fs.readFile(
        DATA_FILE,
        "utf-8"
      );
    } catch {
      // File doesn't exist.
      // Create it automatically.
      await fs.writeFile(
        DATA_FILE,
        "[]",
        "utf-8"
      );

      return [];
    }

    // Empty file = empty array
    if (!raw.trim()) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);

      // JSON must be an array
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as LiveTvChannel[];
    } catch {
      // Invalid JSON should not crash the app.
      return [];
    }
  } catch (error) {
    console.error(
      "Live TV JSON Read Error:",
      error
    );

    // Never crash because of an empty/broken file.
    return [];
  }
}

// ======================================================
// WRITE FILE SAFELY
// ======================================================

async function writeLiveTv(
  channels: LiveTvChannel[]
) {
  await fs.mkdir(DATA_DIR, {
    recursive: true,
  });

  await fs.writeFile(
    DATA_FILE,
    JSON.stringify(
      channels,
      null,
      2
    ),
    "utf-8"
  );
}

// ======================================================
// GET
// ======================================================

export async function GET() {
  try {
    const channels = await readLiveTv();

    const sorted = [...channels].sort(
      (a, b) =>
        Number(a.order ?? 0) -
        Number(b.order ?? 0)
    );

    return NextResponse.json(
      sorted,
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "Live TV GET Error:",
      error
    );

    // Always return an array.
    return NextResponse.json(
      [],
      {
        status: 200,
      }
    );
  }
}

// ======================================================
// POST
// ======================================================

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const channels =
      await readLiveTv();

    const newChannel: LiveTvChannel = {
      id: crypto.randomUUID(),

      title:
        String(
          body?.title ?? ""
        ).trim(),

      youtubeUrl:
        String(
          body?.youtubeUrl ?? ""
        ).trim(),

      enabled:
        body?.enabled === true,

      order:
        Number(
          body?.order ?? channels.length
        ) || 0,

      ...(body?.logo
        ? {
            logo: String(
              body.logo
            ),
          }
        : {}),
    };

    if (!newChannel.title) {
      return NextResponse.json(
        {
          message:
            "Channel title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!newChannel.youtubeUrl) {
      return NextResponse.json(
        {
          message:
            "YouTube URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    channels.push(
      newChannel
    );

    await writeLiveTv(
      channels
    );

    return NextResponse.json(
      newChannel,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Live TV POST Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to create Live TV channel.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// PUT
// ======================================================

export async function PUT(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const id =
      String(
        body?.id ?? ""
      ).trim();

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Channel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const channels =
      await readLiveTv();

    const index =
      channels.findIndex(
        (channel) =>
          channel.id === id
      );

    if (index === -1) {
      return NextResponse.json(
        {
          message:
            "Live TV channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    const existing =
      channels[index];

    const updated: LiveTvChannel = {
      ...existing,

      ...(body.title !== undefined
        ? {
            title:
              String(
                body.title
              ).trim(),
          }
        : {}),

      ...(body.youtubeUrl !==
      undefined
        ? {
            youtubeUrl:
              String(
                body.youtubeUrl
              ).trim(),
          }
        : {}),

      ...(body.enabled !==
      undefined
        ? {
            enabled:
              body.enabled === true,
          }
        : {}),

      ...(body.order !==
      undefined
        ? {
            order:
              Number(
                body.order
              ) || 0,
          }
        : {}),

      ...(body.logo !==
      undefined
        ? {
            logo:
              String(
                body.logo
              ),
          }
        : {}),
    };

    channels[index] =
      updated;

    await writeLiveTv(
      channels
    );

    return NextResponse.json(
      updated,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Live TV PUT Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update Live TV channel.",
      },
      {
        status: 500,
      }
    );
  }
}

// ======================================================
// DELETE
// ======================================================

export async function DELETE(
  request: NextRequest
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams
        .get("id")
        ?.trim();

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Channel ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const channels =
      await readLiveTv();

    const filtered =
      channels.filter(
        (channel) =>
          channel.id !== id
      );

    if (
      filtered.length ===
      channels.length
    ) {
      return NextResponse.json(
        {
          message:
            "Live TV channel not found.",
        },
        {
          status: 404,
        }
      );
    }

    await writeLiveTv(
      filtered
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Live TV DELETE Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete Live TV channel.",
      },
      {
        status: 500,
      }
    );
  }
}