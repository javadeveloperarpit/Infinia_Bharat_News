"use client";

import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  ArrowUpAZ,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type {
  AdPosition,
  AdType,
} from "./types";

// ======================================================
// TYPES
// ======================================================

export type AdSort =
  | "priority-desc"
  | "priority-asc"
  | "name-asc"
  | "name-desc"
  | "newest"
  | "oldest";

export interface AdFilterState {
  search: string;
  type: "all" | AdType;
  position: "all" | AdPosition;
  status:
    | "all"
    | "active"
    | "inactive";
  sort: AdSort;
}

interface AdFiltersProps {
  filters: AdFilterState;

  onChange: (
    filters: AdFilterState
  ) => void;

  totalCount: number;

  filteredCount: number;
}

// ======================================================
// DEFAULT FILTERS
// ======================================================

export const DEFAULT_AD_FILTERS: AdFilterState = {
  search: "",
  type: "all",
  position: "all",
  status: "all",
  sort: "priority-desc",
};

// ======================================================
// COMPONENT
// ======================================================

export default function AdFilters({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: AdFiltersProps) {
  // ====================================================
  // UPDATE
  // ====================================================

  function updateFilter(
    key: keyof AdFilterState,
    value: string
  ) {
    onChange({
      ...filters,
      [key]: value,
    } as AdFilterState);
  }

  // ====================================================
  // CLEAR
  // ====================================================

  const hasFilters =
    filters.search !== "" ||
    filters.type !== "all" ||
    filters.position !== "all" ||
    filters.status !== "all" ||
    filters.sort !==
      "priority-desc";

  function clearFilters() {
    onChange({
      ...DEFAULT_AD_FILTERS,
    });
  }

  // ====================================================
  // COMMON CLASS
  // ====================================================

  const selectClass = `
    h-10
    w-full
    rounded-xl
    border
    border-zinc-800
    bg-zinc-900
    px-3
    text-sm
    text-zinc-200
    outline-none
    transition
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/20
  `;

  // ====================================================
  // RENDER
  // ====================================================

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
      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-zinc-800
          px-4
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-red-500/10
              text-red-400
            "
          >
            <SlidersHorizontal
              size={17}
            />
          </div>

          <div>
            <h3
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Advertisement Filters
            </h3>

            <p
              className="
                text-[11px]
                text-zinc-500
              "
            >
              Showing{" "}
              <span className="text-zinc-300">
                {filteredCount}
              </span>{" "}
              of{" "}
              <span className="text-zinc-300">
                {totalCount}
              </span>{" "}
              ads
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="
              flex
              w-fit
              items-center
              gap-1.5
              rounded-lg
              px-2.5
              py-1.5
              text-xs
              font-semibold
              text-zinc-400
              transition
              hover:bg-zinc-900
              hover:text-white
            "
          >
            <X size={14} />

            Clear filters
          </button>
        )}
      </div>

      {/* ==================================================
          FILTER BODY
      ================================================== */}

      <div className="p-4">
        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-5
          "
        >
          {/* SEARCH */}

          <div
            className="
              relative
              md:col-span-2
              xl:col-span-1
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
              type="search"
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
                focus:ring-red-500/20
              "
            />
          </div>

          {/* TYPE */}

          <div className="relative">
            <Filter
              size={14}
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
              className={`${selectClass} pl-9`}
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

          <div>
            <select
              value={filters.position}
              onChange={(event) =>
                updateFilter(
                  "position",
                  event.target.value
                )
              }
              className={selectClass}
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

          <div>
            <select
              value={filters.status}
              onChange={(event) =>
                updateFilter(
                  "status",
                  event.target.value
                )
              }
              className={selectClass}
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active Only
              </option>

              <option value="inactive">
                Inactive Only
              </option>
            </select>
          </div>

          {/* SORT */}

          <div className="relative">
            {filters.sort ===
            "priority-desc" ||
            filters.sort ===
              "newest" ||
            filters.sort ===
              "name-desc" ? (
              <ArrowDownWideNarrow
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
            ) : (
              <ArrowUpAZ
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
            )}

            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter(
                  "sort",
                  event.target.value
                )
              }
              className={`${selectClass} pl-9`}
            >
              <option value="priority-desc">
                Priority: High → Low
              </option>

              <option value="priority-asc">
                Priority: Low → High
              </option>

              <option value="name-asc">
                Name: A → Z
              </option>

              <option value="name-desc">
                Name: Z → A
              </option>

              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>
            </select>
          </div>
        </div>

        {/* ==================================================
            ACTIVE FILTER SUMMARY
        ================================================== */}

        {hasFilters && (
          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className="
                text-[11px]
                font-medium
                text-zinc-600
              "
            >
              Active:
            </span>

            {filters.search && (
              <span
                className="
                  rounded-lg
                  bg-zinc-900
                  px-2.5
                  py-1
                  text-[11px]
                  text-zinc-300
                "
              >
                Search:{" "}
                {filters.search}
              </span>
            )}

            {filters.type !== "all" && (
              <span
                className="
                  rounded-lg
                  bg-red-500/10
                  px-2.5
                  py-1
                  text-[11px]
                  capitalize
                  text-red-400
                "
              >
                Type:{" "}
                {filters.type}
              </span>
            )}

            {filters.position !==
              "all" && (
              <span
                className="
                  rounded-lg
                  bg-blue-500/10
                  px-2.5
                  py-1
                  text-[11px]
                  text-blue-400
                "
              >
                Position:{" "}
                {filters.position}
              </span>
            )}

            {filters.status !==
              "all" && (
              <span
                className="
                  rounded-lg
                  bg-emerald-500/10
                  px-2.5
                  py-1
                  text-[11px]
                  capitalize
                  text-emerald-400
                "
              >
                Status:{" "}
                {filters.status}
              </span>
            )}

            {filters.sort !==
              "priority-desc" && (
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded-lg
                  bg-zinc-900
                  px-2.5
                  py-1
                  text-[11px]
                  text-zinc-300
                "
              >
                <ArrowDownAZ
                  size={11}
                />

                Sorted
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}