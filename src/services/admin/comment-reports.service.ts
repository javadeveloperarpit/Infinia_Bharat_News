import {
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase-admin/firestore";

import {
  commentsAdminDb,
} from "@/lib/firebase/firebase-comments-admin";

// ==========================================
// TYPES
// ==========================================

export type CommentReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "misinformation"
  | "inappropriate"
  | "other";

export type CommentReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

export interface CommentReport {
  id: string;

  commentId: string;
  articleId: string;
  articleSlug: string;

  reporterId: string;
  reporterName: string;
  reporterEmail: string;

  reason: CommentReportReason;
  details: string;

  commentText: string;
  commentUserId: string;
  commentUserName: string;

  status: CommentReportStatus;

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// TIMESTAMP FORMAT
// ==========================================

function formatTimestamp(
  value: unknown
): string | undefined {

  if (!value) {
    return undefined;
  }

  // Firestore Timestamp
  if (
    value instanceof Timestamp
  ) {
    return value.toDate().toISOString();
  }

  // Firebase Admin Timestamp-like object
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .toISOString();
  }

  // JavaScript Date
  if (value instanceof Date) {
    return value.toISOString();
  }

  // String / number fallback
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return undefined;
}

// ==========================================
// FORMAT REPORT
// ==========================================

function formatReport(
  snapshot: QueryDocumentSnapshot<DocumentData>
): CommentReport {

  const data = snapshot.data();

  return {
    id: snapshot.id,

    commentId:
      data.commentId || "",

    articleId:
      data.articleId || "",

    articleSlug:
      data.articleSlug || "",

    reporterId:
      data.reporterId || "",

    reporterName:
      data.reporterName || "User",

    reporterEmail:
      data.reporterEmail || "",

    reason:
      data.reason || "other",

    details:
      data.details || "",

    commentText:
      data.commentText || "",

    commentUserId:
      data.commentUserId || "",

    commentUserName:
      data.commentUserName || "User",

    status:
      data.status || "pending",

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
// SORT BY CREATED AT
// ==========================================

function sortReportsByCreatedAt(
  reports: CommentReport[]
): CommentReport[] {

  return reports.sort(
    (a, b) => {

      const timeA =
        a.createdAt
          ? new Date(
              a.createdAt
            ).getTime()
          : 0;

      const timeB =
        b.createdAt
          ? new Date(
              b.createdAt
            ).getTime()
          : 0;

      return timeB - timeA;
    }
  );
}

// ==========================================
// GET PENDING REPORTS
// ==========================================
//
// IMPORTANT:
// We intentionally DO NOT use:
//
// .where("status", "==", "pending")
// .orderBy("createdAt", "desc")
//
// because that can require a composite Firestore index.
//
// We fetch pending reports and sort in JavaScript.
//

export async function getPendingCommentReports(
  maxResults = 50
): Promise<CommentReport[]> {

  const snapshot =
    await commentsAdminDb
      .collection("commentReports")
      .where(
        "status",
        "==",
        "pending"
      )
      .get();

  const reports =
    snapshot.docs.map(
      formatReport
    );

  const sortedReports =
    sortReportsByCreatedAt(
      reports
    );

  return sortedReports.slice(
    0,
    maxResults
  );
}

// ==========================================
// GET ALL REPORTS
// ==========================================
//
// No composite index required.
//

export async function getCommentReports(
  maxResults = 100
): Promise<CommentReport[]> {

  const snapshot =
    await commentsAdminDb
      .collection("commentReports")
      .get();

  const reports =
    snapshot.docs.map(
      formatReport
    );

  const sortedReports =
    sortReportsByCreatedAt(
      reports
    );

  return sortedReports.slice(
    0,
    maxResults
  );
}

// ==========================================
// GET PENDING REPORT COUNT
// ==========================================

export async function getPendingCommentReportCount(): Promise<number> {

  const snapshot =
    await commentsAdminDb
      .collection("commentReports")
      .where(
        "status",
        "==",
        "pending"
      )
      .get();

  return snapshot.size;
}