"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase/firebase";

import {
  deleteArticle,
  updateArticle,
} from "@/services/article.service";

import {
  FileText,
  CheckCircle2,
  FileEdit,
  Star,
  FolderOpen,
  RefreshCw,
  Search,
  ChevronDown,
  Trash2,
  Pencil,
  Save,
  X,
  AlertCircle,
  Clock3,
  Cloud,
  Check,
  CircleAlert,
  Database,
} from "lucide-react";

// ======================================================
// TYPES
// ======================================================

type PriorityErrors = Record<string, string>;
type SavingMap = Record<string, boolean>;

interface CategoryItem {
  id?: string;
  name?: string;
  nameHi?: string;
  slug?: string;
  status?: string;
  [key: string]: any;
}

interface CategoryStat {
  key: string;
  name: string;
  slug: string;
  count: number;
  percentage: number;
}

interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  today: number;
  last7Days: number;
  last30Days: number;
  categoryBreakdown: CategoryStat[];
}

// ======================================================
// FIREBASE / JSON SYNC TYPES
// ======================================================

interface SyncArticle {
  id: string;
  title?: string;
  slug?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  publishedAt?: any;
  date?: any;
  [key: string]: any;
}

interface PendingArticle extends SyncArticle {
  firebaseId: string;
  matchedBy?: "id" | "slug" | "title";
}

// ======================================================
// DATE HELPERS
// ======================================================

function parseArticleDate(article: any): Date | null {
  const value =
    article?.publishedAt ??
    article?.createdAt ??
    article?.date ??
    article?.updatedAt;

  if (!value) return null;

  try {
    if (
      typeof value === "object" &&
      typeof value?.toDate === "function"
    ) {
      return value.toDate();
    }

    if (
      typeof value === "object" &&
      typeof value?.seconds === "number"
    ) {
      return new Date(
        value.seconds * 1000 +
          Math.floor(
            (value.nanoseconds ?? 0) / 1000000
          )
      );
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

function getDateMillis(value: any): number {
  if (!value) return 0;

  try {
    if (
      typeof value === "object" &&
      typeof value?.toDate === "function"
    ) {
      return value.toDate().getTime();
    }

    if (
      typeof value === "object" &&
      typeof value?.seconds === "number"
    ) {
      return value.seconds * 1000;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 0
      : date.getTime();
  } catch {
    return 0;
  }
}

function isSameDay(date: Date, target: Date) {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

function isWithinDays(date: Date, days: number) {
  const now = new Date();

  const diff = now.getTime() - date.getTime();

  return (
    diff >= 0 &&
    diff <= days * 24 * 60 * 60 * 1000
  );
}

// ======================================================
// STRING HELPERS
// ======================================================

function normalize(value: any): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizeSlug(value: any): string {
  return normalize(value).replace(
    /^\/+|\/+$/g,
    ""
  );
}

function normalizeTitle(value: any): string {
  return normalize(value)
    .replace(/\s+/g, " ")
    .replace(/[“”‘’"'`]/g, "")
    .trim();
}

// ======================================================
// CATEGORY HELPERS
// ======================================================

function getArticleCategoryRaw(article: any): string {
  const category =
    article?.category ??
    article?.categorySlug ??
    article?.categoryId ??
    "";

  if (
    typeof category === "object" &&
    category !== null
  ) {
    return normalizeSlug(
      category.slug ??
        category.id ??
        category.name ??
        category.nameHi
    );
  }

  return normalizeSlug(category);
}

function findCategory(
  article: any,
  categories: CategoryItem[]
): CategoryItem | undefined {
  const raw = getArticleCategoryRaw(article);

  if (!raw) return undefined;

  return categories.find((category) => {
    const id = normalizeSlug(category.id);
    const slug = normalizeSlug(category.slug);
    const name = normalizeSlug(category.name);
    const nameHi = normalizeSlug(category.nameHi);

    return (
      raw === id ||
      raw === slug ||
      raw === name ||
      raw === nameHi
    );
  });
}

function resolveCategorySlug(
  article: any,
  categories: CategoryItem[]
): string {
  const found = findCategory(
    article,
    categories
  );

  if (found) {
    return (
      normalizeSlug(found.slug) ||
      normalizeSlug(found.id) ||
      "uncategorized"
    );
  }

  return (
    getArticleCategoryRaw(article) ||
    "uncategorized"
  );
}

function resolveCategoryName(
  article: any,
  categories: CategoryItem[]
): string {
  const found = findCategory(
    article,
    categories
  );

  if (found) {
    return (
      found.nameHi ||
      found.name ||
      found.slug ||
      "Uncategorized"
    );
  }

  return (
    getArticleCategoryRaw(article) ||
    "Uncategorized"
  );
}

// ======================================================
// CATEGORY STATS
// ======================================================

function buildCategoryStats(
  articles: any[],
  categories: CategoryItem[]
): CategoryStat[] {
  const published = articles.filter(
    (article) =>
      article?.status === "published"
  );

  const total = published.length;

  const countMap = new Map<string, number>();

  const metadataMap = new Map<
    string,
    {
      name: string;
      slug: string;
    }
  >();

  categories.forEach((category) => {
    const slug = normalizeSlug(
      category.slug ||
        category.id ||
        category.name
    );

    if (!slug) return;

    countMap.set(slug, 0);

    metadataMap.set(slug, {
      name:
        category.nameHi ||
        category.name ||
        slug,
      slug,
    });
  });

  published.forEach((article) => {
    const slug = resolveCategorySlug(
      article,
      categories
    );

    countMap.set(
      slug,
      (countMap.get(slug) ?? 0) + 1
    );

    if (!metadataMap.has(slug)) {
      metadataMap.set(slug, {
        name: resolveCategoryName(
          article,
          categories
        ),
        slug,
      });
    }
  });

  return Array.from(countMap.entries())
    .map(([key, count]) => {
      const metadata =
        metadataMap.get(key);

      return {
        key,
        name:
          metadata?.name ||
          key,
        slug:
          metadata?.slug ||
          key,
        count,
        percentage:
          total > 0
            ? Math.round(
                (count / total) * 100
              )
            : 0,
      };
    })
    .sort((a, b) => {
      if (a.count !== b.count) {
        return a.count - b.count;
      }

      return a.slug.localeCompare(
        b.slug
      );
    });
}

// ======================================================
// ARTICLE STATS
// ======================================================

function buildArticleStats(
  articles: any[],
  categories: CategoryItem[]
): ArticleStats {
  const published = articles.filter(
    (article) =>
      article?.status === "published"
  );

  const drafts = articles.filter(
    (article) =>
      article?.status !== "published"
  );

  const featured = articles.filter(
    (article) =>
      article?.featured === true
  );

  const now = new Date();

  const today = published.filter(
    (article) => {
      const date =
        parseArticleDate(article);

      return (
        date !== null &&
        isSameDay(date, now)
      );
    }
  ).length;

  const last7Days = published.filter(
    (article) => {
      const date =
        parseArticleDate(article);

      return (
        date !== null &&
        isWithinDays(date, 7)
      );
    }
  ).length;

  const last30Days = published.filter(
    (article) => {
      const date =
        parseArticleDate(article);

      return (
        date !== null &&
        isWithinDays(date, 30)
      );
    }
  ).length;

  return {
    total: articles.length,
    published: published.length,
    drafts: drafts.length,
    featured: featured.length,
    today,
    last7Days,
    last30Days,
    categoryBreakdown:
      buildCategoryStats(
        articles,
        categories
      ),
  };
}

// ======================================================
// NUMBER
// ======================================================

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

// ======================================================
// FIREBASE ARTICLE EXTRACTION
// ======================================================

function firebaseDocToArticle(
  doc: QueryDocumentSnapshot<DocumentData>
): SyncArticle {
  const data = doc.data();

  return {
    ...data,
    id: String(
      data?.id ??
        doc.id
    ),
  };
}

// ======================================================
// JSON MATCHING
// ======================================================

function findJsonMatch(
  firebaseArticle: SyncArticle,
  jsonArticles: SyncArticle[]
): {
  found: boolean;
  matchedBy?: "id" | "slug" | "title";
} {
  const firebaseId =
    normalize(
      firebaseArticle.id
    );

  const firebaseSlug =
    normalizeSlug(
      firebaseArticle.slug
    );

  const firebaseTitle =
    normalizeTitle(
      firebaseArticle.title
    );

  if (firebaseId) {
    const byId =
      jsonArticles.find(
        (item) =>
          normalize(
            item?.id
          ) === firebaseId
      );

    if (byId) {
      return {
        found: true,
        matchedBy: "id",
      };
    }
  }

  if (firebaseSlug) {
    const bySlug =
      jsonArticles.find(
        (item) =>
          normalizeSlug(
            item?.slug
          ) === firebaseSlug
      );

    if (bySlug) {
      return {
        found: true,
        matchedBy: "slug",
      };
    }
  }

  if (firebaseTitle) {
    const byTitle =
      jsonArticles.find(
        (item) =>
          normalizeTitle(
            item?.title
          ) === firebaseTitle
      );

    if (byTitle) {
      return {
        found: true,
        matchedBy: "title",
      };
    }
  }

  return {
    found: false,
  };
}

// ======================================================
// CATEGORY BAR CHART
// ======================================================

function CategoryBarChart({
  categories,
}: {
  categories: CategoryStat[];
}) {
  if (!categories.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-400">
        No categories found
      </div>
    );
  }

  const maxCount = Math.max(
    ...categories.map(
      (item) => item.count
    ),
    1
  );

  return (
    <div className="space-y-2.5">
      {categories.map((item) => {
        const width =
          item.count === 0
            ? 0
            : Math.max(
                (item.count /
                  maxCount) *
                  100,
                3
              );

        return (
          <div
            key={item.key}
            className="group"
          >
            <div className="mb-1 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="truncate text-[11px] font-bold text-zinc-800"
                    title={item.name}
                  >
                    {item.name}
                  </span>

                  <span
                    className="hidden shrink-0 truncate rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-500 sm:inline"
                    title={item.slug}
                  >
                    {item.slug}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[9px] font-semibold text-zinc-400">
                  {item.percentage}%
                </span>

                <span className="min-w-[24px] text-right text-xs font-black text-zinc-900">
                  {item.count}
                </span>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.count === 0
                    ? "bg-zinc-200"
                    : item.count <= 1
                    ? "bg-red-400"
                    : item.count <= 2
                    ? "bg-amber-400"
                    : "bg-red-600"
                }`}
                style={{
                  width: `${width}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// PENDING SYNCHRONIZATION
// ======================================================

function PendingSynchronization({
  pendingArticles,
  checking,
  firebaseCount,
  jsonCount,
  error,
  onCheck,
}: {
  pendingArticles: PendingArticle[];
  checking: boolean;
  firebaseCount: number;
  jsonCount: number;
  error: string;
  onCheck: () => void;
}) {
  const pendingCount =
    pendingArticles.length;

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
              pendingCount > 0
                ? "bg-amber-50"
                : "bg-green-50"
            }`}
          >
            {pendingCount > 0 ? (
              <Clock3
                size={16}
                className="text-amber-600"
              />
            ) : (
              <CheckCircle2
                size={16}
                className="text-green-600"
              />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-xs font-black text-zinc-900">
              Pending Synchronization
            </h2>

            <p className="truncate text-[9px] text-zinc-400">
              Firebase latest articles vs articles.json
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="rounded-full bg-zinc-100 px-2 py-1 text-[8px] font-black text-zinc-500">
              Firebase {firebaseCount}
            </span>

            <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black text-blue-600">
              JSON {jsonCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onCheck}
            disabled={checking}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-[9px] font-black text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={12}
              className={
                checking
                  ? "animate-spin"
                  : ""
              }
            />
            Check Now
          </button>
        </div>
      </div>

      {error ? (
        <div className="border-b border-red-100 bg-red-50 px-3 py-2.5 sm:px-4">
          <div className="flex items-start gap-2">
            <AlertCircle
              size={14}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-black text-red-800">
                Synchronization check failed
              </p>

              <p className="mt-0.5 text-[9px] text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : checking ? (
        <div className="flex min-h-[105px] items-center justify-center px-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500">
            <RefreshCw
              size={14}
              className="animate-spin"
            />
            Checking latest Firebase articles against articles.json...
          </div>
        </div>
      ) : pendingCount === 0 ? (
        <div className="flex min-h-[105px] items-center justify-center px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50">
              <Check
                size={18}
                className="text-green-600"
              />
            </div>

            <p className="mt-2 text-[11px] font-black text-green-700">
              Everything is synchronized
            </p>

            <p className="mt-0.5 text-[9px] text-zinc-400">
              All checked Firebase articles are available in articles.json.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CircleAlert
                size={13}
                className="text-amber-600"
              />

              <span className="text-[10px] font-black text-zinc-800">
                {pendingCount} article
                {pendingCount !== 1
                  ? "s"
                  : ""}{" "}
                pending
              </span>
            </div>

            <span className="text-[8px] font-semibold text-zinc-400">
              Waiting for JSON sync
            </span>
          </div>

          <div className="max-h-[170px] space-y-1.5 overflow-y-auto pr-1">
            {pendingArticles.map(
              (article) => {
                const date =
                  parseArticleDate(
                    article
                  );

                return (
                  <div
                    key={
                      article.firebaseId
                    }
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-2.5 py-2"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-100">
                      <Cloud
                        size={12}
                        className="text-amber-700"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[10px] font-black text-zinc-800"
                        title={
                          article.title
                        }
                      >
                        {article.title ||
                          "Untitled Article"}
                      </p>

                      <div className="mt-0.5 flex min-w-0 items-center gap-2">
                        <span
                          className="truncate font-mono text-[8px] text-zinc-400"
                          title={
                            article.slug ||
                            article.firebaseId
                          }
                        >
                          {article.slug
                            ? `/${article.slug}`
                            : `ID: ${article.firebaseId}`}
                        </span>

                        {date && (
                          <span className="hidden shrink-0 text-[8px] text-zinc-400 sm:inline">
                            {date.toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month:
                                  "short",
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[7px] font-black uppercase text-amber-700">
                      Pending
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// ======================================================
// MOBILE ARTICLE CARD
// ======================================================

function MobileArticleCard({
  article,
  categoriesData,
  featuredCount,
  priorityValue,
  priorityError,
  isSaving,
  onFeaturedChange,
  onPriorityInput,
  onPrioritySave,
  onDelete,
}: {
  article: any;
  categoriesData: CategoryItem[];
  featuredCount: number;
  priorityValue: string;
  priorityError?: string;
  isSaving: boolean;
  onFeaturedChange: (
    article: any,
    checked: boolean
  ) => void;
  onPriorityInput: (
    id: string,
    value: string
  ) => void;
  onPrioritySave: (
    article: any
  ) => void;
  onDelete: (
    id: string
  ) => void;
}) {
  const date =
    parseArticleDate(article);

  const categoryName =
    resolveCategoryName(
      article,
      categoriesData
    );

  const categorySlug =
    resolveCategorySlug(
      article,
      categoriesData
    );

  return (
    <article
      className={`rounded-xl border bg-white p-3 shadow-sm ${
        article.featured
          ? "border-red-200 ring-1 ring-red-50"
          : "border-zinc-200"
      }`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {article.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-black text-red-700">
                <Star
                  size={9}
                  fill="currentColor"
                />
                Featured
              </span>
            )}

            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                article.status ===
                "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {article.status ??
                "unknown"}
            </span>
          </div>

          <h3 className="line-clamp-3 text-sm font-black leading-5 text-zinc-900">
            {article.title ??
              "Untitled Article"}
          </h3>

          {article.slug && (
            <p
              className="mt-1 truncate font-mono text-[9px] text-zinc-400"
              title={article.slug}
            >
              /{article.slug}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-lg bg-zinc-50 px-2.5 py-2">
          <p className="text-[8px] font-black uppercase tracking-wide text-zinc-400">
            Category
          </p>

          <p
            className="mt-0.5 truncate text-[10px] font-black text-zinc-700"
            title={categorySlug}
          >
            {categorySlug}
          </p>

          <p
            className="truncate text-[9px] text-zinc-400"
            title={categoryName}
          >
            {categoryName}
          </p>
        </div>

        <div className="rounded-lg bg-zinc-50 px-2.5 py-2">
          <p className="text-[8px] font-black uppercase tracking-wide text-zinc-400">
            Date
          </p>

          <p className="mt-0.5 text-[10px] font-black text-zinc-700">
            {date
              ? date.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : "—"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-2.5">
        <div className="flex items-center justify-between gap-3">
          <label className="flex min-w-0 cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={
                article.featured === true
              }
              disabled={
                !article.featured &&
                featuredCount >= 5
              }
              onChange={(event) =>
                onFeaturedChange(
                  article,
                  event.target.checked
                )
              }
              className="h-4 w-4 shrink-0 cursor-pointer accent-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            />

            <span className="text-[10px] font-black text-zinc-700">
              Featured
            </span>

            <span className="text-[9px] font-semibold text-zinc-400">
              {featuredCount}/5
            </span>
          </label>

          {article.featured && (
            <div className="flex shrink-0 items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={5}
                value={priorityValue}
                disabled={isSaving}
                onChange={(event) =>
                  onPriorityInput(
                    article.id,
                    event.target.value
                  )
                }
                className={`h-8 w-14 rounded-md border bg-white px-2 text-center text-xs font-black text-zinc-900 outline-none focus:border-red-500 ${
                  priorityError
                    ? "border-red-500"
                    : "border-zinc-200"
                }`}
              />

              <button
                type="button"
                disabled={isSaving}
                onClick={() =>
                  onPrioritySave(article)
                }
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-green-600 px-2 text-white shadow-sm active:scale-95 disabled:opacity-50"
                aria-label="Save priority"
              >
                {isSaving ? (
                  <RefreshCw
                    size={13}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={13} />
                )}
              </button>
            </div>
          )}
        </div>

        {priorityError && (
          <p className="mt-1.5 text-[9px] font-bold text-red-600">
            {priorityError}
          </p>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href={`/admin/articles/${article.id}/edit`}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs font-black text-blue-700 active:scale-[0.98]"
        >
          <Pencil size={14} />
          Edit Article
        </Link>

        <button
          type="button"
          onClick={() =>
            onDelete(article.id)
          }
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-black text-red-700 active:scale-[0.98]"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}

// ======================================================
// PAGE
// ======================================================

export default function ArticlesPage() {
  const [articles, setArticles] =
    useState<any[]>([]);

  const [
    categoriesData,
    setCategoriesData,
  ] = useState<CategoryItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loadError, setLoadError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    "all" | "published" | "draft"
  >("all");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [
    pendingPriorities,
    setPendingPriorities,
  ] = useState<
    Record<string, string>
  >({});

  const [
    priorityErrors,
    setPriorityErrors,
  ] = useState<PriorityErrors>({});

  const [
    savingPriority,
    setSavingPriority,
  ] = useState<SavingMap>({});

  // ====================================================
  // SYNC STATE
  // ====================================================

  const [
    pendingArticles,
    setPendingArticles,
  ] = useState<PendingArticle[]>(
    []
  );

  const [
    syncChecking,
    setSyncChecking,
  ] = useState(false);

  const [
    syncError,
    setSyncError,
  ] = useState("");

  const [
    firebaseArticleCount,
    setFirebaseArticleCount,
  ] = useState(0);

  const [
    jsonArticleCount,
    setJsonArticleCount,
  ] = useState(0);

  // ====================================================
  // LOAD ARTICLES JSON
  // ====================================================

  const loadArticlesJson =
    useCallback(
      async (): Promise<any[]> => {
        const response =
          await fetch(
            "/data/articles.json",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load articles.json"
          );
        }

        const data: unknown =
          await response.json();

        const root =
          data as
            | {
                articles?: unknown;
              }
            | unknown[];

        let list: unknown[] = [];

        if (Array.isArray(root)) {
          list = root;
        } else if (
          root &&
          typeof root === "object" &&
          Array.isArray(
            root.articles
          )
        ) {
          list = root.articles;
        }

        const safeList =
          list.filter(
            (item) =>
              item !== null &&
              typeof item ===
                "object"
          );

        setArticles(
          safeList as any[]
        );

        return safeList as any[];
      },
      []
    );

  // ====================================================
  // LOAD CATEGORIES JSON
  // ====================================================

  const loadCategoriesJson =
    useCallback(
      async (): Promise<
        CategoryItem[]
      > => {
        const response =
          await fetch(
            "/data/categories.json",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load categories.json"
          );
        }

        const data: unknown =
          await response.json();

        const root =
          data as
            | {
                categories?: unknown;
              }
            | unknown[];

        let list: unknown[] = [];

        if (Array.isArray(root)) {
          list = root;
        } else if (
          root &&
          typeof root === "object" &&
          Array.isArray(
            root.categories
          )
        ) {
          list = root.categories;
        }

        const safeList =
          list.filter(
            (item) =>
              item !== null &&
              typeof item ===
                "object"
          ) as CategoryItem[];

        setCategoriesData(
          safeList
        );

        return safeList;
      },
      []
    );

  // ====================================================
  // FIREBASE → JSON SYNC CHECK
  // ====================================================

  const checkFirebaseSync =
    useCallback(
      async (
        jsonArticlesOverride?: any[]
      ) => {
        try {
          setSyncChecking(true);
          setSyncError("");

          // --------------------------------------------
          // ALWAYS FETCH CURRENT JSON
          // --------------------------------------------

          let jsonArticles =
            jsonArticlesOverride;

          if (!jsonArticles) {
            const response =
              await fetch(
                "/data/articles.json",
                {
                  cache: "no-store",
                }
              );

            if (!response.ok) {
              throw new Error(
                "Unable to read articles.json."
              );
            }

            const data: unknown =
              await response.json();

            const root =
              data as
                | {
                    articles?: unknown;
                  }
                | unknown[];

            if (
              Array.isArray(root)
            ) {
              jsonArticles =
                root as any[];
            } else if (
              root &&
              typeof root ===
                "object" &&
              Array.isArray(
                root.articles
              )
            ) {
              jsonArticles =
                root.articles as any[];
            } else {
              jsonArticles = [];
            }
          }

          const safeJsonArticles =
            Array.isArray(
              jsonArticles
            )
              ? jsonArticles
              : [];

          setJsonArticleCount(
            safeJsonArticles.length
          );

          // --------------------------------------------
          // GET LATEST FIREBASE ARTICLES
          // --------------------------------------------

          const articlesCollection =
            collection(
              db,
              "articles"
            );

          let snapshot;

          try {
            const latestQuery =
              query(
                articlesCollection,
                orderBy(
                  "createdAt",
                  "desc"
                ),
                limit(50)
              );

            snapshot =
              await getDocs(
                latestQuery
              );
          } catch (orderError) {
            console.warn(
              "Firebase createdAt ordering failed. Falling back to updatedAt:",
              orderError
            );

            try {
              const fallbackQuery =
                query(
                  articlesCollection,
                  orderBy(
                    "updatedAt",
                    "desc"
                  ),
                  limit(50)
                );

              snapshot =
                await getDocs(
                  fallbackQuery
                );
            } catch (fallbackError) {
              console.warn(
                "Firebase ordered query failed. Falling back to latest available documents:",
                fallbackError
              );

              snapshot =
                await getDocs(
                  articlesCollection
                );
            }
          }

          const firebaseArticles =
            snapshot.docs
              .map(
                firebaseDocToArticle
              )
              .sort(
                (a, b) =>
                  getDateMillis(
                    b.createdAt ??
                      b.publishedAt ??
                      b.updatedAt
                  ) -
                  getDateMillis(
                    a.createdAt ??
                      a.publishedAt ??
                      a.updatedAt
                  )
              )
              .slice(0, 50);

          setFirebaseArticleCount(
            firebaseArticles.length
          );

          // --------------------------------------------
          // FIND ARTICLES NOT PRESENT IN JSON
          // --------------------------------------------

          const pending: PendingArticle[] =
            [];

          firebaseArticles.forEach(
            (firebaseArticle) => {
              const match =
                findJsonMatch(
                  firebaseArticle,
                  safeJsonArticles
                );

              if (!match.found) {
                pending.push({
                  ...firebaseArticle,
                  firebaseId:
                    firebaseArticle.id,
                });
              }
            }
          );

          setPendingArticles(
            pending
          );
        } catch (error: any) {
          console.error(
            "FIREBASE JSON SYNC ERROR:",
            error
          );

          setPendingArticles(
            []
          );

          setSyncError(
            error?.message ||
              "Unable to check Firebase synchronization."
          );
        } finally {
          setSyncChecking(false);
        }
      },
      []
    );

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  const initialize =
    useCallback(async () => {
      try {
        setLoading(true);
        setLoadError("");

        const [
          jsonArticles,
        ] = await Promise.all([
          loadArticlesJson(),
          loadCategoriesJson(),
        ]);

        // Check Firebase against the SAME freshly
        // fetched JSON list.
        await checkFirebaseSync(
          jsonArticles
        );
      } catch (error) {
        console.error(
          "ARTICLES DASHBOARD ERROR:",
          error
        );

        setLoadError(
          "Unable to load article dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, [
      loadArticlesJson,
      loadCategoriesJson,
      checkFirebaseSync,
    ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ====================================================
  // REFRESH
  // ====================================================

  async function refreshDashboard() {
    try {
      setRefreshing(true);
      setLoadError("");

      const [
        jsonArticles,
      ] = await Promise.all([
        loadArticlesJson(),
        loadCategoriesJson(),
      ]);

      await checkFirebaseSync(
        jsonArticles
      );
    } catch (error) {
      console.error(
        "REFRESH ERROR:",
        error
      );

      setLoadError(
        "Refresh failed. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  }

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(
    () =>
      buildArticleStats(
        articles,
        categoriesData
      ),
    [articles, categoriesData]
  );

  const categories =
    stats.categoryBreakdown;

  const featuredCount =
    stats.featured;

  // ====================================================
  // FILTERED ARTICLES
  // ====================================================

  const filteredArticles =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const result =
        articles.filter(
          (article) => {
            const title =
              normalize(
                article?.title
              );

            const slug =
              normalize(
                article?.slug
              );

            const categoryName =
              normalize(
                resolveCategoryName(
                  article,
                  categoriesData
                )
              );

            const categorySlug =
              normalize(
                resolveCategorySlug(
                  article,
                  categoriesData
                )
              );

            const categoryRaw =
              normalize(
                getArticleCategoryRaw(
                  article
                )
              );

            const matchesSearch =
              !query ||
              title.includes(query) ||
              slug.includes(query) ||
              categoryName.includes(
                query
              ) ||
              categorySlug.includes(
                query
              ) ||
              categoryRaw.includes(
                query
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              (statusFilter ===
                "published" &&
                article?.status ===
                  "published") ||
              (statusFilter ===
                "draft" &&
                article?.status !==
                  "published");

            const matchesCategory =
              categoryFilter ===
                "all" ||
              resolveCategorySlug(
                article,
                categoriesData
              ) ===
                categoryFilter;

            return (
              matchesSearch &&
              matchesStatus &&
              matchesCategory
            );
          }
        );

      return result.sort(
        (a, b) => {
          const aFeatured =
            a?.featured === true;

          const bFeatured =
            b?.featured === true;

          if (
            aFeatured !==
            bFeatured
          ) {
            return aFeatured
              ? -1
              : 1;
          }

          if (
            aFeatured &&
            bFeatured
          ) {
            const aPriority =
              Number(
                a?.priority
              );

            const bPriority =
              Number(
                b?.priority
              );

            const safeA =
              Number.isFinite(
                aPriority
              )
                ? aPriority
                : 999;

            const safeB =
              Number.isFinite(
                bPriority
              )
                ? bPriority
                : 999;

            if (
              safeA !==
              safeB
            ) {
              return (
                safeA - safeB
              );
            }
          }

          const aDate =
            parseArticleDate(
              a
            )?.getTime() ?? 0;

          const bDate =
            parseArticleDate(
              b
            )?.getTime() ?? 0;

          return (
            bDate - aDate
          );
        }
      );
    }, [
      articles,
      categoriesData,
      search,
      statusFilter,
      categoryFilter,
    ]);

  // ====================================================
  // FEATURED CHANGE
  // ====================================================

  async function handleFeaturedChange(
    article: any,
    checked: boolean
  ) {
    try {
      setPriorityErrors(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            article.id
          ];

          return next;
        }
      );

      if (!checked) {
        await updateArticle(
          article.id,
          {
            featured: false,
          }
        );

        await refreshDashboard();

        return;
      }

      if (
        featuredCount >= 5
      ) {
        setPriorityErrors(
          (previous) => ({
            ...previous,
            [article.id]:
              "Maximum 5 featured articles allowed.",
          })
        );

        return;
      }

      const usedPriorities =
        articles
          .filter(
            (item) =>
              item.featured ===
                true &&
              item.id !==
                article.id
          )
          .map((item) =>
            Number(
              item.priority
            )
          )
          .filter(
            (priority) =>
              Number.isInteger(
                priority
              ) &&
              priority >= 1 &&
              priority <= 5
          );

      const availablePriority =
        [1, 2, 3, 4, 5].find(
          (priority) =>
            !usedPriorities.includes(
              priority
            )
        );

      if (
        !availablePriority
      ) {
        setPriorityErrors(
          (previous) => ({
            ...previous,
            [article.id]:
              "All priorities 1–5 are occupied.",
          })
        );

        return;
      }

      await updateArticle(
        article.id,
        {
          featured: true,
          priority:
            availablePriority,
        }
      );

      await refreshDashboard();
    } catch (error: any) {
      console.error(
        "FEATURE UPDATE ERROR:",
        error
      );

      setPriorityErrors(
        (previous) => ({
          ...previous,
          [article.id]:
            error?.message ||
            "Featured update failed.",
        })
      );
    }
  }

  // ====================================================
  // PRIORITY INPUT
  // ====================================================

  function handlePriorityInput(
    articleId: string,
    value: string
  ) {
    setPendingPriorities(
      (previous) => ({
        ...previous,
        [articleId]: value,
      })
    );

    setPriorityErrors(
      (previous) => {
        const next = {
          ...previous,
        };

        delete next[articleId];

        return next;
      }
    );
  }

  // ====================================================
  // PRIORITY SAVE
  // ====================================================

  async function handlePrioritySave(
    article: any
  ) {
    const rawValue =
      pendingPriorities[
        article.id
      ] ??
      String(
        article.priority ?? ""
      );

    if (
      rawValue.trim() === ""
    ) {
      setPriorityErrors(
        (previous) => ({
          ...previous,
          [article.id]:
            "Priority is required.",
        })
      );

      return;
    }

    const priority =
      Number(rawValue);

    if (
      !Number.isInteger(
        priority
      ) ||
      priority < 1 ||
      priority > 5
    ) {
      setPriorityErrors(
        (previous) => ({
          ...previous,
          [article.id]:
            "Priority must be between 1 and 5.",
        })
      );

      return;
    }

    const occupied =
      articles.some(
        (item) =>
          item.id !==
            article.id &&
          item.featured ===
            true &&
          Number(
            item.priority
          ) === priority
      );

    if (occupied) {
      setPriorityErrors(
        (previous) => ({
          ...previous,
          [article.id]:
            `Priority ${priority} is already occupied.`,
        })
      );

      return;
    }

    try {
      setSavingPriority(
        (previous) => ({
          ...previous,
          [article.id]: true,
        })
      );

      await updateArticle(
        article.id,
        {
          featured: true,
          priority,
        }
      );

      setPendingPriorities(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            article.id
          ];

          return next;
        }
      );

      setPriorityErrors(
        (previous) => {
          const next = {
            ...previous,
          };

          delete next[
            article.id
          ];

          return next;
        }
      );

      await refreshDashboard();
    } catch (error: any) {
      console.error(
        "PRIORITY SAVE ERROR:",
        error
      );

      setPriorityErrors(
        (previous) => ({
          ...previous,
          [article.id]:
            error?.message ||
            "Priority update failed.",
        })
      );
    } finally {
      setSavingPriority(
        (previous) => ({
          ...previous,
          [article.id]: false,
        })
      );
    }
  }

  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this article?\n\nThis action cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteArticle(id);

      await refreshDashboard();

      window.alert(
        "Article deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      window.alert(
        "Delete failed. Please try again."
      );
    }
  }

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
  }

  const hasFilters =
    Boolean(search) ||
    statusFilter !== "all" ||
    categoryFilter !== "all";

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex h-[calc(100vh-80px)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-zinc-50">

      {/* ==================================================
          TOP HEADER
      ================================================== */}

      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight text-zinc-950 sm:text-xl">
                Articles
              </h1>

              <p className="hidden text-[10px] font-medium text-zinc-400 sm:block">
                Manage, synchronize and organize your articles
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={
                  refreshDashboard
                }
                disabled={refreshing}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-[10px] font-black text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              <Link
                href="/admin/articles/create"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-3.5 text-[10px] font-black text-white shadow-sm transition hover:bg-red-700"
              >
                + Create
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-5 sm:px-5">

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
              <RefreshCw
                size={16}
                className="animate-spin"
              />
              Loading articles...
            </div>
          </div>
        ) : loadError ? (
          <div className="mx-auto mt-5 max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-center">
            <AlertCircle
              size={25}
              className="mx-auto text-red-600"
            />

            <p className="mt-2 text-sm font-black text-red-900">
              Something went wrong
            </p>

            <p className="mt-1 text-[11px] text-red-700">
              {loadError}
            </p>

            <button
              type="button"
              onClick={
                initialize
              }
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-[10px] font-black text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>

            {/* ==================================================
                PENDING SYNC
            ================================================== */}

            <PendingSynchronization
              pendingArticles={
                pendingArticles
              }
              checking={
                syncChecking
              }
              firebaseCount={
                firebaseArticleCount
              }
              jsonCount={
                jsonArticleCount
              }
              error={syncError}
              onCheck={() =>
                checkFirebaseSync()
              }
            />

            {/* ==================================================
                DASHBOARD SUMMARY
            ================================================== */}

            <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">

              {/* STATS */}

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">

                {/* TOTAL */}

                <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <FileText
                      size={15}
                      className="text-blue-600"
                    />

                    <span className="text-[8px] font-black uppercase tracking-wide text-zinc-300">
                      All
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-black text-zinc-950">
                    {formatNumber(
                      stats.total
                    )}
                  </p>

                  <p className="text-[9px] font-semibold text-zinc-400">
                    Total Articles
                  </p>
                </div>

                {/* PUBLISHED */}

                <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <CheckCircle2
                      size={15}
                      className="text-green-600"
                    />

                    <span className="text-[8px] font-black uppercase tracking-wide text-green-500">
                      Live
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-black text-zinc-950">
                    {formatNumber(
                      stats.published
                    )}
                  </p>

                  <p className="text-[9px] font-semibold text-zinc-400">
                    Published
                  </p>
                </div>

                {/* DRAFT */}

                <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <FileEdit
                      size={15}
                      className="text-amber-600"
                    />

                    <span className="text-[8px] font-black uppercase tracking-wide text-amber-500">
                      Work
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-black text-zinc-950">
                    {formatNumber(
                      stats.drafts
                    )}
                  </p>

                  <p className="text-[9px] font-semibold text-zinc-400">
                    Drafts
                  </p>
                </div>

                {/* FEATURED */}

                <div className="rounded-xl border border-red-200 bg-red-50 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Star
                      size={15}
                      className="text-red-600"
                      fill="currentColor"
                    />

                    <span className="text-[8px] font-black uppercase tracking-wide text-red-500">
                      Max 5
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-black text-red-700">
                    {stats.featured}/5
                  </p>

                  <p className="text-[9px] font-semibold text-red-500">
                    Featured
                  </p>
                </div>

                {/* PUBLISHING */}

                <div className="col-span-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:col-span-4 xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      Publishing Activity
                    </span>

                    <span className="text-[9px] font-semibold text-zinc-300">
                      Published only
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 divide-x divide-zinc-100">
                    <div className="text-center">
                      <p className="text-base font-black text-zinc-900">
                        {stats.today}
                      </p>

                      <p className="text-[8px] font-semibold text-zinc-400">
                        Today
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-base font-black text-zinc-900">
                        {stats.last7Days}
                      </p>

                      <p className="text-[8px] font-semibold text-zinc-400">
                        7 Days
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-base font-black text-zinc-900">
                        {stats.last30Days}
                      </p>

                      <p className="text-[8px] font-semibold text-zinc-400">
                        30 Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CATEGORY BAR CHART */}

              <div className="rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <FolderOpen
                        size={14}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xs font-black text-zinc-900">
                        Category Distribution
                      </h2>

                      <p className="text-[9px] text-zinc-400">
                        Lowest → highest articles
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-1 text-[8px] font-black text-zinc-500">
                    {categories.length}{" "}
                    categories
                  </span>
                </div>

                <div className="max-h-[330px] overflow-y-auto pr-1">
                  <CategoryBarChart
                    categories={
                      categories
                    }
                  />
                </div>
              </div>
            </section>

            {/* ==================================================
                ARTICLE LIST
            ================================================== */}

            <section className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">

              {/* SECTION HEADER */}

              <div className="border-b border-zinc-100 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xs font-black text-zinc-900">
                      Article List
                    </h2>

                    <p className="text-[9px] text-zinc-400">
                      Featured first · Priority · Latest
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black text-zinc-600">
                    {filteredArticles.length}
                  </span>
                </div>

                {/* ==================================================
                    SEARCH / FILTERS — NOW ABOVE ARTICLE LIST
                ================================================== */}

                <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_190px]">

                  {/* SEARCH */}

                  <div className="relative min-w-0">
                    <Search
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(
                        event
                      ) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Search title, article slug, category name or slug..."
                      className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[11px] font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  {/* STATUS */}

                  <div className="relative">
                    <select
                      value={
                        statusFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setStatusFilter(
                          event.target
                            .value as
                            | "all"
                            | "published"
                            | "draft"
                        )
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 pr-8 text-[10px] font-black text-zinc-700 outline-none focus:border-red-500"
                    >
                      <option value="all">
                        All Status
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="draft">
                        Drafts
                      </option>
                    </select>

                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>

                  {/* CATEGORY */}

                  <div className="relative">
                    <select
                      value={
                        categoryFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setCategoryFilter(
                          event.target
                            .value
                        )
                      }
                      className="h-9 w-full appearance-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 pr-8 text-[10px] font-black text-zinc-700 outline-none focus:border-red-500"
                    >
                      <option value="all">
                        All Categories
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category.key
                            }
                            value={
                              category.key
                            }
                          >
                            {
                              category.slug
                            }{" "}
                            (
                            {
                              category.count
                            }
                            )
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </div>

                {/* RESULT META */}

                <div className="mt-1.5 flex min-h-[17px] items-center justify-between gap-2">
                  <span className="text-[9px] font-semibold text-zinc-400">
                    Showing{" "}
                    <strong className="text-zinc-700">
                      {
                        filteredArticles.length
                      }
                    </strong>{" "}
                    of{" "}
                    <strong className="text-zinc-700">
                      {articles.length}
                    </strong>
                  </span>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="inline-flex items-center gap-1 text-[9px] font-black text-red-600 hover:text-red-700"
                    >
                      <X size={11} />
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {filteredArticles.length ===
              0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center px-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100">
                    <Search
                      size={21}
                      className="text-zinc-300"
                    />
                  </div>

                  <p className="mt-3 text-sm font-black text-zinc-700">
                    No articles found
                  </p>

                  <p className="mt-1 max-w-sm text-[10px] text-zinc-400">
                    Try changing your
                    search or filters.
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-[10px] font-black text-white"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* ==================================================
                      MOBILE CARDS
                  ================================================== */}

                  <div className="space-y-2.5 bg-zinc-50 p-2.5 md:hidden">
                    {filteredArticles.map(
                      (article) => {
                        const priorityValue =
                          pendingPriorities[
                            article.id
                          ] ??
                          String(
                            article.priority ??
                              ""
                          );

                        return (
                          <MobileArticleCard
                            key={
                              article.id
                            }
                            article={
                              article
                            }
                            categoriesData={
                              categoriesData
                            }
                            featuredCount={
                              featuredCount
                            }
                            priorityValue={
                              priorityValue
                            }
                            priorityError={
                              priorityErrors[
                                article.id
                              ]
                            }
                            isSaving={
                              savingPriority[
                                article.id
                              ] ===
                              true
                            }
                            onFeaturedChange={
                              handleFeaturedChange
                            }
                            onPriorityInput={
                              handlePriorityInput
                            }
                            onPrioritySave={
                              handlePrioritySave
                            }
                            onDelete={
                              handleDelete
                            }
                          />
                        );
                      }
                    )}
                  </div>

                  {/* ==================================================
                      DESKTOP TABLE
                  ================================================== */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1050px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-zinc-200 bg-zinc-50">
                          <th className="sticky left-0 z-20 bg-zinc-50 px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Article
                          </th>

                          <th className="px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Featured
                          </th>

                          <th className="px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Priority
                          </th>

                          <th className="px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Category
                          </th>

                          <th className="px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Date
                          </th>

                          <th className="px-3 py-2.5 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Status
                          </th>

                          <th className="px-3 py-2.5 text-right text-[8px] font-black uppercase tracking-wider text-zinc-400">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredArticles.map(
                          (article) => {
                            const priorityValue =
                              pendingPriorities[
                                article.id
                              ] ??
                              String(
                                article.priority ??
                                  ""
                              );

                            const priorityError =
                              priorityErrors[
                                article.id
                              ];

                            const isSaving =
                              savingPriority[
                                article.id
                              ] ===
                              true;

                            const date =
                              parseArticleDate(
                                article
                              );

                            const categoryName =
                              resolveCategoryName(
                                article,
                                categoriesData
                              );

                            const categorySlug =
                              resolveCategorySlug(
                                article,
                                categoriesData
                              );

                            return (
                              <tr
                                key={
                                  article.id
                                }
                                className={`border-t border-zinc-100 transition hover:bg-zinc-50 ${
                                  article.featured
                                    ? "bg-red-50/40"
                                    : ""
                                }`}
                              >
                                {/* ARTICLE */}

                                <td className="sticky left-0 z-10 max-w-[420px] bg-white px-3 py-2.5">
                                  <div className="flex min-w-0 items-start gap-2">
                                    {article.featured && (
                                      <Star
                                        size={
                                          13
                                        }
                                        className="mt-0.5 shrink-0 text-red-600"
                                        fill="currentColor"
                                      />
                                    )}

                                    <div className="min-w-0">
                                      <p
                                        className="line-clamp-2 text-[11px] font-bold leading-4 text-zinc-900"
                                        title={
                                          article.title
                                        }
                                      >
                                        {article.title ??
                                          "Untitled Article"}
                                      </p>

                                      {article.slug && (
                                        <p
                                          className="mt-0.5 truncate font-mono text-[8px] text-zinc-400"
                                          title={
                                            article.slug
                                          }
                                        >
                                          /
                                          {
                                            article.slug
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* FEATURED */}

                                <td className="px-3 py-2.5">
                                  <input
                                    type="checkbox"
                                    checked={
                                      article.featured ===
                                      true
                                    }
                                    disabled={
                                      !article.featured &&
                                      featuredCount >=
                                        5
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      handleFeaturedChange(
                                        article,
                                        event
                                          .target
                                          .checked
                                      )
                                    }
                                    className="h-4 w-4 cursor-pointer accent-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                                  />
                                </td>

                                {/* PRIORITY */}

                                <td className="min-w-[150px] px-3 py-2.5">
                                  {article.featured ? (
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          min={1}
                                          max={5}
                                          value={
                                            priorityValue
                                          }
                                          disabled={
                                            isSaving
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            handlePriorityInput(
                                              article.id,
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                          className={`h-8 w-12 rounded-md border bg-white px-1 text-center text-xs font-black outline-none focus:border-red-500 ${
                                            priorityError
                                              ? "border-red-500"
                                              : "border-zinc-200"
                                          }`}
                                        />

                                        <button
                                          type="button"
                                          disabled={
                                            isSaving
                                          }
                                          onClick={() =>
                                            handlePrioritySave(
                                              article
                                            )
                                          }
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                          {isSaving ? (
                                            <RefreshCw
                                              size={
                                                12
                                              }
                                              className="animate-spin"
                                            />
                                          ) : (
                                            <Save
                                              size={
                                                12
                                              }
                                            />
                                          )}
                                        </button>
                                      </div>

                                      {priorityError && (
                                        <p className="mt-1 max-w-[140px] text-[8px] font-bold text-red-600">
                                          {
                                            priorityError
                                          }
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-zinc-300">
                                      —
                                    </span>
                                  )}
                                </td>

                                {/* CATEGORY */}

                                <td className="px-3 py-2.5">
                                  <div className="max-w-[180px]">
                                    <span
                                      className="block truncate font-mono text-[9px] font-black text-zinc-700"
                                      title={
                                        categorySlug
                                      }
                                    >
                                      {
                                        categorySlug
                                      }
                                    </span>

                                    <span
                                      className="mt-0.5 block truncate text-[8px] text-zinc-400"
                                      title={
                                        categoryName
                                      }
                                    >
                                      {
                                        categoryName
                                      }
                                    </span>
                                  </div>
                                </td>

                                {/* DATE */}

                                <td className="whitespace-nowrap px-3 py-2.5 text-[9px] font-semibold text-zinc-500">
                                  {date
                                    ? date.toLocaleDateString(
                                        "en-IN",
                                        {
                                          day: "2-digit",
                                          month:
                                            "short",
                                          year:
                                            "numeric",
                                        }
                                      )
                                    : "—"}
                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-2.5">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase ${
                                      article.status ===
                                      "published"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-zinc-100 text-zinc-600"
                                    }`}
                                  >
                                    {article.status ??
                                      "unknown"}
                                  </span>
                                </td>

                                {/* ACTIONS */}

                                <td className="whitespace-nowrap px-3 py-2.5">
                                  <div className="flex justify-end gap-1.5">
                                    <Link
                                      href={`/admin/articles/${article.id}/edit`}
                                      className="inline-flex h-8 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 text-[9px] font-black text-blue-700 transition hover:bg-blue-100"
                                    >
                                      <Pencil
                                        size={
                                          11
                                        }
                                      />
                                      Edit
                                    </Link>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDelete(
                                          article.id
                                        )
                                      }
                                      className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 text-[9px] font-black text-red-700 transition hover:bg-red-100"
                                    >
                                      <Trash2
                                        size={
                                          11
                                        }
                                      />
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex items-center justify-between px-1 py-3">
              <span className="text-[9px] font-semibold text-zinc-400">
                Article Management
              </span>

              <div className="flex items-center gap-2">
                {pendingArticles.length >
                  0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-700">
                    <Database
                      size={9}
                    />
                    {
                      pendingArticles.length
                    }{" "}
                    pending sync
                  </span>
                )}

                <span className="text-[9px] font-black text-zinc-500">
                  {
                    filteredArticles.length
                  }{" "}
                  visible
                </span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}