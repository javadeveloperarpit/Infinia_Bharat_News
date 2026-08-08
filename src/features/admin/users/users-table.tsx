"use client";

import { useState } from "react";

import type { UserType } from "./users-page";
import { auth } from "@/lib/firebase/firebase";

interface Props {
  users: UserType[];
  loading: boolean;
  reload: () => void;
}

export default function UsersTable({
  users,
  loading,
  reload,
}: Props) {
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState("");

  // ==========================================
  // DELETE USER
  // ==========================================

  async function deleteUser(uid: string) {
    const confirmDelete = confirm(
      "Are you sure you want to delete this editor?"
    );

    if (!confirmDelete) return;

    try {
      setDeleting(uid);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        alert("Please login again");
        return;
      }

      const token =
        await currentUser.getIdToken();

      const response = await fetch(
        "/api/admin/users",
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            uid,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data?.message ||
            "Failed to delete user"
        );

        return;
      }

      await reload();

    } catch (error) {
      console.error(
        "DELETE USER ERROR:",
        error
      );

      alert(
        "Something went wrong while deleting user."
      );

    } finally {
      setDeleting("");
    }
  }

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredUsers =
    users.filter(
      (user) =>
        user.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||

        user.email
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // ==========================================
  // INITIALS
  // ==========================================

  function getInitials(
    name: string
  ) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (word) =>
          word.charAt(0).toUpperCase()
      )
      .join("");
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        bg-white
        text-zinc-900
        rounded-xl
        shadow-lg
        p-5
        space-y-5
        border
        border-zinc-200
      "
    >

      {/* ======================================
          SEARCH
      ====================================== */}

      <div>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="
            w-full
            border
            border-zinc-300
            rounded-lg
            px-3
            py-2.5
            bg-white
            text-black
            placeholder:text-zinc-400
            outline-none
            focus:border-red-500
            focus:ring-4
            focus:ring-red-500/10
          "
        />
      </div>


      {/* ======================================
          LOADING
      ====================================== */}

      {loading ? (

        <div className="text-center py-10">
          Loading users...
        </div>

      ) : filteredUsers.length === 0 ? (

        <div
          className="
            text-center
            py-10
            text-zinc-500
          "
        >
          No users found
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* ==================================
                TABLE HEADER
            ================================== */}

            <thead>

              <tr
                className="
                  border-b
                  text-left
                  text-sm
                  text-zinc-700
                "
              >

                <th className="py-3">
                  Author
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            {/* ==================================
                TABLE BODY
            ================================== */}

            <tbody>

              {filteredUsers.map(
                (user) => (

                  <tr
                    key={user.id}
                    className="
                      border-b
                      hover:bg-zinc-50
                      transition
                    "
                  >

                    {/* ==========================
                        AUTHOR
                    ========================== */}

                    <td className="py-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        {/* PROFILE PHOTO */}

                        {user.photo ? (

                          <img
                            src={user.photo}
                            alt={user.name}
                            className="
                              w-11
                              h-11
                              rounded-full
                              object-cover
                              border
                              border-zinc-200
                              shadow-sm
                              shrink-0
                            "
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div
                            className="
                              w-11
                              h-11
                              rounded-full
                              bg-red-600
                              text-white
                              flex
                              items-center
                              justify-center
                              font-bold
                              text-sm
                              shrink-0
                            "
                          >
                            {getInitials(
                              user.name
                            )}
                          </div>

                        )}


                        {/* NAME */}

                        <div className="min-w-0">

                          <div
                            className="
                              font-bold
                              text-zinc-950
                              truncate
                              max-w-[220px]
                            "
                          >
                            {user.name}
                          </div>

                          <div
                            className="
                              text-xs
                              text-zinc-500
                              mt-0.5
                            "
                          >
                            @{user.slug}
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* ==========================
                        EMAIL
                    ========================== */}

                    <td className="text-sm">
                      {user.email}
                    </td>


                    {/* ==========================
                        ROLE
                    ========================== */}

                    <td>

                      <span
                        className="
                          bg-blue-100
                          text-blue-700
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                        "
                      >
                        {user.role}
                      </span>

                    </td>


                    {/* ==========================
                        STATUS
                    ========================== */}

                    <td>

                      <span
                        className="
                          bg-green-100
                          text-green-700
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                        "
                      >
                        {user.status}
                      </span>

                    </td>


                    {/* ==========================
                        ACTION
                    ========================== */}

                    <td>

                      <button
                        onClick={() =>
                          deleteUser(
                            user.uid
                          )
                        }
                        disabled={
                          deleting ===
                          user.uid
                        }
                        className="
                          bg-red-600
                          text-white
                          px-3
                          py-1.5
                          rounded-lg
                          text-sm
                          font-semibold
                          transition
                          hover:bg-red-700
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                        "
                      >
                        {deleting ===
                        user.uid
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

