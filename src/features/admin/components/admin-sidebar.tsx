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
  X
} from "lucide-react";

const menu = [

  {
    name:"Dashboard",
    href:"/admin",
    icon:LayoutDashboard
  },

  {
    name:"Articles",
    href:"/admin/articles",
    icon:FileText
  },

  {
    name:"Videos",
    href:"/admin/videos",
    icon:Video
  },

  {
    name:"Breaking News",
    href:"/admin/breaking-news",
    icon:Bell
  },

  {
    name:"Ads",
    href:"/admin/ads",
    icon:Image
  },

  {
    name:"Users",
    href:"/admin/users",
    icon:Users
  },

  {
    name:"Settings",
    href:"/admin/settings",
    icon:Settings
  }

];

export default function AdminSidebar({
  open,
  setOpen,
  collapsed
}:{
  open:boolean;
  setOpen:(value:boolean)=>void;
  collapsed:boolean;
}){

  return (

    <>

      {/* Mobile Overlay */}

      {
        open &&

        <div
          onClick={()=>setOpen(false)}
          className="
          fixed
          inset-0
          bg-black/50
          z-40
          md:hidden
          "
        />

      }

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

        ${collapsed ? "md:w-20" : "md:w-64"}

        w-64

        ${open ? "translate-x-0":"-translate-x-full"}

        md:translate-x-0
        `}

      >

        <div
          className="
          h-16
          flex
          items-center
          justify-between
          px-5
          border-b
          border-zinc-800
          "
        >

          {

            !collapsed &&

            <h2
              className="
              text-xl
              font-bold
              text-red-500
              "
            >
              INFINIA CMS
            </h2>

          }

          <button
            className="md:hidden"
            onClick={()=>setOpen(false)}
          >
            <X/>
          </button>

        </div>

        <nav
          className="
          p-3
          space-y-2
          "
        >

          {

            menu.map((item)=>{

              const Icon=item.icon;

              return (

                <Link

                  key={item.name}

                  href={item.href}

                  onClick={()=>setOpen(false)}

                  className={`
                  flex
                  items-center

                  ${
                    collapsed
                    ? "justify-center"
                    : "gap-3"
                  }

                  p-3
                  rounded-lg
                  hover:bg-zinc-800
                  transition
                  `}

                >

                  <Icon size={20}/>

                  &nbsp;<span className={collapsed ? "md:hidden" : ""}>
  { item.name}
</span>

                </Link>

              )

            })

          }

        </nav>

      </aside>

    </>

  )

}