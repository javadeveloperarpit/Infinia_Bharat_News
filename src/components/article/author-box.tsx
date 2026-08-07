"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  article: any;
}

export default function AuthorBox({ article }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [showFloating, setShowFloating] = useState(false);

  const name = article.author?.name || "INFINIA BHARAT NEWS";
  const email = article.author?.email || "news@infiniabharatnews.com";

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloating(!entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Floating Avatar - Desktop */}
      {showFloating && (
        <div
          className="
            hidden
            lg:flex
            fixed
            top-[430px]
            left-10
            z-40
          "
        >
          <div
            className="
              w-12
              h-12
              rounded-full
              bg-red-600
              text-white
              flex
              items-center
              justify-center
              font-bold
              shadow-xl
              ring-4
              ring-white
            "
            title={name}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Floating Avatar - Mobile */}
      {showFloating && (
        <div
          className="
            lg:hidden
            fixed
            top-[170px]
            right-10
            z-50
          "
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              bg-red-600
              text-white
              flex
              items-center
              justify-center
              font-bold
              shadow-xl
              ring-2
              ring-white
            "
            title={name}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {/* Original Author Card */}
      <div
        ref={ref}
        className="
          mt-10
          w-fit
          max-w-sm
          border
          rounded-2xl
          bg-white
          shadow-sm
          p-4
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              w-12
              h-12
              rounded-full
              bg-red-600
              text-white
              flex
              items-center
              justify-center
              font-bold
              text-lg
              shrink-0
            "
          >
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate">
              {name}
            </h3>

            <p className="text-xs text-zinc-500 truncate">
              {email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}