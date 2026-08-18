"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Loader2,
} from "lucide-react";

import {
  auth,
} from "@/lib/firebase/firebase";

import type {
  UserType,
} from "./users-page";

interface EditUserModalProps {
  open: boolean;

  setOpen:
    (value: boolean) => void;

  user:
    UserType | null;

  reload:
    () => void;
}

export default function EditUserModal({
  open,
  setOpen,
  user,
  reload,
}: EditUserModalProps) {

  const [name, setName] =
    useState("");

  const [photo, setPhoto] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [status, setStatus] =
    useState("active");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {

    if (user && open) {

      setName(
        user.name || ""
      );

      setPhoto(
        user.photo || ""
      );

      setBio(
        user.bio || ""
      );

      setStatus(
        user.status || "active"
      );

      setError("");
    }

  }, [
    user,
    open,
  ]);

  if (!open || !user) {
    return null;
  }

  async function handleSubmit(
  e: React.FormEvent
) {
  e.preventDefault();

  if (!user) {
    return;
  }

  try {
    setLoading(true);

    setError("");

    const currentUser =
      auth.currentUser;

    if (!currentUser) {
      throw new Error(
        "You are not authenticated"
      );
    }

    const token =
      await currentUser.getIdToken(
        true
      );

    const res =
      await fetch(
        "/api/admin/users",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify({
              uid: user.uid,

              name,

              photo,

              bio,

              status,
            }),
        }
      );

    const data =
      await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
        "Failed to update user"
      );
    }

    reload();

    setOpen(false);

  } catch (error: any) {

    console.error(
      "UPDATE USER ERROR:",
      error
    );

    setError(
      error?.message ||
      "Failed to update user"
    );

  } finally {

    setLoading(false);

  }
}

  return (
    <div
      className="
        fixed
        inset-0
        z-100
        flex
        items-center
        justify-center
        bg-black/50
        p-4
      "
    >

      <div
        className="
          relative
          w-full
          max-w-lg
          rounded-2xl
          bg-white
          p-6
          shadow-2xl
        "
      >

        <button
          type="button"
          onClick={() =>
            setOpen(false)
          }
          className="
            absolute
            right-4
            top-4
            rounded-lg
            p-2
            text-zinc-500
            hover:bg-zinc-100
          "
        >
          <X size={20} />
        </button>

        <h2
          className="
            text-xl
            font-bold
            text-zinc-900
          "
        >
          Edit User
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-zinc-500
          "
        >
          Update user profile details
        </p>

        <form
          onSubmit={handleSubmit}
          className="
            mt-6
            space-y-4
          "
        >

          <div>
            <label className="text-sm font-medium">
              Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="
                mt-1
                w-full
                rounded-xl
                border
                border-zinc-300
                px-4
                py-3
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              value={user.email}
              disabled
              className="
                mt-1
                w-full
                cursor-not-allowed
                rounded-xl
                border
                border-zinc-200
                bg-zinc-100
                px-4
                py-3
                text-zinc-500
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Profile Photo URL
            </label>

            <input
              value={photo}
              onChange={(e) =>
                setPhoto(
                  e.target.value
                )
              }
              className="
                mt-1
                w-full
                rounded-xl
                border
                border-zinc-300
                px-4
                py-3
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              rows={4}
              className="
                mt-1
                w-full
                resize-none
                rounded-xl
                border
                border-zinc-300
                px-4
                py-3
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="
                mt-1
                w-full
                rounded-xl
                border
                border-zinc-300
                px-4
                py-3
                outline-none
                focus:border-red-500
              "
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          {error && (
            <div
              className="
                rounded-xl
                bg-red-50
                p-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          <div
            className="
              flex
              justify-end
              gap-3
              pt-2
            "
          >

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="
                rounded-xl
                border
                border-zinc-300
                px-5
                py-2.5
                text-sm
                font-semibold
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
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
                disabled:opacity-60
              "
            >

              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              )}

              {loading
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}