"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import {
  signInToComments,
} from "@/services/comments/comments-auth.service";

import {
  createComment,
} from "@/services/comments/comments.service";

interface Props {
  articleId: string;
  articleSlug: string;
  parentId?: string;
  onCreated?: () => void;
}

export default function CommentComposer({
  articleId,
  articleSlug,
  parentId = "",
  onCreated,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // AUTH STATE
  // ==========================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        commentsAuth,
        (currentUser) => {
          setUser(currentUser);
          setLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  async function handleLogin() {
    try {
      setError("");

      await signInToComments();
    } catch (error) {
      console.error(
        "COMMENT LOGIN ERROR:",
        error
      );

      setError(
        "Login nahi ho paaya. Please try again."
      );
    }
  }

  // ==========================================
  // SUBMIT COMMENT
  // ==========================================

  async function handleSubmit() {
    // LOGIN CHECK

    if (!user) {
      await handleLogin();
      return;
    }

    const cleanedText =
      text.trim();

    // EMPTY CHECK

    if (!cleanedText) {
      setError(
        parentId
          ? "Reply empty nahi ho sakta."
          : "Comment empty nahi ho sakta."
      );

      return;
    }

    // LENGTH CHECK

    if (cleanedText.length > 2000) {
      setError(
        parentId
          ? "Reply 2000 characters se zyada nahi ho sakta."
          : "Comment 2000 characters se zyada nahi ho sakta."
      );

      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createComment({
        articleId,

        articleSlug,

        userId:
          user.uid,

        userName:
          user.displayName ||
          "User",

        userPhoto:
          user.photoURL ||
          "",

        text:
          cleanedText,

        parentId,
      });

      // ========================================
      // RESET
      // ========================================

      setText("");
      setError("");

      // ========================================
      // REFRESH PARENT LIST
      // ========================================

      onCreated?.();

    } catch (error) {
      console.error(
        "CREATE COMMENT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : parentId
            ? "Reply post nahi ho paaya."
            : "Comment post nahi ho paaya."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />

        <div className="h-10 flex-1 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return (
      <div className="mb-5">
        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Join the conversation
            </p>

            <p className="mt-0.5 text-xs text-zinc-500">
              Sign in to leave a comment.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleLogin
            }
            className="
              rounded-full
              bg-zinc-900
              px-5
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-zinc-700
            "
          >
            Sign in
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ==========================================
  // LOGGED IN
  // ==========================================

  return (
    <div className="mb-5 flex gap-3">
      {/* ================================= */}
      {/* AVATAR */}
      {/* ================================= */}

      <div className="shrink-0">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={
              user.displayName ||
              "User"
            }
            referrerPolicy="no-referrer"
            className="
              h-10
              w-10
              rounded-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-red-600
              text-sm
              font-bold
              text-white
            "
          >
            {(
              user.displayName ||
              "U"
            )
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* INPUT */}
      {/* ================================= */}

      <div className="min-w-0 flex-1">
        <textarea
          value={text}
          onChange={(event) => {
            setText(
              event.target.value
            );

            if (error) {
              setError("");
            }
          }}
          placeholder={
            parentId
              ? "Add a reply..."
              : "Add a comment..."
          }
          maxLength={2000}
          rows={1}
          disabled={submitting}
          className="
            w-full
            resize-none
            border-b
            border-zinc-300
            bg-transparent
            px-0
            py-2
            text-sm
            leading-6
            text-zinc-900
            outline-none
            transition
            placeholder:text-zinc-500
            focus:border-zinc-900
            disabled:opacity-60
          "
        />

        {/* ERROR */}

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* ================================= */}
        {/* FOOTER */}
        {/* ================================= */}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            {text.length}/2000
          </span>

          <div className="flex gap-2">
            {/* CANCEL */}

            <button
              type="button"
              onClick={() => {
                setText("");
                setError("");
              }}
              disabled={
                submitting ||
                !text
              }
              className="
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                text-zinc-600
                transition
                hover:bg-zinc-100
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Cancel
            </button>

            {/* SUBMIT */}

            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                submitting ||
                !text.trim()
              }
              className="
                rounded-full
                bg-red-600
                px-5
                py-2
                text-xs
                font-bold
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {submitting
                ? parentId
                  ? "Replying..."
                  : "Posting..."
                : parentId
                  ? "Reply"
                  : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}