"use client";

import {
useEffect,
useState,
} from "react";

import {
useRouter,
} from "next/navigation";

import {
createVideo,
} from "@/services/video.service";

import {
getCategories,
} from "@/services/category.service";

export default function CreateVideo() {

const router =
useRouter();

const [categories, setCategories] =
useState<any[]>([]);

const [loading, setLoading] =
useState(false);

const [form, setForm] = useState({

title: "",

youtubeUrl: "",

categoryId: "",

description: "",

status: "draft",


});

useEffect(() => {

async function loadCategories() {

  try {

    const data =
      await getCategories();

    setCategories(data);

  }
  catch (error) {

    console.error(
      "Categories Error:",
      error
    );

  }

}


loadCategories();

}, []);

function change(
e: React.ChangeEvent<
HTMLInputElement |
HTMLTextAreaElement |
HTMLSelectElement
>
) {

const {
  name,
  value,
} = e.target;


setForm((prev) => ({

  ...prev,

  [name]: value,

}));

}

async function save() {


try {

  if (!form.title.trim()) {

    alert(
      "Please enter video title"
    );

    return;

  }


  if (!form.youtubeUrl.trim()) {

    alert(
      "Please enter YouTube URL"
    );

    return;

  }


  if (!form.categoryId) {

    alert(
      "Please select a category"
    );

    return;

  }


  setLoading(true);


  await createVideo(
    form as any
  );


  alert(
    "Video Added Successfully"
  );


  router.push(
    "/admin/videos"
  );

}
catch (error: any) {

  console.error(
    "Create Video Error:",
    error
  );

  alert(
    error?.message ||
    "Failed to add video"
  );

}
finally {

  setLoading(false);

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
    gap-3
    sm:flex-row
    sm:items-center
    sm:justify-between
  ">

    <div>

      <h1 className="
        text-2xl
        sm:text-3xl
        font-bold
        text-zinc-900
      ">

        Create Video

      </h1>

      <p className="
        mt-1
        text-sm
        text-zinc-500
      ">

        Add a YouTube video to your website

      </p>

    </div>


    <button
      type="button"
      onClick={() =>
        router.push(
          "/admin/videos"
        )
      }
      className="
        w-full
        sm:w-auto
        rounded-lg
        border
        border-zinc-200
        bg-white
        px-4
        py-2.5
        text-sm
        font-semibold
        text-zinc-700
        hover:bg-zinc-50
      "
    >

      Cancel

    </button>

  </div>


  {/* FORM CARD */}

  <div className="
    w-full
    min-w-0
    rounded-xl
    border
    border-zinc-200
    bg-white
    p-4
    shadow-sm
    sm:p-6
    lg:p-8
  ">


    <div className="
      grid
      grid-cols-1
      gap-6
    ">


      {/* TITLE */}

      <div>

        <label className="
          mb-2
          block
          text-sm
          font-semibold
          text-zinc-800
        ">

          Video Title

        </label>

        <input
          type="text"
          name="title"
          value={
            form.title
          }
          onChange={change}
          placeholder="Enter video title"
          className="
            w-full
            min-w-0
            rounded-lg
            border
            border-zinc-200
            px-3
            py-3
            text-sm
            outline-none
            transition
            focus:border-red-500
            focus:ring-2
            focus:ring-red-500/10
          "
        />

      </div>


      {/* YOUTUBE URL */}

      <div>

        <label className="
          mb-2
          block
          text-sm
          font-semibold
          text-zinc-800
        ">

          YouTube URL

        </label>

        <input
          type="url"
          name="youtubeUrl"
          value={
            form.youtubeUrl
          }
          onChange={change}
          placeholder="
            https://www.youtube.com/watch?v=...
          "
          className="
            w-full
            min-w-0
            rounded-lg
            border
            border-zinc-200
            px-3
            py-3
            text-sm
            outline-none
            focus:border-red-500
            focus:ring-2
            focus:ring-red-500/10
          "
        />

        <p className="
          mt-2
          text-xs
          text-zinc-500
        ">

          Paste the normal YouTube video URL.

        </p>

      </div>


      {/* CATEGORY */}

      <div>

        <label className="
          mb-2
          block
          text-sm
          font-semibold
          text-zinc-800
        ">

          Category

        </label>

        <select
          name="categoryId"
          value={
            form.categoryId
          }
          onChange={change}
          className="
            w-full
            min-w-0
            rounded-lg
            border
            border-zinc-200
            bg-white
            px-3
            py-3
            text-sm
            outline-none
            focus:border-red-500
            focus:ring-2
            focus:ring-red-500/10
          "
        >

          <option value="">
            Select Category
          </option>

          {categories.map(
            (category) => (

              <option
                key={category.id}
                value={category.id}
              >

                {category.name}

              </option>

            )
          )}

        </select>

      </div>


      {/* DESCRIPTION */}

      <div>

        <label className="
          mb-2
          block
          text-sm
          font-semibold
          text-zinc-800
        ">

          Description

        </label>

        <textarea
          name="description"
          value={
            form.description
          }
          onChange={change}
          rows={6}
          placeholder="
            Write a description for this video...
          "
          className="
            w-full
            min-w-0
            resize-y
            rounded-lg
            border
            border-zinc-200
            px-3
            py-3
            text-sm
            leading-6
            outline-none
            focus:border-red-500
            focus:ring-2
            focus:ring-red-500/10
          "
        />

      </div>


      {/* STATUS */}

      <div>

        <label className="
          mb-2
          block
          text-sm
          font-semibold
          text-zinc-800
        ">

          Status

        </label>

        <select
          name="status"
          value={
            form.status
          }
          onChange={change}
          className="
            w-full
            rounded-lg
            border
            border-zinc-200
            bg-white
            px-3
            py-3
            text-sm
            outline-none
            focus:border-red-500
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


      {/* ACTIONS */}

      <div className="
        flex
        flex-col-reverse
        gap-3
        border-t
        border-zinc-100
        pt-6
        sm:flex-row
        sm:justify-end
      ">

        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/videos"
            )
          }
          className="
            w-full
            rounded-lg
            border
            border-zinc-200
            bg-white
            px-6
            py-3
            text-sm
            font-semibold
            text-zinc-700
            hover:bg-zinc-50
            sm:w-auto
          "
        >

          Cancel

        </button>


        <button
          type="button"
          disabled={loading}
          onClick={save}
          className="
            w-full
            rounded-lg
            bg-red-600
            px-6
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-red-700
            disabled:cursor-not-allowed
            disabled:opacity-60
            sm:w-auto
          "
        >

          {loading
            ? "Adding Video..."
            : "Add Video"
          }

        </button>

      </div>

    </div>

  </div>

</div>

);

}
