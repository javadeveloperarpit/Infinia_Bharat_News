"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  FileText,
  Video,
  Users,
  Radio,
  Megaphone,
  Zap,
  Clock,
  Tv,
  ArrowUpRight,
} from "lucide-react";

import StatCard from "../components/stat-card";

import {
  getDashboardStats,
  getRecentActivities,
  RecentActivity,
} from "@/services/dashboard.service";


// ==========================================
// ACTIVITY ICON
// ==========================================

function ActivityIcon({
  type,
}: {
  type: RecentActivity["type"];
}) {

  if (type === "article") {
    return <FileText size={18} />;
  }

  if (type === "video") {
    return <Video size={18} />;
  }

  if (type === "user") {
    return <Users size={18} />;
  }

  if (type === "breaking") {
    return <Zap size={18} />;
  }

  if (type === "liveTv") {
    return <Tv size={18} />;
  }

  if (type === "ad") {
    return <Megaphone size={18} />;
  }

  return <Radio size={18} />;
}


// ==========================================
// ACTIVITY LABEL
// ==========================================

function getActivityLabel(
  type: RecentActivity["type"]
) {

  switch (type) {

    case "article":
      return "ARTICLE";

    case "video":
      return "VIDEO";

    case "user":
      return "USER";

    case "breaking":
      return "BREAKING";

    case "liveTv":
      return "LIVE TV";

    case "ad":
      return "ADVERTISEMENT";

    default:
      return "ACTIVITY";

  }

}


// ==========================================
// ACTIVITY ROUTE
// ==========================================

function getActivityRoute(
  activity: RecentActivity
) {

  switch (activity.type) {

    case "article":
      return `/admin/articles/${activity.id}/edit`;

    case "video":
      return `/admin/videos`;

    case "user":
      return `/admin/users`;

    case "breaking":
      return `/admin/breaking-news`;

    case "liveTv":
      return `/admin/live-tv`;

    case "ad":
      return `/admin/business-ads`;

    default:
      return "#";

  }

}


// ==========================================
// TIME FORMAT
// ==========================================

function formatTime(
  date?: string
) {

  if (!date) {
    return "";
  }

  const timestamp =
    new Date(date).getTime();

  if (isNaN(timestamp)) {
    return "";
  }

  const difference =
    Date.now() - timestamp;

  const seconds =
    Math.floor(
      difference / 1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

}


// ==========================================
// DASHBOARD
// ==========================================

export default function DashboardContent() {

  const [
    stats,
    setStats,
  ] = useState({

    articles: 0,

    videos: 0,

    users: 0,

    breakingNews: 0,

    liveTv: 0,

    ads: 0,

  });


  const [
    activities,
    setActivities,
  ] = useState<
    RecentActivity[]
  >([]);


  const [
    loading,
    setLoading,
  ] = useState(true);
  const [
  visibleActivities,
  setVisibleActivities,
] = useState(10);


  // ========================================
  // LOAD DASHBOARD
  // ========================================

  useEffect(() => {

    async function loadDashboard() {

      try {

        setLoading(true);

        const [
          data,
          recentActivities,
        ] = await Promise.all([

          getDashboardStats(),

          getRecentActivities(),

        ]);

        setStats(data);

        setActivities(
          recentActivities
        );

      } catch (error) {

        console.error(
          "Dashboard Error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadDashboard();

  }, []);


  // ========================================
  // UI
  // ========================================

  return (

    <div
      className="
        space-y-7
        pb-10
      "
    >

      {/* HEADER */}

      <div>

        <h1
          className="
            text-3xl
            font-bold
            text-zinc-900
          "
        >
          Dashboard
        </h1>

        <p
          className="
            mt-1
            text-sm
            text-zinc-500
          "
        >
          Overview of your news platform
        </p>

      </div>


      {/* STAT CARDS */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >

        <StatCard
          title="Total Articles"
          value={
            loading
              ? "..."
              : String(stats.articles)
          }
          description="Published news articles"
        />

        <StatCard
          title="Videos"
          value={
            loading
              ? "..."
              : String(stats.videos)
          }
          description="Uploaded videos"
        />

        <StatCard
          title="Users"
          value={
            loading
              ? "..."
              : String(stats.users)
          }
          description="Registered users"
        />

        <StatCard
          title="Ads"
          value={
            loading
              ? "..."
              : String(stats.ads)
          }
          description="Active advertisements"
        />

      </div>


      {/* RECENT ACTIVITY */}

      <section
        className="
          bg-white
          rounded-2xl
          border
          border-zinc-200
          shadow-sm
          overflow-hidden
        "
      >

        {/* HEADER */}

        <div
          className="
            px-6
            py-5
            border-b
            border-zinc-100
            flex
            items-center
            justify-between
          "
        >

          <div>

            <h2
              className="
                text-xl
                font-bold
                text-zinc-900
              "
            >
              Recent Activity
            </h2>

            <p
              className="
                text-sm
                text-zinc-500
                mt-1
              "
            >
              Latest activity across your platform
            </p>

          </div>

          <div className="flex items-center gap-3">

  <div
    className="
      hidden
      sm:flex
      items-center
      gap-2
      text-xs
      font-medium
      text-zinc-500
    "
  >
    <Clock size={14} />

    Live updates
  </div>



</div>

        </div>


        {/* ACTIVITY */}

        <div
          className="
            divide-y
            divide-zinc-100
          "
        >

          {loading && (

            <div
              className="
                px-6
                py-10
                text-center
                text-sm
                text-zinc-500
              "
            >
              Loading recent activity...
            </div>

          )}


          {!loading &&
            activities.length === 0 && (

              <div
                className="
                  px-6
                  py-12
                  text-center
                "
              >

                <div
                  className="
                    mx-auto
                    mb-3
                    w-12
                    h-12
                    rounded-full
                    bg-zinc-100
                    flex
                    items-center
                    justify-center
                    text-zinc-400
                  "
                >

                  <Clock size={20} />

                </div>

                <p
                  className="
                    font-medium
                    text-zinc-700
                  "
                >
                  No activity yet
                </p>

                <p
                  className="
                    text-sm
                    text-zinc-500
                    mt-1
                  "
                >
                  New activity will appear here.
                </p>

              </div>

            )}


          {!loading &&
  activities
    .slice(0, visibleActivities)
    .map(
      (activity) => (
                <Link
                  key={`${activity.type}-${activity.id}`}
                  href={getActivityRoute(activity)}
                  className="
                    group
                    px-6
                    py-4
                    flex
                    items-center
                    gap-4
                    hover:bg-zinc-50
                    transition-all
                    duration-200
                  "
                >

                  {/* ICON */}

                  <div
                    className="
                      shrink-0
                      w-10
                      h-10
                      rounded-xl
                      bg-zinc-100
                      text-zinc-700
                      flex
                      items-center
                      justify-center
                      group-hover:bg-blue-50
                      group-hover:text-blue-600
                      transition-colors
                    "
                  >

                    <ActivityIcon
                      type={
                        activity.type
                      }
                    />

                  </div>


                  {/* CONTENT */}

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        flex-wrap
                      "
                    >

                      <span
                        className="
                          text-[10px]
                          font-bold
                          tracking-wider
                          text-blue-600
                          bg-blue-50
                          px-2
                          py-1
                          rounded-md
                        "
                      >
                        {
                          getActivityLabel(
                            activity.type
                          )
                        }
                      </span>

                    </div>


                    <h3
                      className="
                        mt-1
                        font-semibold
                        text-sm
                        text-zinc-900
                        truncate
                        group-hover:text-blue-600
                        transition-colors
                      "
                    >
                      {
                        activity.title
                      }
                    </h3>


                    <p
                      className="
                        text-xs
                        text-zinc-500
                        mt-0.5
                      "
                    >
                      {
                        activity.description
                      }
                    </p>

                  </div>


                  {/* TIME */}

                  <div
                    className="
                      shrink-0
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <span
                      className="
                        text-xs
                        text-zinc-400
                        whitespace-nowrap
                      "
                    >
                      {
                        formatTime(
                          activity.createdAt
                        )
                      }
                    </span>


                    <ArrowUpRight
                      size={17}
                      className="
                        text-zinc-300
                        group-hover:text-blue-600
                        group-hover:translate-x-0.5
                        group-hover:-translate-y-0.5
                        transition-all
                      "
                    />

                  </div>

                </Link>

              )
            )}

                      {!loading &&
            activities.length > visibleActivities && (

              <div
                className="
                  px-6
                  py-4
                  flex
                  justify-center
                  border-t
                  border-zinc-100
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setVisibleActivities(
                      (previous) =>
                        previous + 10
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-blue-200
                    bg-blue-50
                    px-5
                    py-2
                    text-xs
                    font-bold
                    text-blue-600
                    transition-all
                    hover:bg-blue-100
                    hover:border-blue-300
                    active:scale-95
                  "
                >
                  See More
                </button>

              </div>

            )}

        </div>

      </section>

    </div>

  );

}
