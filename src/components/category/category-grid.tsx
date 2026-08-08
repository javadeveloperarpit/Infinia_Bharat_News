"use client";

import { useState } from "react";

import NewsCard from "@/components/home/news-card";

export default function CategoryGrid({
  articles,
}: {
  articles: any[];
}) {
  const [visible, setVisible] = useState(18);

  const items = articles?.slice(0, visible) || [];

  return (
    <div className="w-full min-w-0">

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-3
          gap-4
          md:gap-5
          w-full
          min-w-0
        "
      >
        {items.map((item: any) => (
          <div
            key={item.id}
            className="w-full min-w-0"
          >
            <NewsCard
              article={{
                ...item,
                slug: item.slug,
              }}
            />
          </div>
        ))}
      </div>

      {visible < articles.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() =>
              setVisible((prev) => prev + 18)
            }
            className="
              px-8
              py-3
              rounded-full
              bg-red-600
              text-white
              font-bold
              hover:bg-red-700
              transition
            "
          >
            Load More
          </button>
        </div>
      )}

    </div>
  );
}

