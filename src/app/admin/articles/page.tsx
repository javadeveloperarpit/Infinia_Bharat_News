"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  getArticles,
  deleteArticle,
  updateArticle,
} from "@/services/article.service";

import {
  getCategories,
} from "@/services/category.service";


// ======================================================
// SORT
// ======================================================

function sortArticles(
  list: any[]
) {
  return [...list].sort(
    (a, b) => {

      if (
        a.featured === true &&
        b.featured !== true
      ) {
        return -1;
      }

      if (
        a.featured !== true &&
        b.featured === true
      ) {
        return 1;
      }

      if (
        a.featured === true &&
        b.featured === true
      ) {
        return (
          (Number(a.priority) || 999) -
          (Number(b.priority) || 999)
        );
      }

      return 0;
    }
  );
}


// ======================================================
// TYPES
// ======================================================

type PriorityErrors =
  Record<string, string>;


// ======================================================
// PAGE
// ======================================================

export default function ArticlesPage() {

  const [
    articles,
    setArticles,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    categoryNames,
    setCategoryNames,
  ] = useState<
    Record<string, string>
  >({});

  const [
    pendingPriorities,
    setPendingPriorities,
  ] = useState<
    Record<string, string>
  >({});

  const [
    priorityErrors,
    setPriorityErrors,
  ] = useState<
    PriorityErrors
  >({});

  const [
    savingPriority,
    setSavingPriority,
  ] = useState<
    Record<string, boolean>
  >({});


  // ======================================================
  // FEATURED COUNT
  // ======================================================

  const featuredCount =
    articles.filter(
      (article) =>
        article.featured === true
    ).length;


  // ======================================================
  // LOAD ARTICLES
  // ======================================================

  async function loadArticles() {

    try {

      setLoading(true);

      const [
        data,
        categories,
      ] = await Promise.all([
        getArticles(),
        getCategories(),
      ]);


      const categoryMap:
        Record<string, string> = {};


      categories.forEach(
        (category: any) => {

          categoryMap[
            category.id
          ] = category.name;

        }
      );


      setCategoryNames(
        categoryMap
      );

      setArticles(
        sortArticles(data)
      );

      setPendingPriorities({});
      setPriorityErrors({});

    } catch (error) {

      console.error(
        "Articles Load Error:",
        error
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {

    loadArticles();

  }, []);


  // ======================================================
  // FEATURED CHANGE
  // ======================================================

  async function handleFeaturedChange(
    article: any,
    checked: boolean
  ) {

    try {

      // ----------------------------------------------
      // REMOVE FEATURED
      // ----------------------------------------------

      if (!checked) {

        await updateArticle(
  article.id,
  {
    featured: false,
  }
);

        await loadArticles();

        return;
      }


      // ----------------------------------------------
      // MAX 5
      // ----------------------------------------------

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


      // ----------------------------------------------
      // FIND FREE PRIORITY
      // ----------------------------------------------

      const usedPriorities =
        articles
          .filter(
            (item) =>
              item.featured === true &&
              item.id !== article.id
          )
          .map(
            (item) =>
              Number(item.priority)
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


      // ----------------------------------------------
      // SAVE FEATURED
      // ----------------------------------------------

      await updateArticle(
        article.id,
        {
          featured: true,
          priority:
            availablePriority,
        }
      );


      await loadArticles();

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


  // ======================================================
  // PRIORITY INPUT
  //
  // ONLY LOCAL STATE
  // ======================================================

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

        delete next[articleId];

        return next;
      }
    );
  }


  // ======================================================
  // SAVE PRIORITY
  // ONLY ✓ SAVES
  // ======================================================

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


    // ----------------------------------------------
    // EMPTY
    // ----------------------------------------------

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


    // ----------------------------------------------
    // 1 - 5
    // ----------------------------------------------

    if (
      !Number.isInteger(priority) ||
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


    // ----------------------------------------------
    // DUPLICATE
    // ----------------------------------------------

    const occupied =
      articles.some(
        (item) =>
          item.id !== article.id &&
          item.featured === true &&
          Number(item.priority) ===
            priority
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


    // ----------------------------------------------
    // SAVE
    // ----------------------------------------------

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


      await loadArticles();

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


  // ======================================================
  // DELETE
  // ======================================================

  async function handleDelete(
    id: string
  ) {

    if (
      !confirm(
        "Delete this article?"
      )
    ) {
      return;
    }


    try {

      await deleteArticle(id);

      alert(
        "Article Deleted"
      );

      await loadArticles();

    } catch (error) {

      console.error(error);

      alert(
        "Delete failed"
      );

    }
  }


  // ======================================================
  // UI
  // ======================================================

  return (

    <div
      className="
        flex
        h-[calc(100vh-80px)]
        w-full
        min-w-0
        flex-col
        overflow-hidden
      "
    >

      {/* ==================================================
          STICKY PAGE HEADER
      ================================================== */}

      <div
        className="
          sticky
          top-0
          z-40
          shrink-0
          bg-zinc-50
          pb-4
        "
      >

        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-zinc-900
                sm:text-3xl
              "
            >
              Articles
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Manage your news articles
            </p>

          </div>


          <Link
            href="/admin/articles/create"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              rounded-lg
              bg-red-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              active:scale-[0.98]
              sm:w-auto
            "
          >
            + Create Article
          </Link>

        </div>


        {/* ==================================================
            FEATURED INFO
        ================================================== */}

        <div
          className="
            mt-4
            flex
            items-center
            justify-between
            rounded-xl
            border
            border-zinc-200
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >

          <div>

            <p
              className="
                text-sm
                font-semibold
                text-zinc-900
              "
            >
              Featured Articles
            </p>

            <p
              className="
                text-xs
                text-zinc-500
              "
            >
              Maximum 5 articles can be featured
            </p>

          </div>


          <div
            className="
              rounded-full
              bg-red-50
              px-3
              py-1.5
              text-sm
              font-bold
              text-red-600
            "
          >
            {featuredCount}/5
          </div>

        </div>

      </div>


      {/* ==================================================
          ARTICLE TABLE
          ONLY THIS AREA SCROLLS
      ================================================== */}

      <div
        className="
          min-h-0
          w-full
          flex-1
          overflow-hidden
          rounded-xl
          border
          border-zinc-200
          bg-white
          shadow-sm
        "
      >

        {loading ? (

          <div
            className="
              flex
              h-full
              min-h-[220px]
              items-center
              justify-center
              text-sm
              text-zinc-500
            "
          >
            Loading articles...
          </div>

        ) : articles.length === 0 ? (

          <div
            className="
              flex
              h-full
              min-h-[220px]
              flex-col
              items-center
              justify-center
              text-center
            "
          >

            <p
              className="
                font-semibold
                text-zinc-800
              "
            >
              No articles found
            </p>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Create your first article.
            </p>

          </div>

        ) : (

          <div
            className="
              h-full
              w-full
              overflow-auto
              overscroll-contain
            "
          >

            <table
              className="
                w-full
                min-w-[1050px]
                border-collapse
                text-left
              "
            >

              {/* ==================================================
                  TABLE HEADER
              ================================================== */}

              <thead>

                <tr
                  className="
                    sticky
                    top-0
                    z-30
                    bg-zinc-50
                    text-xs
                    uppercase
                    tracking-wide
                    text-zinc-500
                    shadow-[0_1px_0_#e4e4e7]
                  "
                >

                  <th className="px-4 py-4 font-semibold">
                    Title
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Featured
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Priority
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Category
                  </th>

                  <th className="px-4 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-4 py-4 text-right font-semibold">
                    Action
                  </th>

                </tr>

              </thead>


              {/* ==================================================
                  BODY
              ================================================== */}

              <tbody>

                {articles.map(
                  (article) => {

                    const pendingValue =
                      pendingPriorities[
                        article.id
                      ];


                    const priorityValue =
                      pendingValue !== undefined
                        ? pendingValue
                        : String(
                            article.priority ?? ""
                          );


                    const priorityError =
                      priorityErrors[
                        article.id
                      ];


                    const isSaving =
                      savingPriority[
                        article.id
                      ] === true;


                    return (

                      <tr
                        key={article.id}
                        className={`
                          border-t
                          border-zinc-100
                          transition
                          hover:bg-zinc-50
                          ${
                            article.featured
                              ? "bg-red-50/30"
                              : ""
                          }
                        `}
                      >

                        {/* TITLE */}

                        <td
                          className="
                            max-w-[360px]
                            px-4
                            py-4
                          "
                        >

                          <div
                            className="
                              truncate
                              font-medium
                              text-zinc-900
                            "
                            title={
                              article.title
                            }
                          >
                            {article.title}
                          </div>

                        </td>


                        {/* FEATURED */}

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >

                          <label
                            className="
                              inline-flex
                              items-center
                              gap-2
                            "
                          >

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
                                handleFeaturedChange(
                                  article,
                                  event.target.checked
                                )
                              }
                              className="
                                h-4
                                w-4
                                cursor-pointer
                                accent-red-600
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            />

                            {article.featured && (

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  text-red-600
                                "
                              >
                                Featured
                              </span>

                            )}

                          </label>

                        </td>


                        {/* PRIORITY */}

                        <td
                          className="
                            min-w-[210px]
                            px-4
                            py-4
                          "
                        >

                          {article.featured ? (

                            <div>

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                "
                              >

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
                                  onChange={(event) =>
                                    handlePriorityInput(
                                      article.id,
                                      event.target.value
                                    )
                                  }
                                  className={`
                                    w-20
                                    rounded-lg
                                    border
                                    bg-white
                                    px-3
                                    py-2
                                    text-sm
                                    font-semibold
                                    text-zinc-900
                                    outline-none
                                    transition
                                    focus:ring-2
                                    ${
                                      priorityError
                                        ? `
                                          border-red-500
                                          focus:border-red-500
                                          focus:ring-red-100
                                        `
                                        : `
                                          border-zinc-300
                                          focus:border-red-500
                                          focus:ring-red-100
                                        `
                                    }
                                  `}
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
                                  title="Save priority"
                                  className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-green-600
                                    text-lg
                                    font-bold
                                    text-white
                                    transition
                                    hover:bg-green-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >
                                  {isSaving
                                    ? "..."
                                    : "✓"}
                                </button>

                              </div>


                              {priorityError && (

                                <p
                                  className="
                                    mt-1.5
                                    text-xs
                                    font-semibold
                                    text-red-600
                                  "
                                >
                                  {priorityError}
                                </p>

                              )}

                            </div>

                          ) : (

                            <span
                              className="
                                text-sm
                                text-zinc-400
                              "
                            >
                              —
                            </span>

                          )}

                        </td>


                        {/* CATEGORY */}

                        <td
                          className="
                            whitespace-nowrap
                            px-4
                            py-4
                            text-sm
                            text-zinc-600
                          "
                        >
                          {
                            categoryNames[
                              article.categoryId
                            ] || "N/A"
                          }
                        </td>


                        {/* STATUS */}

                        <td
                          className="
                            px-4
                            py-4
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-semibold
                              ${
                                article.status ===
                                "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-zinc-100 text-zinc-600"
                              }
                            `}
                          >
                            {article.status}
                          </span>

                        </td>


                        {/* ACTION */}

                        <td
                          className="
                            whitespace-nowrap
                            px-4
                            py-4
                          "
                        >

                          <div
                            className="
                              flex
                              justify-end
                              gap-4
                            "
                          >

                            <Link
                              href={`/admin/articles/${article.id}/edit`}
                              className="
                                text-sm
                                font-semibold
                                text-blue-600
                                hover:text-blue-800
                              "
                            >
                              Edit
                            </Link>


                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  article.id
                                )
                              }
                              className="
                                text-sm
                                font-semibold
                                text-red-600
                                hover:text-red-800
                              "
                            >
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

        )}

      </div>


      {/* MOBILE HINT */}

      <div
        className="
          shrink-0
          border-t
          border-zinc-100
          py-2
          text-center
          text-[11px]
          text-zinc-400
          sm:hidden
        "
      >
        ← Swipe horizontally to view all columns →
      </div>

    </div>
  );
}