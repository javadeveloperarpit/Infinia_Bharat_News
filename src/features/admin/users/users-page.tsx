"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  auth,
} from "@/lib/firebase/firebase";

import AddUserModal from "./add-user-modal";
import UsersTable from "./users-table";

export interface UserType {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  status: string;
  photo?: string;
  slug?: string;
}

export default function UsersPage() {
  const [users, setUsers] =
    useState<UserType[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [open, setOpen] =
    useState(false);

  async function loadUsers(
    currentUser: any
  ) {
    try {
      setLoading(true);

      if (!currentUser) {
        console.error(
          "No authenticated Firebase user"
        );

        setUsers([]);

        return;
      }

      /*
       * Force fresh Firebase ID token
       */
      const token =
        await currentUser.getIdToken(true);

      if (!token) {
        throw new Error(
          "Firebase authentication token not available"
        );
      }

      console.log(
        "Authenticated UID:",
        currentUser.uid
      );

      const res =
        await fetch(
          "/api/admin/users",
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            cache: "no-store",
          }
        );

      const contentType =
        res.headers.get(
          "content-type"
        ) || "";

      let data: any = null;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data = await res.json();
      } else {
        const text =
          await res.text();

        console.error(
          "Users API returned non-JSON:",
          text
        );

        throw new Error(
          "Server returned an invalid response"
        );
      }

      console.log(
        "Users API Response:",
        res.status,
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
          `Users API failed (${res.status})`
        );
      }

      if (
        Array.isArray(data)
      ) {
        setUsers(data);
      } else {
        console.error(
          "Unexpected users response:",
          data
        );

        setUsers([]);
      }

    } catch (error: any) {
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
    /*
     * Wait until Firebase Auth
     * restores the logged-in user.
     */
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          loadUsers(
            currentUser
          );
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-6">

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
          onClick={() =>
            setOpen(true)
          }
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

        <div
          className="
            w-full
            min-w-0
            overflow-x-auto
          "
        >

          <UsersTable
            users={users}
            loading={loading}
            reload={() =>
              loadUsers(
                auth.currentUser
              )
            }
          />

        </div>

      </div>


      {/* ADD USER MODAL */}

      <AddUserModal
        open={open}
        setOpen={setOpen}
        reload={() =>
          loadUsers(
            auth.currentUser
          )
        }
      />

    </div>
  );
}