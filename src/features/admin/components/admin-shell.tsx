"use client";

import { useState } from "react";

import AdminSidebar from "./admin-sidebar";
import AdminHeader from "./admin-header";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (

    <div className="min-h-screen bg-zinc-100">

      <AdminSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        collapsed={collapsed}
      />

      <div
        className={`
          transition-all
          duration-300
          ${collapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >

        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main
          className="
          p-4
          md:p-6
          "
        >
          {children}
        </main>

      </div>

    </div>

  );

}