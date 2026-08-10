"use client";

import {
  BarChart3,
  Eye,
  MousePointerClick,
  PauseCircle,
  PlayCircle,
  Target,
} from "lucide-react";

import type { AdsData } from "./types";

interface AdStatsProps {
  ads: AdsData[];
}

// ======================================================
// STAT CARD
// ======================================================

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({
  title,
  value,
  description,
  icon,
  accent,
}: StatCardProps) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-4
        transition
        duration-200
        hover:border-zinc-700
        hover:bg-zinc-900/80
      "
    >
      {/* GLOW */}

      <div
        className={`
          pointer-events-none
          absolute
          -right-8
          -top-8
          h-24
          w-24
          rounded-full
          blur-3xl
          opacity-20
          ${accent}
        `}
      />

      <div
        className="
          relative
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              truncate
              text-xs
              font-medium
              text-zinc-500
            "
          >
            {title}
          </p>

          <p
            className="
              mt-1.5
              truncate
              text-2xl
              font-bold
              tracking-tight
              text-white
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              truncate
              text-[11px]
              text-zinc-500
            "
          >
            {description}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-zinc-900
            text-zinc-300
            ring-1
            ring-zinc-800
            transition
            group-hover:scale-105
          "
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// FORMAT NUMBER
// ======================================================

function formatNumber(
  value: number
): string {
  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(
      value >= 10_000_000
        ? 0
        : 1
    )}M`;
  }

  if (value >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(
      value >= 10_000
        ? 0
        : 1
    )}K`;
  }

  return value.toLocaleString();
}

// ======================================================
// COMPONENT
// ======================================================

export default function AdStats({
  ads,
}: AdStatsProps) {
  // ====================================================
  // CALCULATIONS
  // ====================================================

  const totalAds = ads.length;

  const activeAds = ads.filter(
    (ad) => ad.active
  ).length;

  const inactiveAds =
    totalAds - activeAds;

  const impressions =
    ads.reduce(
      (total, ad) =>
        total +
        Number(
          ad.impressions ?? 0
        ),
      0
    );

  const clicks =
    ads.reduce(
      (total, ad) =>
        total +
        Number(
          ad.clicks ?? 0
        ),
      0
    );

  const ctr =
    impressions > 0
      ? (clicks / impressions) *
        100
      : 0;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-6
      "
    >
      {/* TOTAL */}

      <StatCard
        title="Total Ads"
        value={totalAds}
        description="All advertisements"
        icon={
          <BarChart3
            size={19}
          />
        }
        accent="bg-blue-500"
      />

      {/* ACTIVE */}

      <StatCard
        title="Active Ads"
        value={activeAds}
        description="Currently enabled"
        icon={
          <PlayCircle
            size={19}
          />
        }
        accent="bg-emerald-500"
      />

      {/* INACTIVE */}

      <StatCard
        title="Inactive Ads"
        value={inactiveAds}
        description="Currently disabled"
        icon={
          <PauseCircle
            size={19}
          />
        }
        accent="bg-zinc-500"
      />

      {/* IMPRESSIONS */}

      <StatCard
        title="Impressions"
        value={formatNumber(
          impressions
        )}
        description="Total ad views"
        icon={
          <Eye
            size={19}
          />
        }
        accent="bg-purple-500"
      />

      {/* CLICKS */}

      <StatCard
        title="Clicks"
        value={formatNumber(
          clicks
        )}
        description="Total ad clicks"
        icon={
          <MousePointerClick
            size={19}
          />
        }
        accent="bg-orange-500"
      />

      {/* CTR */}

      <StatCard
        title="CTR"
        value={`${ctr.toFixed(2)}%`}
        description="Click-through rate"
        icon={
          <Target
            size={19}
          />
        }
        accent="bg-red-500"
      />
    </div>
  );
}