"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { commentsDb } from "@/lib/firebase/firebase-comments";

// ==========================================
// TYPES
// ==========================================

export interface CommentData {
  id: string;
  articleId: string;
  articleSlug: string;

  userId: string;
  userName: string;
  userPhoto: string;

  text: string;

  parentId: string;

  replyCount: number;
  likeCount: number;
  dislikeCount: number;

  status: "published" | "hidden" | "deleted";

  createdAt?: string;
  updatedAt?: string;
}

export type CommentReaction =
  | "like"
  | "dislike"
  | null;

// ==========================================
// FORMAT FIRESTORE TIMESTAMP
// ==========================================

function formatTimestamp(value: any) {
  if (!value) {
    return undefined;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (typeof value?.seconds === "number") {
    return new Date(
      value.seconds * 1000
    ).toISOString();
  }

  return undefined;
}

// ==========================================
// FORMAT COMMENT
// ==========================================

function formatComment(
  snapshot: any
): CommentData {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    articleId:
      data.articleId || "",

    articleSlug:
      data.articleSlug || "",

    userId:
      data.userId || "",

    userName:
      data.userName || "User",

    userPhoto:
      data.userPhoto || "",

    text:
      data.text || "",

    parentId:
      data.parentId || "",

    replyCount:
      Number(data.replyCount || 0),

    likeCount:
      Number(data.likeCount || 0),

    dislikeCount:
      Number(data.dislikeCount || 0),

    status:
      data.status || "published",

    createdAt:
      formatTimestamp(
        data.createdAt
      ),

    updatedAt:
      formatTimestamp(
        data.updatedAt
      ),
  };
}

// ==========================================
// GET ARTICLE COMMENTS
// ==========================================

export async function getArticleComments(
  articleId: string
): Promise<CommentData[]> {
  if (!articleId) {
    return [];
  }

  const q = query(
    collection(
      commentsDb,
      "comments"
    ),

    where(
      "articleId",
      "==",
      articleId
    ),

    where(
      "parentId",
      "==",
      ""
    ),

    where(
      "status",
      "==",
      "published"
    ),

    orderBy(
      "createdAt",
      "desc"
    ),

    limit(50)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    formatComment
  );
}

// ==========================================
// GET REPLIES
// ==========================================

export async function getCommentReplies(
  commentId: string
): Promise<CommentData[]> {
  if (!commentId) {
    return [];
  }

  const q = query(
    collection(
      commentsDb,
      "comments"
    ),

    where(
      "parentId",
      "==",
      commentId
    ),

    where(
      "status",
      "==",
      "published"
    ),

    orderBy(
      "createdAt",
      "asc"
    ),

    limit(50)
  );

  const snapshot =
    await getDocs(q);

  return snapshot.docs.map(
    formatComment
  );
}

// ==========================================
// GET COMMENT BY ID
// ==========================================

export async function getCommentById(
  commentId: string
): Promise<CommentData | null> {
  if (!commentId) {
    return null;
  }

  const commentRef = doc(
    commentsDb,
    "comments",
    commentId
  );

  const snapshot =
    await getDoc(commentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return formatComment(snapshot);
}

// ==========================================
// CREATE COMMENT / REPLY
// ==========================================

export async function createComment(
  data: {
    articleId: string;
    articleSlug: string;
    userId: string;
    userName: string;
    userPhoto: string;
    text: string;
    parentId?: string;
  }
): Promise<CommentData> {
  const text =
    data.text.trim();

  if (!text) {
    throw new Error(
      "Comment cannot be empty"
    );
  }

  if (text.length > 2000) {
    throw new Error(
      "Comment is too long"
    );
  }

  const parentId =
    data.parentId || "";

  // ==========================================
  // TOP LEVEL COMMENT
  // ==========================================

  if (!parentId) {
    const commentRef =
      await addDoc(
        collection(
          commentsDb,
          "comments"
        ),
        {
          articleId:
            data.articleId,

          articleSlug:
            data.articleSlug,

          userId:
            data.userId,

          userName:
            data.userName,

          userPhoto:
            data.userPhoto || "",

          text,

          parentId: "",

          replyCount: 0,

          likeCount: 0,

          dislikeCount: 0,

          status:
            "published",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

    // Firestore timestamp immediately
    // available nahi hota in local object,
    // isliye created comment dobara read karenge.

    const createdSnapshot =
      await getDoc(
        commentRef
      );

    return formatComment(
      createdSnapshot
    );
  }

  // ==========================================
  // REPLY
  // ==========================================

  const parentRef = doc(
    commentsDb,
    "comments",
    parentId
  );

  const replyRef = doc(
    collection(
      commentsDb,
      "comments"
    )
  );

  await runTransaction(
    commentsDb,
    async (transaction) => {
      const parentSnapshot =
        await transaction.get(
          parentRef
        );

      if (!parentSnapshot.exists()) {
        throw new Error(
          "Parent comment not found."
        );
      }

      const parentData =
        parentSnapshot.data();

      if (
        parentData.status !==
        "published"
      ) {
        throw new Error(
          "Cannot reply to this comment."
        );
      }

      // CREATE REPLY

      transaction.set(
        replyRef,
        {
          articleId:
            data.articleId,

          articleSlug:
            data.articleSlug,

          userId:
            data.userId,

          userName:
            data.userName,

          userPhoto:
            data.userPhoto || "",

          text,

          parentId,

          replyCount: 0,

          likeCount: 0,

          dislikeCount: 0,

          status:
            "published",

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      // UPDATE PARENT REPLY COUNT

      transaction.update(
        parentRef,
        {
          replyCount:
            increment(1),

          updatedAt:
            serverTimestamp(),
        }
      );
    }
  );

  const createdSnapshot =
    await getDoc(
      replyRef
    );

  return formatComment(
    createdSnapshot
  );
}

// ==========================================
// UPDATE COMMENT
// ==========================================

export async function updateComment(
  commentId: string,
  text: string
) {
  const cleanedText =
    text.trim();

  if (!cleanedText) {
    throw new Error(
      "Comment cannot be empty"
    );
  }

  if (cleanedText.length > 2000) {
    throw new Error(
      "Comment is too long"
    );
  }

  await updateDoc(
    doc(
      commentsDb,
      "comments",
      commentId
    ),
    {
      text: cleanedText,

      updatedAt:
        serverTimestamp(),
    }
  );
}

// ==========================================
// DELETE COMMENT
// ==========================================

export async function deleteComment(
  commentId: string
) {
  await deleteDoc(
    doc(
      commentsDb,
      "comments",
      commentId
    )
  );
}

// ==========================================
// GET COMMENT REACTION
// ==========================================

export async function getCommentReaction(
  commentId: string,
  userId: string
): Promise<CommentReaction> {
  if (!commentId || !userId) {
    return null;
  }

  const reactionRef = doc(
    commentsDb,
    "comments",
    commentId,
    "reactions",
    userId
  );

  const snapshot =
    await getDoc(
      reactionRef
    );

  if (!snapshot.exists()) {
    return null;
  }

  const data =
    snapshot.data();

  if (
    data.type === "like" ||
    data.type === "dislike"
  ) {
    return data.type;
  }

  return null;
}

// ==========================================
// TOGGLE COMMENT REACTION
// ==========================================

export async function toggleCommentReaction(
  commentId: string,
  userId: string,
  reaction: "like" | "dislike"
): Promise<{
  reaction: CommentReaction;
  likeCount: number;
  dislikeCount: number;
}> {
  if (!commentId || !userId) {
    throw new Error(
      "Comment ID and user ID are required"
    );
  }

  const commentRef = doc(
    commentsDb,
    "comments",
    commentId
  );

  const reactionRef = doc(
    commentsDb,
    "comments",
    commentId,
    "reactions",
    userId
  );

  return runTransaction(
    commentsDb,
    async (transaction) => {
      const commentSnapshot =
        await transaction.get(
          commentRef
        );

      if (!commentSnapshot.exists()) {
        throw new Error(
          "Comment not found"
        );
      }

      const reactionSnapshot =
        await transaction.get(
          reactionRef
        );

      const commentData =
        commentSnapshot.data();

      let likeCount =
        Number(
          commentData.likeCount || 0
        );

      let dislikeCount =
        Number(
          commentData.dislikeCount || 0
        );

      const oldReaction =
        reactionSnapshot.exists()
          ? reactionSnapshot
              .data()
              ?.type
          : null;

      // ======================================
      // SAME REACTION → REMOVE
      // ======================================

      if (
        oldReaction === reaction
      ) {
        transaction.delete(
          reactionRef
        );

        if (
          reaction === "like"
        ) {
          likeCount =
            Math.max(
              0,
              likeCount - 1
            );
        }

        if (
          reaction === "dislike"
        ) {
          dislikeCount =
            Math.max(
              0,
              dislikeCount - 1
            );
        }

        transaction.update(
          commentRef,
          {
            likeCount,

            dislikeCount,

            updatedAt:
              serverTimestamp(),
          }
        );

        return {
          reaction: null,

          likeCount,

          dislikeCount,
        };
      }

      // ======================================
      // SWITCH REACTION
      // ======================================

      if (
        oldReaction === "like" &&
        reaction === "dislike"
      ) {
        likeCount =
          Math.max(
            0,
            likeCount - 1
          );

        dislikeCount += 1;
      }

      if (
        oldReaction === "dislike" &&
        reaction === "like"
      ) {
        dislikeCount =
          Math.max(
            0,
            dislikeCount - 1
          );

        likeCount += 1;
      }

      // ======================================
      // NEW REACTION
      // ======================================

      if (!oldReaction) {
        if (
          reaction === "like"
        ) {
          likeCount += 1;
        }

        if (
          reaction === "dislike"
        ) {
          dislikeCount += 1;
        }
      }

      transaction.set(
        reactionRef,
        {
          type: reaction,

          userId,

          updatedAt:
            serverTimestamp(),
        }
      );

      transaction.update(
        commentRef,
        {
          likeCount,

          dislikeCount,

          updatedAt:
            serverTimestamp(),
        }
      );

      return {
        reaction,

        likeCount,

        dislikeCount,
      };
    }
  );
}