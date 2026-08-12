"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { auth } from "@/lib/firebase/firebase";

import {
  getCategories,
} from "@/services/category.service";

import Editor from "@/components/editor/NewsEditor";


// ======================================================
// CREATE ARTICLE PAGE
// ======================================================

export default function CreateArticlePage() {

  const router = useRouter();

  const searchParams =
    useSearchParams();


  // ======================================================
// STATES
// ======================================================

const [loading, setLoading] =
  useState(false);

const [categories, setCategories] =
  useState<any[]>([]);

const [categoriesLoading, setCategoriesLoading] =
  useState(true);

const [form, setForm] = useState({

  title: "",

  categoryId: "",

  thumbnail: "",

  shortDescription: "",

  content: "",

  seoTitle: "",

  seoDescription: "",

  featured: false,

  breaking: false,

  priority: 0,

  status:
    "draft" as
    "draft" |
    "published",

});

  // ======================================================
// LOAD CATEGORIES
// ======================================================

useEffect(() => {

  let mounted = true;

  async function loadCategories() {

    try {

      setCategoriesLoading(true);

      const data =
        await getCategories();

      console.log(
        "ARTICLE CATEGORIES:",
        data
      );

      if (mounted) {

        setCategories(
          Array.isArray(data)
            ? data
            : []
        );

      }

    } catch (error) {

      console.error(
        "Categories Load Error:",
        error
      );

      if (mounted) {

        setCategories([]);

      }

    } finally {

      if (mounted) {

        setCategoriesLoading(false);

      }

    }

  }

  loadCategories();

  return () => {

    mounted = false;

  };

}, []);


  // ======================================================
// LOAD AI GENERATED ARTICLE
// ======================================================

useEffect(() => {

  // AI source nahi hai
  if (
    searchParams.get("from") !== "ai"
  ) {

    return;

  }


  // Categories abhi load nahi hui hain
  // Is point par bilkul kuch mat karo.
  //
  // IMPORTANT:
  // sessionStorage bhi remove nahi karna hai.
  //
  if (categoriesLoading) {

    console.log(
      "Waiting for categories before loading AI article..."
    );

    return;

  }


  const saved =
    sessionStorage.getItem(
      "ai_article"
    );


  if (!saved) {

    return;

  }


  try {

    const aiArticle =
      JSON.parse(saved);


    console.log(
      "AI ARTICLE RECEIVED:",
      aiArticle
    );


    // ==================================================
    // FIND CATEGORY
    // ==================================================

    const suggestedCategory =
      String(
        aiArticle.suggestedCategory ||
        aiArticle.category ||
        ""
      )
        .trim()
        .toLowerCase();


    let matchedCategory = null;


    if (
      suggestedCategory &&
      categories.length > 0
    ) {

      matchedCategory =
        categories.find(
          (category) => {

            const categoryName =
              String(
                category?.name ||
                ""
              )
                .trim()
                .toLowerCase();


            const categorySlug =
              String(
                category?.slug ||
                ""
              )
                .trim()
                .toLowerCase();


            return (

              categoryName ===
              suggestedCategory ||

              categorySlug ===
              suggestedCategory

            );

          }
        ) || null;

    }


    console.log(
      "AI SUGGESTED CATEGORY:",
      suggestedCategory
    );


    console.log(
      "MATCHED CATEGORY:",
      matchedCategory
    );


    // ==================================================
    // SET COMPLETE FORM
    // ==================================================

    setForm(
      (previous) => ({

        ...previous,

        title:
          aiArticle.title ||
          "",

        categoryId:
          matchedCategory?.id ||
          aiArticle.categoryId ||
          "",

        thumbnail:
          aiArticle.thumbnail ||
          "",

        shortDescription:
          aiArticle.shortDescription ||
          "",

        content:
          aiArticle.content ||
          "",

        seoTitle:
          aiArticle.seoTitle ||
          "",

        seoDescription:
          aiArticle.seoDescription ||
          "",

        featured:
          Boolean(
            aiArticle.featured
          ),

        breaking:
          Boolean(
            aiArticle.breaking
          ),

        priority:
          Number(
            aiArticle.priority || 0
          ),

        status:
          aiArticle.status ===
          "published"
            ? "published"
            : "draft",

      })
    );


    // ==================================================
    // CATEGORY RESULT
    // ==================================================

    if (
      matchedCategory
    ) {

      console.log(
        "AI CATEGORY MATCHED:",
        matchedCategory.name,
        matchedCategory.id
      );

    } else if (
      suggestedCategory
    ) {

      console.warn(
        "AI CATEGORY NOT FOUND:",
        suggestedCategory,

        "Available categories:",
        categories.map(
          (category) =>
            category.name
        )
      );

    }


    // ==================================================
    // REMOVE SESSION DATA
    // ==================================================
    //
    // IMPORTANT:
    // Ye tabhi hoga jab categories load ho chuki hain.
    //
    sessionStorage.removeItem(
      "ai_article"
    );


  } catch (error) {

    console.error(
      "AI Article Load Error:",
      error
    );

  }

}, [
  searchParams,
  categories,
  categoriesLoading,
]);

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  function handleChange(
    e: any
  ) {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setForm(
      (previous) => ({

        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : name === "priority"
            ? Number(value)
            : value,

      })
    );

  }


  // ======================================================
  // EDITOR CHANGE
  // ======================================================

  function handleEditorChange(
    value: string
  ) {

    setForm(
      (previous) => ({

        ...previous,

        content:
          value,

      })
    );

  }


  // ======================================================
  // SUBMIT ARTICLE
  // ======================================================

  async function handleSubmit() {

    try {

      setLoading(true);


      const user =
        auth.currentUser;


      if (!user) {

        alert(
          "Please login again."
        );

        return;

      }


      // ==================================================
      // CATEGORY VALIDATION
      // ==================================================

      if (!form.categoryId) {

        alert(
          "Please select an article category."
        );

        return;

      }


      // ==================================================
      // GET TOKEN
      // ==================================================

      const token =
        await user.getIdToken();


      // ==================================================
      // CREATE ARTICLE
      // ==================================================

      const res =
        await fetch(
          "/api/admin/articles",
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,

            },

            body:
              JSON.stringify(
                form
              ),

          }
        );


      const data =
        await res.json();


      if (!res.ok) {

        throw new Error(
          data?.message ||
          "Failed to create article"
        );

      }


      // ==================================================
      // SUCCESS
      // ==================================================

      alert(
        "Article Created Successfully"
      );


      router.push(
        "/admin/articles"
      );


      router.refresh();


    } catch (error: any) {

      console.error(
        "Article Create Error:",
        error
      );


      alert(
        error?.message ||
        "Something went wrong"
      );


    } finally {

      setLoading(false);

    }

  }


  // ======================================================
  // UI
  // ======================================================

  return (

    <div
      className="
        max-w-5xl
        mx-auto
        space-y-6
        pb-10
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>

        <h1
          className="
            text-3xl
            font-black
            text-zinc-900
          "
        >
          Create Article
        </h1>


        <p
          className="
            mt-1
            text-sm
            text-zinc-500
          "
        >
          Create and publish your news
          article.
        </p>

      </div>


      {/* ==================================================
          ARTICLE FORM
      ================================================== */}

      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          p-4
          sm:p-6
          space-y-6
        "
      >

        {/* ==================================================
            TITLE
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Article Title
          </label>


          <input
            name="title"
            placeholder="Article Title"
            value={
              form.title
            }
            onChange={
              handleChange
            }
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />

        </div>


        {/* ==================================================
            CATEGORY
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Category
          </label>


          <select
  name="categoryId"
  value={form.categoryId}
  onChange={handleChange}
  disabled={categoriesLoading}
  className="
    w-full
    border
    border-zinc-300
    p-3
    rounded-lg
    outline-none
    focus:ring-2
    focus:ring-red-500
    bg-white
    disabled:bg-zinc-100
    disabled:cursor-wait
  "
>

  <option value="">
    {categoriesLoading
      ? "Loading categories..."
      : "Select Category"
    }
  </option>


  {categories.map(
    (cat) => (

      <option
        key={cat.id}
        value={cat.id}
      >
        {cat.name}
      </option>

    )
  )}

</select>


          {/* AI CATEGORY STATUS */}

          {searchParams.get("from") === "ai" &&
  categoriesLoading && (

    <p
      className="
        mt-2
        text-xs
        font-semibold
        text-zinc-500
      "
    >
      Loading categories and matching
      AI suggestion...
    </p>

)}

        </div>


        {/* ==================================================
            THUMBNAIL
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Thumbnail Image
          </label>


          <input
            name="thumbnail"
            placeholder="Blogger Image URL"
            value={
              form.thumbnail
            }
            onChange={
              handleChange
            }
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />


          <p
            className="
              text-xs
              text-zinc-500
              mt-2
            "
          >
            Upload your image to Blogger
            and paste the image URL here.
          </p>


          {/* IMAGE PREVIEW */}

          {form.thumbnail && (

            <div
              className="
                mt-4
                overflow-hidden
                rounded-xl
                border
                border-zinc-200
                bg-zinc-50
              "
            >

              <img
                src={
                  form.thumbnail
                }
                alt={
                  form.title ||
                  "Article thumbnail"
                }
                className="
                  w-full
                  max-h-72
                  object-cover
                "
                onError={(
                  event
                ) => {

                  event.currentTarget.style.display =
                    "none";

                }}
              />

            </div>

          )}

        </div>


        {/* ==================================================
            SHORT DESCRIPTION
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Short Description
          </label>


          <textarea
            name="shortDescription"
            placeholder="Short description"
            value={
              form.shortDescription
            }
            onChange={
              handleChange
            }
            rows={4}
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              resize-y
              focus:ring-2
              focus:ring-red-500
            "
          />

        </div>


        {/* ==================================================
            CONTENT EDITOR
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Article Content
          </label>


          <Editor
            value={
              form.content
            }
            onChange={
              handleEditorChange
            }
          />

        </div>


        {/* ==================================================
            SEO TITLE
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Slug 
          </label>


          <input
            name="seoTitle"
            placeholder="SEO Title"
            value={
              form.seoTitle
            }
            onChange={
              handleChange
            }
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />


          <p
            className="
              text-xs
              text-zinc-500
              mt-2
            "
          >
            example: for Slug= pmmodi-news then you get url : https://infiniabharatnews.vercel.app/news/pmmodi-news-xxxx
          </p>

        </div>


        {/* ==================================================
            SEO DESCRIPTION
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            SEO Description
          </label>


          <textarea
            name="seoDescription"
            placeholder="SEO Description"
            value={
              form.seoDescription
            }
            onChange={
              handleChange
            }
            rows={3}
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              resize-y
              focus:ring-2
              focus:ring-red-500
            "
          />

        </div>


        {/* ==================================================
            OPTIONS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >

          {/* FEATURED */}

          <label
            className="
              flex
              items-center
              gap-3
              border
              border-zinc-200
              rounded-lg
              p-4
              cursor-pointer
            "
          >

            <input
              type="checkbox"
              name="featured"
              checked={
                form.featured
              }
              onChange={
                handleChange
              }
            />


            <span
              className="
                font-semibold
              "
            >
              Featured Article
            </span>

          </label>


          {/* BREAKING */}

          <label
            className="
              flex
              items-center
              gap-3
              border
              border-zinc-200
              rounded-lg
              p-4
              cursor-pointer
            "
          >

            <input
              type="checkbox"
              name="breaking"
              checked={
                form.breaking
              }
              onChange={
                handleChange
              }
            />


            <span
              className="
                font-semibold
              "
            >
              Breaking News
            </span>

          </label>

        </div>


        {/* ==================================================
            PRIORITY
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Priority
          </label>


          <input
            type="number"
            name="priority"
            value={
              form.priority
            }
            onChange={
              handleChange
            }
            min={0}
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              outline-none
              focus:ring-2
              focus:ring-red-500
            "
          />

        </div>


        {/* ==================================================
            STATUS
        ================================================== */}

        <div>

          <label
            className="
              block
              text-sm
              font-bold
              mb-2
            "
          >
            Status
          </label>


          <select
            name="status"
            value={
              form.status
            }
            onChange={
              handleChange
            }
            className="
              w-full
              border
              border-zinc-300
              p-3
              rounded-lg
              bg-white
            "
          >

            <option value="draft">
              Draft
            </option>


            <option value="published">
              Published
            </option>

          </select>

        </div>


        {/* ==================================================
            SUBMIT
        ================================================== */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
            sm:justify-end
            pt-4
            border-t
            border-zinc-200
          "
        >

          {/* CANCEL */}

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/articles"
              )
            }
            className="
              px-5
              py-3
              rounded-lg
              border
              border-zinc-300
              font-semibold
              hover:bg-zinc-50
            "
          >
            Cancel
          </button>


          {/* CREATE */}

          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              loading
            }
            className="
              px-6
              py-3
              rounded-lg
              bg-red-600
              text-white
              font-bold
              hover:bg-red-700
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {loading
              ? "Creating..."
              : "Create Article"
            }

          </button>

        </div>

      </div>

    </div>

  );

}