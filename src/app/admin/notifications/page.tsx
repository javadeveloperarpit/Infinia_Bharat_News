"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  BellRing,
  Image as ImageIcon,
  Link2,
  Send,
  Newspaper,
  Radio,
  Video,
  Megaphone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type NotificationType =
  | "article"
  | "breaking"
  | "video"
  | "custom"
  | "card";

type SendResult = {
  success: boolean;
  message?: string;
  type?: NotificationType;
  total?: number;
  sent?: number;
  failed?: number;
  removed?: number;
};

// ======================================================
// CONFIG
// ======================================================

const API_ENDPOINT = "/api/admin/notifications";

const SITE_URL =
  "https://infiniabharatnews.vercel.app/";

const DEFAULT_ICON =
  "https://infiniabharatnews.vercel.app/loader.webp";

const DEFAULT_BADGE =
  "https://infiniabharatnews.vercel.app/loader.webp";

// ======================================================
// TYPE CONFIG
// ======================================================

const notificationTypes: {
  value: NotificationType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: "article",
    label: "Article",
    description: "News article notification",
    icon: Newspaper,
  },
  {
    value: "breaking",
    label: "Breaking News",
    description: "Urgent breaking news",
    icon: Radio,
  },
  {
    value: "video",
    label: "Video",
    description: "Video / reel notification",
    icon: Video,
  },
  {
    value: "custom",
    label: "Custom",
    description: "General notification",
    icon: Megaphone,
  },
  {
    value: "card",
    label: "Custom Card",
    description: "Rich card notification",
    icon: CreditCard,
  },
];

// ======================================================
// DEFAULT CTA
// ======================================================

function getDefaultCta(
  type: NotificationType
) {
  switch (type) {
    case "article":
      return "Read Story";

    case "breaking":
      return "Read Now";

    case "video":
      return "Watch Video";

    case "card":
      return "Open";

    default:
      return "Open";
  }
}

// ======================================================
// TOKEN HELPER
// ======================================================

function getAdminToken() {
  if (typeof window === "undefined") {
    return "";
  }

  const possibleKeys = [
    "adminToken",
    "admin_token",
    "authToken",
    "auth_token",
    "token",
    "accessToken",
    "access_token",
  ];

  for (const key of possibleKeys) {
    const value =
      window.localStorage.getItem(key);

    if (value?.trim()) {
      return value.trim();
    }
  }

  return "";
}

// ======================================================
// PAGE
// ======================================================

export default function NotificationAdminPage() {
  // ====================================================
  // STATE
  // ====================================================

  const [type, setType] =
    useState<NotificationType>("article");

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [url, setUrl] =
    useState("");

  const [image, setImage] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [tag, setTag] =
    useState("");

  const [ctaText, setCtaText] =
    useState("");

  const [heading, setHeading] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [icon, setIcon] =
    useState(DEFAULT_ICON);

  const [badge, setBadge] =
    useState(DEFAULT_BADGE);

  const [sending, setSending] =
    useState(false);

  const [result, setResult] =
    useState<SendResult | null>(null);

  const [error, setError] =
    useState("");

  // ====================================================
  // CURRENT TYPE
  // ====================================================

  const currentType = useMemo(
    () =>
      notificationTypes.find(
        (item) => item.value === type
      ),
    [type]
  );

  // ====================================================
  // TYPE CHANGE
  // ====================================================

  function handleTypeChange(
    nextType: NotificationType
  ) {
    setType(nextType);

    setResult(null);
    setError("");

    setCtaText(
      getDefaultCta(nextType)
    );

    if (nextType !== "article") {
      setCategory("");
    }

    if (nextType !== "card") {
      setHeading("");
      setDescription("");
    }
  }

  // ====================================================
  // RESET
  // ====================================================

  function resetForm() {
    setType("article");
    setTitle("");
    setMessage("");
    setUrl("");
    setImage("");
    setCategory("");
    setTag("");
    setCtaText("Read Story");
    setHeading("");
    setDescription("");
    setIcon(DEFAULT_ICON);
    setBadge(DEFAULT_BADGE);
    setResult(null);
    setError("");
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setResult(null);

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (!title.trim()) {
      setError(
        "Notification title is required."
      );
      return;
    }

    if (!message.trim()) {
      setError(
        "Notification message is required."
      );
      return;
    }

    if (
      type === "article" &&
      !category.trim()
    ) {
      setError(
        "Category is required for article notifications."
      );
      return;
    }

    if (
      type === "card" &&
      !ctaText.trim()
    ) {
      setError(
        "CTA text is required for custom cards."
      );
      return;
    }

    // ----------------------------------------------
    // TOKEN
    // ----------------------------------------------

    const token = getAdminToken();

    if (!token) {
      setError(
        "Admin authentication token was not found. Please login again."
      );
      return;
    }

    // ----------------------------------------------
    // PAYLOAD
    // ----------------------------------------------

    const payload = {
      type,

      title: title.trim(),

      body: message.trim(),

      url:
        url.trim() ||
        SITE_URL,

      image:
        image.trim() ||
        "",

      category:
        category.trim(),

      tag:
        tag.trim() ||
        `infinia-${type}-${Date.now()}`,

      ctaText:
        ctaText.trim() ||
        getDefaultCta(type),

      heading:
        heading.trim() ||
        title.trim(),

      description:
        description.trim() ||
        message.trim(),

      icon:
        icon.trim() ||
        DEFAULT_ICON,

      badge:
        badge.trim() ||
        DEFAULT_BADGE,
    };

    // ----------------------------------------------
    // SEND
    // ----------------------------------------------

    try {
      setSending(true);

      const response =
        await fetch(API_ENDPOINT, {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body:
            JSON.stringify(payload),

          cache: "no-store",
        });

      let data: SendResult;

      try {
        data =
          await response.json();
      } catch {
        data = {
          success: false,
          message:
            "Invalid response from server.",
        };
      }

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Notification sending failed."
        );
        return;
      }

      setResult(data);

    } catch (err) {
      console.error(
        "Notification send error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while sending notification."
      );
    } finally {
      setSending(false);
    }
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
                <BellRing
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Push Notifications
                </h1>

                <p className="text-sm text-zinc-400">
                  INFINIA BHARAT NEWS Admin
                </p>
              </div>
            </div>

            <p className="max-w-2xl text-sm text-zinc-400">
              Send instant push notifications to
              subscribed INFINIA BHARAT NEWS readers.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Sending failed
              </p>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {result?.success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">

            <div className="flex items-start gap-3">
              <CheckCircle2
                size={22}
                className="mt-0.5 shrink-0 text-emerald-400"
              />

              <div className="flex-1">
                <p className="font-semibold text-emerald-300">
                  Notification sent successfully
                </p>

                <p className="mt-1 text-sm text-emerald-300/70">
                  Push delivery process completed.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <Stat
                label="Subscribers"
                value={
                  result.total ?? 0
                }
              />

              <Stat
                label="Sent"
                value={
                  result.sent ?? 0
                }
              />

              <Stat
                label="Failed"
                value={
                  result.failed ?? 0
                }
              />

              <Stat
                label="Removed"
                value={
                  result.removed ?? 0
                }
              />

            </div>
          </div>
        )}

        {/* =================================================
            TYPE SELECTOR
        ================================================= */}

        <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-6">

          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Notification Type
            </h2>

            <p className="text-sm text-zinc-500">
              Choose what kind of notification you want to send.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

            {notificationTypes.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  type ===
                  item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      handleTypeChange(
                        item.value
                      )
                    }
                    className={[
                      "rounded-2xl border p-4 text-left transition",
                      active
                        ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/5"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">

                      <div
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          active
                            ? "bg-red-600 text-white"
                            : "bg-zinc-800 text-zinc-400",
                        ].join(" ")}
                      >
                        <Icon size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.description}
                        </p>
                      </div>

                    </div>
                  </button>
                );
              }
            )}

          </div>
        </section>

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
          >

            {/* FORM HEADER */}

            <div className="mb-6 flex items-center gap-3">
              {currentType && (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
                  <currentType.icon
                    size={20}
                  />
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold">
                  {currentType?.label ||
                    "Notification"}
                </h2>

                <p className="text-sm text-zinc-500">
                  Configure your notification
                </p>
              </div>
            </div>

            {/* =================================================
                BASIC
            ================================================= */}

            <div className="space-y-5">

              <Field
                label="Notification Title"
                required
                value={title}
                onChange={setTitle}
                placeholder="INFINIA BHARAT NEWS"
                maxLength={120}
              />

              <TextArea
                label="Message"
                required
                value={message}
                onChange={setMessage}
                placeholder="नई खबर उपलब्ध है..."
                rows={4}
                maxLength={300}
              />

              {/* =================================================
                  ARTICLE CATEGORY
              ================================================= */}

              {type === "article" && (
                <Field
                  label="Category"
                  required
                  value={category}
                  onChange={setCategory}
                  placeholder="जैसे: राजनीति, खेल, उत्तर प्रदेश"
                />
              )}

              {/* =================================================
                  URL
              ================================================= */}

              <Field
                label="Target URL"
                value={url}
                onChange={setUrl}
                placeholder={SITE_URL}
                icon={
                  <Link2 size={16} />
                }
              />

              {/* =================================================
                  IMAGE
              ================================================= */}

              <Field
                label="Rich Image URL"
                value={image}
                onChange={setImage}
                placeholder="https://example.com/news-image.webp"
                icon={
                  <ImageIcon size={16} />
                }
              />

              {/* =================================================
                  CTA
              ================================================= */}

              <Field
                label="CTA Text"
                value={ctaText}
                onChange={setCtaText}
                placeholder={getDefaultCta(type)}
              />

              {/* =================================================
                  TAG
              ================================================= */}

              <Field
                label="Notification Tag"
                value={tag}
                onChange={setTag}
                placeholder={`infinia-${type}-${Date.now()}`}
              />

              {/* =================================================
                  CARD FIELDS
              ================================================= */}

              {type === "card" && (
                <div className="space-y-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">

                  <div>
                    <p className="font-semibold text-red-300">
                      Custom Card Content
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      These fields are used for structured rich-card data.
                    </p>
                  </div>

                  <Field
                    label="Card Heading"
                    value={heading}
                    onChange={setHeading}
                    placeholder={title || "Card heading"}
                  />

                  <TextArea
                    label="Card Description"
                    value={description}
                    onChange={setDescription}
                    placeholder={
                      message ||
                      "Card description..."
                    }
                    rows={4}
                  />

                </div>
              )}

              {/* =================================================
                  ADVANCED ASSETS
              ================================================= */}

              <details className="rounded-2xl border border-zinc-800 bg-zinc-950">

                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-zinc-300">
                  Advanced Notification Assets
                </summary>

                <div className="space-y-5 border-t border-zinc-800 p-4">

                  <Field
                    label="Icon URL"
                    value={icon}
                    onChange={setIcon}
                    placeholder={DEFAULT_ICON}
                  />

                  <Field
                    label="Badge URL"
                    value={badge}
                    onChange={setBadge}
                    placeholder={DEFAULT_BADGE}
                  />

                </div>
              </details>

              {/* =================================================
                  SEND BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    Sending notification...
                  </>
                ) : (
                  <>
                    <Send size={19} />

                    Send Notification
                  </>
                )}
              </button>

            </div>
          </form>

          {/* =================================================
              PREVIEW
          ================================================= */}

          <aside className="space-y-6">

            {/* PREVIEW CARD */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <div className="mb-5">
                <h2 className="text-lg font-bold">
                  Live Preview
                </h2>

                <p className="text-sm text-zinc-500">
                  Approximate browser notification preview
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl">

                {/* Browser notification */}

                <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">

                  <img
                    src={
                      icon ||
                      DEFAULT_ICON
                    }
                    alt=""
                    className="h-9 w-9 rounded-lg object-cover"
                    onError={(event) => {
                      event.currentTarget.src =
                        DEFAULT_ICON;
                    }}
                  />

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">

                      <p className="truncate text-xs font-semibold text-zinc-300">
                        INFINIA BHARAT NEWS
                      </p>

                      <span className="text-[10px] text-zinc-600">
                        now
                      </span>

                    </div>

                    <p className="mt-1 truncate text-[10px] text-zinc-600">
                      Push Notification
                    </p>

                  </div>

                </div>

                <div className="p-4">

                  <p className="text-sm font-bold text-white">
                    {title ||
                      "Notification Title"}
                  </p>

                  <p className="mt-2 text-sm leading-5 text-zinc-400">
                    {getPreviewBody(
                      type,
                      category,
                      message
                    )}
                  </p>

                  {image && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">

                      <img
                        src={image}
                        alt=""
                        className="aspect-video w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2">

                    <div className="rounded-lg bg-red-600/10 px-3 py-2 text-xs font-semibold text-red-400">
                      {ctaText ||
                        getDefaultCta(type)}
                    </div>

                    <div className="rounded-lg bg-zinc-800 px-3 py-2 text-xs text-zinc-500">
                      Open
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <h3 className="mb-4 font-bold">
                Notification Summary
              </h3>

              <div className="space-y-3 text-sm">

                <SummaryRow
                  label="Type"
                  value={type}
                />

                <SummaryRow
                  label="Title"
                  value={
                    title ||
                    "Not set"
                  }
                />

                <SummaryRow
                  label="Category"
                  value={
                    category ||
                    "—"
                  }
                />

                <SummaryRow
                  label="CTA"
                  value={
                    ctaText ||
                    getDefaultCta(type)
                  }
                />

                <SummaryRow
                  label="Target"
                  value={
                    url ||
                    SITE_URL
                  }
                />

              </div>
            </div>

            {/* =================================================
                WORKFLOW
            ================================================= */}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">

              <h3 className="mb-4 font-bold">
                Delivery Flow
              </h3>

              <div className="space-y-4">

                <FlowStep
                  number="1"
                  text="Admin authentication"
                />

                <FlowStep
                  number="2"
                  text="Next.js API validates payload"
                />

                <FlowStep
                  number="3"
                  text="Cloudflare Push Worker receives request"
                />

                <FlowStep
                  number="4"
                  text="D1 subscriptions are processed"
                />

                <FlowStep
                  number="5"
                  text="Expired subscriptions are removed"
                />

              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}

// ======================================================
// FIELD
// ======================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">

      <div className="mb-2 flex items-center justify-between gap-2">

        <span className="text-sm font-medium text-zinc-300">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </span>

        {maxLength && (
          <span className="text-[11px] text-zinc-600">
            {value.length}/{maxLength}
          </span>
        )}

      </div>

      <div className="relative">

        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
            {icon}
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className={[
            "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500",
            icon
              ? "pl-10"
              : "",
          ].join(" ")}
        />

      </div>
    </label>
  );
}

// ======================================================
// TEXTAREA
// ======================================================

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 4,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">

      <div className="mb-2 flex items-center justify-between gap-2">

        <span className="text-sm font-medium text-zinc-300">
          {label}

          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </span>

        {maxLength && (
          <span className="text-[11px] text-zinc-600">
            {value.length}/{maxLength}
          </span>
        )}

      </div>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-red-500"
      />

    </label>
  );
}

// ======================================================
// STAT
// ======================================================

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
      <p className="text-xs text-zinc-600">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// SUMMARY ROW
// ======================================================

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3 last:border-0 last:pb-0">

      <span className="shrink-0 text-zinc-600">
        {label}
      </span>

      <span className="max-w-[230px] truncate text-right font-medium text-zinc-300">
        {value}
      </span>

    </div>
  );
}

// ======================================================
// FLOW STEP
// ======================================================

function FlowStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/15 text-xs font-bold text-red-400">
        {number}
      </div>

      <p className="text-sm text-zinc-400">
        {text}
      </p>

    </div>
  );
}

// ======================================================
// PREVIEW BODY
// ======================================================

function getPreviewBody(
  type: NotificationType,
  category: string,
  message: string
) {
  const clean =
    message ||
    "नई खबर उपलब्ध है।";

  if (type === "article") {
    return category
      ? `📰 ${category} • ${clean}`
      : clean;
  }

  if (type === "breaking") {
    return `🔴 BREAKING NEWS • ${clean}`;
  }

  if (type === "video") {
    return `▶️ ${clean}`;
  }

  return clean;
}