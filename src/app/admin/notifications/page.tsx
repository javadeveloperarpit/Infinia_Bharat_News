"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

// ======================================================
// TYPES
// ======================================================

type NotificationType =
  | "article"
  | "breaking"
  | "video"
  | "custom"
  | "card";

// ======================================================
// COMPONENT
// ======================================================

export default function NotificationsAdminPage() {
  // ====================================================
  // AUTH
  // ====================================================

  const [user, setUser] =
    useState<any>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loginLoading, setLoginLoading] =
    useState(false);

  // ====================================================
  // FORM
  // ====================================================

  const [type, setType] =
    useState<NotificationType>("custom");

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [image, setImage] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [tag, setTag] =
    useState("");

  const [ctaText, setCtaText] =
    useState("");

  const [heading, setHeading] =
    useState("");

  const [description, setDescription] =
    useState("");

  // ====================================================
  // STATE
  // ====================================================

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ====================================================
  // AUTH STATE
  // ====================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        commentsAuth,
        (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  // ====================================================
  // GOOGLE LOGIN
  // ====================================================

  async function handleGoogleLogin() {
    try {
      setLoginLoading(true);
      setError("");
      setSuccess("");

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(
        commentsAuth,
        provider
      );

      setSuccess(
        "Login successful."
      );
    } catch (error) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Google login nahi ho paaya."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  // ====================================================
  // SEND NOTIFICATION
  // ====================================================

  async function handleSend() {
    try {
      setSending(true);
      setError("");
      setSuccess("");

      // -----------------------------------------------
      // USER CHECK
      // -----------------------------------------------

      if (!user) {
        throw new Error(
          "Please login with Google first."
        );
      }

      // -----------------------------------------------
      // FIREBASE ID TOKEN
      // -----------------------------------------------

      const token =
        await user.getIdToken();

      if (!token) {
        throw new Error(
          "Authentication token could not be obtained."
        );
      }

      // -----------------------------------------------
      // VALIDATION
      // -----------------------------------------------

      if (!title.trim()) {
        throw new Error(
          "Notification title is required."
        );
      }

      if (!message.trim()) {
        throw new Error(
          "Notification message is required."
        );
      }

      if (
        type === "article" &&
        !category.trim()
      ) {
        throw new Error(
          "Article notification category is required."
        );
      }

      if (
        type === "card" &&
        !ctaText.trim()
      ) {
        throw new Error(
          "Card notification CTA text is required."
        );
      }

      // -----------------------------------------------
      // API
      // -----------------------------------------------

      const response =
        await fetch(
          "/api/admin/notifications/send",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              type,

              title:
                title.trim(),

              body:
                message.trim(),

              url:
                url.trim(),

              image:
                image.trim(),

              category:
                category.trim(),

              tag:
                tag.trim(),

              ctaText:
                ctaText.trim(),

              heading:
                heading.trim(),

              description:
                description.trim(),
            }),

            cache: "no-store",
          }
        );

      // -----------------------------------------------
      // RESPONSE
      // -----------------------------------------------

      const result =
        await response.json();

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Notification sending failed."
        );
      }

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      setSuccess(
        `Notification sent successfully. ${
          result.sent ?? 0
        } users notified.`
      );

    } catch (error) {
      console.error(
        "SEND NOTIFICATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Notification send nahi ho paayi."
      );
    } finally {
      setSending(false);
    }
  }

  // ====================================================
  // AUTH LOADING
  // ====================================================

  if (authLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="h-[500px] animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  // ====================================================
  // LOGIN SCREEN
  // ====================================================

  if (!user) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-zinc-200 bg-white p-6">

        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">

          {/* LOGO */}

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">

            <img
              src="/loader.webp"
              alt="Infinia Bharat News"
              className="h-full w-full object-contain p-2"
            />

          </div>

          {/* HEADING */}

          <h2 className="text-2xl font-bold text-zinc-900">
            Notification Manager
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Notifications send karne ke liye
            Google account se continue karein.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
              {error}
            </div>
          )}

          {/* LOGIN */}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-5
              py-3.5
              text-sm
              font-bold
              text-zinc-800
              shadow-sm
              transition
              hover:bg-zinc-50
              hover:shadow-md
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {!loginLoading && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                />

                <path
                  fill="#34A853"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
                />

                <path
                  fill="#FBBC05"
                  d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.37l3.24-2.53Z"
                />

                <path
                  fill="#EA4335"
                  d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.18 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"
                />
              </svg>
            )}

            {loginLoading
              ? "Google se login ho raha hai..."
              : "Continue with Google"}

          </button>

          <p className="mt-5 text-xs text-zinc-400">
            Secure Google authentication
          </p>

        </div>
      </div>
    );
  }

  // ====================================================
  // MAIN UI
  // ====================================================

  return (
    <div className="space-y-5">

      {/* HEADER */}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">

        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            Push Notifications
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            INFINIA BHARAT NEWS subscribers ko
            notification bhejein.
          </p>
        </div>

      </div>

      {/* FORM */}

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">

        <div className="grid gap-5 lg:grid-cols-2">

          {/* TYPE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Notification Type
            </label>

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value as NotificationType
                )
              }
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-500"
            >
              <option value="custom">
                Custom
              </option>

              <option value="article">
                Article
              </option>

              <option value="breaking">
                Breaking News
              </option>

              <option value="video">
                Video
              </option>

              <option value="card">
                Card
              </option>
            </select>
          </div>

          {/* TITLE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Title *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Notification title"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />
          </div>

          {/* MESSAGE */}

          <div className="lg:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Message *
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              rows={4}
              placeholder="Notification message"
              className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* URL */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              URL
            </label>

            <input
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              placeholder="https://infiniabharatnews.vercel.app/..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Image URL
            </label>

            <input
              value={image}
              onChange={(e) =>
                setImage(e.target.value)
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Category
              {type === "article" && " *"}
            </label>

            <input
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              placeholder="Politics, Sports, World..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* TAG */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Tag
            </label>

            <input
              value={tag}
              onChange={(e) =>
                setTag(e.target.value)
              }
              placeholder="Optional notification tag"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* CTA */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              CTA Text
              {type === "card" && " *"}
            </label>

            <input
              value={ctaText}
              onChange={(e) =>
                setCtaText(e.target.value)
              }
              placeholder="Read Story / Watch Video / Open"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* HEADING */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Card Heading
            </label>

            <input
              value={heading}
              onChange={(e) =>
                setHeading(e.target.value)
              }
              placeholder="Optional"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="lg:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-zinc-800">
              Card Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Optional card description"
              className="w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-red-500"
            />

          </div>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* SEND */}

      <div className="flex justify-end">

        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          className="
            rounded-xl
            bg-red-600
            px-6
            py-3
            text-sm
            font-bold
            text-white
            shadow-sm
            transition
            hover:bg-red-700
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {sending
            ? "Sending..."
            : "Send Notification"}
        </button>

      </div>

    </div>
  );
}