"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CommentData,
  getArticleComments,
} from "@/services/comments/comments.service";

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

  return (
    <section className="w-full">
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
      {/* COMMENT COMPOSER */}
      {/* ================================= */}

      <CommentComposer
        articleId={articleId}
        articleSlug={articleSlug}
        onCreated={loadComments}
      />

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
              {/* Avatar skeleton */}

              <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-200" />

              {/* Content skeleton */}

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
        <div className="py-6 text-sm text-red-600">
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
          <div className="space-y-6 py-4">
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
              />
            ))}
          </div>
        )}
    </section>
  );
}