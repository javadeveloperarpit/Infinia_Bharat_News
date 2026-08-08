
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createAd,
  getAds,
  deleteAd,
} from "@/services/ads.service";

export default function AdsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "",
    position: "homepage_top",
    active: true,
  });

  async function loadAds() {
    try {
      setLoading(true);

      const data = await getAds();

      setAds(data || []);
    } catch (error) {
      console.error("Ads Load Error:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  function handleChange(e: any) {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function saveAd() {
    if (!form.title.trim()) {
      alert("Please enter ad title.");
      return;
    }

    if (!form.image.trim()) {
      alert("Please enter ad image URL.");
      return;
    }

    try {
      setSaving(true);

      await createAd(form);

      alert("Advertisement Added Successfully");

      setForm({
        title: "",
        image: "",
        link: "",
        position: "homepage_top",
        active: true,
      });

      await loadAds();
    } catch (error) {
      console.error("Ad Create Error:", error);
      alert("Failed to add advertisement.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this advertisement?"
    );

    if (!confirmed) return;

    try {
      await deleteAd(id);

      await loadAds();
    } catch (error) {
      console.error("Ad Delete Error:", error);
      alert("Failed to delete advertisement.");
    }
  }

  return (
    <div className="w-full max-w-6xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Ads Management
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create and manage advertisements across the website.
        </p>
      </div>

      {/* CREATE AD */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4 sm:p-6">

        <h2 className="text-lg font-bold text-zinc-900 mb-5">
          Create Advertisement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* TITLE */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Ad Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Advertisement Title"
              className="
                w-full
                border
                border-zinc-300
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/10
              "
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Image URL
            </label>

            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/ad.jpg"
              className="
                w-full
                border
                border-zinc-300
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/10
              "
            />
          </div>

          {/* LINK */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Advertisement Link
            </label>

            <input
              name="link"
              value={form.link}
              onChange={handleChange}
              placeholder="https://example.com"
              className="
                w-full
                border
                border-zinc-300
                rounded-lg
                px-4
                py-3
                text-sm
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/10
              "
            />
          </div>

          {/* POSITION */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Advertisement Position
            </label>

            <select
              name="position"
              value={form.position}
              onChange={handleChange}
              className="
                w-full
                border
                border-zinc-300
                rounded-lg
                px-4
                py-3
                text-sm
                bg-white
                outline-none
                focus:border-red-500
                focus:ring-2
                focus:ring-red-500/10
              "
            >
              <option value="homepage_top">
                Homepage Top
              </option>

              <option value="homepage_middle">
                Homepage Middle
              </option>

              <option value="article_between">
                Article Between
              </option>

              <option value="sidebar">
                Sidebar
              </option>
            </select>
          </div>

          {/* ACTIVE */}
          <div className="flex items-center md:pt-7">

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="
                  w-5
                  h-5
                  accent-red-600
                  cursor-pointer
                "
              />

              <span className="text-sm font-semibold text-zinc-700">
                Active Advertisement
              </span>

            </label>

          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={saveAd}
          disabled={saving}
          className="
            mt-6
            w-full
            sm:w-auto
            bg-red-600
            hover:bg-red-700
            disabled:bg-zinc-300
            disabled:cursor-not-allowed
            text-white
            px-6
            py-3
            rounded-lg
            font-semibold
            text-sm
            transition
          "
        >
          {saving
            ? "Adding Advertisement..."
            : "Add Advertisement"}
        </button>

      </div>

      {/* ADS LIST */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">

        <div className="px-4 sm:px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">
            Advertisements
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-zinc-500">
            Loading advertisements...
          </div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No advertisements found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">

            {ads.map((ad) => (
              <div
                key={ad.id}
                className="
                  p-4
                  sm:p-5
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-4
                "
              >

                {/* AD INFO */}
                <div className="min-w-0">

                  <h3 className="font-bold text-zinc-900 break-words">
                    {ad.title}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">

                    <span className="
                      inline-flex
                      items-center
                      px-3
                      py-1
                      rounded-full
                      bg-zinc-100
                      text-zinc-700
                      text-xs
                      font-semibold
                    ">
                      {ad.position}
                    </span>

                    <span
                      className={`
                        inline-flex
                        items-center
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-semibold
                        ${
                          ad.active
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500"
                        }
                      `}
                    >
                      {ad.active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

                {/* ACTION */}
                <button
                  onClick={() => remove(ad.id)}
                  className="
                    w-full
                    sm:w-auto
                    shrink-0
                    border
                    border-red-200
                    text-red-600
                    hover:bg-red-50
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    font-semibold
                    transition
                  "
                >
                  Delete
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}
