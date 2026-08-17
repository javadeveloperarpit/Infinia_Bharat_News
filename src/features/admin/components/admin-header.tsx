"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquareWarning,
} from "lucide-react";

export default function AdminHeader({
  setSidebarOpen,
  collapsed,
  setCollapsed,
}: {
  setSidebarOpen: React.Dispatch<
    React.SetStateAction<boolean>
  >;
  collapsed: boolean;
  setCollapsed: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) {

  const [reportCount, setReportCount] =
    useState(0);

  const [showReports, setShowReports] =
    useState(false);

  const [loadingReports, setLoadingReports] =
    useState(false);

    const [advertisingCount, setAdvertisingCount] =
  useState(0);

  // ==========================================
  // GET CURRENT ADMIN TOKEN
  // ==========================================

  async function getAdminToken() {
    const {
      getAuth,
    } = await import(
      "firebase/auth"
    );

    const auth =
      getAuth();

    const user =
      auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken();
  }

  // ==========================================
  // LOAD REPORT COUNT
  // ==========================================

  async function loadReportCount() {

    try {

      const token =
        await getAdminToken();

      if (!token) {
        return;
      }

      const response =
        await fetch(
          "/api/admin/comment-reports?limit=1",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      if (data.success) {
        setReportCount(
          Number(
            data.count || 0
          )
        );
      }

    } catch (error) {

      console.error(
        "REPORT COUNT ERROR:",
        error
      );

    }
  }
async function loadAdvertisingCount() {
  try {
    const token = await getAdminToken();

    if (!token) {
      return;
    }

    const response = await fetch(
      "/api/admin/advertising-inquiries",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return;
    }

    const data = await response.json();

    if (data.success) {
      setAdvertisingCount(
        Number(data.count || 0)
      );
    }
  } catch (error) {
    console.error(
      "ADVERTISING COUNT ERROR:",
      error
    );
  }
}
  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
  loadReportCount();
  loadAdvertisingCount();
}, []);
  // ==========================================
  // BELL CLICK
  // ==========================================

  function handleBellClick() {
  setShowReports((previous) => !previous);
}

  return (

    <header
      className="
        sticky
        top-0
        z-30
        h-16
        border-b
        bg-white
        flex
        items-center
        justify-between
        px-6
      "
    >

      {/* LEFT */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* MOBILE */}

        <button
          type="button"
          className="md:hidden"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <Menu size={24} />
        </button>

        {/* DESKTOP */}

        <button
          type="button"
          className="
            hidden
            md:block
          "
          onClick={() =>
            setCollapsed(
              !collapsed
            )
          }
        >

          {collapsed ? (
            <PanelLeftOpen
              size={22}
            />
          ) : (
            <PanelLeftClose
              size={22}
            />
          )}

        </button>

        <h1
          className="
            font-semibold
          "
        >
          Admin Dashboard
        </h1>

      </div>


      {/* RIGHT */}

      <div
        className="
          relative
        "
      >

        {/* BELL */}

        <button
          type="button"
          onClick={
            handleBellClick
          }
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-zinc-700
            hover:bg-zinc-100
            transition
          "
          aria-label="Comment reports"
        >

          <Bell
            size={22}
          />

          {/* REPORT BADGE */}

          {reportCount + advertisingCount > 0 && (

            <span
              className="
                absolute
                -right-0.5
                -top-0.5
                min-w-[18px]
                h-[18px]
                rounded-full
                bg-red-600
                px-1
                flex
                items-center
                justify-center
                text-[10px]
                font-bold
                text-white
                ring-2
                ring-white
              "
            >
              {reportCount + advertisingCount > 99
  ? "99+"
  : reportCount + advertisingCount}
            </span>

          )}

        </button>


        {/* REPORT DROPDOWN */}

      
{showReports && (
  <div
    className="
      absolute
      right-0
      top-12
      w-[340px]
      overflow-hidden
      rounded-2xl
      border
      border-zinc-200
      bg-white
      shadow-xl
    "
  >
    {/* HEADER */}

    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-zinc-100
        px-4
        py-3
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <MessageSquareWarning
          size={18}
          className="text-red-600"
        />

        <span
          className="
            font-semibold
            text-zinc-900
          "
        >
          Notifications
        </span>
      </div>

      {(reportCount + advertisingCount) > 0 && (
        <span
          className="
            rounded-full
            bg-red-50
            px-2
            py-1
            text-xs
            font-bold
            text-red-600
          "
        >
          {reportCount + advertisingCount} pending
        </span>
      )}
    </div>

    {/* COMMENT REPORTS */}

    {reportCount > 0 && (
      <div className="border-b border-zinc-100 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Comment Reports
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {reportCount} pending{" "}
              {reportCount === 1
                ? "report"
                : "reports"}
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-red-50
              px-2
              py-1
              text-xs
              font-bold
              text-red-600
            "
          >
            {reportCount}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowReports(false);

            window.location.href =
              "/admin/comment-reports";
          }}
          className="
            mt-3
            w-full
            rounded-xl
            bg-zinc-900
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          View all reports
        </button>
      </div>
    )}

    {/* ADVERTISING INQUIRIES */}

    {advertisingCount > 0 && (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Advertising Inquiry
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {advertisingCount} new advertising{" "}
              {advertisingCount === 1
                ? "inquiry"
                : "inquiries"}
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-amber-50
              px-2
              py-1
              text-xs
              font-bold
              text-amber-700
            "
          >
            {advertisingCount}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowReports(false);

            window.location.href =
              "/admin/advertising-inquiries";
          }}
          className="
            mt-3
            w-full
            rounded-xl
            bg-[#111]
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          View advertising inquiries
        </button>
      </div>
    )}

    {/* NOTHING PENDING */}

    {reportCount === 0 &&
      advertisingCount === 0 && (
        <div className="px-4 py-7 text-center">
          <div
            className="
              mx-auto
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-green-50
              text-green-600
            "
          >
            ✓
          </div>

          <p
            className="
              mt-3
              text-sm
              font-semibold
              text-zinc-800
            "
          >
            No new notifications
          </p>

          <p
            className="
              mt-1
              text-xs
              text-zinc-500
            "
          >
            Everything looks good.
          </p>
        </div>
      )}
  </div>
)}

      </div>

    </header>

  );
}