"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  FileText,
  Video,
  Bell,
  Image,
  Users,
  Settings,
  X,
  Sparkles,
  Radio,
} from "lucide-react";

const menu = [

  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  {
    name: "Articles",
    href: "/admin/articles",
    icon: FileText,
  },
  {
    name: "Videos",
    href: "/admin/videos",
    icon: Video,
  },

  // ==================================================
  // LIVE TV
  // ==================================================

  {
    name: "Live TV",
    href: "/admin/live-tv",
    icon: Radio,
  },

  {
    name: "Shorts",
    href: "/admin/shorts",
    icon: Video,
  },

  {
    name: "AI Newsroom",
    href: "/admin/ai-news",
    icon: Sparkles,
  },

  {
    name: "Breaking News",
    href: "/admin/breaking-news",
    icon: Bell,
  },

  {
    name: "Ads",
    href: "/admin/ads",
    icon: Image,
  },

  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },

  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },

];

export default function AdminSidebar({
  open,
  setOpen,
  collapsed,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  collapsed: boolean;
}) {

  return (

    <>

      {/* Mobile Overlay */}

      {open && (

        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            md:hidden
          "
        />

      )}

      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          overflow-y-auto

          bg-zinc-950
          text-white

          transition-all
          duration-300

          ${collapsed
            ? "md:w-20"
            : "md:w-64"
          }

          w-64

          ${open
            ? "translate-x-0"
            : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >

        {/* HEADER */}

        <div
          className="
            flex
            h-16
            items-center
            justify-between
            border-b
            border-zinc-800
            px-5
          "
        >

          {!collapsed && (

            <h2
              className="
                text-xl
                font-bold
                text-red-500
              "
            >
              INFINIA CMS
            </h2>

          )}

          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>

        </div>


        {/* MENU */}

        <nav
          className="
            space-y-2
            p-3
          "
        >

          {menu.map((item) => {

            const Icon = item.icon;

            const isAI =
              item.name === "AI Newsroom";

            const isLiveTV =
              item.name === "Live TV";

            return (

              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex
                  items-center

                  ${
                    collapsed
                      ? "justify-center"
                      : "gap-3"
                  }

                  rounded-lg
                  p-3

                  transition-all
                  duration-200

                  ${
                    isAI
                      ? `
                        border
                        border-red-500/20
                        bg-gradient-to-r
                        from-red-600/20
                        to-purple-600/20
                        text-white
                        hover:border-red-500/40
                        hover:from-red-600/30
                        hover:to-purple-600/30
                      `
                      : isLiveTV
                      ? `
                        border
                        border-red-500/20
                        bg-red-600/10
                        hover:border-red-500/40
                        hover:bg-red-600/20
                      `
                      : `
                        hover:bg-zinc-800
                      `
                  }
                `}
              >

                <Icon
                  size={20}
                  className={
                    isAI
                      ? "text-red-400"
                      : isLiveTV
                      ? "text-red-500"
                      : ""
                  }
                />

                <span
                  className={
                    collapsed
                      ? "md:hidden"
                      : ""
                  }
                >
                  {item.name}
                </span>


                {/* LIVE BADGE */}

                {isLiveTV && !collapsed && (

                  <span
                    className="
                      ml-auto
                      flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-red-600
                      px-2
                      py-0.5
                      text-[9px]
                      font-bold
                      text-white
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        animate-pulse
                        rounded-full
                        bg-white
                      "
                    />

                    LIVE

                  </span>

                )}


                {/* AI BADGE */}

                {isAI && !collapsed && (

                  <span
                    className="
                      ml-auto
                      rounded-full
                      bg-red-600
                      px-2
                      py-0.5
                      text-[9px]
                      font-bold
                      text-white
                    "
                  >
                    AI
                  </span>

                )}

              </Link>

            );

          })}

        </nav>

      </aside>

    </>

  );
}