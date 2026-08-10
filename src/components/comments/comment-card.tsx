"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import {
  CommentData,
  CommentReportReason,
  createCommentReport,
  deleteComment,
  getCommentReaction,
  getCommentReplies,
  toggleCommentReaction,
  updateComment,
} from "@/services/comments/comments.service";

import ReplyComposer from "./reply-composer";

import { commentsAuth } from "@/lib/firebase/firebase-comments";
import { signInToComments } from "@/services/comments/comments-auth.service";

interface Props {
  comment: CommentData;
}

type Reaction = "like" | "dislike" | null;
type PendingAction = () => void;

const REPORT_REASONS: Array<{
  value: CommentReportReason;
  label: string;
}> = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "misinformation", label: "Misinformation" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function LikeIcon({ active = false }: { active?: boolean }) {
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

function DislikeIcon({ active = false }: { active?: boolean }) {
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.15Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.46-2.35l-3.14-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.53A9.75 9.75 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.51 13.58A5.86 5.86 0 0 1 6.2 12c0-.55.1-1.08.31-1.58V7.89H3.27A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.02 4.11l3.24-2.53Z" />
      <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.73 5.39l3.24 2.53C7.29 8.1 9.45 6.38 12 6.38Z" />
    </svg>
  );
}

function GoogleLoginModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  if (!open) return null;

  async function handleGoogleLogin() {
    if (loginLoading) return;

    try {
      setLoginLoading(true);
      setLoginError("");
      await signInToComments();
      onSuccess();
    } catch (error: any) {
      console.error("COMMENT GOOGLE LOGIN ERROR:", error);

      if (error?.code === "auth/popup-closed-by-user") return;

      if (error?.code === "auth/popup-blocked") {
        setLoginError("Google login popup block ho gaya. Browser me popups allow karein.");
        return;
      }

      setLoginError("Google login nahi ho paaya. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={() => !loginLoading && onClose()}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
              <GoogleIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Sign in to continue</h3>
              <p className="mt-0.5 text-xs text-zinc-500">Sign in with Google to interact with comments.</p>
            </div>
          </div>

          {loginError && <p className="mt-4 text-xs font-medium text-red-600">{loginError}</p>}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                Signing in...
              </>
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loginLoading}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  open,
  isReply,
  commentId,
  reason,
  details,
  loading,
  error,
  success,
  onReasonChange,
  onDetailsChange,
  onSubmit,
  onClose,
}: {
  open: boolean;
  isReply: boolean;
  commentId: string;
  reason: CommentReportReason | "";
  details: string;
  loading: boolean;
  error: string;
  success: boolean;
  onReasonChange: (value: CommentReportReason) => void;
  onDetailsChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {!success ? (
          <>
            <h3 className="text-lg font-semibold text-zinc-900">Report {isReply ? "reply" : "comment"}</h3>
            <p className="mt-1 text-sm text-zinc-500">Why are you reporting this {isReply ? "reply" : "comment"}?</p>

            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((item) => (
                <label key={item.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 px-3 py-2.5 transition hover:bg-zinc-50">
                  <input
                    type="radio"
                    name={`report-${commentId}`}
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => onReasonChange(item.value)}
                    disabled={loading}
                    className="accent-red-600"
                  />
                  <span className="text-sm text-zinc-800">{item.label}</span>
                </label>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(event) => onDetailsChange(event.target.value)}
              maxLength={1000}
              rows={3}
              disabled={loading}
              placeholder="Additional details (optional)"
              className="mt-4 w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-900"
            />

            <div className="mt-1 text-right text-[11px] text-zinc-400">{details.length}/1000</div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 rounded-xl bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !reason}
                onClick={onSubmit}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl text-green-600">✓</div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">Report submitted</h3>
            <p className="mt-1 text-sm text-zinc-500">Thank you. Our team will review this {isReply ? "reply" : "comment"}.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function useCommentsUser() {
  const [user, setUser] = useState<User | null>(commentsAuth.currentUser);

  useEffect(() => {
    return onAuthStateChanged(commentsAuth, setUser);
  }, []);

  return user;
}

function useLoginGate() {
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  function requireLogin(action: PendingAction) {
    if (commentsAuth.currentUser) {
      action();
      return;
    }

    setPendingAction(() => action);
    setShowLogin(true);
  }

  function handleLoginSuccess() {
    setShowLogin(false);
    const action = pendingAction;
    setPendingAction(null);

    if (action) {
      window.setTimeout(action, 0);
    }
  }

  function closeLogin() {
    setShowLogin(false);
    setPendingAction(null);
  }

  return { showLogin, requireLogin, handleLoginSuccess, closeLogin };
}

function useReportState() {
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<CommentReportReason | "">("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  function openReport() {
    setReportError("");
    setReportSuccess(false);
    setReportReason("");
    setReportDetails("");
    setShowReport(true);
  }

  function closeReport() {
    if (reportLoading) return;
    setShowReport(false);
    setReportError("");
    setReportSuccess(false);
    setReportReason("");
    setReportDetails("");
  }

  return {
    showReport,
    reportReason,
    reportDetails,
    reportLoading,
    reportError,
    reportSuccess,
    setReportReason,
    setReportDetails,
    setReportLoading,
    setReportError,
    setReportSuccess,
    openReport,
    closeReport,
  };
}

export default function CommentCard({ comment }: Props) {
  const user = useCommentsUser();
  const { showLogin, requireLogin, handleLoginSuccess, closeLogin } = useLoginGate();
  const report = useReportState();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(null);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [reactionError, setReactionError] = useState("");
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentData[]>([]);
  const [replyCount, setReplyCount] = useState(comment.replyCount);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesError, setRepliesError] = useState("");

  const isOwner = user?.uid === comment.userId;

  useEffect(() => {
    let cancelled = false;

    async function loadReaction() {
      if (!user) {
        setReaction(null);
        return;
      }

      try {
        const currentReaction = await getCommentReaction(comment.id, user.uid);
        if (!cancelled) setReaction(currentReaction);
      } catch (error) {
        console.error("GET COMMENT REACTION ERROR:", error);
      }
    }

    loadReaction();
    return () => {
      cancelled = true;
    };
  }, [comment.id, user]);

  async function loadReplies() {
    try {
      setRepliesLoading(true);
      setRepliesError("");
      const data = await getCommentReplies(comment.id);
      setReplies(data);
    } catch (error) {
      console.error("GET REPLIES ERROR:", error);
      setRepliesError("Replies load nahi ho paaye.");
    } finally {
      setRepliesLoading(false);
    }
  }

  async function handleReaction(type: "like" | "dislike") {
    const currentUser = commentsAuth.currentUser;
    if (!currentUser) {
      requireLogin(() => handleReaction(type));
      return;
    }

    if (reactionLoading) return;

    try {
      setReactionLoading(true);
      setReactionError("");
      const result = await toggleCommentReaction(comment.id, currentUser.uid, type);
      setReaction(result.reaction);
      setLikeCount(result.likeCount);
      setDislikeCount(result.dislikeCount);
    } catch (error) {
      console.error("COMMENT REACTION ERROR:", error);
      setReactionError("Reaction update nahi ho paaya.");
    } finally {
      setReactionLoading(false);
    }
  }

  async function handleToggleReplies() {
    const next = !showReplies;
    setShowReplies(next);
    if (next && replies.length === 0) await loadReplies();
  }

  async function handleEdit() {
    if (!isOwner) return;
    const cleanedText = editText.trim();
    if (!cleanedText || cleanedText.length > 2000) return;

    try {
      setEditLoading(true);
      await updateComment(comment.id, cleanedText);
      comment.text = cleanedText;
      setEditText(cleanedText);
      setShowEdit(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("UPDATE COMMENT ERROR:", error);
      alert("Comment update nahi ho paaya.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!isOwner) return;

    try {
      setDeleteLoading(true);
      await deleteComment(comment.id);
      setDeleted(true);
    } catch (error) {
      console.error("DELETE COMMENT ERROR:", error);
      alert("Comment delete nahi ho paaya.");
    } finally {
      setDeleteLoading(false);
      setMenuOpen(false);
    }
  }

  async function handleReport() {
    const currentUser = commentsAuth.currentUser;
    if (!currentUser) {
      requireLogin(() => handleReport());
      return;
    }

    if (!report.reportReason) {
      report.setReportError("Please select a reason.");
      return;
    }

    if (report.reportLoading) return;

    try {
      report.setReportLoading(true);
      report.setReportError("");

      await createCommentReport({
        commentId: comment.id,
        articleId: comment.articleId,
        articleSlug: comment.articleSlug,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || "User",
        reporterEmail: currentUser.email || "",
        reason: report.reportReason,
        details: report.reportDetails,
      });

      report.setReportSuccess(true);
      report.setReportReason("");
      report.setReportDetails("");
    } catch (error) {
      console.error("REPORT COMMENT ERROR:", error);
      report.setReportError(error instanceof Error ? error.message : "Report submit nahi ho paaya.");
    } finally {
      report.setReportLoading(false);
    }
  }

  if (deleted) {
    return (
      <article className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">—</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm italic text-zinc-500">This comment was deleted.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex gap-3">
      <div className="shrink-0">
        {comment.userPhoto ? (
          <img
            src={comment.userPhoto}
            alt={comment.userName}
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700">
            {(comment.userName || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-zinc-900">{comment.userName}</span>
          {comment.createdAt && (
            <>
              <span className="text-[12px] text-zinc-400">·</span>
              <span className="text-[12px] text-zinc-500">{formatRelativeTime(comment.createdAt)}</span>
            </>
          )}

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Comment options"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-[0_4px_18px_rgba(0,0,0,0.15)] ring-1 ring-black/5">
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditText(comment.text);
                        setShowEdit(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-800 transition hover:bg-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={deleteLoading}
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deleteLoading ? "Deleting..." : "Delete"}
                    </button>
                  </>
                )}

                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      requireLogin(() => report.openReport());
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {showEdit ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              maxLength={2000}
              rows={3}
              autoFocus
              disabled={editLoading}
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">{editText.length}/2000</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={editLoading}
                  onClick={() => {
                    setEditText(comment.text);
                    setShowEdit(false);
                  }}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={editLoading || !editText.trim()}
                  onClick={handleEdit}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-[14px] leading-[1.45] text-zinc-900">{comment.text}</p>
        )}

        <div className="mt-2 flex items-center">
          <button
            type="button"
            disabled={reactionLoading}
            aria-label="Like"
            onClick={() => requireLogin(() => handleReaction("like"))}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 transition ${reaction === "like" ? "bg-zinc-100 text-black" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            <LikeIcon active={reaction === "like"} />
            {likeCount > 0 && <span className="text-xs font-medium">{likeCount}</span>}
          </button>

          <button
            type="button"
            disabled={reactionLoading}
            aria-label="Dislike"
            onClick={() => requireLogin(() => handleReaction("dislike"))}
            className={`flex h-8 items-center rounded-full px-2.5 transition ${reaction === "dislike" ? "bg-zinc-100 text-black" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            <DislikeIcon active={reaction === "dislike"} />
            {dislikeCount > 0 && <span className="ml-1 text-xs font-medium">{dislikeCount}</span>}
          </button>

          <button
            type="button"
            onClick={() => requireLogin(() => setShowReplyComposer((value) => !value))}
            className="ml-1 h-8 rounded-full px-3 text-xs font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            Reply
          </button>
        </div>

        {reactionError && <p className="mt-1 text-xs text-red-600">{reactionError}</p>}

        {showReplyComposer && (
          <div className="mt-3">
            <ReplyComposer
              articleId={comment.articleId}
              articleSlug={comment.articleSlug}
              parentId={comment.id}
              onCreated={(newReply: CommentData) => {
                setShowReplyComposer(false);
                setReplies((current: CommentData[]) => [...current, newReply]);
                setReplyCount((current: number) => current + 1);
                setShowReplies(true);
              }}
              onCancel={() => setShowReplyComposer(false)}
            />
          </div>
        )}

        {replyCount > 0 && (
          <button
            type="button"
            onClick={handleToggleReplies}
            className="mt-2 flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <span className="text-[11px]">{showReplies ? "▲" : "▼"}</span>
            <span>{showReplies ? "Hide replies" : replyCount === 1 ? "View 1 reply" : `View ${replyCount} replies`}</span>
          </button>
        )}

        {showReplies && (
          <div className="mt-3 ml-2 border-l-2 border-zinc-200 pl-4">
            {repliesLoading && <div className="py-3 text-sm text-zinc-500">Loading replies...</div>}
            {!repliesLoading && repliesError && <div className="py-3 text-sm text-red-600">{repliesError}</div>}
            {!repliesLoading && !repliesError && replies.length === 0 && <div className="py-3 text-sm text-zinc-500">No replies yet.</div>}
            {!repliesLoading && !repliesError && replies.length > 0 && (
              <div className="space-y-5 py-2">
                {replies.map((reply) => (
                  <ReplyItem
                    key={reply.id}
                    reply={reply}
                    articleId={comment.articleId}
                    articleSlug={comment.articleSlug}
                    onCreated={(newReply: CommentData) => {
                      setReplies((current: CommentData[]) => [...current, newReply]);
                      setReplyCount((current: number) => current + 1);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ReportModal
        open={report.showReport}
        isReply={false}
        commentId={comment.id}
        reason={report.reportReason}
        details={report.reportDetails}
        loading={report.reportLoading}
        error={report.reportError}
        success={report.reportSuccess}
        onReasonChange={report.setReportReason}
        onDetailsChange={report.setReportDetails}
        onSubmit={handleReport}
        onClose={report.closeReport}
      />

      <GoogleLoginModal open={showLogin} onClose={closeLogin} onSuccess={handleLoginSuccess} />
    </article>
  );
}

function ReplyItem({
  reply,
  articleId,
  articleSlug,
  onCreated,
}: {
  reply: CommentData;
  articleId: string;
  articleSlug: string;
  onCreated?: (reply: CommentData) => void;
}) {
  const user = useCommentsUser();
  const { showLogin, requireLogin, handleLoginSuccess, closeLogin } = useLoginGate();
  const report = useReportState();

  const [reaction, setReaction] = useState<Reaction>(null);
  const [likeCount, setLikeCount] = useState(reply.likeCount);
  const [dislikeCount, setDislikeCount] = useState(reply.dislikeCount);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [reactionError, setReactionError] = useState("");
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState(reply.text);
  const [editLoading, setEditLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const isOwner = user?.uid === reply.userId;

  useEffect(() => {
    let cancelled = false;

    async function loadReaction() {
      if (!user) {
        setReaction(null);
        return;
      }

      try {
        const currentReaction = await getCommentReaction(reply.id, user.uid);
        if (!cancelled) setReaction(currentReaction);
      } catch (error) {
        console.error("GET REPLY REACTION ERROR:", error);
      }
    }

    loadReaction();
    return () => {
      cancelled = true;
    };
  }, [reply.id, user]);

  async function handleReaction(type: "like" | "dislike") {
    const currentUser = commentsAuth.currentUser;
    if (!currentUser) {
      requireLogin(() => handleReaction(type));
      return;
    }

    if (reactionLoading) return;

    try {
      setReactionLoading(true);
      setReactionError("");
      const result = await toggleCommentReaction(reply.id, currentUser.uid, type);
      setReaction(result.reaction);
      setLikeCount(result.likeCount);
      setDislikeCount(result.dislikeCount);
    } catch (error) {
      console.error("REPLY REACTION ERROR:", error);
      setReactionError("Reaction update nahi ho paaya.");
    } finally {
      setReactionLoading(false);
    }
  }

  async function handleEdit() {
    if (!isOwner) return;
    const cleanedText = editText.trim();
    if (!cleanedText || cleanedText.length > 2000) return;

    try {
      setEditLoading(true);
      await updateComment(reply.id, cleanedText);
      reply.text = cleanedText;
      setEditText(cleanedText);
      setShowEdit(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("UPDATE REPLY ERROR:", error);
      alert("Reply update nahi ho paaya.");
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!isOwner) return;
    if (!window.confirm("Kya aap is reply ko delete karna chahte hain?")) return;

    try {
      await deleteComment(reply.id);
      setDeleted(true);
    } catch (error) {
      console.error("DELETE REPLY ERROR:", error);
      alert("Reply delete nahi ho paaya.");
    } finally {
      setMenuOpen(false);
    }
  }

  async function handleReport() {
    const currentUser = commentsAuth.currentUser;
    if (!currentUser) {
      requireLogin(() => handleReport());
      return;
    }

    if (!report.reportReason) {
      report.setReportError("Please select a reason.");
      return;
    }

    if (report.reportLoading) return;

    try {
      report.setReportLoading(true);
      report.setReportError("");

      await createCommentReport({
        commentId: reply.id,
        articleId,
        articleSlug,
        reporterId: currentUser.uid,
        reporterName: currentUser.displayName || "User",
        reporterEmail: currentUser.email || "",
        reason: report.reportReason,
        details: report.reportDetails,
      });

      report.setReportSuccess(true);
      report.setReportReason("");
      report.setReportDetails("");
    } catch (error) {
      console.error("REPORT REPLY ERROR:", error);
      report.setReportError(error instanceof Error ? error.message : "Report submit nahi ho paaya.");
    } finally {
      report.setReportLoading(false);
    }
  }

  if (deleted) {
    return (
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">—</div>
        <p className="text-sm italic text-zinc-500">This reply was deleted.</p>
      </div>
    );
  }

  return (
    <div className="group flex gap-3">
      <div className="shrink-0">
        {reply.userPhoto ? (
          <img src={reply.userPhoto} alt={reply.userName} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
            {(reply.userName || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900">{reply.userName}</span>
          {reply.createdAt && (
            <>
              <span className="text-xs text-zinc-400">·</span>
              <span className="text-xs text-zinc-500">{formatRelativeTime(reply.createdAt)}</span>
            </>
          )}

          <div className="relative ml-auto">
            <button
              type="button"
              aria-label="Reply options"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 opacity-0 transition hover:bg-zinc-100 group-hover:opacity-100 focus:opacity-100"
            >
              <MoreIcon />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-40 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5">
                {isOwner && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setEditText(reply.text);
                        setShowEdit(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}

                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      requireLogin(() => report.openReport());
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {showEdit ? (
          <div className="mt-2">
            <textarea
              value={editText}
              onChange={(event) => setEditText(event.target.value)}
              maxLength={2000}
              rows={3}
              autoFocus
              disabled={editLoading}
              className="w-full resize-none rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" disabled={editLoading} onClick={() => setShowEdit(false)} className="rounded-full px-3 py-2 text-xs hover:bg-zinc-100">Cancel</button>
              <button type="button" disabled={editLoading || !editText.trim()} onClick={handleEdit} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-800">{reply.text}</p>
        )}

        <div className="mt-1 flex items-center">
          <button
            type="button"
            disabled={reactionLoading}
            onClick={() => requireLogin(() => handleReaction("like"))}
            className={`flex h-8 items-center gap-1.5 rounded-full px-2.5 transition ${reaction === "like" ? "bg-zinc-100 text-black" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            <LikeIcon active={reaction === "like"} />
            {likeCount > 0 && <span className="text-xs font-medium">{likeCount}</span>}
          </button>

          <button
            type="button"
            disabled={reactionLoading}
            onClick={() => requireLogin(() => handleReaction("dislike"))}
            className={`flex h-8 items-center rounded-full px-2.5 transition ${reaction === "dislike" ? "bg-zinc-100 text-black" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            <DislikeIcon active={reaction === "dislike"} />
            {dislikeCount > 0 && <span className="ml-1 text-xs font-medium">{dislikeCount}</span>}
          </button>

          <button
            type="button"
            onClick={() => requireLogin(() => setShowReplyComposer((value) => !value))}
            className="ml-1 h-8 rounded-full px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Reply
          </button>
        </div>

        {reactionError && <p className="mt-1 text-xs text-red-600">{reactionError}</p>}

        {showReplyComposer && (
          <div className="mt-3">
            <ReplyComposer
              articleId={articleId}
              articleSlug={articleSlug}
              parentId={reply.id}
              onCreated={(newReply: CommentData) => {
                setShowReplyComposer(false);
                onCreated?.(newReply);
              }}
              onCancel={() => setShowReplyComposer(false)}
            />
          </div>
        )}
      </div>

      <ReportModal
        open={report.showReport}
        isReply
        commentId={reply.id}
        reason={report.reportReason}
        details={report.reportDetails}
        loading={report.reportLoading}
        error={report.reportError}
        success={report.reportSuccess}
        onReasonChange={report.setReportReason}
        onDetailsChange={report.setReportDetails}
        onSubmit={handleReport}
        onClose={report.closeReport}
      />

      <GoogleLoginModal open={showLogin} onClose={closeLogin} onSuccess={handleLoginSuccess} />
    </div>
  );
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}