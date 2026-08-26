"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from "firebase/auth";

import { getYoutubeThumbnail } from "@/utils/youtube";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  commentsAuth,
} from "@/lib/firebase/firebase-comments";

import {
  db,
} from "@/lib/firebase/firebase";

import {
  Bell,
  BellRing,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

type NotificationType =
  | "article"
  | "breaking"
  | "video"
  | "custom";

type ContentItem = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  url: string;
  createdAt: number;
  youtubeUrl?: string;
};

type CategoryItem = {
  id: string;
  name: string;
};

const SITE_URL =
  "https://infiniabharatnews.vercel.app";

const DEFAULT_ICON =
  `${SITE_URL}/notification.webp`;

const DEFAULT_BADGE =
  `${SITE_URL}/notification.webp`;

const TYPE_CONFIG: Record<
  NotificationType,
  {
    label: string;
    description: string;
    icon: typeof Bell;
  }
> = {
  article: {
    label: "Article",
    description:
      "Published article ko notification mein convert karein.",
    icon: FileText,
  },

  breaking: {
    label: "Breaking News",
    description:
      "Active breaking news ko instantly push karein.",
    icon: Zap,
  },

  video: {
    label: "Video",
    description:
      "Published video ko automatically push karein.",
    icon: Play,
  },

  custom: {
    label: "Custom",
    description:
      "Apni custom notification manually create karein.",
    icon: Megaphone,
  },
};

function timestampToNumber(
  value: any
): number {
  if (!value) return 0;

  if (
    typeof value === "number"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const time =
      new Date(value).getTime();

    return Number.isFinite(time)
      ? time
      : 0;
  }

  if (
    typeof value?.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value?.seconds ===
    "number"
  ) {
    return value.seconds * 1000;
  }

  return 0;
}

function truncate(
  text: string,
  length = 120
) {
  const clean =
    String(text || "")
      .replace(/\s+/g, " ")
      .trim();

  if (clean.length <= length) {
    return clean;
  }

  return (
    clean.slice(0, length - 1) +
    "…"
  );
}

function formatDate(
  timestamp: number
) {
  if (!timestamp) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(timestamp)
  );
}

export default function NotificationsAdminPage() {
  // =====================================================
  // AUTH
  // =====================================================

  const [user, setUser] =
    useState<User | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [loginLoading, setLoginLoading] =
    useState(false);

  // =====================================================
  // CONTENT
  // =====================================================

  const [articles, setArticles] =
    useState<ContentItem[]>([]);

  const [videos, setVideos] =
    useState<ContentItem[]>([]);

  const [breakingNews, setBreakingNews] =
    useState<ContentItem[]>([]);

  const [categories, setCategories] =
    useState<CategoryItem[]>([]);

  const [contentLoading, setContentLoading] =
    useState(false);

  const [contentError, setContentError] =
    useState("");

  // =====================================================
  // UI
  // =====================================================

  const [type, setType] =
    useState<NotificationType>(
      "article"
    );

  const [search, setSearch] =
    useState("");

  const [selectedId, setSelectedId] =
    useState("");

  const [showPreview, setShowPreview] =
    useState(true);

  // =====================================================
  // CUSTOM
  // =====================================================

  const [customTitle, setCustomTitle] =
    useState("");

  const [customMessage, setCustomMessage] =
    useState("");

  const [customUrl, setCustomUrl] =
    useState("");

  const [customImage, setCustomImage] =
    useState("");

  // =====================================================
  // STATUS
  // =====================================================

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // AUTH STATE
  // =====================================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        commentsAuth,
        (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        }
      );

    return () =>
      unsubscribe();
  }, []);

  // =====================================================
  // LOAD CONTENT
  // =====================================================

  async function loadContent() {
    try {
      setContentLoading(true);
      setContentError("");

      const [
        articleSnapshot,
        videoSnapshot,
        breakingSnapshot,
        categorySnapshot,
      ] = await Promise.all([
        getDocs(
          collection(
            db,
            "articles"
          )
        ),

        getDocs(
          collection(
            db,
            "videos"
          )
        ),

        getDocs(
          collection(
            db,
            "breakingNews"
          )
        ),

        getDocs(
          collection(
            db,
            "categories"
          )
        ),
      ]);

      // -----------------------------------------------
      // CATEGORIES
      // -----------------------------------------------

      const categoryMap =
        new Map<string, string>();

      const categoryList =
        categorySnapshot.docs
          .map((doc) => {
            const data =
              doc.data();

            const item = {
              id: doc.id,
              name: String(
                data?.name ||
                  data?.nameHi ||
                  ""
              ).trim(),
            };

            categoryMap.set(
              item.id,
              item.name
            );

            return item;
          })
          .filter(
            (item) =>
              item.name
          );

      // -----------------------------------------------
      // ARTICLES
      // -----------------------------------------------

     const articleList =
  articleSnapshot.docs
    .map((doc) => {
      const data =
        doc.data();

      if (
        data?.status !==
        "published"
      ) {
        return null;
      }

      const slug =
        String(
          data?.slug || ""
        ).trim();

      // Slug nahi hai to notification me
      // broken URL nahi bhejna
      if (!slug) {
        return null;
      }

      return {
        id: doc.id,

        title: String(
          data?.title || ""
        ).trim(),

        description: String(
          data?.description ||
            data?.shortDescription ||
            ""
        ).trim(),

        image: String(
          data?.thumbnail ||
            data?.image ||
            ""
        ).trim(),

        category:
          categoryMap.get(
            String(
              data?.categoryId || ""
            )
          ) ||
          String(
            data?.category || ""
          ).trim(),

        // IMPORTANT: Firestore ID nahi,
        // actual article slug use hoga
        url:
          `${SITE_URL}/news/${slug}`,

        youtubeUrl: String(
          data?.youtubeUrl ||
            data?.youtubeURL ||
            data?.videoUrl ||
            ""
        ).trim(),

        createdAt:
          timestampToNumber(
            data?.createdAt
          ),
      };
    })
    .filter(Boolean) as ContentItem[];

      // -----------------------------------------------
      // VIDEOS
      // -----------------------------------------------

      // -----------------------------------------------
// VIDEOS
// -----------------------------------------------

const videoList =
  videoSnapshot.docs
    .map((doc) => {
      const data = doc.data();

      if (
        data?.status !==
        "published"
      ) {
        return null;
      }

      // YouTube URL ko directly Firestore se nikalo
      const youtubeUrl = String(
        data?.youtubeUrl ||
          data?.youtubeURL ||
          data?.videoUrl ||
          data?.url ||
          ""
      ).trim();

      // Existing thumbnail ko priority do
      const storedThumbnail = String(
        data?.thumbnail ||
          data?.image ||
          ""
      ).trim();

      // Agar stored thumbnail nahi hai,
      // to YouTube URL se thumbnail generate hoga
      const youtubeThumbnail =
        youtubeUrl
          ? getYoutubeThumbnail(
              youtubeUrl
            )
          : "";

      return {
        id: doc.id,

        title: String(
          data?.title ||
            ""
        ).trim(),

        description: String(
          data?.description ||
            data?.shortDescription ||
            ""
        ).trim(),

        image:
          storedThumbnail ||
          youtubeThumbnail,

        category:
          categoryMap.get(
            String(
              data?.categoryId ||
                ""
            )
          ) || "",

        url:
          `${SITE_URL}/video/${doc.id}`,

        youtubeUrl,

        createdAt:
          timestampToNumber(
            data?.createdAt
          ),
      };
    })
    .filter(
      Boolean
    ) as ContentItem[];
      // -----------------------------------------------
      // BREAKING NEWS
      // -----------------------------------------------

      const breakingList =
        breakingSnapshot.docs
          .map((doc) => {
            const data =
              doc.data();

            if (
              data?.active ===
              false
            ) {
              return null;
            }

            const text =
              String(
                data?.text ||
                  data?.title ||
                  ""
              ).trim();

            if (!text) {
              return null;
            }

            return {
              id: doc.id,

              title:
                "Breaking News",

              description:
                text,

              image:
                String(
                  data?.image ||
                    ""
                ).trim(),

              category:
                "Breaking News",

              url:
                `${SITE_URL}/latest`,

              createdAt:
                timestampToNumber(
                  data?.createdAt ||
                    data?.updatedAt
                ),
            };
          })
          .filter(
            Boolean
          ) as ContentItem[];

      articleList.sort(
        (a, b) =>
          b.createdAt -
          a.createdAt
      );

      videoList.sort(
        (a, b) =>
          b.createdAt -
          a.createdAt
      );

      breakingList.sort(
        (a, b) =>
          b.createdAt -
          a.createdAt
      );

      setCategories(
        categoryList
      );

      setArticles(
        articleList
      );

      setVideos(
        videoList
      );

      setBreakingNews(
        breakingList
      );
    } catch (error) {
      console.error(
        "NOTIFICATION CONTENT LOAD ERROR:",
        error
      );

      setContentError(
        error instanceof Error
          ? error.message
          : "Content load nahi ho paaya."
      );
    } finally {
      setContentLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      loadContent();
    }
  }, [user]);

  // =====================================================
  // CURRENT LIST
  // =====================================================

  const currentItems =
    useMemo(() => {
      if (
        type === "article"
      ) {
        return articles;
      }

      if (
        type === "video"
      ) {
        return videos;
      }

      if (
        type === "breaking"
      ) {
        return breakingNews;
      }

      return [];
    }, [
      type,
      articles,
      videos,
      breakingNews,
    ]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredItems =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return currentItems;
      }

      return currentItems.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(query) ||
          item.description
            .toLowerCase()
            .includes(query) ||
          item.category
            .toLowerCase()
            .includes(query)
      );
    }, [
      currentItems,
      search,
    ]);

  // =====================================================
  // SELECTED CONTENT
  // =====================================================

  const selectedItem =
    useMemo(() => {
      return currentItems.find(
        (item) =>
          item.id ===
          selectedId
      ) || null;
    }, [
      currentItems,
      selectedId,
    ]);

  // =====================================================
  // RESET SELECTION WHEN TYPE CHANGES
  // =====================================================

  useEffect(() => {
    setSelectedId("");
    setSearch("");
    setError("");
    setSuccess("");
  }, [type]);

  // =====================================================
  // NOTIFICATION DATA
  // =====================================================

  const notificationData =
    useMemo(() => {
      if (
        type === "custom"
      ) {
        return {
          title:
            customTitle.trim(),

          body:
            customMessage.trim(),

          url:
            customUrl.trim() ||
            SITE_URL,

          image:
            customImage.trim(),

          category: "",

          heading:
            customTitle.trim(),

          description:
            customMessage.trim(),
        };
      }

      if (!selectedItem) {
        return {
          title: "",
          body: "",
          url: "",
          image: "",
          category: "",
          heading: "",
          description: "",
        };
      }

      if (
        type === "breaking"
      ) {
        return {
          title:
            "🔴 Breaking News",

          body:
            selectedItem.description,

          url:
            selectedItem.url,

          image:
            selectedItem.image,

          category:
            "Breaking News",

          heading:
            "🔴 Breaking News",

          description:
            selectedItem.description,
        };
      }

      return {
        title:
          selectedItem.title,

        body:
          selectedItem.description ||
          (
            type === "video"
              ? "वीडियो देखने के लिए टैप करें।"
              : "पूरी खबर पढ़ने के लिए टैप करें।"
          ),

        url:
          selectedItem.url,

        image:
          selectedItem.image,

        category:
          selectedItem.category,

        heading:
          selectedItem.title,

        description:
          selectedItem.description,
      };
    }, [
      type,
      selectedItem,
      customTitle,
      customMessage,
      customUrl,
      customImage,
    ]);

  // =====================================================
  // LOGIN
  // =====================================================

  async function handleGoogleLogin() {
    try {
      setLoginLoading(true);
      setError("");
      setSuccess("");

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt:
          "select_account",
      });

      await signInWithPopup(
        commentsAuth,
        provider
      );

      setSuccess(
        "Google login successful."
      );
    } catch (error) {
      console.error(
        "GOOGLE LOGIN ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Google login nahi ho paaya."
      );
    } finally {
      setLoginLoading(false);
    }
  }

  // =====================================================
  // SEND
  // =====================================================

  async function handleSend() {
    try {
      setSending(true);
      setError("");
      setSuccess("");

      const currentUser =
        commentsAuth.currentUser;

      if (!currentUser) {
        throw new Error(
          "Please login with Google first."
        );
      }

      const token =
        await currentUser.getIdToken();

      if (!token) {
        throw new Error(
          "Authentication token could not be generated."
        );
      }

      

      if (
        !notificationData.title
      ) {
        throw new Error(
          "Notification title missing hai."
        );
      }

      if (
        !notificationData.body
      ) {
        throw new Error(
          "Notification message missing hai."
        );
      }

      if (
        type !== "custom" &&
        !selectedItem
      ) {
        throw new Error(
          "Pehle content select karein."
        );
      }

      const response =
        await fetch(
          "/api/admin/notifications",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              type,

              title:
                notificationData.title,

              body:
                notificationData.body,

              url:
                notificationData.url ||
                SITE_URL,

              image:
                notificationData.image,

              category:
                notificationData.category,

              ctaText:
                type === "video"
                  ? "Watch Video"
                  : type === "article"
                  ? "Read Story"
                  : type === "breaking"
                  ? "Read Now"
                  : "Open",

              heading:
                notificationData.heading,

              description:
                notificationData.description,

              icon:
                DEFAULT_ICON,

              badge:
                DEFAULT_BADGE,

              tag:
                `infinia-${type}-${Date.now()}`,
            }),

            cache:
              "no-store",
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let result: any;

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        result =
          await response.json();
      } else {
        const text =
          await response.text();

        throw new Error(
          `Server returned ${response.status}: ${text.slice(
            0,
            200
          )}`
        );
      }

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Notification sending failed."
        );
      }

      setSuccess(
        `Notification sent successfully • ${
          result.sent ?? 0
        } subscribers reached${
          result.failed
            ? ` • ${result.failed} failed`
            : ""
        }`
      );

      // Reset
      setSelectedId("");
      setSearch("");

      setCustomTitle("");
      setCustomMessage("");
      setCustomUrl("");
      setCustomImage("");
    } catch (error) {
      console.error(
        "SEND NOTIFICATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Notification sending failed."
      );
    } finally {
      setSending(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (authLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <Loader2
            className="animate-spin"
            size={18}
          />
          Checking authentication...
        </div>
      </div>
    );
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (!user) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <img
              src="/loader.webp"
              alt="INFINIA BHARAT NEWS"
              className="h-full w-full object-contain p-2"
            />
          </div>

          <div className="mb-2 flex items-center justify-center gap-2">
            <BellRing
              size={18}
              className="text-[#C8102E]"
            />

            <span className="text-xs font-bold uppercase tracking-wider text-[#C8102E]">
              Admin Console
            </span>
          </div>

          <h2 className="text-2xl font-black text-zinc-950">
            Push Notifications
          </h2>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            INFINIA BHARAT NEWS subscribers
            ko notifications bhejne ke liye
            Google account se continue karein.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={
              handleGoogleLogin
            }
            disabled={loginLoading}
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-zinc-950
              px-5
              py-3.5
              text-sm
              font-bold
              text-white
              shadow-lg
              transition
              hover:bg-zinc-800
              active:scale-[0.98]
              disabled:opacity-60
            "
          >
            {loginLoading ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.78-.07-1.53-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.63H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.05 4.37l3.24-2.53Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.13c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.18 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.7 5.38l3.24 2.53C7.31 7.85 9.46 6.13 12 6.13Z"
                />
              </svg>
            )}

            {loginLoading
              ? "Connecting..."
              : "Continue with Google"}
          </button>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <ShieldCheck size={14} />
            Secure authentication
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen space-y-5 pb-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">

        <div className="relative px-5 py-6 sm:px-7">

          <div className="absolute inset-x-0 top-0 h-1 bg-[#C8102E]" />

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C8102E]/10 text-[#C8102E]">
                <BellRing size={24} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
                    Push Notifications
                  </h1>

                  <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 sm:inline-flex">
                    READY
                  </span>
                </div>

                <p className="mt-1 text-sm text-zinc-500">
                  Select content. Preview. Send.
                  No unnecessary typing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CheckCircle2
                  size={18}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-900">
                  Authenticated
                </p>

                <p className="max-w-[220px] truncate text-[11px] text-zinc-500">
                  {user.email}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle2
            size={18}
          />
          <span className="flex-1">
            {success}
          </span>

          <button
            onClick={() =>
              setSuccess("")
            }
            className="rounded-lg p-1 hover:bg-green-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <X size={18} />
          <span className="flex-1">
            {error}
          </span>

          <button
            onClick={() =>
              setError("")
            }
            className="rounded-lg p-1 hover:bg-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================
          TYPE SELECTOR
      ================================================= */}

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-zinc-900">
              Create notification
            </p>

            <p className="mt-0.5 text-xs text-zinc-500">
              What do you want to send?
            </p>
          </div>

          <Sparkles
            size={18}
            className="text-[#C8102E]"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

          {(
            Object.keys(
              TYPE_CONFIG
            ) as NotificationType[]
          ).map((item) => {
            const config =
              TYPE_CONFIG[item];

            const Icon =
              config.icon;

            const active =
              type === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setType(item)
                }
                className={`
                  group
                  rounded-2xl
                  border
                  p-3
                  text-left
                  transition
                  ${
                    active
                      ? "border-[#C8102E] bg-[#C8102E]/5 shadow-sm"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
                  }
                `}
              >
                <div
                  className={`
                    mb-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    ${
                      active
                        ? "bg-[#C8102E] text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }
                  `}
                >
                  <Icon size={17} />
                </div>

                <p
                  className={`
                    text-xs font-black
                    ${
                      active
                        ? "text-[#C8102E]"
                        : "text-zinc-900"
                    }
                  `}
                >
                  {config.label}
                </p>

                <p className="mt-1 hidden text-[10px] leading-4 text-zinc-500 sm:block">
                  {config.description}
                </p>
              </button>
            );
          })}

        </div>
      </div>

      {/* =================================================
          WORKSPACE
      ================================================= */}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">

        {/* LEFT */}
        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">

          {type !== "custom" ? (
            <>
              {/* SEARCH BAR */}

              <div className="border-b border-zinc-100 p-4 sm:p-5">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-black text-zinc-900">
                      Select content
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Only published content is shown.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      loadContent
                    }
                    disabled={
                      contentLoading
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        contentLoading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh
                  </button>

                </div>

                <div className="relative mt-4">

                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder={
                      type === "article"
                        ? "Search articles..."
                        : type === "video"
                        ? "Search videos..."
                        : "Search breaking news..."
                    }
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
                      font-medium
                      text-zinc-900
                      outline-none
                      transition
                      focus:border-[#C8102E]
                      focus:bg-white
                    "
                  />

                </div>
              </div>

              {/* CONTENT LIST */}

              <div className="max-h-[560px] overflow-y-auto p-3 sm:p-4">

                {contentLoading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Loading content...
                    </div>
                  </div>
                ) : contentError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {contentError}
                  </div>
                ) : filteredItems.length ===
                  0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                    <Search
                      size={28}
                      className="text-zinc-300"
                    />

                    <p className="mt-3 text-sm font-bold text-zinc-700">
                      No content found
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      Try another search.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">

                    {filteredItems.map(
  (item) => {

    const selected =
      selectedId === item.id;

    const itemImage =
  item.image || "";
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                              setSelectedId(
                                item.id
                              )
                            }
                            className={`
                              flex
                              w-full
                              gap-3
                              rounded-2xl
                              border
                              p-2.5
                              text-left
                              transition
                              ${
                                selected
                                  ? "border-[#C8102E] bg-[#C8102E]/5 shadow-sm"
                                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                              }
                            `}
                          >

                            <div className="relative h-[72px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-[78px] sm:w-[115px]">

                             {itemImage ? (
                                <img
                                  src={itemImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                  <ImageIcon
                                    size={20}
                                  />
                                </div>
                              )}

                              {selected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#C8102E]/30">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#C8102E]">
                                    <CheckCircle2
                                      size={18}
                                    />
                                  </div>
                                </div>
                              )}

                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <p className="line-clamp-2 text-sm font-bold leading-5 text-zinc-900">
                                  {item.title}
                                </p>

                                <ChevronRight
                                  size={16}
                                  className={`
                                    mt-0.5
                                    shrink-0
                                    ${
                                      selected
                                        ? "text-[#C8102E]"
                                        : "text-zinc-300"
                                    }
                                  `}
                                />

                              </div>

                              <p className="mt-1 line-clamp-2 text-xs leading-4 text-zinc-500">
                                {truncate(
                                  item.description,
                                  100
                                )}
                              </p>

                              <div className="mt-2 flex items-center gap-2">

                                {item.category && (
                                  <span className="rounded-md bg-zinc-100 px-2 py-1 text-[9px] font-bold text-zinc-600">
                                    {item.category}
                                  </span>
                                )}

                                <span className="text-[9px] text-zinc-400">
                                  {formatDate(
                                    item.createdAt
                                  )}
                                </span>

                              </div>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            </>
          ) : (
            /* CUSTOM */

            <div className="p-4 sm:p-5">

              <div className="mb-5">
                <p className="text-sm font-black text-zinc-900">
                  Custom notification
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  Existing content use nahi karna hai
                  to yahan manually notification create
                  karein.
                </p>
              </div>

              <div className="space-y-4">

                <Field
                  label="Title"
                  value={customTitle}
                  onChange={
                    setCustomTitle
                  }
                  placeholder="बड़ी खबर सामने आई"
                />

                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-700">
                    Message
                  </label>

                  <textarea
                    value={
                      customMessage
                    }
                    onChange={(e) =>
                      setCustomMessage(
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="Notification message..."
                    className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm outline-none transition focus:border-[#C8102E] focus:bg-white"
                  />
                </div>

                <Field
                  label="Target URL"
                  value={customUrl}
                  onChange={
                    setCustomUrl
                  }
                  placeholder={`${SITE_URL}/...`}
                />

                <Field
                  label="Image URL"
                  value={customImage}
                  onChange={
                    setCustomImage
                  }
                  placeholder="https://..."
                />

              </div>
            </div>
          )}

        </div>

        {/* RIGHT PREVIEW */}

        <div className="space-y-4">

          <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <p className="text-sm font-black text-zinc-900">
                  Notification preview
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Approximate subscriber view
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(
                    (value) =>
                      !value
                  )
                }
                className="rounded-lg px-2 py-1 text-[10px] font-bold text-zinc-500 hover:bg-zinc-100"
              >
                {showPreview
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            {showPreview && (
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">

                {/* PHONE HEADER */}

                <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-3">

                  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                    <img
                      src="/icons/favicon-192x192.webp"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black text-zinc-900">
                      INFINIA BHARAT NEWS
                    </p>

                    <p className="text-[9px] text-zinc-400">
                      now
                    </p>
                  </div>

                  <Bell
                    size={15}
                    className="text-zinc-400"
                  />

                </div>

                {/* IMAGE */}

                {notificationData.image && (
                  <div className="aspect-[16/8] overflow-hidden bg-zinc-200">

                    <img
                      src={
                        notificationData.image
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />

                  </div>
                )}

                {/* CONTENT */}

                <div className="p-4">

                  <div className="mb-2 flex items-center gap-2">

                    <span className="rounded-full bg-[#C8102E]/10 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[#C8102E]">
                      {type}
                    </span>

                    {notificationData.category && (
                      <span className="truncate text-[9px] font-medium text-zinc-400">
                        {notificationData.category}
                      </span>
                    )}

                  </div>

                  <h3 className="line-clamp-2 text-sm font-black leading-5 text-zinc-950">
                    {notificationData.title ||
                      "Notification title"}
                  </h3>

                  <p className="mt-1.5 line-clamp-4 text-xs leading-5 text-zinc-500">
                    {notificationData.body ||
                      "Notification message preview yahan dikhega."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">

                    <span className="text-[9px] text-zinc-400">
                      INFINIA BHARAT NEWS
                    </span>

                    <span className="rounded-lg bg-[#C8102E] px-3 py-1.5 text-[9px] font-bold text-white">
                      {type ===
                      "video"
                        ? "Watch Video"
                        : type ===
                          "article"
                        ? "Read Story"
                        : type ===
                          "breaking"
                        ? "Read Now"
                        : "Open"}
                    </span>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* SEND CARD */}

          <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-5 text-white shadow-xl">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Send size={18} />
              </div>

              <div>
                <p className="text-sm font-black">
                  Ready to send?
                </p>

                <p className="mt-1 text-[11px] leading-5 text-zinc-400">
                  {type === "custom"
                    ? "Your custom notification will be sent to all active subscribers."
                    : selectedItem
                    ? "Selected content ka notification automatically generate ho gaya hai."
                    : "Select content to continue."}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={
                handleSend
              }
              disabled={
                sending ||
                (type !==
                  "custom" &&
                  !selectedItem) ||
                !notificationData.title ||
                !notificationData.body
              }
              className="
                mt-5
                flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#C8102E]
                px-4
                text-sm
                font-black
                text-white
                shadow-lg
                shadow-[#C8102E]/20
                transition
                hover:bg-[#B20E29]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:bg-zinc-700
                disabled:text-zinc-500
                disabled:shadow-none
              "
            >
              {sending ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Send
                    size={17}
                  />

                  Send Notification
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
              <ShieldCheck
                size={13}
              />
              Secure admin delivery
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          FOOTER INFO
      ================================================= */}

      <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[10px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-2">
          <Radio
            size={13}
            className="text-green-600"
          />

          <span>
            Push service connected
          </span>
        </div>

        <span>
          {articles.length} articles •{" "}
          {videos.length} videos •{" "}
          {breakingNews.length} breaking
        </span>

      </div>

    </div>
  );
}

// =====================================================
// SMALL FIELD COMPONENT
// =====================================================

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-700">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-zinc-200
          bg-zinc-50
          px-3.5
          text-sm
          outline-none
          transition
          focus:border-[#C8102E]
          focus:bg-white
        "
      />
    </div>
  );
}