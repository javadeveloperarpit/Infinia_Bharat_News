"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CommentData,
  createComment,
} from "@/services/comments/comments.service";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

interface Props {
  articleId: string;
  articleSlug: string;
  parentId: string;

  onCreated?: (
    reply: CommentData
  ) => void;

  onCancel?: () => void;
}

export default function ReplyComposer({
  articleId,
  articleSlug,
  parentId,
  onCreated,
  onCancel,
}: Props) {
  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [focused, setFocused] =
    useState(false);

  const [user, setUser] =
    useState(
      commentsAuth.currentUser
    );

  // ==========================================
  // AUTH LISTENER
  // ==========================================

  useEffect(() => {
    const unsubscribe =
      commentsAuth.onAuthStateChanged(
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return unsubscribe;
  }, []);

  // ==========================================
  // SUBMIT REPLY
  // ==========================================

  async function handleSubmit() {
    const cleanedText =
      text.trim();

    // LOGIN CHECK

    if (!user) {
      setError(
        "Reply karne ke liye login karein."
      );

      return;
    }

    // EMPTY CHECK

    if (!cleanedText) {
      setError(
        "Reply empty nahi ho sakta."
      );

      return;
    }

    // LENGTH CHECK

    if (cleanedText.length > 2000) {
      setError(
        "Reply 2000 characters se zyada nahi ho sakta."
      );

      return;
    }

    // PARENT CHECK

    if (!parentId) {
      setError(
        "Parent comment missing hai."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      // ========================================
      // CREATE REPLY
      // createComment now returns CommentData
      // ========================================

      const createdReply =
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
// NOTIFY PARENT COMMENT AUTHOR
// ========================================

try {
  const token = await user.getIdToken();

  await fetch("/api/comments/notify-reply", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replyId: createdReply.id,
      parentId,
    }),
  });
} catch (emailError) {
  // Email failure should NOT make the reply fail
  console.error(
    "REPLY EMAIL NOTIFICATION ERROR:",
    emailError
  );
}
      // ========================================
      // RESET
      // ========================================

      setText("");
      setFocused(false);
      setError("");

      // ========================================
      // SEND CREATED REPLY TO PARENT
      // ========================================

      onCreated?.(
        createdReply
      );

    } catch (error) {
      console.error(
        "CREATE REPLY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Reply post nahi ho paaya."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // CANCEL
  // ==========================================

  function handleCancel() {
    if (loading) {
      return;
    }

    setText("");
    setError("");
    setFocused(false);

    onCancel?.();
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return null;
  }

  return (
    <div className="mt-3 flex gap-3">
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
              h-8
              w-8
              rounded-full
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-zinc-200
              text-xs
              font-semibold
              text-zinc-700
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
      {/* COMPOSER */}
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
          onFocus={() =>
            setFocused(true)
          }
          placeholder="Add a reply..."
          rows={1}
          maxLength={2000}
          disabled={loading}
          className="
            w-full
            resize-none
            border-0
            border-b
            border-zinc-300
            bg-transparent
            px-0
            pb-2
            text-sm
            leading-6
            text-zinc-900
            outline-none
            placeholder:text-zinc-500
            focus:border-zinc-900
          "
        />

        {/* CHARACTER COUNT */}

        {focused &&
          text.length > 0 && (
            <div className="mt-1 text-right text-[11px] text-zinc-400">
              {text.length}/2000
            </div>
          )}

        {/* ERROR */}

        {error && (
          <p className="mt-2 text-xs text-red-600">
            {error}
          </p>
        )}

        {/* ACTIONS */}

        {focused && (
          <div className="mt-2 flex justify-end gap-2">
            {/* CANCEL */}

            <button
              type="button"
              disabled={loading}
              onClick={
                handleCancel
              }
              className="
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                text-zinc-700
                transition
                hover:bg-zinc-100
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            {/* REPLY */}

            <button
              type="button"
              disabled={
                loading ||
                !text.trim()
              }
              onClick={
                handleSubmit
              }
              className="
                rounded-full
                bg-zinc-900
                px-4
                py-2
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-zinc-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {loading
                ? "Replying..."
                : "Reply"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}