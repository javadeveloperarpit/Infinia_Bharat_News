"use client";

import { useEffect, useMemo, useState } from "react";

import { Search, UserPlus } from "lucide-react";

import { getCollection } from "@/lib/firebase/firestore";

type UserType = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function UsersContent() {

  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadUsers() {

    setLoading(true);

    try {

      const data = await getCollection("users");

      setUsers(data as UserType[]);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    loadUsers();

  }, []);

  const filteredUsers = useMemo(() => {

    return users.filter((user) => {

      return (

        user.name
          ?.toLowerCase()
          .includes(search.toLowerCase())

        ||

        user.email
          ?.toLowerCase()
          .includes(search.toLowerCase())

      );

    });

  }, [users, search]);

  return (

    <div className="space-y-6">

      {/* Top */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold">
            Users
          </h1>

          <p className="text-zinc-500">
            Manage Editors
          </p>

        </div>

        <button
          className="
          flex
          items-center
          gap-2
          bg-red-600
          hover:bg-red-700
          text-white
          px-5
          py-3
          rounded-lg
          "
        >
          <UserPlus size={18} />

          Add Editor

        </button>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-xl shadow p-5">

          <p className="text-zinc-500">
            Total Users
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {users.length}

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <p className="text-zinc-500">
            Editors
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {
              users.filter(
                (u) => u.role === "editor"
              ).length
            }

          </h2>

        </div>

        <div className="bg-white rounded-xl shadow p-5">

          <p className="text-zinc-500">
            Active
          </p>

          <h2 className="text-3xl font-bold mt-2">

            {
              users.filter(
                (u) => u.status === "active"
              ).length
            }

          </h2>

        </div>

      </div>

      {/* Search */}

      <div className="relative">

        <Search
          size={18}
          className="
          absolute
          left-3
          top-3.5
          text-zinc-400
          "
        />

        <input

          value={search}

          onChange={(e) =>
            setSearch(e.target.value)
          }

          placeholder="Search name or email..."

          className="
          w-full
          rounded-lg
          border
          bg-white
          pl-10
          pr-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-red-500
          "

        />

      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow overflow-x-auto">

        <table className="w-full">

          <thead className="bg-zinc-100">

            <tr>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Email
              </th>

              <th className="text-left p-4">
                Role
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-left p-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {

              loading ?

                (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                      text-center
                      p-10
                      "
                    >

                      Loading...

                    </td>

                  </tr>

                )

                :

                filteredUsers.length === 0 ?

                  (

                    <tr>

                      <td
                        colSpan={5}
                        className="
                        text-center
                        p-10
                        "
                      >

                        No Users Found

                      </td>

                    </tr>

                  )

                  :

                  filteredUsers.map((user) => (

                    <tr
                      key={user.id}
                      className="border-t"
                    >

                      <td className="p-4 font-medium">

                        {user.name}

                      </td>

                      <td className="p-4">

                        {user.email}

                      </td>

                      <td className="p-4">

                        <span
                          className={`
                          px-3
                          py-1
                          rounded-full
                          text-sm

                          ${user.role === "admin"

                              ? "bg-red-100 text-red-700"

                              : "bg-blue-100 text-blue-700"

                            }

                          `}
                        >

                          {user.role}

                        </span>

                      </td>

                      <td className="p-4">

                        <span
                          className={`
                          px-3
                          py-1
                          rounded-full
                          text-sm

                          ${user.status === "active"

                              ? "bg-green-100 text-green-700"

                              : "bg-zinc-200 text-zinc-700"

                            }

                          `}
                        >

                          {user.status}

                        </span>

                      </td>

                      <td className="p-4">

                        {

                          user.role === "admin"

                            ?

                            <span className="text-zinc-400">

                              Owner

                            </span>

                            :

                            <button
                              className="
                              text-red-600
                              hover:underline
                              "
                            >

                              Delete

                            </button>

                        }

                      </td>

                    </tr>

                  ))

            }

          </tbody>

        </table>

      </div>

    </div>

  );

}