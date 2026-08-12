"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";

import {
  CommentData,
  getArticleComments,
} from "@/services/comments/comments.service";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import CommentComposer from "./comment-composer";
import CommentCard from "./comment-card";

interface Props {
  articleId: string;
  articleSlug: string;
}

export default function CommentsList({
  articleId,
  articleSlug,
}: Props) {
  const [comments, setComments] =
    useState<CommentData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [user, setUser] =
    useState<User | null>(null);

  const [loginLoading, setLoginLoading] =
    useState(false);
  const [showAllComments, setShowAllComments] =
    useState(false);

  // ==========================================
  // AUTH STATE
  // ==========================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        commentsAuth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => {
      unsubscribe();
    };
  }, []);

  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  const loadComments =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getArticleComments(
            articleId
          );

        setComments(data);
      } catch (err) {
        console.error(
          "GET COMMENTS ERROR:",
          err
        );

        setError(
          "Comments load nahi ho paaye."
        );
      } finally {
        setLoading(false);
      }
    }, [articleId]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ==========================================
  // GOOGLE LOGIN
  // ==========================================

  async function handleGoogleLogin() {
    try {
      setLoginLoading(true);
      setError("");

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account",
      });

      await signInWithPopup(
        commentsAuth,
        provider
      );
    } catch (err: any) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        err
      );

      if (
        err?.code ===
        "auth/popup-closed-by-user"
      ) {
        return;
      }

      if (
        err?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Google login popup block ho gaya. Browser me popups allow karein."
        );

        return;
      }

      setError(
        "Google login nahi ho paaya. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <section>

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900">
          Comments

          {comments.length > 0 && (
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {comments.length}
            </span>
          )}
        </h2>
      </div>

      {/* ================================= */}
      {/* COMMENT COMPOSER / LOGIN */}
      {/* ================================= */}

      {user ? (
        <CommentComposer
          articleId={articleId}
          articleSlug={articleSlug}
          onCreated={loadComments}
        />
      ) : (
        <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-5 shadow-sm">
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* LEFT */}
            <div className="min-w-0">
              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.15Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.5c2.63 0 4.84-.87 6.46-2.35l-3.14-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.53A9.75 9.75 0 0 0 12 21.5Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.51 13.58L3.27 16.11A9.74 9.74 0 0 1 2.25 12c0-1.57.38-3.05 1.02-4.11l3.24 2.53C6.31 10.92 6.2 11.45 6.2 12s.11 1.08.31 1.58Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.73 5.39l3.24 2.53C7.29 8.1 9.45 6.38 12 6.38Z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Join the conversation
                  </h3>

                  <p className="mt-0.5 text-xs text-zinc-500">
                    Sign in with Google to comment on this article.
                  </p>
                </div>

              </div>
            </div>

            {/* GOOGLE BUTTON */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loginLoading}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2.5
                rounded-xl
                border
                border-zinc-300
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-zinc-800
                shadow-sm
                transition-all
                duration-200
                hover:border-zinc-400
                hover:bg-zinc-50
                hover:shadow-md
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loginLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.27c0-.68-.06-1.34-.18-1.97H12v3.73h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.15Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.5c2.63 0 4.84-.87 6.46-2.35l-3.14-2.45c-.87.58-1.98.92-3.32.92-2.55 0-4.71-1.72-5.49-4.04H3.27v2.53A9.75 9.75 0 0 0 12 21.5Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.51 13.58L3.27 16.11A9.74 9.74 0 0 1 2.25 12c0-1.57.38-3.05 1.02-4.11l3.24 2.53C6.31 10.92 6.2 11.45 6.2 12s.11 1.08.31 1.58Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.38c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.73 5.39l3.24 2.53C7.29 8.1 9.45 6.38 12 6.38Z"
                    />
                  </svg>

                  Continue with Google
                </>
              )}

            </button>

          </div>
        </div>
      )}

      {/* ================================= */}
      {/* LOADING */}
      {/* ================================= */}

      {loading && (
        <div className="space-y-5 py-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse gap-3"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />

              <div className="min-w-0 flex-1">
                <div className="mb-2 h-3 w-32 rounded bg-zinc-200" />

                <div className="mb-2 h-3 w-3/4 rounded bg-zinc-200" />

                <div className="h-3 w-1/2 rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {!loading && error && (
        <div className="py-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ================================= */}
      {/* EMPTY */}
      {/* ================================= */}

      {!loading &&
        !error &&
        comments.length === 0 && (
          <div className="py-8 text-center text-sm text-zinc-500">
            No comments yet. Be the first
            to comment.
          </div>
        )}

      {/* ================================= */}
{/* COMMENTS */}
{/* ================================= */}

{!loading &&
  !error &&
  comments.length > 0 && (
    <>
      <div className="space-y-6 py-4">
        {(showAllComments
          ? comments
          : comments.slice(0, 1)
        ).map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
          />
        ))}
      </div>

      {/* ================================= */}
      {/* SEE MORE / SHOW LESS */}
      {/* ================================= */}

      {comments.length > 1 && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            type="button"
            onClick={() =>
              setShowAllComments(
                (value) => !value
              )
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-zinc-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-zinc-800
              shadow-sm
              transition-all
              duration-200
              hover:border-zinc-300
              hover:bg-zinc-50
              hover:shadow-md
              active:scale-[0.98]
            "
          >
            {showAllComments
              ? "Show less"
              : `See more comments (${comments.length - 1})`}

            <svg
              viewBox="0 0 24 24"
              className={`
                h-4
                w-4
                transition-transform
                duration-200
                ${showAllComments
                  ? "rotate-180"
                  : ""}
              `}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      )}
    </>
  )}

    </section>
  );
}

