"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  deleteArticle,
  getLatestArticles,
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
// DATE HELPERS
// ======================================================

function parseArticleDate(
  article: any
): Date | null {
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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  } catch {
    return null;
  }
}

function isSameDay(
  date: Date,
  target: Date
) {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

function isWithinDays(
  date: Date,
  days: number
) {
  const now = new Date();

  const diff =
    now.getTime() - date.getTime();

  return (
    diff >= 0 &&
    diff <=
      days *
        24 *
        60 *
        60 *
        1000
  );
}

// ======================================================
// STRING HELPERS
// ======================================================

function normalize(
  value: any
): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

// ======================================================
// SAFE VALUE COMPARISON
//
// Prevents false pending caused by:
// undefined vs null
// Firestore Timestamp vs JSON string
// object key ordering
// ======================================================

function normalizeCompareValue(
  value: any
): any {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  // Firestore Timestamp
  if (
    typeof value === "object" &&
    typeof value?.toMillis ===
      "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    typeof value?.toDate ===
      "function"
  ) {
    return value
      .toDate()
      .getTime();
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map(
      normalizeCompareValue
    );
  }

  // Objects
  if (
    typeof value === "object"
  ) {
    const result: Record<
      string,
      any
    > = {};

    Object.keys(value)
      .sort()
      .forEach((key) => {
        result[key] =
          normalizeCompareValue(
            value[key]
          );
      });

    return result;
  }

  return value;
}

function getLatestArticleTime(
  article: any
): number {
  return Math.max(
    timestampToMillis(
      article?.createdAt
    ),
    timestampToMillis(
      article?.updatedAt
    )
  );
}

function timestampToMillis(
  value: any
): number {
  if (!value) return 0;

  if (
    typeof value === "object" &&
    typeof value?.toMillis ===
      "function"
  ) {
    return value.toMillis();
  }

  if (
    typeof value === "object" &&
    typeof value?.toDate ===
      "function"
  ) {
    return value.toDate().getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed =
    new Date(value).getTime();

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalizeSlug(
  value: any
): string {
  return normalize(value).replace(
    /^\/+|\/+$/g,
    ""
  );
}

// ======================================================
// CATEGORY HELPERS
// ======================================================

function getArticleCategoryRaw(
  article: any
): string {
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
  const raw =
    getArticleCategoryRaw(article);

  if (!raw) return undefined;

  return categories.find(
    (category) => {
      const id = normalizeSlug(
        category.id
      );

      const slug = normalizeSlug(
        category.slug
      );

      const name = normalizeSlug(
        category.name
      );

      const nameHi = normalizeSlug(
        category.nameHi
      );

      return (
        raw === id ||
        raw === slug ||
        raw === name ||
        raw === nameHi
      );
    }
  );
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
  const published =
    articles.filter(
      (article) =>
        article?.status === "published"
    );

  const total =
    published.length;

  const countMap =
    new Map<string, number>();

  const metadataMap =
    new Map<
      string,
      {
        name: string;
        slug: string;
      }
    >();

  categories.forEach(
    (category) => {
      const slug =
        normalizeSlug(
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
    }
  );

  published.forEach(
    (article) => {
      const slug =
        resolveCategorySlug(
          article,
          categories
        );

      countMap.set(
        slug,
        (countMap.get(slug) ?? 0) + 1
      );

      if (
        !metadataMap.has(slug)
      ) {
        metadataMap.set(slug, {
          name:
            resolveCategoryName(
              article,
              categories
            ),
          slug,
        });
      }
    }
  );

  return Array.from(
    countMap.entries()
  )
    .map(
      ([key, count]) => {
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
                  (count / total) *
                    100
                )
              : 0,
        };
      }
    )
    .sort(
      (a, b) => {
        if (
          a.count !==
          b.count
        ) {
          return (
            a.count - b.count
          );
        }

        return a.slug.localeCompare(
          b.slug
        );
      }
    );
}

// ======================================================
// ARTICLE STATS
// ======================================================

function buildArticleStats(
  articles: any[],
  categories: CategoryItem[]
): ArticleStats {
  const published =
    articles.filter(
      (article) =>
        article?.status === "published"
    );

  const drafts =
    articles.filter(
      (article) =>
        article?.status !==
        "published"
    );

  const featured =
    articles.filter(
      (article) =>
        article?.featured === true
    );

  const now = new Date();

  const today =
    published.filter(
      (article) => {
        const date =
          parseArticleDate(
            article
          );

        return (
          date !== null &&
          isSameDay(
            date,
            now
          )
        );
      }
    ).length;

  const last7Days =
    published.filter(
      (article) => {
        const date =
          parseArticleDate(
            article
          );

        return (
          date !== null &&
          isWithinDays(
            date,
            7
          )
        );
      }
    ).length;

  const last30Days =
    published.filter(
      (article) => {
        const date =
          parseArticleDate(
            article
          );

        return (
          date !== null &&
          isWithinDays(
            date,
            30
          )
        );
      }
    ).length;

  return {
    total:
      articles.length,
    published:
      published.length,
    drafts:
      drafts.length,
    featured:
      featured.length,
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

function formatNumber(
  value: number
) {
  return value.toLocaleString(
    "en-IN"
  );
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

  const maxCount =
    Math.max(
      ...categories.map(
        (item) => item.count
      ),
      1
    );

  return (
    <div className="space-y-2.5">
      {categories.map(
        (item) => {
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
        }
      )}
    </div>
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
                    month:
                      "short",
                    year:
                      "numeric",
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
                article.featured ===
                true
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
                value={
                  priorityValue
                }
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
                  onPrioritySave(
                    article
                  )
                }
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-green-600 px-2 text-white shadow-sm active:scale-95 disabled:opacity-50"
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

  const [pendingArticles, setPendingArticles] =
    useState<any[]>([]);

  const [pendingLoading, setPendingLoading] =
    useState(false);

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

  // ======================================================
// PENDING SYNC CHECK
//
// ONLY latest 5 changed Firebase articles.
//
// Firebase:
//     article data
//
// VS
//
// GitHub:
//     /data/articles.json
//
// If relevant data differs => Pending
//
// ======================================================

const checkPendingArticles =
  useCallback(
    async (
      jsonArticles: any[]
    ) => {
      try {
        setPendingLoading(true);

        const firebaseLatest =
          await getLatestArticles(5);

        // ----------------------------------------------
        // JSON LOOKUP
        // ----------------------------------------------

        const jsonMap =
          new Map<string, any>();

        jsonArticles.forEach(
          (article) => {
            if (!article) return;

            if (article.id) {
              jsonMap.set(
                normalize(
                  article.id
                ),
                article
              );
            }

            if (article.slug) {
              jsonMap.set(
                `slug:${normalizeSlug(
                  article.slug
                )}`,
                article
              );
            }
          }
        );

        // ----------------------------------------------
        // FIREBASE TIMESTAMP NORMALIZER
        // ----------------------------------------------

        const normalizeTimestamp =
          (value: any): string => {
            if (!value) {
              return "";
            }

            if (
              typeof value?.toDate ===
              "function"
            ) {
              return value
                .toDate()
                .toISOString();
            }

            if (
              typeof value ===
              "object" &&
              typeof value?.seconds ===
                "number"
            ) {
              return new Date(
                value.seconds * 1000
              ).toISOString();
            }

            const date =
              new Date(value);

            if (
              !Number.isNaN(
                date.getTime()
              )
            ) {
              return date.toISOString();
            }

            return String(value);
          };

        // ----------------------------------------------
        // NORMALIZE VALUE
        // ----------------------------------------------

        const normalizeValue =
          (value: any): any => {
            if (
              value === null ||
              value === undefined
            ) {
              return null;
            }

            if (
              typeof value?.toDate ===
              "function"
            ) {
              return normalizeTimestamp(
                value
              );
            }

            if (
              typeof value ===
                "object" &&
              typeof value?.seconds ===
                "number"
            ) {
              return normalizeTimestamp(
                value
              );
            }

            if (
              Array.isArray(value)
            ) {
              return value.map(
                normalizeValue
              );
            }

            if (
              typeof value ===
              "object"
            ) {
              const result: Record<
                string,
                any
              > = {};

              Object.keys(value)
                .sort()
                .forEach(
                  (key) => {
                    result[key] =
                      normalizeValue(
                        value[key]
                      );
                  }
                );

              return result;
            }

            return value;
          };

        // ----------------------------------------------
        // REMOVE FIREBASE-ONLY / NON-SYNC FIELDS
        //
        // These fields should NOT make an article
        // appear pending.
        // ----------------------------------------------

        const buildComparable =
          (
            article: any
          ) => {
            if (!article) {
              return null;
            }

            const ignoredFields =
              new Set([
                "id",

                // Firebase/internal timestamps
                "createdAt",
                "updatedAt",

                // Firebase/internal fields
                "author",

                // Anything else that is not
                // actually stored in articles.json
                "syncStatus",
                "syncError",
              ]);

            const result: Record<
              string,
              any
            > = {};

            Object.keys(article)
              .filter(
                (key) =>
                  !ignoredFields.has(
                    key
                  )
              )
              .sort()
              .forEach(
                (key) => {
                  result[key] =
                    normalizeValue(
                      article[key]
                    );
                }
              );

            return result;
          };

        // ----------------------------------------------
        // FIND JSON ARTICLE
        // ----------------------------------------------

        const findJsonArticle =
          (
            firebaseArticle: any
          ) => {
            const id =
              normalize(
                firebaseArticle?.id
              );

            if (id) {
              const byId =
                jsonMap.get(id);

              if (byId) {
                return byId;
              }
            }

            const slug =
              normalizeSlug(
                firebaseArticle?.slug
              );

            if (slug) {
              return jsonMap.get(
                `slug:${slug}`
              );
            }

            return undefined;
          };

        // ----------------------------------------------
        // COMPARE ONLY LATEST 5
        // ----------------------------------------------

        const pending =
          firebaseLatest.filter(
            (
              firebaseArticle
            ) => {
              const jsonArticle =
                findJsonArticle(
                  firebaseArticle
                );

              // ----------------------------------------
              // Article not present in JSON
              // ----------------------------------------

              if (
                !jsonArticle
              ) {
                return true;
              }

              // ----------------------------------------
              // Compare actual synced data
              // ----------------------------------------

              const firebaseComparable =
                buildComparable(
                  firebaseArticle
                );

              const jsonComparable =
                buildComparable(
                  jsonArticle
                );

              const firebaseString =
                JSON.stringify(
                  firebaseComparable
                );

              const jsonString =
                JSON.stringify(
                  jsonComparable
                );

              return (
                firebaseString !==
                jsonString
              );
            }
          );

        setPendingArticles(
          pending
        );
      } catch (error) {
        console.error(
          "PENDING ARTICLES CHECK ERROR:",
          error
        );

        setPendingArticles([]);
      } finally {
        setPendingLoading(
          false
        );
      }
    },
    []
  );
  // ====================================================
  // LOAD ARTICLES JSON
  // ====================================================

  const loadArticlesJson =
    useCallback(async () => {
      const response =
        await fetch(
          "/data/articles.json",
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load articles.json"
        );
      }

      const data =
        await response.json();

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data?.articles
            )
          ? data.articles
          : [];

      setArticles(list);

      // Firebase ONLY latest 5.
      // Compare against the freshly loaded JSON.
      await checkPendingArticles(
        list
      );
    }, [
      checkPendingArticles,
    ]);

  // ====================================================
  // LOAD CATEGORIES
  // ====================================================

  const loadCategoriesJson =
    useCallback(async () => {
      const response =
        await fetch(
          "/data/categories.json",
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Unable to load categories.json"
        );
      }

      const data =
        await response.json();

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(
              data?.categories
            )
          ? data.categories
          : [];

      setCategoriesData(
        list
      );
    }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  const initialize =
    useCallback(async () => {
      try {
        setLoading(true);
        setLoadError("");

        await Promise.all([
          loadArticlesJson(),
          loadCategoriesJson(),
        ]);
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
    ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ====================================================
  // REFRESH
  // ====================================================

  const refreshDashboard =
    useCallback(async () => {
      try {
        setRefreshing(true);
        setLoadError("");

        await Promise.all([
          loadArticlesJson(),
          loadCategoriesJson(),
        ]);
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
    }, [
      loadArticlesJson,
      loadCategoriesJson,
    ]);

  // ====================================================
  // STATS
  // ====================================================

  const stats = useMemo(
    () =>
      buildArticleStats(
        articles,
        categoriesData
      ),
    [
      articles,
      categoriesData,
    ]
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
              title.includes(
                query
              ) ||
              slug.includes(
                query
              ) ||
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
        [articleId]:
          value,
      })
    );

    setPriorityErrors(
      (previous) => {
        const next = {
          ...previous,
        };

        delete next[
          articleId
        ];

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
          [article.id]:
            true,
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
          [article.id]:
            false,
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
    statusFilter !==
      "all" ||
    categoryFilter !==
      "all";

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex h-[calc(100vh-80px)] min-h-0 w-full min-w-0 flex-col overflow-hidden bg-zinc-50">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="shrink-0 border-b border-zinc-200 bg-white">
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight text-zinc-950 sm:text-xl">
                Articles
              </h1>

              <p className="hidden text-[10px] font-medium text-zinc-400 sm:block">
                Manage, search and organize
                your articles
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={
                  refreshDashboard
                }
                disabled={
                  refreshing
                }
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
                PENDING ARTICLES
                Firebase latest 5 vs articles.json
            ================================================== */}

            <section className="mt-3 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/60 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Clock3
                      size={14}
                      className="text-amber-600"
                    />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xs font-black text-zinc-900">
                      Pending Articles
                    </h2>

                    <p className="truncate text-[9px] text-zinc-400">
                      Latest 5 Firebase articles not found in articles.json
                    </p>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black ${
                    pendingArticles.length >
                    0
                      ? "bg-amber-100 text-amber-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {pendingLoading
                    ? "Checking..."
                    : `${pendingArticles.length} Pending`}
                </span>
              </div>

              {pendingLoading ? (
                <div className="flex min-h-[100px] items-center justify-center gap-2 text-[10px] font-bold text-zinc-400">
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />
                  Checking latest Firebase articles...
                </div>
              ) : pendingArticles.length ===
                0 ? (
                <div className="flex min-h-[100px] items-center justify-center px-4 text-center">
                  <div>
                    <CheckCircle2
                      size={20}
                      className="mx-auto text-green-500"
                    />

                    <p className="mt-1.5 text-xs font-black text-zinc-700">
                      Everything is synced
                    </p>

                    <p className="mt-0.5 text-[9px] text-zinc-400">
                      Latest Firebase articles are already present in articles.json.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-amber-100">
                  {pendingArticles.map(
                    (
                      article,
                      index
                    ) => {
                      const date =
                        parseArticleDate(
                          article
                        );

                      return (
                        <div
                          key={
                            article.id ??
                            article.slug ??
                            index
                          }
                          className="flex min-w-0 items-center gap-3 px-3 py-2.5 transition hover:bg-amber-50/30"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-black text-amber-700">
                            {index +
                              1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-[11px] font-black text-zinc-900"
                              title={
                                article.title
                              }
                            >
                              {article.title ||
                                "Untitled Article"}
                            </p>

                            {article.changedFields?.length >
  0 && (
  <div className="mt-1 flex flex-wrap gap-1">
    {article.changedFields.map(
      (field: string) => (
        <span
          key={field}
          className="rounded bg-zinc-100 px-1.5 py-0.5 text-[7px] font-bold text-zinc-500"
        >
          {field}
        </span>
      )
    )}
  </div>
)}

                            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
                              {article.slug && (
                                <span
                                  className="max-w-[60%] truncate font-mono text-[8px] text-zinc-400"
                                  title={
                                    article.slug
                                  }
                                >
                                  /
                                  {
                                    article.slug
                                  }
                                </span>
                              )}

                              {date && (
                                <span className="shrink-0 text-[8px] font-semibold text-zinc-400">
                                  {date.toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month:
                                        "short",
                                      year:
                                        "numeric",
                                    }
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <span
  className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase ${
    article.pendingType ===
    "featured"
      ? "bg-purple-100 text-purple-700"
      : article.pendingType ===
        "priority"
      ? "bg-blue-100 text-blue-700"
      : article.pendingType ===
        "created"
      ? "bg-amber-100 text-amber-700"
      : "bg-orange-100 text-orange-700"
  }`}
>
  {article.pendingType ===
  "featured"
    ? "Featured Pending"
    : article.pendingType ===
      "priority"
    ? "Priority Pending"
    : article.pendingType ===
      "created"
    ? "New Article Pending"
    : "Update Pending"}
</span>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </section>

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

              {/* CATEGORY DISTRIBUTION */}

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
                    {
                      categories.length
                    }{" "}
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
                SEARCH + FILTERS
                NOW BELOW DASHBOARD
            ================================================== */}

            <section className="mt-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-3.5">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_190px]">

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
                    {
                      articles.length
                    }
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
            </section>

            {/* ==================================================
                ARTICLE LIST
            ================================================== */}

            <section className="mt-3 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">

              {/* SECTION HEADER */}

              <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2.5">
                <div>
                  <h2 className="text-xs font-black text-zinc-900">
                    Article List
                  </h2>

                  <p className="text-[9px] text-zinc-400">
                    Featured first · Priority · Latest
                  </p>
                </div>

                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black text-zinc-600">
                  {
                    filteredArticles.length
                  }
                </span>
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
                      MOBILE
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

              <span className="text-[9px] font-black text-zinc-500">
                {
                  filteredArticles.length
                }{" "}
                visible
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}