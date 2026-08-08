"use client";

import {
  useEffect,
  useState,
} from "react";

import AddUserModal from "./add-user-modal";
import UsersTable from "./users-table";

export interface UserType {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);

      const {
        getAuth,
      } = await import("firebase/auth");

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user found");
        setUsers([]);
        return;
      }

      const token = await currentUser.getIdToken();

      const res = await fetch(
        "/api/admin/users",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );

      const contentType =
        res.headers.get("content-type") || "";

      let data: any = null;

      if (
        contentType.includes("application/json")
      ) {
        data = await res.json();
      } else {
        const text = await res.text();

        console.error(
          "Users API returned non-JSON:",
          text
        );
      }

      if (!res.ok) {
        console.error(
          "Users API Error:",
          {
            status: res.status,
            data,
          }
        );

        setUsers([]);
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error(
          "Unexpected users response:",
          data
        );

        setUsers([]);
      }
    } catch (error) {
      console.error(
        "Load Users Error:",
        error
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="w-full min-w-0 space-y-6 overflow-hidden">

      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h1
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-zinc-900
              tracking-tight
            "
          >
            Users
          </h1>

          <p
            className="
              mt-1
              text-sm
              sm:text-base
              text-zinc-500
            "
          >
            Manage editors and admin users
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            w-full
            sm:w-auto
            shrink-0
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-red-600
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-red-700
            active:scale-[0.98]
          "
        >
          <span className="text-lg leading-none">
            +
          </span>

          Add Editor
        </button>
      </div>

      {/* USERS TABLE */}
      <div
        className="
          w-full
          min-w-0
          overflow-hidden
          rounded-2xl
          border
          border-zinc-200
          bg-white
          shadow-sm
        "
      >
        <div className="w-full min-w-0 overflow-x-auto">
          <UsersTable
            users={users}
            loading={loading}
            reload={loadUsers}
          />
        </div>
      </div>

      {/* ADD USER MODAL */}
      <AddUserModal
        open={open}
        setOpen={setOpen}
        reload={loadUsers}
      />

    </div>
  );
}
