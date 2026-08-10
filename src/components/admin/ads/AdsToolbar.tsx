"use client";

import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  AdPosition,
  AdType,
} from "./types";

export type AdsStatusFilter =
  | "all"
  | "active"
  | "inactive";

export interface AdsFilters {
  search: string;
  type: AdType | "all";
  position: AdPosition | "all";
  status: AdsStatusFilter;
}

interface AdsToolbarProps {
  filters: AdsFilters;

  onChange: (
    filters: AdsFilters
  ) => void;
}

export default function AdsToolbar({
  filters,
  onChange,
}: AdsToolbarProps) {
  function updateFilter(
    key: keyof AdsFilters,
    value: string
  ) {
    onChange({
      ...filters,
      [key]: value,
    } as AdsFilters);
  }

  function clearFilters() {
    onChange({
      search: "",
      type: "all",
      position: "all",
      status: "all",
    });
  }

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.position !== "all" ||
    filters.status !== "all";

  return (
    <section
      className="
        mb-5
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-3
        sm:p-4
      "
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          mb-3
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <div className="flex items-center gap-2">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-zinc-900
              text-zinc-400
            "
          >
            <SlidersHorizontal
              size={16}
            />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Advertisement Filters
            </h2>

            <p
              className="
                hidden
                text-xs
                text-zinc-600
                sm:block
              "
            >
              Search and filter advertisements
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="
              flex
              items-center
              gap-1.5
              rounded-lg
              px-2.5
              py-1.5
              text-xs
              font-medium
              text-zinc-400
              transition
              hover:bg-zinc-900
              hover:text-white
            "
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* ==================================================
          FILTER GRID
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        {/* SEARCH */}

        <div
          className="
            relative
            sm:col-span-2
            lg:col-span-1
          "
        >
          <Search
            size={17}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="text"
            value={filters.search}
            onChange={(event) =>
              updateFilter(
                "search",
                event.target.value
              )
            }
            placeholder="Search advertisements..."
            className="
              h-10
              w-full
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              pl-9
              pr-3
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-600
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            "
          />
        </div>

        {/* TYPE */}

        <div className="relative">
          <Filter
            size={15}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <select
            value={filters.type}
            onChange={(event) =>
              updateFilter(
                "type",
                event.target.value
              )
            }
            className="
              h-10
              w-full
              appearance-none
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              pl-9
              pr-8
              text-sm
              text-zinc-300
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            "
          >
            <option value="all">
              All Types
            </option>

            <option value="image">
              Image
            </option>

            <option value="video">
              Video
            </option>

            <option value="html">
              HTML
            </option>

            <option value="text">
              Text
            </option>

            <option value="cube">
              3D Cube
            </option>
          </select>
        </div>

        {/* POSITION */}

        <div className="relative">
          <Filter
            size={15}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <select
            value={filters.position}
            onChange={(event) =>
              updateFilter(
                "position",
                event.target.value
              )
            }
            className="
              h-10
              w-full
              appearance-none
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              pl-9
              pr-8
              text-sm
              text-zinc-300
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            "
          >
            <option value="all">
              All Positions
            </option>

            <option value="top">
              Top
            </option>

            <option value="header">
              Header
            </option>

            <option value="below-navbar">
              Below Navbar
            </option>

            <option value="between-articles">
              Between Articles
            </option>

            <option value="sidebar">
              Sidebar
            </option>

            <option value="article-top">
              Article Top
            </option>

            <option value="article-middle">
              Article Middle
            </option>

            <option value="article-bottom">
              Article Bottom
            </option>

            <option value="footer">
              Footer
            </option>

            <option value="popup">
              Popup
            </option>

            <option value="shorts">
              Shorts
            </option>
          </select>
        </div>

        {/* STATUS */}

        <div className="relative">
          <Filter
            size={15}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-zinc-500
            "
          />

          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter(
                "status",
                event.target.value
              )
            }
            className="
              h-10
              w-full
              appearance-none
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              pl-9
              pr-8
              text-sm
              text-zinc-300
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            "
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>
        </div>
      </div>
    </section>
  );
}