"use client";

import { useEffect, useState } from "react";

import {
  CommentData,
  CommentReportReason,
  createCommentReport,
  getCommentReaction,
  getCommentReplies,
  toggleCommentReaction,
  updateComment,
  deleteComment,
} from "@/services/comments/comments.service";

import ReplyComposer from "./reply-composer";

import { commentsAuth } from "@/lib/firebase/firebase-comments";

// ==========================================
// PROPS
// ==========================================

interface Props {
  comment: CommentData;
}

// ==========================================
// MORE ICON
// ==========================================

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

// ==========================================
// LIKE ICON
// ==========================================

function LikeIcon({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 10v10H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3Z" />

      <path d="M7 20h9.2a2 2 0 0 0 1.94-1.52l1.6-6.4A2 2 0 0 0 17.8 9H14l.55-3.3A2.3 2.3 0 0 0 12.28 3L7 10v10Z" />
    </svg>
  );
}

// ==========================================
// DISLIKE ICON
// ==========================================

function DislikeIcon({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 14V4H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3Z" />

      <path d="M7 4h9.2a2 2 0 0 1 1.94 1.52l1.6 6.4A2 2 0 0 1 17.8 14H14l.55 3.3A2.3 2.3 0 0 1 12.28 21L7 14V4Z" />
    </svg>
  );
}

// ==========================================
// COMMENT CARD
// ==========================================

export default function CommentCard({
  comment,
}: Props) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showReport, setShowReport] =
    useState(false);
  const [reportReason, setReportReason] =
  useState<CommentReportReason | "">("");

const [reportDetails, setReportDetails] =
  useState("");

const [reportLoading, setReportLoading] =
  useState(false);

const [reportError, setReportError] =
  useState("");

const [reportSuccess, setReportSuccess] =
  useState(false);

  const [showEdit, setShowEdit] =
    useState(false);

  const [editText, setEditText] =
    useState(comment.text);

  const [editLoading, setEditLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleted, setDeleted] =
    useState(false);

  const [reaction, setReaction] =
    useState<"like" | "dislike" | null>(null);

  const [likeCount, setLikeCount] =
    useState(comment.likeCount);

  const [dislikeCount, setDislikeCount] =
    useState(comment.dislikeCount);

  const [reactionLoading, setReactionLoading] =
    useState(false);

  const [reactionError, setReactionError] =
    useState("");

  const [showReplyComposer, setShowReplyComposer] =
    useState(false);

  const [showReplies, setShowReplies] =
    useState(false);

  const [replies, setReplies] =
    useState<CommentData[]>([]);

  const [replyCount, setReplyCount] =
    useState(comment.replyCount);

  const [repliesLoading, setRepliesLoading] =
    useState(false);

  const [repliesError, setRepliesError] =
    useState("");
 
  // ==========================================
  // CURRENT USER
  // ==========================================

  const currentUser =
    commentsAuth.currentUser;
  const isOwnComment =
  currentUser?.uid === comment.userId;

  const isOwner =
    currentUser?.uid === comment.userId;

  // ==========================================
  // LOAD CURRENT REACTION
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadReaction() {
      const user =
        commentsAuth.currentUser;

      if (!user) {
        return;
      }

      try {
        const currentReaction =
          await getCommentReaction(
            comment.id,
            user.uid
          );

        if (!cancelled) {
          setReaction(currentReaction);
        }
      } catch (error) {
        console.error(
          "GET COMMENT REACTION ERROR:",
          error
        );
      }
    }

    loadReaction();

    return () => {
      cancelled = true;
    };
  }, [comment.id]);

  // ==========================================
  // LOAD REPLIES
  // ==========================================

  async function loadReplies() {
    try {
      setRepliesLoading(true);
      setRepliesError("");

      const data =
        await getCommentReplies(
          comment.id
        );

      setReplies(data);
    } catch (error) {
      console.error(
        "GET REPLIES ERROR:",
        error
      );

      setRepliesError(
        "Replies load nahi ho paaye."
      );
    } finally {
      setRepliesLoading(false);
    }
  }

  // ==========================================
  // REACTION
  // ==========================================

  async function handleReaction(
    type: "like" | "dislike"
  ) {
    const user =
      commentsAuth.currentUser;

    if (!user) {
      setReactionError(
        "Please login for giving reaction"
      );

      return;
    }

    if (reactionLoading) {
      return;
    }

    try {
      setReactionLoading(true);
      setReactionError("");

      const result =
        await toggleCommentReaction(
          comment.id,
          user.uid,
          type
        );

      setReaction(
        result.reaction
      );

      setLikeCount(
        result.likeCount
      );

      setDislikeCount(
        result.dislikeCount
      );
    } catch (error) {
      console.error(
        "COMMENT REACTION ERROR:",
        error
      );

      setReactionError(
        "Reaction update nahi ho paaya."
      );
    } finally {
      setReactionLoading(false);
    }
  }

  // ==========================================
  // TOGGLE REPLIES
  // ==========================================

  async function handleToggleReplies() {
    const next =
      !showReplies;

    setShowReplies(next);

    if (
      next &&
      replies.length === 0
    ) {
      await loadReplies();
    }
  }

  // ==========================================
  // EDIT COMMENT
  // ==========================================

  async function handleEdit() {
    if (!isOwner) {
      return;
    }

    const cleanedText =
      editText.trim();

    if (!cleanedText) {
      return;
    }

    if (cleanedText.length > 2000) {
      return;
    }

    try {
      setEditLoading(true);

      await updateComment(
        comment.id,
        cleanedText
      );

      comment.text =
        cleanedText;

      setEditText(
        cleanedText
      );

      setShowEdit(false);
      setMenuOpen(false);
    } catch (error) {
      console.error(
        "UPDATE COMMENT ERROR:",
        error
      );

      alert(
        "Comment update nahi ho paaya."
      );
    } finally {
      setEditLoading(false);
    }
  }

  // ==========================================
  // DELETE COMMENT
  // ==========================================

  async function handleDelete() {
    if (!isOwner) {
      return;
    }

    const confirmed =
      window.confirm(
        "Kya aap is comment ko delete karna chahte hain?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteLoading(true);

      await deleteComment(
        comment.id
      );

      setDeleted(true);
    } catch (error) {
      console.error(
        "DELETE COMMENT ERROR:",
        error
      );

      alert(
        "Comment delete nahi ho paaya."
      );
    } finally {
      setDeleteLoading(false);
      setMenuOpen(false);
    }
  }
// ==========================================
// REPORT COMMENT
// ==========================================

async function handleReport() {
  const user =
    commentsAuth.currentUser;

  if (!user) {
    setReportError(
      "Please login with Google Account"
    );

    return;
  }

  if (!reportReason) {
    setReportError(
      "Please select a reason."
    );

    return;
  }

  if (reportLoading) {
    return;
  }

  try {
    setReportLoading(true);
    setReportError("");

    await createCommentReport({
      commentId: comment.id,

      articleId:
        comment.articleId,

      articleSlug:
        comment.articleSlug,

      reporterId:
        user.uid,

      reporterName:
        user.displayName ||
        "User",

      reporterEmail:
        user.email ||
        "",

      reason:
        reportReason,

      details:
        reportDetails,
    });

    setReportSuccess(true);

    setReportReason("");
    setReportDetails("");
  } catch (error) {
    console.error(
      "REPORT COMMENT ERROR:",
      error
    );

    setReportError(
      error instanceof Error
        ? error.message
        : "Error in Submitting Report!"
    );
  } finally {
    setReportLoading(false);
  }
}
  // ==========================================
  // DELETED STATE
  // ==========================================

  if (deleted) {
    return (
      <article className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <span className="text-sm">
            —
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm italic text-zinc-500">
            This comment was deleted.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-3">
      {/* ================================= */}
      {/* AVATAR */}
      {/* ================================= */}

      <div className="shrink-0">
        {comment.userPhoto ? (
          <img
            src={comment.userPhoto}
            alt={comment.userName}
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
              bg-zinc-200
              text-sm
              font-medium
              text-zinc-700
            "
          >
            {(comment.userName || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div className="min-w-0 flex-1">
        {/* NAME + TIME + MENU */}

        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-zinc-900">
            {comment.userName}
          </span>

          {comment.createdAt && (
            <>
              <span className="text-[12px] text-zinc-400">
                ·
              </span>

              <span className="text-[12px] text-zinc-500">
                {formatRelativeTime(
                  comment.createdAt
                )}
              </span>
            </>
          )}

          {/* MENU */}

          <div className="relative ml-auto">
            <button
  type="button"
  onClick={() => setMenuOpen((prev) => !prev)}
  aria-label="Comment options"
  className="
    flex
    h-9
    w-9
    items-center
    justify-center
    rounded-full
    text-zinc-700
    hover:bg-zinc-100
    hover:text-zinc-950
    transition
  "
>
  <MoreIcon />
</button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-9
                  z-30
                  w-44
                  overflow-hidden
                  rounded-xl
                  bg-white
                  py-1
                  shadow-[0_4px_18px_rgba(0,0,0,0.15)]
                  ring-1
                  ring-black/5
                "
              >
                {/* OWNER OPTIONS */}

                {isOwner && (
                  <>
                    <button
                      type="button"
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        text-zinc-800
                        transition
                        hover:bg-zinc-100
                      "
                      onClick={() => {
                        setEditText(
                          comment.text
                        );

                        setShowEdit(
                          true
                        );

                        setMenuOpen(
                          false
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={
                        deleteLoading
                      }
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        text-red-600
                        transition
                        hover:bg-red-50
                        disabled:opacity-50
                      "
                      onClick={
                        handleDelete
                      }
                    >
                      {deleteLoading
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </>
                )}

                {/* REPORT */}

                {!isOwnComment && (
  <button
    type="button"
    onClick={() => {
      setMenuOpen(false);
      setShowReport(true);
    }}
    className="
      w-full
      px-4
      py-2.5
      text-left
      text-sm
      font-medium
      text-red-600
      hover:bg-red-50
    "
  >
    Report
  </button>
)}
              </div>
            )}
          </div>
        </div>

        {/* ================================= */}
        {/* EDIT */}
        {/* ================================= */}

        {showEdit ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(event) =>
                setEditText(
                  event.target.value
                )
              }
              maxLength={2000}
              rows={3}
              autoFocus
              disabled={editLoading}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-zinc-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-zinc-900
                outline-none
                focus:border-zinc-900
              "
            />

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">
                {editText.length}/2000
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    editLoading
                  }
                  onClick={() => {
                    setEditText(
                      comment.text
                    );

                    setShowEdit(
                      false
                    );
                  }}
                  className="
                    rounded-full
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-zinc-700
                    hover:bg-zinc-100
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    editLoading ||
                    !editText.trim()
                  }
                  onClick={
                    handleEdit
                  }
                  className="
                    rounded-full
                    bg-zinc-900
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-white
                    hover:bg-zinc-700
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  {editLoading
                    ? "Saving..."
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================================= */
          /* COMMENT TEXT */
          /* ================================= */

          <p
            className="
              mt-1
              whitespace-pre-wrap
              break-words
              text-[14px]
              leading-[1.45]
              text-zinc-900
            "
          >
            {comment.text}
          </p>
        )}

        {/* ================================= */}
        {/* ACTIONS */}
        {/* ================================= */}

        <div className="mt-2 flex items-center">
          {/* LIKE */}

          <button
            type="button"
            disabled={
              reactionLoading
            }
            aria-label="Like"
            onClick={() =>
              handleReaction(
                "like"
              )
            }
            className={`
              flex
              h-8
              items-center
              gap-1.5
              rounded-full
              px-2.5
              transition
              ${
                reaction === "like"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-600 hover:bg-zinc-100"
              }
            `}
          >
            <LikeIcon
              active={
                reaction === "like"
              }
            />

            {likeCount > 0 && (
              <span className="text-xs font-medium">
                {likeCount}
              </span>
            )}
          </button>

          {/* DISLIKE */}

          <button
            type="button"
            disabled={
              reactionLoading
            }
            aria-label="Dislike"
            onClick={() =>
              handleReaction(
                "dislike"
              )
            }
            className={`
              flex
              h-8
              items-center
              rounded-full
              px-2.5
              transition
              ${
                reaction === "dislike"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-600 hover:bg-zinc-100"
              }
            `}
          >
            <DislikeIcon
              active={
                reaction === "dislike"
              }
            />
          </button>

          {/* REPLY */}

          <button
            type="button"
            onClick={() =>
              setShowReplyComposer(
                (value) => !value
              )
            }
            className="
              ml-1
              h-8
              rounded-full
              px-3
              text-xs
              font-semibold
              text-zinc-800
              transition
              hover:bg-zinc-100
            "
          >
            Reply
          </button>
        </div>

        {/* ================================= */}
        {/* REACTION ERROR */}
        {/* ================================= */}

        {reactionError && (
          <p className="mt-1 text-xs text-red-600">
            {reactionError}
          </p>
        )}

        {/* ================================= */}
        {/* REPLY COMPOSER */}
        {/* ================================= */}

        {showReplyComposer && (
          <div className="mt-3">
            <ReplyComposer
              articleId={
                comment.articleId
              }
              articleSlug={
                comment.articleSlug
              }
              parentId={
                comment.id
              }
              onCreated={(
                newReply
              ) => {
                setShowReplyComposer(
                  false
                );

                setReplies(
                  (current) => [
                    ...current,
                    newReply,
                  ]
                );

                setReplyCount(
                  (current) =>
                    current + 1
                );

                setShowReplies(
                  true
                );
              }}
              onCancel={() => {
                setShowReplyComposer(
                  false
                );
              }}
            />
          </div>
        )}

        {/* ================================= */}
        {/* VIEW REPLIES */}
        {/* ================================= */}

        {replyCount > 0 && (
          <button
            type="button"
            onClick={
              handleToggleReplies
            }
            className="
              mt-2
              flex
              items-center
              gap-1
              rounded-full
              px-2
              py-1.5
              text-sm
              font-semibold
              text-red-600
              transition
              hover:bg-red-50
            "
          >
            <span className="text-[11px]">
              {showReplies
                ? "▲"
                : "▼"}
            </span>

            <span>
              {showReplies
                ? "Hide replies"
                : replyCount === 1
                ? "View 1 reply"
                : `View ${replyCount} replies`}
            </span>
          </button>
        )}

        {/* ================================= */}
        {/* REPLIES */}
        {/* ================================= */}

        {showReplies && (
          <div
            className="
              mt-3
              ml-2
              border-l-2
              border-zinc-200
              pl-4
            "
          >
            {repliesLoading && (
              <div className="py-3 text-sm text-zinc-500">
                Loading replies...
              </div>
            )}

            {!repliesLoading &&
              repliesError && (
                <div className="py-3 text-sm text-red-600">
                  {repliesError}
                </div>
              )}

            {!repliesLoading &&
              !repliesError &&
              replies.length === 0 && (
                <div className="py-3 text-sm text-zinc-500">
                  No replies yet.
                </div>
              )}

            {!repliesLoading &&
              !repliesError &&
              replies.length > 0 && (
                <div className="space-y-5 py-2">
                  {replies.map(
                    (reply) => (
                      <ReplyItem
                        key={reply.id}
                        reply={reply}
                        articleId={
                          comment.articleId
                        }
                        articleSlug={
                          comment.articleSlug
                        }
                        onCreated={(
                          newReply
                        ) => {
                          setReplies(
                            (
                              current
                            ) => [
                              ...current,
                              newReply,
                            ]
                          );

                          setReplyCount(
                            (
                              current
                            ) =>
                              current +
                              1
                          );
                        }}
                      />
                    )
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {/* ==========================================
    REPORT MODAL
========================================== */}

{showReport && (
  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
    "
    onClick={() => {
      if (!reportLoading) {
        setShowReport(false);
        setReportError("");
        setReportSuccess(false);
      }
    }}
  >
    <div
      className="
        w-full
        max-w-md
        rounded-2xl
        bg-white
        p-5
        shadow-2xl
      "
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      {!reportSuccess ? (
        <>
          <h3 className="text-lg font-semibold text-zinc-900">
            Report comment
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Why are you reporting this comment?
          </p>

          {/* REASONS */}

          <div className="mt-4 space-y-2">

            {[
              {
                value: "spam",
                label: "Spam",
              },
              {
                value: "harassment",
                label: "Harassment or abuse",
              },
              {
                value: "hate_speech",
                label: "Hate speech",
              },
              {
                value: "misinformation",
                label: "Misinformation",
              },
              {
                value: "inappropriate",
                label: "Inappropriate content",
              },
              {
                value: "other",
                label: "Other",
              },
            ].map((item) => (
              <label
                key={item.value}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-zinc-200
                  px-3
                  py-2.5
                  transition
                  hover:bg-zinc-50
                "
              >
                <input
                  type="radio"
                  name={`report-${comment.id}`}
                  value={item.value}
                  checked={
                    reportReason ===
                    item.value
                  }
                  onChange={() =>
                    setReportReason(
                      item.value as CommentReportReason
                    )
                  }
                  disabled={reportLoading}
                  className="accent-red-600"
                />

                <span className="text-sm text-zinc-800">
                  {item.label}
                </span>
              </label>
            ))}

          </div>

          {/* DETAILS */}

          <textarea
            value={reportDetails}
            onChange={(event) =>
              setReportDetails(
                event.target.value
              )
            }
            maxLength={1000}
            rows={3}
            disabled={reportLoading}
            placeholder="Additional details (optional)"
            className="
              mt-4
              w-full
              resize-none
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-3
              py-2.5
              text-sm
              text-zinc-900
              outline-none
              placeholder:text-zinc-400
              focus:border-zinc-900
            "
          />

          <div className="mt-1 text-right text-[11px] text-zinc-400">
            {reportDetails.length}/1000
          </div>

          {/* ERROR */}

          {reportError && (
            <p className="mt-2 text-sm text-red-600">
              {reportError}
            </p>
          )}

          {/* BUTTONS */}

          <div className="mt-5 flex gap-2">

            <button
              type="button"
              disabled={reportLoading}
              onClick={() => {
                setShowReport(false);
                setReportReason("");
                setReportDetails("");
                setReportError("");
              }}
              className="
                flex-1
                rounded-xl
                bg-zinc-100
                py-2.5
                text-sm
                font-semibold
                text-zinc-800
                transition
                hover:bg-zinc-200
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                reportLoading ||
                !reportReason
              }
              onClick={handleReport}
              className="
                flex-1
                rounded-xl
                bg-red-600
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              {reportLoading
                ? "Submitting..."
                : "Submit report"}
            </button>

          </div>
        </>
      ) : (
        /* SUCCESS */

        <div className="py-4 text-center">

          <div className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-green-100
            text-xl
            text-green-600
          ">
            ✓
          </div>

          <h3 className="mt-4 text-lg font-semibold text-zinc-900">
            Report submitted
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Thank you. Our team will review this
            comment.
          </p>

          <button
            type="button"
            onClick={() => {
              setShowReport(false);
              setReportSuccess(false);
              setReportError("");
            }}
            className="
              mt-5
              w-full
              rounded-xl
              bg-zinc-900
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-zinc-700
            "
          >
            Done
          </button>

        </div>
      )}

    </div>
  </div>
)}
    </article>
  );
}

// ==========================================
// REPLY ITEM
// ==========================================

function ReplyItem({
  reply,
  articleId,
  articleSlug,
  onCreated,
}: {
  reply: CommentData;
  articleId: string;
  articleSlug: string;
  onCreated?: (
    reply: CommentData
  ) => void;
}) {
  const [reaction, setReaction] =
    useState<
      "like" | "dislike" | null
    >(null);

  const [likeCount, setLikeCount] =
    useState(reply.likeCount);

  const [dislikeCount, setDislikeCount] =
    useState(reply.dislikeCount);

  const [reactionLoading, setReactionLoading] =
    useState(false);

  const [reactionError, setReactionError] =
    useState("");

  const [
    showReplyComposer,
    setShowReplyComposer,
  ] = useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [showEdit, setShowEdit] =
    useState(false);

  const [editText, setEditText] =
    useState(reply.text);

  const [editLoading, setEditLoading] =
    useState(false);

  const [deleted, setDeleted] =
    useState(false);

  const currentUser =
    commentsAuth.currentUser;

  const isOwner =
    currentUser?.uid === reply.userId;
  const [showReport, setShowReport] =
  useState(false);

const [reportReason, setReportReason] =
  useState<CommentReportReason | "">("");

const [reportDetails, setReportDetails] =
  useState("");

const [reportLoading, setReportLoading] =
  useState(false);

const [reportError, setReportError] =
  useState("");

const [reportSuccess, setReportSuccess] =
  useState(false);
  // ==========================================
  // LOAD REACTION
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadReaction() {
      const user =
        commentsAuth.currentUser;

      if (!user) {
        return;
      }

      try {
        const currentReaction =
          await getCommentReaction(
            reply.id,
            user.uid
          );

        if (!cancelled) {
          setReaction(
            currentReaction
          );
        }
      } catch (error) {
        console.error(
          "GET REPLY REACTION ERROR:",
          error
        );
      }
    }

    loadReaction();

    return () => {
      cancelled = true;
    };
  }, [reply.id]);

  // ==========================================
  // REACTION
  // ==========================================

  async function handleReaction(
    type: "like" | "dislike"
  ) {
    const user =
      commentsAuth.currentUser;

    if (!user) {
      setReactionError(
        "Like karne ke liye Google se login karein."
      );

      return;
    }

    if (reactionLoading) {
      return;
    }

    try {
      setReactionLoading(true);
      setReactionError("");

      const result =
        await toggleCommentReaction(
          reply.id,
          user.uid,
          type
        );

      setReaction(
        result.reaction
      );

      setLikeCount(
        result.likeCount
      );

      setDislikeCount(
        result.dislikeCount
      );
    } catch (error) {
      console.error(
        "REPLY REACTION ERROR:",
        error
      );

      setReactionError(
        "Reaction update nahi ho paaya."
      );
    } finally {
      setReactionLoading(false);
    }
  }

  // ==========================================
  // EDIT REPLY
  // ==========================================

  async function handleEdit() {
    if (!isOwner) {
      return;
    }

    const cleanedText =
      editText.trim();

    if (!cleanedText) {
      return;
    }

    try {
      setEditLoading(true);

      await updateComment(
        reply.id,
        cleanedText
      );

      reply.text =
        cleanedText;

      setEditText(
        cleanedText
      );

      setShowEdit(false);
    } catch (error) {
      console.error(
        "UPDATE REPLY ERROR:",
        error
      );

      alert(
        "Reply update nahi ho paaya."
      );
    } finally {
      setEditLoading(false);
    }
  }

  // ==========================================
  // DELETE REPLY
  // ==========================================

  async function handleDelete() {
    if (!isOwner) {
      return;
    }

    const confirmed =
      window.confirm(
        "Kya aap is reply ko delete karna chahte hain?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteComment(
        reply.id
      );

      setDeleted(true);
    } catch (error) {
      console.error(
        "DELETE REPLY ERROR:",
        error
      );

      alert(
        "Reply delete nahi ho paaya."
      );
    }
  }
  async function handleReport() {
  const user =
    commentsAuth.currentUser;

  if (!user) {
    setReportError(
      "Report karne ke liye Google se login karein."
    );

    return;
  }

  if (!reportReason) {
    setReportError(
      "Please select a reason."
    );

    return;
  }

  if (reportLoading) {
    return;
  }

  try {
    setReportLoading(true);
    setReportError("");

    await createCommentReport({
      commentId: reply.id,

      articleId,

      articleSlug,

      reporterId:
        user.uid,

      reporterName:
        user.displayName ||
        "User",

      reporterEmail:
        user.email ||
        "",

      reason:
        reportReason,

      details:
        reportDetails,
    });
    

    setReportSuccess(true);
    setReportReason("");
    setReportDetails("");
  } catch (error) {
    console.error(
      "REPORT REPLY ERROR:",
      error
    );

    setReportError(
      error instanceof Error
        ? error.message
        : "Report submit nahi ho paaya."
    );
  } finally {
    setReportLoading(false);
  }
}

  if (deleted) {
    return (
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          —
        </div>

        <p className="text-sm italic text-zinc-500">
          This reply was deleted.
        </p>
      </div>
    );
  }
  

  return (
    <div className="group flex gap-3">
      {/* AVATAR */}

      <div className="shrink-0">
        {reply.userPhoto ? (
          <img
            src={reply.userPhoto}
            alt={reply.userName}
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
            {(reply.userName || "U")
              .charAt(0)
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="min-w-0 flex-1">
        {/* NAME + TIME + MENU */}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            {reply.userName}
          </span>

          {reply.createdAt && (
            <>
              <span className="text-xs text-zinc-400">
                ·
              </span>

              <span className="text-xs text-zinc-500">
                {formatRelativeTime(
                  reply.createdAt
                )}
              </span>
            </>
          )}

          <div className="relative ml-auto">
            <button
              type="button"
              aria-label="Reply options"
              onClick={() =>
                setMenuOpen(
                  (value) => !value
                )
              }
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                text-zinc-500
                opacity-0
                transition
                hover:bg-zinc-100
                group-hover:opacity-100
                focus:opacity-100
              "
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-8
                  z-30
                  w-40
                  overflow-hidden
                  rounded-xl
                  bg-white
                  py-1
                  shadow-lg
                  ring-1
                  ring-black/5
                "
              >
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditText(
                          reply.text
                        );

                        setShowEdit(
                          true
                        );

                        setMenuOpen(
                          false
                        );
                      }}
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        hover:bg-zinc-100
                      "
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleDelete
                      }
                      className="
                        w-full
                        px-4
                        py-2.5
                        text-left
                        text-sm
                        text-red-600
                        hover:bg-red-50
                      "
                    >
                      Delete
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
    setMenuOpen(false);
    setShowReport(true);
  }}
                  className="
                    w-full
                    px-4
                    py-2.5
                    text-left
                    text-sm
                    hover:bg-zinc-100
                  "
                >
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* EDIT */}

        {showEdit ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(event) =>
                setEditText(
                  event.target.value
                )
              }
              maxLength={2000}
              rows={3}
              autoFocus
              disabled={editLoading}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-zinc-300
                px-3
                py-2
                text-sm
                outline-none
                focus:border-zinc-900
              "
            />

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                disabled={
                  editLoading
                }
                onClick={() =>
                  setShowEdit(
                    false
                  )
                }
                className="
                  rounded-full
                  px-3
                  py-2
                  text-xs
                  hover:bg-zinc-100
                "
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  editLoading ||
                  !editText.trim()
                }
                onClick={
                  handleEdit
                }
                className="
                  rounded-full
                  bg-zinc-900
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  disabled:opacity-40
                "
              >
                {editLoading
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p
            className="
              mt-1
              whitespace-pre-wrap
              break-words
              text-sm
              leading-6
              text-zinc-800
            "
          >
            {reply.text}
          </p>
        )}

        {/* ACTIONS */}

        <div className="mt-1 flex items-center">
          <button
            type="button"
            disabled={
              reactionLoading
            }
            onClick={() =>
              handleReaction(
                "like"
              )
            }
            className={`
              flex
              h-8
              items-center
              gap-1.5
              rounded-full
              px-2.5
              transition
              ${
                reaction === "like"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-600 hover:bg-zinc-100"
              }
            `}
          >
            <LikeIcon
              active={
                reaction === "like"
              }
            />

            {likeCount > 0 && (
              <span className="text-xs font-medium">
                {likeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            disabled={
              reactionLoading
            }
            onClick={() =>
              handleReaction(
                "dislike"
              )
            }
            className={`
              flex
              h-8
              items-center
              rounded-full
              px-2.5
              transition
              ${
                reaction ===
                "dislike"
                  ? "bg-zinc-100 text-black"
                  : "text-zinc-600 hover:bg-zinc-100"
              }
            `}
          >
            <DislikeIcon
              active={
                reaction ===
                "dislike"
              }
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setShowReplyComposer(
                (value) => !value
              )
            }
            className="
              ml-1
              h-8
              rounded-full
              px-3
              text-xs
              font-semibold
              text-zinc-700
              hover:bg-zinc-100
            "
          >
            Reply
          </button>
        </div>

        {/* ERROR */}

        {reactionError && (
          <p className="mt-1 text-xs text-red-600">
            {reactionError}
          </p>
        )}

        {/* NESTED REPLY */}

        {showReplyComposer && (
          <div className="mt-3">
            <ReplyComposer
              articleId={articleId}
              articleSlug={
                articleSlug
              }
              parentId={reply.id}
              onCreated={(
                newReply
              ) => {
                setShowReplyComposer(
                  false
                );

                onCreated?.(
                  newReply
                );
              }}
              onCancel={() =>
                setShowReplyComposer(
                  false
                )
              }
            />
          </div>
        )}
      </div>
    
             {showReport && (
  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/40
      p-4
    "
    onClick={() => {
      if (!reportLoading) {
        setShowReport(false);
        setReportError("");
        setReportSuccess(false);
      }
    }}
  >
    <div
      className="
        w-full
        max-w-md
        rounded-2xl
        bg-white
        p-5
        shadow-2xl
      "
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      {!reportSuccess ? (
        <>
          <h3 className="text-lg font-semibold text-zinc-900">
            Report reply
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Why are you reporting this reply?
          </p>

          <div className="mt-4 space-y-2">
            {[
              {
                value: "spam",
                label: "Spam",
              },
              {
                value: "harassment",
                label: "Harassment or abuse",
              },
              {
                value: "hate_speech",
                label: "Hate speech",
              },
              {
                value: "misinformation",
                label: "Misinformation",
              },
              {
                value: "inappropriate",
                label: "Inappropriate content",
              },
              {
                value: "other",
                label: "Other",
              },
            ].map((item) => (
              <label
                key={item.value}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-zinc-200
                  px-3
                  py-2.5
                  hover:bg-zinc-50
                "
              >
                <input
                  type="radio"
                  name={`reply-report-${reply.id}`}
                  value={item.value}
                  checked={
                    reportReason ===
                    item.value
                  }
                  onChange={() =>
                    setReportReason(
                      item.value as CommentReportReason
                    )
                  }
                  disabled={reportLoading}
                  className="accent-red-600"
                />

                <span className="text-sm text-zinc-800">
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          <textarea
            value={reportDetails}
            onChange={(event) =>
              setReportDetails(
                event.target.value
              )
            }
            maxLength={1000}
            rows={3}
            disabled={reportLoading}
            placeholder="Additional details (optional)"
            className="
              mt-4
              w-full
              resize-none
              rounded-xl
              border
              border-zinc-300
              px-3
              py-2.5
              text-sm
              outline-none
              focus:border-zinc-900
            "
          />

          <div className="mt-1 text-right text-[11px] text-zinc-400">
            {reportDetails.length}/1000
          </div>

          {reportError && (
            <p className="mt-2 text-sm text-red-600">
              {reportError}
            </p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              disabled={reportLoading}
              onClick={() => {
                setShowReport(false);
                setReportReason("");
                setReportDetails("");
                setReportError("");
              }}
              className="
                flex-1
                rounded-xl
                bg-zinc-100
                py-2.5
                text-sm
                font-semibold
                text-zinc-800
                hover:bg-zinc-200
              "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                reportLoading ||
                !reportReason
              }
              onClick={handleReport}
              className="
                flex-1
                rounded-xl
                bg-red-600
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:bg-red-700
                disabled:opacity-40
              "
            >
              {reportLoading
                ? "Submitting..."
                : "Submit report"}
            </button>
          </div>
        </>
      ) : (
        <div className="py-4 text-center">
          <div className="
            mx-auto
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            bg-green-100
            text-xl
            text-green-600
          ">
            ✓
          </div>

          <h3 className="mt-4 text-lg font-semibold">
            Report submitted
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Thank you. Our team will review this reply.
          </p>

          <button
            type="button"
            onClick={() => {
              setShowReport(false);
              setReportSuccess(false);
              setReportError("");
            }}
            className="
              mt-5
              w-full
              rounded-xl
              bg-zinc-900
              py-2.5
              text-sm
              font-semibold
              text-white
            "
          >
            Done
          </button>
        </div>
      )}
    </div>
  </div>
)}</div>
  );
}

// ==========================================
// RELATIVE TIME
// ==========================================

function formatRelativeTime(
  dateString: string
) {
  const date =
    new Date(dateString);

  const diff =
    Date.now() -
    date.getTime();

  const seconds =
    Math.floor(diff / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes =
    Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days =
    Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}