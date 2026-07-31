"use client";

import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

export default function AdminHeader({
  setSidebarOpen,
  collapsed,
  setCollapsed,
}: {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {

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

      <div className="flex items-center gap-3">

        {/* Mobile */}

        <button
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={24}/>
        </button>

        {/* Desktop */}

        <button
          className="hidden md:block"
          onClick={() => setCollapsed(!collapsed)}
        >
          {
            collapsed
            ? <PanelLeftOpen size={22}/>
            : <PanelLeftClose size={22}/>
          }
        </button>

        <h1 className="font-semibold">
          Admin Dashboard
        </h1>

      </div>

      <button className="relative">
        <Bell size={22}/>
      </button>

    </header>

  );

}