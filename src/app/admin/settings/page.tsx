
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";

interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: "active" | "inactive";
}

export default function CategoriesPage() {

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    nameHi: "",
    slug: "",
    status: "active" as "active" | "inactive",
  });


  // =========================
  // LOAD CATEGORIES
  // =========================

  async function loadCategories() {

    try {

      setLoading(true);

      const data =
        await getCategories();

      setCategories(data);

    } catch (error) {

      console.error(
        "Categories Load Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadCategories();

  }, []);


  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {

    const {
      name,
      value,
    } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

  }


  // =========================
  // AUTO SLUG
  // =========================

  function createSlug(
    text: string
  ) {

    return text
      .toLowerCase()
      .trim()
      .replace(
        /[^\w\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );

  }


  // =========================
  // START EDIT
  // =========================

  function handleEdit(
    category: Category
  ) {

    setEditingId(category.id);

    setForm({
      name: category.name || "",
      nameHi: category.nameHi || "",
      slug: category.slug || "",
      status:
        category.status || "active",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =========================
  // CANCEL EDIT
  // =========================

  function cancelEdit() {

    setEditingId(null);

    setForm({
      name: "",
      nameHi: "",
      slug: "",
      status: "active",
    });

  }


  // =========================
  // SAVE / UPDATE
  // =========================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!form.name.trim()) {

      alert(
        "Category name is required"
      );

      return;

    }


    try {

      setSaving(true);


      const data = {
        name: form.name.trim(),

        nameHi:
          form.nameHi.trim(),

        slug:
          form.slug.trim()
            ? form.slug.trim()
            : createSlug(form.name),

        status:
          form.status,
      };


      // UPDATE
      if (editingId) {

        await updateCategory(
          editingId,
          data
        );

        alert(
          "Category Updated Successfully"
        );

      }

      // CREATE
      else {

        await createCategory(
          data
        );

        alert(
          "Category Created Successfully"
        );

      }


      cancelEdit();

      await loadCategories();

    } catch (error) {

      console.error(
        "Category Save Error:",
        error
      );

      alert(
        "Failed to save category"
      );

    } finally {

      setSaving(false);

    }

  }


  // =========================
  // DELETE
  // =========================

  async function handleDelete(
    id: string
  ) {

    const confirmed =
      confirm(
        "Are you sure you want to delete this category?"
      );

    if (!confirmed)
      return;


    try {

      await deleteCategory(id);

      if (editingId === id) {

        cancelEdit();

      }

      await loadCategories();

    } catch (error) {

      console.error(
        "Category Delete Error:",
        error
      );

      alert(
        "Failed to delete category"
      );

    }

  }


  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div>

        <h1
          className="
            text-2xl
            sm:text-3xl
            font-bold
            text-zinc-900
          "
        >
          Categories
        </h1>

        <p
          className="
            text-sm
            text-zinc-500
            mt-1
          "
        >
          Create, update and manage
          your news categories.
        </p>

      </div>


      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          p-4
          sm:p-6
          shadow-sm
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            mb-5
          "
        >

          <h2
            className="
              text-lg
              font-bold
              text-zinc-900
            "
          >
            {editingId
              ? "Edit Category"
              : "Add Category"}
          </h2>


          {editingId && (

            <button
              type="button"
              onClick={cancelEdit}
              className="
                text-sm
                font-semibold
                text-zinc-500
                hover:text-zinc-900
              "
            >
              Cancel
            </button>

          )}

        </div>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >

          {/* NAME */}

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-zinc-700
                mb-2
              "
            >
              Category Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Politics"
              className="
                w-full
                border
                border-zinc-200
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
              "
            />

          </div>


          {/* HINDI NAME */}

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-zinc-700
                mb-2
              "
            >
              Hindi Name
            </label>

            <input
              name="nameHi"
              value={form.nameHi}
              onChange={handleChange}
              placeholder="राजनीति"
              className="
                w-full
                border
                border-zinc-200
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
              "
            />

          </div>


          {/* SLUG */}

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-zinc-700
                mb-2
              "
            >
              Slug
            </label>

            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="politics"
              className="
                w-full
                border
                border-zinc-200
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
              "
            />

          </div>


          {/* STATUS */}

          <div>

            <label
              className="
                block
                text-sm
                font-semibold
                text-zinc-700
                mb-2
              "
            >
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="
                w-full
                border
                border-zinc-200
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-100
                bg-white
              "
            >

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>


        {/* SAVE */}

        <button
          type="submit"
          disabled={saving}
          className="
            mt-5
            w-full
            sm:w-auto
            bg-red-600
            hover:bg-red-700
            disabled:opacity-50
            text-white
            font-semibold
            px-6
            py-3
            rounded-xl
            transition
          "
        >

          {saving
            ? "Saving..."
            : editingId
              ? "Update Category"
              : "Add Category"}

        </button>

      </form>


      {/* CATEGORY LIST */}

      <div
        className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        "
      >

        <div
          className="
            px-4
            sm:px-6
            py-4
            border-b
            border-zinc-200
            flex
            items-center
            justify-between
          "
        >

          <h2
            className="
              font-bold
              text-lg
            "
          >
            All Categories
          </h2>

          <span
            className="
              text-sm
              text-zinc-500
            "
          >
            {categories.length} categories
          </span>

        </div>


        {loading ? (

          <div
            className="
              p-8
              text-center
              text-zinc-500
            "
          >
            Loading categories...
          </div>

        ) : categories.length === 0 ? (

          <div
            className="
              p-8
              text-center
              text-zinc-500
            "
          >
            No categories found.
          </div>

        ) : (

          <div className="divide-y">

            {categories.map(
              category => (

                <div
                  key={category.id}
                  className="
                    p-4
                    sm:px-6
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    justify-between
                    gap-4
                  "
                >

                  <div
                    className="
                      min-w-0
                    "
                  >

                    <h3
                      className="
                        font-bold
                        text-zinc-900
                        truncate
                      "
                    >
                      {category.name}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-zinc-500
                        mt-1
                      "
                    >
                      {category.nameHi}
                      {" • "}
                      /{category.slug}
                    </p>

                  </div>


                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      shrink-0
                    "
                  >

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        ${
                          category.status ===
                          "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-600"
                        }
                      `}
                    >
                      {category.status}
                    </span>


                    <button
                      onClick={() =>
                        handleEdit(
                          category
                        )
                      }
                      className="
                        px-3
                        py-2
                        rounded-lg
                        bg-blue-50
                        text-blue-600
                        font-semibold
                        text-sm
                        hover:bg-blue-100
                      "
                    >
                      Edit
                    </button>


                    <button
                      onClick={() =>
                        handleDelete(
                          category.id
                        )
                      }
                      className="
                        px-3
                        py-2
                        rounded-lg
                        bg-red-50
                        text-red-600
                        font-semibold
                        text-sm
                        hover:bg-red-100
                      "
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}

