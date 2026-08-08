"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createBreakingNews,
  getBreakingNews,
  deleteBreakingNews,
} from "@/services/breaking.service";

export default function BreakingNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);

      const data = await getBreakingNews();

      setNews(data || []);
    } catch (error) {
      console.error("Breaking News Load Error:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    if (!text.trim()) return;

    try {
      await createBreakingNews({
        text: text.trim(),
        active: true,
        expiry: "24h",
        id: "",
      });

      setText("");
      await load();
    } catch (error) {
      console.error("Breaking News Add Error:", error);
      alert("Failed to add breaking news.");
    }
  }

  async function removeNews(id: string) {
    const confirmed = confirm(
      "Are you sure you want to delete this breaking news?"
    );

    if (!confirmed) return;

    try {
      await deleteBreakingNews(id);
      await load();
    } catch (error) {
      console.error("Breaking News Delete Error:", error);
      alert("Delete failed.");
    }
  }

  return (
    <div className="w-full max-w-5xl space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Breaking News
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage live breaking news alerts.
        </p>
      </div>

      {/* ADD BOX */}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                add();
              }
            }}
            placeholder="Enter breaking news headline..."
            className="
              w-full
              min-w-0
              border
              border-zinc-300
              rounded-lg
              px-4
              py-3
              text-sm
              text-zinc-900
              outline-none
              focus:border-red-500
              focus:ring-2
              focus:ring-red-500/10
            "
          />

          <button
            onClick={add}
            disabled={!text.trim()}
            className="
              w-full
              sm:w-auto
              shrink-0
              bg-red-600
              hover:bg-red-700
              disabled:bg-zinc-300
              disabled:cursor-not-allowed
              text-white
              px-5
              py-3
              rounded-lg
              font-semibold
              text-sm
              transition
            "
          >
            Add Breaking News
          </button>

        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">

        <div className="px-4 sm:px-6 py-4 border-b border-zinc-200">
          <h2 className="font-bold text-lg text-zinc-900">
            Active Breaking News
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-zinc-500">
            Loading breaking news...
          </div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            No breaking news found.
          </div>
        ) : (
          <div className="divide-y divide-zinc-200">

            {news.map((item) => (
              <div
                key={item.id}
                className="
                  p-4
                  sm:p-5
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
                "
              >

                {/* NEWS TEXT */}
                <div className="flex items-start gap-3 min-w-0">

                  <span
                    className="
                      mt-1.5
                      shrink-0
                      w-2
                      h-2
                      rounded-full
                      bg-red-600
                      animate-pulse
                    "
                  />

                  <p
                    className="
                      text-sm
                      sm:text-base
                      font-medium
                      text-zinc-800
                      leading-6
                      break-words
                    "
                  >
                    {item.text}
                  </p>

                </div>

                {/* DELETE */}
                <button
                  onClick={() => removeNews(item.id)}
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