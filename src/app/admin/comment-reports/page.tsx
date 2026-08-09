"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  MessageSquareWarning,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";

import { getAuth } from "firebase/auth";

// ==========================================
// TYPES
// ==========================================

type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "misinformation"
  | "inappropriate"
  | "other";

interface CommentReport {
  id: string;

  commentId: string;
  articleId: string;
  articleSlug: string;

  reporterId: string;
  reporterName: string;
  reporterEmail: string;

  reason: ReportReason;
  details: string;

  commentText: string;
  commentUserId: string;
  commentUserName: string;

  status: ReportStatus;

  createdAt?: string;
  updatedAt?: string;
}

type FilterStatus =
  | "all"
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

// ==========================================
// HELPERS
// ==========================================

function getReasonLabel(
  reason: ReportReason
) {
  switch (reason) {
    case "spam":
      return "Spam";

    case "harassment":
      return "Harassment";

    case "hate_speech":
      return "Hate Speech";

    case "misinformation":
      return "Misinformation";

    case "inappropriate":
      return "Inappropriate";

    default:
      return "Other";
  }
}

function getReasonIcon(
  reason: ReportReason
) {
  switch (reason) {
    case "hate_speech":
    case "harassment":
      return ShieldAlert;

    case "misinformation":
      return AlertTriangle;

    default:
      return MessageSquareWarning;
  }
}

function formatDate(
  value?: string
) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function formatShortDate(
  value?: string
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function getStatusClasses(
  status: ReportStatus
) {
  switch (status) {
    case "pending":
      return {
        badge:
          "bg-amber-50 text-amber-700 border-amber-200",
        dot:
          "bg-amber-500",
      };

    case "reviewed":
      return {
        badge:
          "bg-blue-50 text-blue-700 border-blue-200",
        dot:
          "bg-blue-500",
      };

    case "resolved":
      return {
        badge:
          "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot:
          "bg-emerald-500",
      };

    case "rejected":
      return {
        badge:
          "bg-zinc-100 text-zinc-600 border-zinc-200",
        dot:
          "bg-zinc-500",
      };
  }
}

function getStatusLabel(
  status: ReportStatus
) {
  switch (status) {
    case "pending":
      return "Pending";

    case "reviewed":
      return "Reviewed";

    case "resolved":
      return "Resolved";

    case "rejected":
      return "Rejected";
  }
}

// ==========================================
// TOKEN
// ==========================================

async function getAdminToken() {
  const auth = getAuth();

  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken();
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function CommentReportsPage() {

  const [
    reports,
    setReports,
  ] = useState<CommentReport[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<string | null>(
    null
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<FilterStatus>(
    "all"
  );

  const [
    selectedReport,
    setSelectedReport,
  ] =
    useState<CommentReport | null>(
      null
    );

  const [
    menuReportId,
    setMenuReportId,
  ] = useState<string | null>(
    null
  );

  const [
    confirmDelete,
    setConfirmDelete,
  ] =
    useState<CommentReport | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState("");

  // ========================================
  // FETCH REPORTS
  // ========================================

  const loadReports =
    useCallback(
      async (
        showRefresh = false
      ) => {

        try {

          setError("");

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const token =
            await getAdminToken();

          if (!token) {
            throw new Error(
              "Admin authentication required."
            );
          }

          const response =
            await fetch(
              "/api/admin/comment-reports?limit=100",
              {
                method: "GET",

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                cache: "no-store",
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load reports."
            );
          }

          setReports(
            Array.isArray(
              data?.reports
            )
              ? data.reports
              : []
          );

        } catch (err) {

          console.error(
            "LOAD REPORTS ERROR:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reports."
          );

        } finally {

          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ========================================
  // UPDATE REPORT
  // ========================================

  async function updateReportStatus(
    reportId: string,
    status: ReportStatus
  ) {

    try {

      setActionLoading(
        `${reportId}-${status}`
      );

      setMenuReportId(null);

      const token =
        await getAdminToken();

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }

      const response =
        await fetch(
          `/api/admin/comment-reports/${reportId}`,
          {
            method: "PATCH",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update report."
        );
      }

      setReports(
        (previous) =>
          previous.map(
            (report) =>
              report.id === reportId
                ? {
                    ...report,
                    status,
                    updatedAt:
                      new Date().toISOString(),
                  }
                : report
          )
      );

      setSelectedReport(
        (previous) =>
          previous?.id === reportId
            ? {
                ...previous,
                status,
                updatedAt:
                  new Date().toISOString(),
              }
            : previous
      );

    } catch (err) {

      console.error(
        "UPDATE REPORT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update report."
      );

    } finally {

      setActionLoading(null);
    }
  }

  // ========================================
  // DELETE REPORT
  // ========================================

  async function deleteReport(
    report: CommentReport
  ) {

    try {

      setActionLoading(
        `${report.id}-delete`
      );

      const token =
        await getAdminToken();

      if (!token) {
        throw new Error(
          "Admin authentication required."
        );
      }

      const response =
        await fetch(
          `/api/admin/comment-reports/${report.id}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to delete report."
        );
      }

      setReports(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== report.id
          )
      );

      if (
        selectedReport?.id ===
        report.id
      ) {
        setSelectedReport(null);
      }

      setConfirmDelete(null);

    } catch (err) {

      console.error(
        "DELETE REPORT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete report."
      );

    } finally {

      setActionLoading(null);
    }
  }

  // ========================================
  // FILTER REPORTS
  // ========================================

  const filteredReports =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return reports.filter(
        (report) => {

          if (
            statusFilter !== "all" &&
            report.status !==
              statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            report.reporterName,
            report.reporterEmail,
            report.commentUserName,
            report.commentText,
            report.details,
            report.articleSlug,
            getReasonLabel(
              report.reason
            ),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );

    }, [
      reports,
      search,
      statusFilter,
    ]);

  // ========================================
  // COUNTS
  // ========================================

  const counts =
    useMemo(() => {

      return {
        all: reports.length,

        pending:
          reports.filter(
            (report) =>
              report.status ===
              "pending"
          ).length,

        reviewed:
          reports.filter(
            (report) =>
              report.status ===
              "reviewed"
          ).length,

        resolved:
          reports.filter(
            (report) =>
              report.status ===
              "resolved"
          ).length,

        rejected:
          reports.filter(
            (report) =>
              report.status ===
              "rejected"
          ).length,
      };

    }, [reports]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <div
      className="
        min-h-[calc(100vh-4rem)]
        bg-zinc-50
        p-4
        sm:p-6
        lg:p-8
      "
    >

      {/* ====================================
          HEADER
      ==================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              mb-2
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-zinc-500
            "
          >
            <span>
              Admin
            </span>

            <span>
              /
            </span>

            <span>
              Moderation
            </span>

            <span>
              /
            </span>

            <span
              className="
                text-zinc-900
              "
            >
              Comment Reports
            </span>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-600
              "
            >
              <MessageSquareWarning
                size={22}
              />
            </div>

            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-zinc-950
                  sm:text-3xl
                "
              >
                Comment Reports
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                Review and moderate
                reported comments.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            loadReports(true)
          }
          disabled={refreshing}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-4
            text-sm
            font-semibold
            text-zinc-700
            shadow-sm
            transition
            hover:bg-zinc-100
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          <RefreshCw
            size={16}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ====================================
          ERROR
      ==================================== */}

      {error && (
        <div
          className="
            mb-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-200
            bg-red-50
            p-4
            text-red-700
          "
        >

          <AlertTriangle
            size={19}
            className="
              mt-0.5
              shrink-0
            "
          />

          <div className="flex-1">

            <p
              className="
                text-sm
                font-semibold
              "
            >
              Something went wrong
            </p>

            <p
              className="
                mt-0.5
                text-xs
              "
            >
              {error}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="
              rounded-lg
              p-1
              hover:bg-red-100
            "
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* ====================================
          STAT CARDS
      ==================================== */}

      <div
        className="
          mb-6
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-5
        "
      >

        <StatCard
          label="Total"
          value={counts.all}
          icon={
            <FileText size={19} />
          }
        />

        <StatCard
          label="Pending"
          value={counts.pending}
          icon={
            <Clock3 size={19} />
          }
          active={
            statusFilter ===
            "pending"
          }
          onClick={() =>
            setStatusFilter(
              "pending"
            )
          }
        />

        <StatCard
          label="Reviewed"
          value={counts.reviewed}
          icon={
            <EyeIcon size={19} />
          }
          active={
            statusFilter ===
            "reviewed"
          }
          onClick={() =>
            setStatusFilter(
              "reviewed"
            )
          }
        />

        <StatCard
          label="Resolved"
          value={counts.resolved}
          icon={
            <CheckCircle2
              size={19}
            />
          }
          active={
            statusFilter ===
            "resolved"
          }
          onClick={() =>
            setStatusFilter(
              "resolved"
            )
          }
        />

        <StatCard
          label="Rejected"
          value={counts.rejected}
          icon={
            <XCircle size={19} />
          }
          active={
            statusFilter ===
            "rejected"
          }
          onClick={() =>
            setStatusFilter(
              "rejected"
            )
          }
        />

      </div>

      {/* ====================================
          TOOLBAR
      ==================================== */}

      <div
        className="
          mb-5
          rounded-2xl
          border
          border-zinc-200
          bg-white
          p-3
          shadow-sm
          sm:p-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
          "
        >

          {/* SEARCH */}

          <div
            className="
              relative
              flex-1
            "
          >

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="
                Search reports, users,
                comments or articles...
              "
              className="
                h-11
                w-full
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50
                pl-10
                pr-4
                text-sm
                text-zinc-900
                outline-none
                transition
                placeholder:text-zinc-400
                focus:border-zinc-400
                focus:bg-white
                focus:ring-4
                focus:ring-zinc-100
              "
            />

          </div>

          {/* FILTER */}

          <div
            className="
              relative
              min-w-[190px]
            "
          >

            <Filter
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as FilterStatus
                )
              }
              className="
                h-11
                w-full
                appearance-none
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50
                pl-9
                pr-9
                text-sm
                font-medium
                text-zinc-700
                outline-none
                focus:border-zinc-400
              "
            >

              <option value="all">
                All reports
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="reviewed">
                Reviewed
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="rejected">
                Rejected
              </option>

            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

          </div>

        </div>

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            text-xs
            text-zinc-500
          "
        >

          <span>
            Showing{" "}
            <strong
              className="
                text-zinc-800
              "
            >
              {filteredReports.length}
            </strong>{" "}
            of{" "}
            <strong
              className="
                text-zinc-800
              "
            >
              {reports.length}
            </strong>{" "}
            reports
          </span>

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="
                font-semibold
                text-zinc-700
                hover:text-black
              "
            >
              Clear search
            </button>
          )}

        </div>

      </div>

      {/* ====================================
          LOADING
      ==================================== */}

      {loading ? (

        <div
          className="
            flex
            min-h-[420px]
            items-center
            justify-center
            rounded-2xl
            border
            border-zinc-200
            bg-white
          "
        >

          <div
            className="
              text-center
            "
          >

            <Loader2
              size={30}
              className="
                mx-auto
                animate-spin
                text-zinc-500
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-medium
                text-zinc-600
              "
            >
              Loading comment reports...
            </p>

          </div>

        </div>

      ) : filteredReports.length === 0 ? (

        <EmptyState
          hasSearch={
            Boolean(
              search ||
              statusFilter !== "all"
            )
          }
          onReset={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        />

      ) : (

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-zinc-200
            bg-white
            shadow-sm
          "
        >

          {/* DESKTOP TABLE */}

          <div
            className="
              hidden
              overflow-x-auto
              lg:block
            "
          >

            <table
              className="
                w-full
                border-collapse
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-zinc-100
                    bg-zinc-50/80
                    text-left
                  "
                >

                  <th
                    className="
                      px-5
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Report
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Comment
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Reason
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-5
                      py-3.5
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Date
                  </th>

                  <th
                    className="
                      w-16
                      px-5
                      py-3.5
                    "
                  />

                </tr>

              </thead>

              <tbody>

                {filteredReports.map(
                  (report) => (

                    <ReportTableRow
                      key={report.id}
                      report={report}
                      menuOpen={
                        menuReportId ===
                        report.id
                      }
                      actionLoading={
                        actionLoading
                      }
                      onOpen={() =>
                        setSelectedReport(
                          report
                        )
                      }
                      onMenu={() =>
                        setMenuReportId(
                          menuReportId ===
                            report.id
                            ? null
                            : report.id
                        )
                      }
                      onStatusChange={
                        updateReportStatus
                      }
                      onDelete={() =>
                        setConfirmDelete(
                          report
                        )
                      }
                    />

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* MOBILE CARDS */}

          <div
            className="
              divide-y
              divide-zinc-100
              lg:hidden
            "
          >

            {filteredReports.map(
              (report) => (

                <ReportMobileCard
                  key={report.id}
                  report={report}
                  menuOpen={
                    menuReportId ===
                    report.id
                  }
                  actionLoading={
                    actionLoading
                  }
                  onOpen={() =>
                    setSelectedReport(
                      report
                    )
                  }
                  onMenu={() =>
                    setMenuReportId(
                      menuReportId ===
                        report.id
                        ? null
                        : report.id
                    )
                  }
                  onStatusChange={
                    updateReportStatus
                  }
                  onDelete={() =>
                    setConfirmDelete(
                      report
                    )
                  }
                />

              )
            )}

          </div>

        </div>
      )}

      {/* ====================================
          DETAILS MODAL
      ==================================== */}

      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          actionLoading={
            actionLoading
          }
          onClose={() =>
            setSelectedReport(null)
          }
          onStatusChange={
            updateReportStatus
          }
          onDelete={() =>
            setConfirmDelete(
              selectedReport
            )
          }
        />
      )}

      {/* ====================================
          DELETE CONFIRMATION
      ==================================== */}

      {confirmDelete && (
        <DeleteConfirmModal
          report={confirmDelete}
          loading={
            actionLoading ===
            `${confirmDelete.id}-delete`
          }
          onClose={() =>
            setConfirmDelete(null)
          }
          onConfirm={() =>
            deleteReport(
              confirmDelete
            )
          }
        />
      )}

    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  label,
  value,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        rounded-2xl
        border
        bg-white
        p-4
        text-left
        shadow-sm
        transition
        ${
          active
            ? "border-zinc-900 ring-2 ring-zinc-100"
            : "border-zinc-200"
        }
        ${
          onClick
            ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
            : "cursor-default"
        }
      `}
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-xs
            font-semibold
            text-zinc-500
          "
        >
          {label}
        </span>

        <span
          className="
            text-zinc-400
          "
        >
          {icon}
        </span>

      </div>

      <div
        className="
          mt-2
          text-2xl
          font-bold
          tracking-tight
          text-zinc-950
        "
      >
        {value}
      </div>

    </button>
  );
}

// ==========================================
// EYE ICON
// ==========================================

function EyeIcon({
  size = 19,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="
          M2.06 12.35
          a1 1 0 0 1 0-.7
          10.94 10.94 0 0 1
          19.88 0
          1 1 0 0 1 0 .7
          10.94 10.94 0 0 1
          -19.88 0
        "
      />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}

// ==========================================
// TABLE ROW
// ==========================================

function ReportTableRow({
  report,
  menuOpen,
  actionLoading,
  onOpen,
  onMenu,
  onStatusChange,
  onDelete,
}: {
  report: CommentReport;
  menuOpen: boolean;
  actionLoading: string | null;
  onOpen: () => void;
  onMenu: () => void;
  onStatusChange: (
    id: string,
    status: ReportStatus
  ) => void;
  onDelete: () => void;
}) {

  const ReasonIcon =
    getReasonIcon(
      report.reason
    );

  const status =
    getStatusClasses(
      report.status
    );

  return (
    <tr
      className="
        border-b
        border-zinc-100
        last:border-b-0
        hover:bg-zinc-50/60
      "
    >

      <td className="px-5 py-4">

        <button
          type="button"
          onClick={onOpen}
          className="
            block
            max-w-[230px]
            text-left
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-zinc-100
                text-zinc-600
              "
            >
              <User size={15} />
            </div>

            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-zinc-900
                "
              >
                {report.reporterName}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-zinc-500
                "
              >
                {report.reporterEmail ||
                  "No email"}
              </p>

            </div>

          </div>

        </button>

      </td>

      <td className="px-5 py-4">

        <button
          type="button"
          onClick={onOpen}
          className="
            block
            max-w-[300px]
            text-left
          "
        >

          <p
            className="
              line-clamp-2
              text-sm
              leading-5
              text-zinc-700
            "
          >
            {report.commentText ||
              "No comment text"}
          </p>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-zinc-400
            "
          >
            By {report.commentUserName}
          </p>

        </button>

      </td>

      <td className="px-5 py-4">

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-zinc-50
            px-2.5
            py-1.5
            text-xs
            font-semibold
            text-zinc-700
          "
        >

          <ReasonIcon
            size={14}
            className="text-red-500"
          />

          {getReasonLabel(
            report.reason
          )}

        </div>

      </td>

      <td className="px-5 py-4">

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-semibold
            ${status.badge}
          `}
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${status.dot}
            `}
          />

          {getStatusLabel(
            report.status
          )}

        </span>

      </td>

      <td className="px-5 py-4">

        <div
          className="
            whitespace-nowrap
            text-xs
            text-zinc-500
          "
        >
          {formatShortDate(
            report.createdAt
          )}
        </div>

      </td>

      <td className="px-5 py-4">

        <div className="relative">

          <button
            type="button"
            onClick={onMenu}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-zinc-500
              hover:bg-zinc-100
              hover:text-zinc-900
            "
          >
            <MoreVertical
              size={18}
            />
          </button>

          {menuOpen && (
            <ActionMenu
              report={report}
              actionLoading={
                actionLoading
              }
              onOpen={onOpen}
              onStatusChange={
                onStatusChange
              }
              onDelete={onDelete}
            />
          )}

        </div>

      </td>

    </tr>
  );
}

// ==========================================
// MOBILE CARD
// ==========================================

function ReportMobileCard({
  report,
  menuOpen,
  actionLoading,
  onOpen,
  onMenu,
  onStatusChange,
  onDelete,
}: {
  report: CommentReport;
  menuOpen: boolean;
  actionLoading: string | null;
  onOpen: () => void;
  onMenu: () => void;
  onStatusChange: (
    id: string,
    status: ReportStatus
  ) => void;
  onDelete: () => void;
}) {

  const status =
    getStatusClasses(
      report.status
    );

  const ReasonIcon =
    getReasonIcon(
      report.reason
    );

  return (
    <div
      className="
        relative
        p-4
        sm:p-5
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >

        <button
          type="button"
          onClick={onOpen}
          className="
            flex
            min-w-0
            items-center
            gap-3
            text-left
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-zinc-100
              text-zinc-600
            "
          >
            <User size={18} />
          </div>

          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                truncate
                text-sm
                font-bold
                text-zinc-900
              "
            >
              {report.reporterName}
            </p>

            <p
              className="
                truncate
                text-xs
                text-zinc-500
              "
            >
              {report.reporterEmail ||
                "No email"}
            </p>

          </div>

        </button>

        <div
          className="
            relative
            shrink-0
          "
        >

          <button
            type="button"
            onClick={onMenu}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-zinc-500
              hover:bg-zinc-100
            "
          >
            <MoreVertical
              size={18}
            />
          </button>

          {menuOpen && (
            <ActionMenu
              report={report}
              actionLoading={
                actionLoading
              }
              onOpen={onOpen}
              onStatusChange={
                onStatusChange
              }
              onDelete={onDelete}
            />
          )}

        </div>

      </div>

      <button
        type="button"
        onClick={onOpen}
        className="
          mt-4
          block
          w-full
          rounded-xl
          bg-zinc-50
          p-3
          text-left
        "
      >

        <p
          className="
            line-clamp-3
            text-sm
            leading-5
            text-zinc-700
          "
        >
          {report.commentText ||
            "No comment text"}
        </p>

        <p
          className="
            mt-2
            text-xs
            text-zinc-400
          "
        >
          Comment by{" "}
          <span
            className="
              font-semibold
              text-zinc-600
            "
          >
            {report.commentUserName}
          </span>
        </p>

      </button>

      <div
        className="
          mt-3
          flex
          flex-wrap
          items-center
          gap-2
        "
      >

        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-xs
            font-semibold
            ${status.badge}
          `}
        >

          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${status.dot}
            `}
          />

          {getStatusLabel(
            report.status
          )}

        </span>

        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            bg-red-50
            px-2.5
            py-1
            text-xs
            font-semibold
            text-red-700
          "
        >

          <ReasonIcon
            size={13}
          />

          {getReasonLabel(
            report.reason
          )}

        </span>

        <span
          className="
            ml-auto
            text-xs
            text-zinc-400
          "
        >
          {formatShortDate(
            report.createdAt
          )}
        </span>

      </div>

    </div>
  );
}

// ==========================================
// ACTION MENU
// ==========================================

function ActionMenu({
  report,
  actionLoading,
  onOpen,
  onStatusChange,
  onDelete,
}: {
  report: CommentReport;
  actionLoading: string | null;
  onOpen: () => void;
  onStatusChange: (
    id: string,
    status: ReportStatus
  ) => void;
  onDelete: () => void;
}) {

  return (
    <div
      className="
        absolute
        right-0
        top-10
        z-50
        w-52
        overflow-hidden
        rounded-xl
        border
        border-zinc-200
        bg-white
        p-1.5
        shadow-xl
      "
    >

      <MenuButton
        icon={
          <FileText
            size={15}
          />
        }
        label="View details"
        onClick={onOpen}
      />

      {report.status !==
        "reviewed" && (
        <MenuButton
          icon={
            <EyeIcon size={15} />
          }
          label="Mark reviewed"
          loading={
            actionLoading ===
            `${report.id}-reviewed`
          }
          onClick={() =>
            onStatusChange(
              report.id,
              "reviewed"
            )
          }
        />
      )}

      {report.status !==
        "resolved" && (
        <MenuButton
          icon={
            <CheckCircle2
              size={15}
            />
          }
          label="Resolve report"
          className="
            text-emerald-700
            hover:bg-emerald-50
          "
          loading={
            actionLoading ===
            `${report.id}-resolved`
          }
          onClick={() =>
            onStatusChange(
              report.id,
              "resolved"
            )
          }
        />
      )}

      {report.status !==
        "rejected" && (
        <MenuButton
          icon={
            <XCircle size={15} />
          }
          label="Reject report"
          loading={
            actionLoading ===
            `${report.id}-rejected`
          }
          onClick={() =>
            onStatusChange(
              report.id,
              "rejected"
            )
          }
        />
      )}

      <div
        className="
          my-1
          border-t
          border-zinc-100
        "
      />

      <MenuButton
        icon={
          <Trash2 size={15} />
        }
        label="Delete report"
        className="
          text-red-600
          hover:bg-red-50
        "
        onClick={onDelete}
      />

    </div>
  );
}

// ==========================================
// MENU BUTTON
// ==========================================

function MenuButton({
  icon,
  label,
  onClick,
  loading = false,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  loading?: boolean;
  className?: string;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        flex
        w-full
        items-center
        gap-2.5
        rounded-lg
        px-3
        py-2.5
        text-left
        text-xs
        font-semibold
        text-zinc-700
        hover:bg-zinc-100
        disabled:opacity-60
        ${className}
      `}
    >

      {loading ? (
        <Loader2
          size={15}
          className="
            animate-spin
          "
        />
      ) : (
        icon
      )}

      {label}

    </button>
  );
}

// ==========================================
// DETAILS MODAL
// ==========================================

function ReportDetailsModal({
  report,
  actionLoading,
  onClose,
  onStatusChange,
  onDelete,
}: {
  report: CommentReport;
  actionLoading: string | null;
  onClose: () => void;
  onStatusChange: (
    id: string,
    status: ReportStatus
  ) => void;
  onDelete: () => void;
}) {

  const status =
    getStatusClasses(
      report.status
    );

  const ReasonIcon =
    getReasonIcon(
      report.reason
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >

      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-zinc-100
            px-5
            py-4
            sm:px-6
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-50
                  text-red-600
                "
              >
                <MessageSquareWarning
                  size={18}
                />
              </div>

              <div>

                <h2
                  className="
                    text-base
                    font-bold
                    text-zinc-950
                  "
                >
                  Report details
                </h2>

                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  ID: {report.id}
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-zinc-500
              hover:bg-zinc-100
              hover:text-zinc-900
            "
          >
            <X size={19} />
          </button>

        </div>

        {/* CONTENT */}

        <div
          className="
            overflow-y-auto
            px-5
            py-5
            sm:px-6
          "
        >

          {/* STATUS / REASON */}

          <div
            className="
              mb-5
              flex
              flex-wrap
              items-center
              gap-2
            "
          >

            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-3
                py-1.5
                text-xs
                font-bold
                ${status.badge}
              `}
            >

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${status.dot}
                `}
              />

              {getStatusLabel(
                report.status
              )}

            </span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                bg-red-50
                px-3
                py-1.5
                text-xs
                font-bold
                text-red-700
              "
            >

              <ReasonIcon
                size={14}
              />

              {getReasonLabel(
                report.reason
              )}

            </span>

            <span
              className="
                ml-auto
                flex
                items-center
                gap-1.5
                text-xs
                text-zinc-400
              "
            >

              <CalendarDays
                size={14}
              />

              {formatDate(
                report.createdAt
              )}

            </span>

          </div>

          {/* REPORTED COMMENT */}

          <section
            className="
              mb-5
              overflow-hidden
              rounded-2xl
              border
              border-zinc-200
            "
          >

            <div
              className="
                border-b
                border-zinc-100
                bg-zinc-50
                px-4
                py-3
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Reported comment
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-zinc-400
                    "
                  >
                    Comment by{" "}
                    <strong
                      className="
                        text-zinc-600
                      "
                    >
                      {
                        report.commentUserName
                      }
                    </strong>
                  </p>

                </div>

              </div>

            </div>

            <div
              className="
                p-4
              "
            >

              <p
                className="
                  whitespace-pre-wrap
                  text-sm
                  leading-6
                  text-zinc-800
                "
              >
                {report.commentText ||
                  "No comment text available."}
              </p>

            </div>

          </section>

          {/* REPORTER + ARTICLE */}

          <div
            className="
              mb-5
              grid
              gap-4
              sm:grid-cols-2
            "
          >

            <InfoBox
              icon={
                <User size={17} />
              }
              label="Reported by"
              value={
                report.reporterName ||
                "Unknown user"
              }
              secondary={
                report.reporterEmail ||
                "No email available"
              }
            />

            <InfoBox
              icon={
                <FileText size={17} />
              }
              label="Article"
              value={
                report.articleSlug ||
                report.articleId ||
                "Unknown article"
              }
              secondary={
                report.articleId
                  ? `Article ID: ${report.articleId}`
                  : "No article ID"
              }
            />

          </div>

          {/* DETAILS */}

          <section
            className="
              mb-5
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-4
            "
          >

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-zinc-500
              "
            >
              Report explanation
            </p>

            <p
              className="
                mt-3
                whitespace-pre-wrap
                text-sm
                leading-6
                text-zinc-700
              "
            >
              {report.details ||
                "The reporter did not provide additional details."}
            </p>

          </section>

          {/* META */}

          <div
            className="
              grid
              gap-3
              rounded-2xl
              bg-zinc-50
              p-4
              text-xs
              sm:grid-cols-2
            "
          >

            <MetaItem
              label="Report ID"
              value={report.id}
            />

            <MetaItem
              label="Comment ID"
              value={report.commentId}
            />

            <MetaItem
              label="Reporter ID"
              value={report.reporterId}
            />

            <MetaItem
              label="Comment User ID"
              value={report.commentUserId}
            />

          </div>

        </div>

        {/* FOOTER */}

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-zinc-100
            bg-zinc-50/70
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >

          <button
            type="button"
            onClick={onDelete}
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-3
              text-sm
              font-semibold
              text-red-600
              hover:bg-red-50
            "
          >

            <Trash2 size={16} />

            Delete report

          </button>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {report.status !==
              "rejected" && (
              <ActionButton
                label="Reject"
                icon={
                  <XCircle size={16} />
                }
                variant="secondary"
                loading={
                  actionLoading ===
                  `${report.id}-rejected`
                }
                onClick={() =>
                  onStatusChange(
                    report.id,
                    "rejected"
                  )
                }
              />
            )}

            {report.status !==
              "reviewed" && (
              <ActionButton
                label="Mark reviewed"
                icon={
                  <EyeIcon size={16} />
                }
                variant="secondary"
                loading={
                  actionLoading ===
                  `${report.id}-reviewed`
                }
                onClick={() =>
                  onStatusChange(
                    report.id,
                    "reviewed"
                  )
                }
              />
            )}

            {report.status !==
              "resolved" && (
              <ActionButton
                label="Resolve"
                icon={
                  <CheckCircle2
                    size={16}
                  />
                }
                variant="primary"
                loading={
                  actionLoading ===
                  `${report.id}-resolved`
                }
                onClick={() =>
                  onStatusChange(
                    report.id,
                    "resolved"
                  )
                }
              />
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

// ==========================================
// INFO BOX
// ==========================================

function InfoBox({
  icon,
  label,
  value,
  secondary,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  secondary: string;
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-zinc-200
        p-4
      "
    >

      <div
        className="
          flex
          items-center
          gap-2
          text-zinc-400
        "
      >
        {icon}

        <span
          className="
            text-xs
            font-bold
            uppercase
            tracking-wider
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-3
          truncate
          text-sm
          font-bold
          text-zinc-900
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          truncate
          text-xs
          text-zinc-500
        "
      >
        {secondary}
      </p>

    </div>
  );
}

// ==========================================
// META ITEM
// ==========================================

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div>

      <p
        className="
          font-semibold
          text-zinc-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-all
          font-mono
          text-[11px]
          text-zinc-600
        "
      >
        {value || "—"}
      </p>

    </div>
  );
}

// ==========================================
// ACTION BUTTON
// ==========================================

function ActionButton({
  label,
  icon,
  variant,
  loading,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  variant:
    | "primary"
    | "secondary";
  loading?: boolean;
  onClick: () => void;
}) {

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`
        inline-flex
        h-10
        items-center
        justify-center
        gap-2
        rounded-xl
        px-4
        text-sm
        font-bold
        transition
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${
          variant === "primary"
            ? "bg-zinc-950 text-white hover:bg-zinc-800"
            : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
        }
      `}
    >

      {loading ? (
        <Loader2
          size={16}
          className="
            animate-spin
          "
        />
      ) : (
        icon
      )}

      {label}

    </button>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptyState({
  hasSearch,
  onReset,
}: {
  hasSearch: boolean;
  onReset: () => void;
}) {

  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-zinc-200
        bg-white
        px-6
        text-center
      "
    >

      <div
        className="
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-2xl
          bg-emerald-50
          text-emerald-600
        "
      >
        <CheckCircle2
          size={30}
        />
      </div>

      <h2
        className="
          mt-5
          text-lg
          font-bold
          text-zinc-900
        "
      >
        {hasSearch
          ? "No matching reports"
          : "No comment reports"}
      </h2>

      <p
        className="
          mt-1
          max-w-md
          text-sm
          leading-6
          text-zinc-500
        "
      >
        {hasSearch
          ? "Try changing the search text or status filter."
          : "There are currently no comment reports requiring moderation."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onReset}
          className="
            mt-5
            rounded-xl
            bg-zinc-950
            px-4
            py-2.5
            text-sm
            font-semibold
            text-white
            hover:bg-zinc-800
          "
        >
          Clear filters
        </button>
      )}

    </div>
  );
}

// ==========================================
// DELETE MODAL
// ==========================================

function DeleteConfirmModal({
  report,
  loading,
  onClose,
  onConfirm,
}: {
  report: CommentReport;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-6
          shadow-2xl
        "
      >

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-red-50
            text-red-600
          "
        >
          <Trash2 size={22} />
        </div>

        <h2
          className="
            mt-4
            text-lg
            font-bold
            text-zinc-950
          "
        >
          Delete this report?
        </h2>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500
          "
        >
          This will permanently remove the
          report from the moderation system.
          This action cannot be undone.
        </p>

        <div
          className="
            mt-4
            rounded-xl
            bg-zinc-50
            p-3
          "
        >

          <p
            className="
              line-clamp-2
              text-sm
              text-zinc-700
            "
          >
            {report.commentText ||
              "No comment text"}
          </p>

        </div>

        <div
          className="
            mt-6
            flex
            justify-end
            gap-2
          "
        >

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-zinc-700
              hover:bg-zinc-100
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              hover:bg-red-700
              disabled:opacity-60
            "
          >

            {loading ? (
              <Loader2
                size={16}
                className="
                  animate-spin
                "
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete

          </button>

        </div>

      </div>

    </div>
  );
}