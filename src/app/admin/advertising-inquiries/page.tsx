"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

type Inquiry = {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  companyName?: string;
  subject?: string;
  message?: string;
  inquiry?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  status?: string;

  [key: string]: unknown;
};

type Filter =
  | "all"
  | "pending"
  | "contacted"
  | "resolved";

export default function AdvertisingInquiriesPage() {
  const [inquiries, setInquiries] =
    useState<Inquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [selected, setSelected] =
    useState<Inquiry | null>(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState<Filter>("all");

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  // ==========================================
  // ADMIN TOKEN
  // ==========================================

  async function getAdminToken() {
    const {
      getAuth,
    } = await import("firebase/auth");

    const auth = getAuth();

    const user =
      auth.currentUser;

    if (!user) {
      return null;
    }

    return user.getIdToken();
  }

  // ==========================================
  // LOAD
  // ==========================================

  const loadInquiries = useCallback(
    async (
      showRefresh = false
    ) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token =
          await getAdminToken();

        if (!token) {
          setError(
            "Admin authentication required."
          );
          return;
        }

        const response =
          await fetch(
            "/api/admin/advertising-inquiries",
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

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Failed to load inquiries."
          );
        }

        setInquiries(
          Array.isArray(data.inquiries)
            ? data.inquiries
            : []
        );

      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load inquiries."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredInquiries =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return inquiries.filter(
        (item) => {
          const matchesFilter =
            filter === "all" ||
            String(item.status || "pending")
              .toLowerCase() === filter;

          if (!matchesFilter) {
            return false;
          }

          if (!query) {
            return true;
          }

          return Object.values(item)
            .some((value) =>
              String(value ?? "")
                .toLowerCase()
                .includes(query)
            );
        }
      );
    }, [
      inquiries,
      search,
      filter,
    ]);

  // ==========================================
  // COUNTS
  // ==========================================

  const counts = useMemo(() => {
    return {
      all: inquiries.length,

      pending:
        inquiries.filter(
          (item) =>
            item.status === "pending" ||
            !item.status
        ).length,

      contacted:
        inquiries.filter(
          (item) =>
            item.status === "contacted"
        ).length,

      resolved:
        inquiries.filter(
          (item) =>
            item.status === "resolved"
        ).length,
    };
  }, [inquiries]);

  // ==========================================
  // UPDATE STATUS
  // ==========================================

  async function updateStatus(
    inquiry: Inquiry,
    status:
      | "pending"
      | "contacted"
      | "resolved"
  ) {
    try {
      setActionLoading(
        `${inquiry.id}-${status}`
      );

      const token =
        await getAdminToken();

      if (!token) {
        throw new Error(
          "Authentication required."
        );
      }

      const response =
        await fetch(
          "/api/admin/advertising-inquiries",
          {
            method: "PATCH",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: inquiry.id,
              status,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update inquiry."
        );
      }

      setInquiries(
        (previous) =>
          previous.map((item) =>
            item.id === inquiry.id
              ? {
                  ...item,
                  status,
                }
              : item
          )
      );

      setSelected(
        (previous) =>
          previous?.id === inquiry.id
            ? {
                ...previous,
                status,
              }
            : previous
      );

    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to update inquiry."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function deleteInquiry(
    inquiry: Inquiry
  ) {
    const confirmed =
      window.confirm(
        "Delete this advertising inquiry permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `${inquiry.id}-delete`
      );

      const token =
        await getAdminToken();

      if (!token) {
        throw new Error(
          "Authentication required."
        );
      }

      const response =
        await fetch(
          "/api/admin/advertising-inquiries",
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              id: inquiry.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to delete inquiry."
        );
      }

      setInquiries(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== inquiry.id
          )
      );

      if (
        selected?.id === inquiry.id
      ) {
        setSelected(null);
      }

    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete inquiry."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // ==========================================
  // HELPERS
  // ==========================================

  function getName(
    inquiry: Inquiry
  ) {
    return (
      inquiry.name ||
      inquiry.fullName ||
      "Unknown person"
    );
  }

  function getCompany(
    inquiry: Inquiry
  ) {
    return (
      inquiry.company ||
      inquiry.companyName ||
      ""
    );
  }

  function getMessage(
    inquiry: Inquiry
  ) {
    return (
      inquiry.message ||
      inquiry.inquiry ||
      inquiry.subject ||
      "No message provided."
    );
  }

  function formatDate(
    value: unknown
  ) {
    if (!value) {
      return "Unknown date";
    }

    const date =
      new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return String(value);
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

  function statusLabel(
    status?: string
  ) {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  }

  function statusClass(
    status?: string
  ) {
    switch (status) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "contacted":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  async function copyText(
    text: string
  ) {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch {
      // Ignore clipboard errors
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-zinc-50 p-6">
        <div className="mx-auto max-w-7xl">

          <div className="h-8 w-72 animate-pulse rounded-lg bg-zinc-200" />

          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-zinc-200" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}
          </div>

          <div className="mt-6 h-24 animate-pulse rounded-2xl bg-white" />

          <div className="mt-4 space-y-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 p-4 sm:p-6">

      <div className="mx-auto max-w-7xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  window.history.back()
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-zinc-200
                  bg-white
                  text-zinc-700
                  shadow-sm
                  transition
                  hover:bg-zinc-100
                "
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <h1 className="text-xl font-bold text-zinc-950 sm:text-2xl">
                  Advertising Inquiries
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Manage advertising requests received from your website.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadInquiries(true)
            }
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-950
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-zinc-800
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

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>

              <button
                type="button"
                onClick={() =>
                  loadInquiries()
                }
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ================================= */}
        {/* STATS */}
        {/* ================================= */}

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatCard
            label="All Inquiries"
            value={counts.all}
            icon={<MessageSquare size={19} />}
            active={filter === "all"}
            onClick={() =>
              setFilter("all")
            }
          />

          <StatCard
            label="Pending"
            value={counts.pending}
            icon={<Clock size={19} />}
            active={filter === "pending"}
            onClick={() =>
              setFilter("pending")
            }
          />

          <StatCard
            label="Contacted"
            value={counts.contacted}
            icon={<Phone size={19} />}
            active={filter === "contacted"}
            onClick={() =>
              setFilter("contacted")
            }
          />

          <StatCard
            label="Resolved"
            value={counts.resolved}
            icon={<Check size={19} />}
            active={filter === "resolved"}
            onClick={() =>
              setFilter("resolved")
            }
          />

        </div>

        {/* ================================= */}
        {/* SEARCH */}
        {/* ================================= */}

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">

          <div className="relative">
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, email, company, phone or message..."
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
              "
            />
          </div>

        </div>

        {/* ================================= */}
        {/* RESULTS */}
        {/* ================================= */}

        <div className="mt-5">

          {filteredInquiries.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-emerald-50
                text-emerald-600
              ">
                <Check size={25} />
              </div>

              <h2 className="mt-4 text-base font-bold text-zinc-900">
                No advertising inquiries
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
                {search
                  ? "No inquiries match your search."
                  : "There are no inquiries in this category right now."}
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {filteredInquiries.map(
                (inquiry) => (
                  <InquiryCard
                    key={inquiry.id}
                    inquiry={inquiry}
                    onClick={() =>
                      setSelected(
                        inquiry
                      )
                    }
                  />
                )
              )}

            </div>
          )}

        </div>

        {/* ================================= */}
        {/* DETAIL DRAWER */}
        {/* ================================= */}

        {selected && (
          <div className="fixed inset-0 z-[100]">

            <button
              type="button"
              aria-label="Close inquiry"
              onClick={() =>
                setSelected(null)
              }
              className="
                absolute
                inset-0
                bg-black/40
                backdrop-blur-[2px]
              "
            />

            <aside className="
              absolute
              right-0
              top-0
              h-full
              w-full
              max-w-xl
              overflow-y-auto
              bg-white
              shadow-2xl
            ">

              {/* DRAWER HEADER */}

              <div className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-zinc-200
                bg-white
                px-5
                py-4
              ">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Advertising Inquiry
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-zinc-950">
                    {getName(selected)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelected(null)
                  }
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
                  <X size={20} />
                </button>

              </div>

              <div className="p-5">

                {/* STATUS */}

                <div className="flex items-center justify-between gap-3">

                  <span
                    className={`
                      inline-flex
                      rounded-full
                      border
                      px-3
                      py-1
                      text-xs
                      font-bold
                      ${statusClass(
                        selected.status
                      )}
                    `}
                  >
                    {statusLabel(
                      selected.status
                    )}
                  </span>

                  <span className="text-xs text-zinc-400">
                    ID: {selected.id}
                  </span>

                </div>

                {/* CONTACT INFO */}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {getName(selected) && (
                    <InfoItem
                      icon={
                        <User size={17} />
                      }
                      label="Name"
                      value={getName(
                        selected
                      )}
                    />
                  )}

                  {selected.email && (
                    <InfoItem
                      icon={
                        <Mail size={17} />
                      }
                      label="Email"
                      value={String(
                        selected.email
                      )}
                      action={
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              String(
                                selected.email
                              )
                            )
                          }
                          title="Copy email"
                        >
                          <Copy size={14} />
                        </button>
                      }
                    />
                  )}

                  {selected.phone && (
                    <InfoItem
                      icon={
                        <Phone size={17} />
                      }
                      label="Phone"
                      value={String(
                        selected.phone
                      )}
                      action={
                        <button
                          type="button"
                          onClick={() =>
                            copyText(
                              String(
                                selected.phone
                              )
                            )
                          }
                          title="Copy phone"
                        >
                          <Copy size={14} />
                        </button>
                      }
                    />
                  )}

                  {getCompany(selected) && (
                    <InfoItem
                      icon={
                        <Building2
                          size={17}
                        />
                      }
                      label="Company"
                      value={getCompany(
                        selected
                      )}
                    />
                  )}

                </div>

                {/* QUICK ACTIONS */}

                <div className="mt-5 flex flex-wrap gap-2">

                  {selected.email && (
                    <a
                      href={`mailto:${String(
                        selected.email
                      )}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
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
                      <Mail size={16} />
                      Email
                    </a>
                  )}

                  {selected.phone && (
                    <a
                      href={`tel:${String(
                        selected.phone
                      )}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-zinc-200
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-zinc-800
                        hover:bg-zinc-50
                      "
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}

                </div>

                {/* MESSAGE */}

                <div className="mt-7">

                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare
                      size={17}
                      className="text-zinc-500"
                    />

                    <h3 className="text-sm font-bold text-zinc-900">
                      Message
                    </h3>
                  </div>

                  <div className="
                    whitespace-pre-wrap
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-zinc-50
                    p-4
                    text-sm
                    leading-6
                    text-zinc-700
                  ">
                    {getMessage(
                      selected
                    )}
                  </div>

                </div>

                {/* DATE */}

                {selected.createdAt && (
                  <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                    <CalendarDays
                      size={15}
                    />

                    Received{" "}
                    {formatDate(
                      selected.createdAt
                    )}
                  </div>
                )}

                {/* STATUS ACTIONS */}

                <div className="mt-8 border-t border-zinc-200 pt-6">

                  <h3 className="text-sm font-bold text-zinc-900">
                    Update Status
                  </h3>

                  <div className="mt-3 grid grid-cols-3 gap-2">

                    <StatusButton
                      label="Pending"
                      active={
                        !selected.status ||
                        selected.status ===
                          "pending"
                      }
                      loading={
                        actionLoading ===
                        `${selected.id}-pending`
                      }
                      onClick={() =>
                        updateStatus(
                          selected,
                          "pending"
                        )
                      }
                    />

                    <StatusButton
                      label="Contacted"
                      active={
                        selected.status ===
                        "contacted"
                      }
                      loading={
                        actionLoading ===
                        `${selected.id}-contacted`
                      }
                      onClick={() =>
                        updateStatus(
                          selected,
                          "contacted"
                        )
                      }
                    />

                    <StatusButton
                      label="Resolved"
                      active={
                        selected.status ===
                        "resolved"
                      }
                      loading={
                        actionLoading ===
                        `${selected.id}-resolved`
                      }
                      onClick={() =>
                        updateStatus(
                          selected,
                          "resolved"
                        )
                      }
                    />

                  </div>

                </div>

                {/* DELETE */}

                <button
                  type="button"
                  disabled={
                    actionLoading ===
                    `${selected.id}-delete`
                  }
                  onClick={() =>
                    deleteInquiry(
                      selected
                    )
                  }
                  className="
                    mt-7
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    py-3
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-100
                    disabled:opacity-50
                  "
                >
                  <Trash2 size={16} />

                  {actionLoading ===
                  `${selected.id}-delete`
                    ? "Deleting..."
                    : "Delete Inquiry"}
                </button>

              </div>

            </aside>
          </div>
        )}

      </div>
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
  active,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-2xl
        border
        bg-white
        p-4
        text-left
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:shadow-md
        ${
          active
            ? "border-zinc-400 ring-2 ring-zinc-100"
            : "border-zinc-200"
        }
      `}
    >
      <div className="flex items-center justify-between">

        <div className="
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          bg-zinc-100
          text-zinc-700
        ">
          {icon}
        </div>

        <ChevronRight
          size={16}
          className="text-zinc-300"
        />

      </div>

      <p className="mt-4 text-xs font-medium text-zinc-500">
        {label}
      </p>

      <p className="mt-0.5 text-2xl font-bold text-zinc-950">
        {value}
      </p>
    </button>
  );
}

// ==========================================
// INQUIRY CARD
// ==========================================

function InquiryCard({
  inquiry,
  onClick,
}: {
  inquiry: Inquiry;
  onClick: () => void;
}) {
  const name =
    inquiry.name ||
    inquiry.fullName ||
    "Unknown person";

  const company =
    inquiry.company ||
    inquiry.companyName;

  const message =
    inquiry.message ||
    inquiry.inquiry ||
    inquiry.subject ||
    "No message provided.";

  const date =
    inquiry.createdAt
      ? new Date(
          inquiry.createdAt
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )
      : "";

  const status =
    inquiry.status || "pending";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-4
        text-left
        shadow-sm
        transition
        hover:-translate-y-0.5
        hover:border-zinc-300
        hover:shadow-md
      "
    >

      <div className="flex items-start gap-4">

        {/* AVATAR */}

        <div className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-zinc-950
          text-sm
          font-bold
          text-white
        ">
          {String(name)
            .charAt(0)
            .toUpperCase()}
        </div>

        {/* CONTENT */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-bold text-zinc-950">
              {String(name)}
            </h3>

            <span
              className={`
                rounded-full
                border
                px-2
                py-0.5
                text-[10px]
                font-bold
                ${statusClass(
                  status
                )}
              `}
            >
              {statusLabel(status)}
            </span>

          </div>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">

            {inquiry.email && (
              <span className="inline-flex items-center gap-1">
                <Mail size={12} />
                {String(
                  inquiry.email
                )}
              </span>
            )}

            {inquiry.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone size={12} />
                {String(
                  inquiry.phone
                )}
              </span>
            )}

            {company && (
              <span className="inline-flex items-center gap-1">
                <Building2 size={12} />
                {String(company)}
              </span>
            )}

          </div>

          <p className="
            mt-3
            line-clamp-2
            text-sm
            leading-5
            text-zinc-600
          ">
            {String(message)}
          </p>

          {date && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <CalendarDays size={12} />
              {date}
            </div>
          )}

        </div>

        <ChevronRight
          size={18}
          className="
            mt-3
            shrink-0
            text-zinc-300
            transition
            group-hover:translate-x-0.5
            group-hover:text-zinc-600
          "
        />

      </div>

    </button>
  );
}

// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-zinc-200
      bg-zinc-50
      p-3
    ">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-zinc-500">
          {icon}

          <span className="text-[11px] font-semibold uppercase tracking-wide">
            {label}
          </span>
        </div>

        {action && (
          <div className="text-zinc-400 hover:text-zinc-900">
            {action}
          </div>
        )}

      </div>

      <p className="mt-2 break-all text-sm font-medium text-zinc-800">
        {value}
      </p>

    </div>
  );
}

// ==========================================
// STATUS BUTTON
// ==========================================

function StatusButton({
  label,
  active,
  loading,
  onClick,
}: {
  label: string;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || active}
      className={`
        rounded-xl
        border
        px-2
        py-2.5
        text-xs
        font-semibold
        transition
        ${
          active
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
        }
        disabled:cursor-not-allowed
        disabled:opacity-70
      `}
    >
      {loading
        ? "..."
        : label}
    </button>
  );
}
function statusLabel(status?: string) {
  if (!status) {
    return "Pending";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function statusClass(status?: string) {
  switch (status) {
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "contacted":
      return "bg-blue-50 text-blue-700 border-blue-200";

    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}