"use client";

import {
  Megaphone,
  Plus,
  RefreshCw,
} from "lucide-react";

import AdCard from "./AdCard";
import type { AdsData } from "./types";

interface AdGridProps {
  ads: AdsData[];

  loading?: boolean;

  deletingId?: string | null;

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

  onCreate?: () => void;

  onRefresh?: () => void | Promise<void>;
}

// ======================================================
// SKELETON
// ======================================================

function AdCardSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
      "
    >
      {/* PREVIEW */}

      <div
        className="
          aspect-[16/7]
          animate-pulse
          bg-zinc-900
        "
      />

      {/* CONTENT */}

      <div className="space-y-4 p-4">
        <div
          className="
            h-4
            w-2/3
            animate-pulse
            rounded
            bg-zinc-800
          "
        />

        <div
          className="
            h-3
            w-1/3
            animate-pulse
            rounded
            bg-zinc-800
          "
        />

        <div
          className="
            grid
            grid-cols-2
            gap-2
          "
        >
          <div
            className="
              h-14
              animate-pulse
              rounded-xl
              bg-zinc-900
            "
          />

          <div
            className="
              h-14
              animate-pulse
              rounded-xl
              bg-zinc-900
            "
          />
        </div>

        <div
          className="
            h-10
            animate-pulse
            rounded-xl
            bg-zinc-900
          "
        />
      </div>
    </div>
  );
}

// ======================================================
// COMPONENT
// ======================================================

export default function AdGrid({
  ads,
  loading = false,
  deletingId = null,
  onEdit,
  onDelete,
  onToggle,
  onCreate,
  onRefresh,
}: AdGridProps) {
  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
        "
      >
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <AdCardSkeleton
            key={index}
          />
        ))}
      </div>
    );
  }

  // ====================================================
  // EMPTY
  // ====================================================

  if (ads.length === 0) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          justify-center
          rounded-2xl
          border
          border-dashed
          border-zinc-800
          bg-zinc-950/60
          px-6
          text-center
        "
      >
        <div
          className="
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-red-500/10
            text-red-400
          "
        >
          <Megaphone
            size={30}
            strokeWidth={1.7}
          />
        </div>

        <h3
          className="
            mt-5
            text-lg
            font-bold
            text-white
          "
        >
          No advertisements yet
        </h3>

        <p
          className="
            mt-2
            max-w-md
            text-sm
            leading-6
            text-zinc-500
          "
        >
          Create your first advertisement
          to start managing banners, videos,
          HTML ads, text ads and 3D cube
          advertisements.
        </p>

        {onCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="
              mt-6
              flex
              items-center
              gap-2
              rounded-xl
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-500
              active:scale-[0.98]
            "
          >
            <Plus size={17} />

            Create Advertisement
          </button>
        )}
      </div>
    );
  }

  // ====================================================
  // GRID
  // ====================================================

  return (
    <div className="space-y-5">
      {/* ==================================================
          GRID TOOLBAR
      ================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              font-semibold
              text-white
            "
          >
            {ads.length}{" "}
            {ads.length === 1
              ? "Advertisement"
              : "Advertisements"}
          </p>

          <p
            className="
              mt-0.5
              text-xs
              text-zinc-500
            "
          >
            Manage and monitor your
            advertisements.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900
                px-3
                py-2
                text-xs
                font-semibold
                text-zinc-300
                transition
                hover:border-zinc-700
                hover:bg-zinc-800
              "
            >
              <RefreshCw
                size={14}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>
          )}

          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-red-600
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-red-500
                active:scale-[0.98]
              "
            >
              <Plus size={15} />

              <span>
                New Ad
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================
          CARDS
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
        "
      >
        {ads.map((ad) => (
          <AdCard
            key={ad.id}
            ad={ad}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            deleting={
              deletingId === ad.id
            }
          />
        ))}
      </div>
    </div>
  );
}