"use client";

import {
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleOff,
  Code2,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers3,
  MousePointerClick,
  Pencil,
  Play,
  Trash2,
  Video,
} from "lucide-react";

import type {
  AdsData,
} from "./types";

// ======================================================
// PROPS
// ======================================================

interface AdCardProps {
  ad: AdsData;

  onEdit: (
    ad: AdsData
  ) => void;

  onDelete: (
    id: string
  ) => void | Promise<void>;

  onToggle: (
    id: string,
    active: boolean
  ) => void | Promise<void>;

  deleting?: boolean;
}

// ======================================================
// TYPE LABEL
// ======================================================

function getTypeLabel(
  type: AdsData["type"]
): string {
  switch (type) {
    case "image":
      return "Image";

    case "video":
      return "Video";

    case "html":
      return "HTML";

    case "text":
      return "Text";

    case "cube":
      return "3D Cube";

    default:
      return "Advertisement";
  }
}

// ======================================================
// TYPE ICON
// ======================================================

function getTypeIcon(
  type: AdsData["type"]
) {
  switch (type) {
    case "image":
      return (
        <ImageIcon size={14} />
      );

    case "video":
      return (
        <Video size={14} />
      );

    case "html":
      return (
        <Code2 size={14} />
      );

    case "text":
      return (
        <FileText size={14} />
      );

    case "cube":
      return (
        <Layers3 size={14} />
      );

    default:
      return (
        <BarChart3 size={14} />
      );
  }
}

// ======================================================
// POSITION LABEL
// ======================================================

function formatPosition(
  position: string
): string {
  return position
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1)
    )
    .join(" ");
}

// ======================================================
// NUMBER FORMAT
// ======================================================

function formatNumber(
  value: number
): string {
  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(1)}K`;
  }

  return value.toLocaleString();
}

// ======================================================
// PREVIEW
// ======================================================

function AdPreview({
  ad,
}: {
  ad: AdsData;
}) {
  // ====================================================
  // IMAGE
  // ====================================================

  if (
    ad.type === "image" &&
    ad.imageUrl
  ) {
    return (
      <div className="absolute inset-0 bg-zinc-900">
        <img
          src={ad.imageUrl}
          alt={ad.name}
          className="
            h-full
            w-full
            object-cover
          "
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/40
            via-transparent
            to-transparent
          "
        />
      </div>
    );
  }

  // ====================================================
  // VIDEO
  // ====================================================

  if (
    ad.type === "video" &&
    ad.videoUrl
  ) {
    const isYouTube =
      ad.videoType ===
      "youtube";

    if (isYouTube) {
      return (
        <div className="absolute inset-0 bg-black">
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-zinc-900
            "
          >
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-red-600
                text-white
                shadow-xl
              "
            >
              <Play
                size={23}
                fill="currentColor"
                className="ml-0.5"
              />
            </div>
          </div>

          <div
            className="
              absolute
              bottom-3
              left-3
              rounded-lg
              bg-black/70
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-white
              backdrop-blur
            "
          >
            YouTube Video
          </div>
        </div>
      );
    }

    return (
      <div className="absolute inset-0 bg-black">
        <video
          src={ad.videoUrl}
          muted
          playsInline
          preload="metadata"
          className="
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-black/10
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-black/60
              text-white
              backdrop-blur
            "
          >
            <Play
              size={20}
              fill="currentColor"
              className="ml-0.5"
            />
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // HTML
  // ====================================================

  if (ad.type === "html") {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-zinc-900
          p-4
        "
      >
        <div
          className="
            max-h-full
            max-w-full
            overflow-hidden
            rounded-xl
            border
            border-zinc-700
            bg-white
            p-4
            text-black
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-bold
              text-zinc-700
            "
          >
            <Code2 size={15} />

            HTML Advertisement
          </div>

          <div
            className="
              mt-2
              line-clamp-3
              text-xs
              text-zinc-500
            "
          >
            {ad.htmlCode ||
              "HTML content"}
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // TEXT
  // ====================================================

  if (ad.type === "text") {
    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          bg-gradient-to-br
          from-red-950
          via-zinc-950
          to-black
          p-6
        "
      >
        <div
          className="
            max-w-[90%]
            text-center
          "
        >
          <FileText
            size={24}
            className="
              mx-auto
              mb-3
              text-red-400
            "
          />

          <p
            className="
              line-clamp-3
              text-sm
              font-semibold
              leading-6
              text-white
            "
          >
            {ad.text ||
              "Text Advertisement"}
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // CUBE
  // ====================================================

  if (ad.type === "cube") {
    const cubeImage =
      ad.cubeFaces?.front
        ?.imageUrl;

    return (
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          overflow-hidden
          bg-zinc-950
        "
      >
        {cubeImage ? (
          <img
            src={cubeImage}
            alt={`${ad.name} cube`}
            className="
              h-full
              w-full
              object-cover
            "
            loading="lazy"
          />
        ) : (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <Layers3
              size={38}
              className="
                text-red-400
              "
            />

            <p
              className="
                mt-2
                text-xs
                font-semibold
                text-white
              "
            >
              3D Cube
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-zinc-500
              "
            >
              Y-Axis Rotation
            </p>
          </div>
        )}
      </div>
    );
  }

  // ====================================================
  // FALLBACK
  // ====================================================

  return (
    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-zinc-900
        text-zinc-600
      "
    >
      <ImageIcon size={30} />
    </div>
  );
}

// ======================================================
// COMPONENT
// ======================================================

export default function AdCard({
  ad,
  onEdit,
  onDelete,
  onToggle,
  deleting = false,
}: AdCardProps) {
  const impressions =
    Number(
      ad.impressions ?? 0
    );

  const clicks =
    Number(
      ad.clicks ?? 0
    );

  const ctr =
    impressions > 0
      ? (clicks /
          impressions) *
        100
      : 0;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        transition
        duration-200
        hover:border-zinc-700
        hover:shadow-2xl
        hover:shadow-black/20
      "
    >
      {/* ==================================================
          PREVIEW
      ================================================== */}

      <div
        className="
          relative
          aspect-[16/8]
          overflow-hidden
          bg-zinc-900
        "
      >
        <AdPreview ad={ad} />

        {/* STATUS */}

        <div
          className="
            absolute
            left-3
            top-3
            z-10
          "
        >
          <div
            className={`
              flex
              items-center
              gap-1.5
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              backdrop-blur-md
              ${
                ad.active
                  ? `
                    border-emerald-500/20
                    bg-emerald-500/15
                    text-emerald-400
                  `
                  : `
                    border-zinc-600
                    bg-black/50
                    text-zinc-400
                  `
              }
            `}
          >
            {ad.active ? (
              <CheckCircle2
                size={12}
              />
            ) : (
              <CircleOff
                size={12}
              />
            )}

            {ad.active
              ? "Active"
              : "Inactive"}
          </div>
        </div>

        {/* TYPE */}

        <div
          className="
            absolute
            right-3
            top-3
            z-10
          "
        >
          <div
            className="
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/10
              bg-black/60
              px-2.5
              py-1
              text-[10px]
              font-semibold
              text-white
              backdrop-blur-md
            "
          >
            {getTypeIcon(
              ad.type
            )}

            {getTypeLabel(
              ad.type
            )}
          </div>
        </div>

        {/* PRIORITY */}

        <div
          className="
            absolute
            bottom-3
            left-3
            z-10
            rounded-lg
            border
            border-white/10
            bg-black/60
            px-2
            py-1
            text-[10px]
            font-semibold
            text-zinc-300
            backdrop-blur-md
          "
        >
          Priority{" "}
          <span className="text-white">
            {ad.priority}
          </span>
        </div>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="p-4">
        {/* NAME */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-3
          "
        >
          <div className="min-w-0">
            <h3
              className="
                truncate
                text-sm
                font-bold
                text-white
              "
              title={ad.name}
            >
              {ad.name}
            </h3>

            <div
              className="
                mt-1
                flex
                items-center
                gap-1.5
                text-[11px]
                text-zinc-500
              "
            >
              <span>
                {formatPosition(
                  ad.position
                )}
              </span>

              <span>
                •
              </span>

              <span>
                {ad.frequency}
              </span>
            </div>
          </div>

          {ad.targetUrl && (
            <a
              href={ad.targetUrl}
              target={
                ad.openInNewTab
                  ? "_blank"
                  : undefined
              }
              rel={
                ad.openInNewTab
                  ? "noopener noreferrer"
                  : undefined
              }
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
              aria-label="Open advertisement link"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-zinc-800
                text-zinc-500
                transition
                hover:border-zinc-700
                hover:bg-zinc-900
                hover:text-white
              "
            >
              <ExternalLink
                size={14}
              />
            </a>
          )}
        </div>

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-3
            overflow-hidden
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/50
          "
        >
          {/* IMPRESSIONS */}

          <div
            className="
              border-r
              border-zinc-800
              p-2.5
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
                text-zinc-500
              "
            >
              <Eye size={12} />

              <span
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-wide
                "
              >
                Views
              </span>
            </div>

            <p
              className="
                mt-1
                text-xs
                font-bold
                text-white
              "
            >
              {formatNumber(
                impressions
              )}
            </p>
          </div>

          {/* CLICKS */}

          <div
            className="
              border-r
              border-zinc-800
              p-2.5
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
                text-zinc-500
              "
            >
              <MousePointerClick
                size={12}
              />

              <span
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-wide
                "
              >
                Clicks
              </span>
            </div>

            <p
              className="
                mt-1
                text-xs
                font-bold
                text-white
              "
            >
              {formatNumber(
                clicks
              )}
            </p>
          </div>

          {/* CTR */}

          <div className="p-2.5">
            <div
              className="
                flex
                items-center
                gap-1.5
                text-zinc-500
              "
            >
              <BarChart3
                size={12}
              />

              <span
                className="
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-wide
                "
              >
                CTR
              </span>
            </div>

            <p
              className="
                mt-1
                text-xs
                font-bold
                text-white
              "
            >
              {ctr.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <div
          className="
            mt-4
            grid
            grid-cols-2
            gap-2
          "
        >
          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              onEdit(ad)
            }
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              text-xs
              font-semibold
              text-zinc-300
              transition
              hover:border-zinc-700
              hover:bg-zinc-800
              hover:text-white
            "
          >
            <Pencil
              size={14}
            />

            Edit
          </button>

          {/* DELETE */}

          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              onDelete(ad.id)
            }
            className="
              flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-xl
              border
              border-red-500/10
              bg-red-500/5
              text-xs
              font-semibold
              text-red-400
              transition
              hover:border-red-500/20
              hover:bg-red-500/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Trash2
              size={14}
            />

            {deleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>

        {/* ==================================================
            ACTIVE TOGGLE
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            onToggle(
              ad.id,
              !ad.active
            )
          }
          className="
            mt-2
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-zinc-800
            bg-zinc-900/40
            px-3
            py-2.5
            text-left
            transition
            hover:bg-zinc-900
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <span
              className={`
                h-2
                w-2
                shrink-0
                rounded-full
                ${
                  ad.active
                    ? "bg-emerald-400"
                    : "bg-zinc-600"
                }
              `}
            />

            <span
              className="
                text-[11px]
                font-medium
                text-zinc-400
              "
            >
              Advertisement is{" "}
              <span className="text-zinc-200">
                {ad.active
                  ? "enabled"
                  : "disabled"}
              </span>
            </span>
          </div>

          <ChevronRight
            size={14}
            className="
              shrink-0
              text-zinc-600
            "
          />
        </button>
      </div>
    </article>
  );
}