"use client";

import {
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
} from "lucide-react";

interface AdsHeaderProps {
  onCreate: () => void;

  onRefresh?: () => void | Promise<void>;

  loading?: boolean;
}

export default function AdsHeader({
  onCreate,
  onRefresh,
  loading = false,
}: AdsHeaderProps) {
  return (
    <header
      className="
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        sm:p-5
      "
    >
      {/* ==================================================
          TITLE
      ================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
        "
      >
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-red-600/10
            text-red-500
          "
        >
          <Megaphone
            size={23}
            strokeWidth={2}
          />
        </div>

        <div className="min-w-0">
          <h1
            className="
              truncate
              text-xl
              font-bold
              tracking-tight
              text-white
              sm:text-2xl
            "
          >
            Advertisement Manager
          </h1>

          <p
            className="
              mt-0.5
              truncate
              text-xs
              text-zinc-500
              sm:text-sm
            "
          >
            Create, manage and monitor
            website advertisements
          </p>
        </div>
      </div>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div
        className="
          flex
          w-full
          flex-col
          gap-2
          sm:w-auto
          sm:flex-row
        "
      >
        {/* REFRESH */}

        {onRefresh && (
          <button
            type="button"
            onClick={() => void onRefresh()}
            disabled={loading}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              px-4
              py-2.5
              text-sm
              font-semibold
              text-zinc-300
              transition
              hover:border-zinc-700
              hover:bg-zinc-800
              hover:text-white
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
              sm:w-auto
            "
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={16} />
            )}

            <span>
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>
        )}

        {/* CREATE */}

        <button
          type="button"
          onClick={onCreate}
          disabled={loading}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-600
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-red-950/20
            transition
            hover:bg-red-500
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:w-auto
          "
        >
          <Plus
            size={18}
            strokeWidth={2.5}
          />

          <span>
            Create Advertisement
          </span>
        </button>
      </div>
    </header>
  );
}