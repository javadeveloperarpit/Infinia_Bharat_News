"use client";

import {
useEffect,
useState,
} from "react";

import Link from "next/link";

import {
getArticles,
deleteArticle,
} from "@/services/article.service";

import {
getCategories,
} from "@/services/category.service";

export default function ArticlesPage() {

const [articles, setArticles] =
useState<any[]>([]);

const [loading, setLoading] =
useState(true);

const [categoryNames, setCategoryNames] =
useState<Record<string, string>>({});

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

      categoryMap[category.id] =
        category.name;

    }
  );


  setCategoryNames(categoryMap);

  setArticles(data);

}
catch (error) {

  console.error(
    "Articles Load Error:",
    error
  );

}
finally {

  setLoading(false);

}

}

useEffect(() => {

loadArticles();

}, []);

async function handleDelete(
id: string
) {

const confirmDelete =
  confirm(
    "Delete this article?"
  );


if (!confirmDelete)
  return;


try {

  await deleteArticle(id);

  alert(
    "Article Deleted"
  );

  await loadArticles();

}
catch (error) {

  console.error(error);

  alert(
    "Delete failed"
  );

}

}

return (

<div className="
  w-full
  min-w-0
  space-y-6
">


  {/* HEADER */}

  <div className="
    flex
    flex-col
    gap-4
    sm:flex-row
    sm:items-center
    sm:justify-between
  ">

    <div className="min-w-0">

      <h1 className="
        text-2xl
        sm:text-3xl
        font-bold
        text-zinc-900
      ">

        Articles

      </h1>

      <p className="
        mt-1
        text-sm
        text-zinc-500
      ">

        Manage your news articles

      </p>

    </div>


    <Link
      href="/admin/articles/create"
      className="
        inline-flex
        w-full
        sm:w-auto
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
      "
    >

      + Create Article

    </Link>

  </div>


  {/* CONTENT */}

  <div className="
    w-full
    min-w-0
    overflow-hidden
    rounded-xl
    border
    border-zinc-200
    bg-white
    shadow-sm
  ">


    {loading ? (

      <div className="
        flex
        min-h-[220px]
        items-center
        justify-center
        px-4
        text-sm
        text-zinc-500
      ">

        Loading articles...

      </div>

    ) : articles.length === 0 ? (

      <div className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        px-4
        text-center
      ">

        <p className="
          font-semibold
          text-zinc-800
        ">

          No articles found

        </p>

        <p className="
          mt-1
          text-sm
          text-zinc-500
        ">

          Create your first article.

        </p>

      </div>

    ) : (

      <>
        {/* MOBILE TABLE SCROLL CONTAINER */}

        <div className="
          w-full
          overflow-x-auto
          overscroll-x-contain
        ">

          <table className="
            w-full
            min-w-[650px]
            border-collapse
            text-left
          ">

            <thead>

              <tr className="
                bg-zinc-50
                text-xs
                uppercase
                tracking-wide
                text-zinc-500
              ">

                <th className="
                  px-4
                  py-4
                  font-semibold
                ">

                  Title

                </th>

                <th className="
                  px-4
                  py-4
                  font-semibold
                ">

                  Category

                </th>

                <th className="
                  px-4
                  py-4
                  font-semibold
                ">

                  Status

                </th>

                <th className="
                  px-4
                  py-4
                  text-right
                  font-semibold
                ">

                  Action

                </th>

              </tr>

            </thead>


            <tbody>

              {articles.map(
                (article) => (

                  <tr
                    key={article.id}
                    className="
                      border-t
                      border-zinc-100
                      transition
                      hover:bg-zinc-50
                    "
                  >

                    <td className="
                      max-w-[360px]
                      px-4
                      py-4
                    ">

                      <div className="
                        truncate
                        font-medium
                        text-zinc-900
                      ">

                        {article.title}

                      </div>

                    </td>


                    <td className="
                      whitespace-nowrap
                      px-4
                      py-4
                      text-sm
                      text-zinc-600
                    ">

                      {
                        categoryNames[
                          article.categoryId
                        ] || "N/A"
                      }

                    </td>


                    <td className="
                      px-4
                      py-4
                    ">

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


                    <td className="
                      whitespace-nowrap
                      px-4
                      py-4
                    ">

                      <div className="
                        flex
                        justify-end
                        gap-4
                      ">

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

                )
              )}

            </tbody>

          </table>

        </div>


        {/* MOBILE HINT */}

        <div className="
          border-t
          border-zinc-100
          px-4
          py-2
          text-center
          text-[11px]
          text-zinc-400
          sm:hidden
        ">

          ← Swipe horizontally to view all columns →

        </div>

      </>

    )}

  </div>

</div>


);

}
