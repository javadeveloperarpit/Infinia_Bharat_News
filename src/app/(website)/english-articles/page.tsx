import type { Metadata } from "next";
import Link from "next/link";

import {
  getCategories,
} from "@/services/public/category.public.service";

import {
  getPublishedArticles,
} from "@/services/public/article.public.service";


export const metadata: Metadata = {
  title: "English News Categories | Infinia Bharat News",
  description:
    "Explore English news categories including India, World, Politics, Business, Sports, Technology, Entertainment, Health, Science, Education, Lifestyle, Auto and Viral news.",
  alternates: {
    canonical: "/english-articles",
  },
};


// ============================================================
// CATEGORY ARTWORK
// ============================================================

const categoryData: Record<
  string,
  {
    image: string;
    description: string;
  }
> = {

  "english-india": {
    image: "/images/english-categories/india.png",
    description:
      "Latest developments, national affairs and major stories from across India.",
  },

  "english-world": {
    image: "/images/english-categories/world.png",
    description:
      "International affairs and important stories from around the world.",
  },

  "english-politics": {
    image: "/images/english-categories/politics.png",
    description:
      "Government, elections, political leaders and policy developments.",
  },

  "english-business": {
    image: "/images/english-categories/business.png",
    description:
      "Markets, economy, companies, finance and business developments.",
  },

  "english-sports": {
    image: "/images/english-categories/sports.png",
    description:
      "Matches, players, tournaments, records and sporting stories.",
  },

  "english-entertainment": {
    image: "/images/english-categories/entertainment.png",
    description:
      "Movies, television, music, celebrities and entertainment stories.",
  },

  "english-technology": {
    image: "/images/english-categories/technology.png",
    description:
      "AI, gadgets, apps, startups and technology developments.",
  },

  "english-health": {
    image: "/images/english-categories/health.png",
    description:
      "Health, wellness, medical developments and healthcare stories.",
  },

  "english-science": {
    image: "/images/english-categories/science.png",
    description:
      "Scientific discoveries, research, space and breakthrough developments.",
  },

  "english-education": {
    image: "/images/english-categories/education.png",
    description:
      "Exams, results, universities, careers and education updates.",
  },

  "english-lifestyle": {
    image: "/images/english-categories/lifestyle.png",
    description:
      "Travel, food, fashion, culture, wellness and modern living.",
  },

  "english-auto": {
    image: "/images/english-categories/auto.png",
    description:
      "Cars, bikes, EVs, launches, reviews and automobile news.",
  },

  "english-viral": {
    image: "/images/english-categories/viral.png",
    description:
      "Trending stories, internet sensations and viral moments.",
  },

};


// ============================================================
// PAGE
// ============================================================

export default async function EnglishArticlesPage() {

  const [
    categories,
    articles,
  ] = await Promise.all([
    getCategories(),
    getPublishedArticles(),
  ]);


  // ==========================================================
  // ENGLISH CATEGORIES
  // ==========================================================

  const englishCategories =
    categories.filter((category) => {

      const slug =
        String(category.slug || "")
          .trim()
          .toLowerCase();

      const name =
        String(category.name || "")
          .trim()
          .toLowerCase();

      return (
        category.status === "active" &&
        (
          slug.startsWith("english-") ||
          name.startsWith("english ")
        )
      );

    });


  // ==========================================================
  // ARTICLE COUNTS
  // ==========================================================

  const articleCounts =
    new Map<string, number>();


  articles.forEach((article) => {

    if (!article.categoryId) {
      return;
    }

    articleCounts.set(
      article.categoryId,
      (articleCounts.get(article.categoryId) || 0) + 1
    );

  });


  // ==========================================================
  // DYNAMIC CHAKRA GEOMETRY
  // ==========================================================

  const total =
    Math.max(englishCategories.length, 1);

  const angle =
    360 / total;


  const center = 500;

  const outerRadius = 455;

  const innerRadius = 105;


  const gap =
    Math.min(
      angle * 0.10,
      4
    );


  const halfAngle =
    Math.max(
      1,
      (angle - gap) / 2
    );


  // ==========================================================
  // POLAR → SVG
  // ==========================================================

  const pointOnCircle = (
    radius: number,
    degrees: number
  ) => {

    const radians =
      (degrees * Math.PI) / 180;

    return {
      x:
        center +
        radius *
          Math.cos(radians),

      y:
        center +
        radius *
          Math.sin(radians),
    };

  };


  return (

    <main
      className="
        min-h-screen
        bg-white
        text-[#111]
      "
    >


      {/* ======================================================
          CATEGORY WHEEL
      ====================================================== */}

      <section
        className="
          container-news
          px-4
          py-8
          md:py-12
        "
      >

        <div className="mb-6">

          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-[#151515]
            "
          >
            English Categories
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-zinc-500
            "
          >
            Choose a section to explore the latest stories.
          </p>

        </div>


        {/* ====================================================
            DESKTOP / LARGE WHEEL
        ==================================================== */}

        <div
          className="
            relative
            mx-auto
            hidden
            aspect-square
            w-full
            max-w-[920px]
            lg:block
          "
        >


          {/* ==================================================
              MULTI-COLOR OUTER GLOW
          ================================================== */}

          <div
            className="
              absolute
              inset-[1%]
              rounded-full
              opacity-75
              blur-[8px]
            "
            style={{
              background:
                "conic-gradient(from 0deg, #ff004c, #ff7a00, #ffd600, #00e5ff, #7c3cff, #ff006e, #ff004c)",
            }}
          />


          {/* ==================================================
              CLEAN RED OUTER RING
          ================================================== */}

          <div
            className="
              absolute
              inset-[2%]
              rounded-full
              border-[4px]
              border-[#d71920]
              bg-white
            "
          />


          {/* ==================================================
              SUBTLE COLOR RING
          ================================================== */}

          <div
            className="
              absolute
              inset-[3.1%]
              rounded-full
              border-[2px]
            "
            style={{
              borderColor:
                "transparent",

              background:
                "linear-gradient(white, white) padding-box, conic-gradient(#ff004c, #ff9d00, #ffe600, #00d9ff, #7c3cff, #ff004c) border-box",
            }}
          />


          {/* ==================================================
              SVG TRIANGLE SYSTEM
          ================================================== */}

          <div
            className="
              absolute
              inset-[4.5%]
            "
          >

            <svg
              viewBox="0 0 1000 1000"
              className="
                h-full
                w-full
                overflow-visible
              "
              aria-label="English news categories"
            >


              {/* =================================================
                  CATEGORY TRIANGLES
              ================================================= */}

              {englishCategories.map((category, index) => {

                const startAngle =
                  -90 +
                  index * angle +
                  gap / 2;


                const endAngle =
                  -90 +
                  (index + 1) * angle -
                  gap / 2;


                const outerLeft =
                  pointOnCircle(
                    outerRadius,
                    startAngle
                  );


                const outerRight =
                  pointOnCircle(
                    outerRadius,
                    endAngle
                  );


                const points = `
                  ${center},${center}
                  ${outerLeft.x},${outerLeft.y}
                  ${outerRight.x},${outerRight.y}
                `;


                const slug =
                  String(category.slug || "")
                    .trim()
                    .toLowerCase();


                const data =
                  categoryData[slug];


                const displayName =
                  category.name.replace(
                    /^English\s*/i,
                    ""
                  );


                const count =
                  articleCounts.get(
                    category.id
                  ) || 0;


                const textAngle =
                  -90 +
                  index * angle +
                  angle / 2;


                const textPoint =
                  pointOnCircle(
                    outerRadius * 0.73,
                    textAngle
                  );


                return (

                  <Link
                    key={category.id}
                    href={`/category/${slug}`}
                    className="group"
                  >

                    <g
                      className="
                        category-triangle
                        cursor-pointer
                      "
                      style={{
                        animationDelay:
                          `${Math.min(
                            index * 0.10,
                            1.8
                          )}s`,
                      }}
                    >


                      {/* ==========================================
                          TRIANGLE
                      ========================================== */}

                      <polygon
                        points={points}
                        fill="white"
                        stroke="url(#categoryGradient)"
                        strokeWidth="4"
                        vectorEffect="non-scaling-stroke"
                        className="
                          transition-all
                          duration-300
                          group-hover:stroke-[#d71920]
                        "
                      />


                      {/* ==========================================
                          CATEGORY IMAGE
                      ========================================== */}

                      {data?.image && (

                        <>

                          <defs>

                            <clipPath
                              id={`triangleClip-${category.id}`}
                            >

                              <polygon
                                points={points}
                              />

                            </clipPath>

                          </defs>


                          <image
                            href={data.image}
                            x="0"
                            y="0"
                            width="1000"
                            height="1000"
                            preserveAspectRatio="xMidYMid slice"
                            clipPath={`url(#triangleClip-${category.id})`}
                            opacity="0.72"
                            className="
                              pointer-events-none
                              transition-all
                              duration-500
                              group-hover:opacity-100
                            "
                          />

                        </>

                      )}


                      {/* ==========================================
                          GLASS COLOR OVERLAY
                      ========================================== */}

                      <polygon
                        points={points}
                        fill="url(#triangleGradient)"
                        opacity="0.12"
                        className="
                          pointer-events-none
                        "
                      />


                      {/* ==========================================
                          CATEGORY TEXT BASE
                      ========================================== */}

                      <polygon
                        points={`
                          ${outerLeft.x},${outerLeft.y}
                          ${outerRight.x},${outerRight.y}

                          ${center +
                            (outerLeft.x - center) * 0.48},
                          ${center +
                            (outerLeft.y - center) * 0.48}

                          ${center +
                            (outerRight.x - center) * 0.48},
                          ${center +
                            (outerRight.y - center) * 0.48}
                        `}
                        fill="white"
                        opacity="0.58"
                        className="
                          pointer-events-none
                        "
                      />

                    </g>


                    {/* ==========================================
                        CATEGORY LABEL
                    ========================================== */}

                    <g
                      className="
                        category-label
                        pointer-events-none
                      "
                      style={{
                        animationDelay:
                          `${Math.min(
                            index * 0.10 + 0.15,
                            1.9
                          )}s`,
                      }}
                    >

                      <foreignObject
                        x={textPoint.x - 90}
                        y={textPoint.y - 40}
                        width="180"
                        height="90"
                      >

                        <div
                          className="
                            flex
                            h-full
                            w-full
                            flex-col
                            items-center
                            justify-center
                            text-center
                          "
                        >

                          <span
                            className="
                              rounded-full
                              bg-white/90
                              px-2
                              py-[3px]
                              text-[7px]
                              font-bold
                              uppercase
                              tracking-[0.14em]
                              text-[#d71920]
                              shadow-sm
                            "
                          >
                            {slug
                              .replace(
                                "english-",
                                ""
                              )
                              .toUpperCase()}
                          </span>


                          <span
                            className="
                              mt-1
                              text-[14px]
                              font-black
                              leading-tight
                              text-[#111]
                              drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]
                            "
                          >
                            {displayName}
                          </span>


                          <span
                            className="
                              mt-1
                              text-[7px]
                              font-semibold
                              text-zinc-600
                            "
                          >
                            {count}{" "}
                            {count === 1
                              ? "Article"
                              : "Articles"}
                          </span>

                        </div>

                      </foreignObject>

                    </g>

                  </Link>

                );

              })}


              {/* ==================================================
                  GRADIENT DEFINITIONS
              ================================================== */}

              <defs>

                <linearGradient
                  id="triangleGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >

                  <stop
                    offset="0%"
                    stopColor="#ff004c"
                  />

                  <stop
                    offset="45%"
                    stopColor="#ff8a00"
                  />

                  <stop
                    offset="100%"
                    stopColor="#7c3cff"
                  />

                </linearGradient>


                <linearGradient
                  id="categoryGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >

                  <stop
                    offset="0%"
                    stopColor="#d71920"
                  />

                  <stop
                    offset="35%"
                    stopColor="#ff7a00"
                  />

                  <stop
                    offset="65%"
                    stopColor="#00d9ff"
                  />

                  <stop
                    offset="100%"
                    stopColor="#7c3cff"
                  />

                </linearGradient>

              </defs>

            </svg>

          </div>


          {/* ============================================================
              PREMIUM ROTATING CD / VINYL HOME DISC

              ONLY .cd-disc ROTATES.
              HOME HUB BELOW IS STATIC.
          ============================================================ */}

          <Link
            href="/"
            aria-label="Go to Home"
            className="
              absolute
              left-1/2
              top-1/2
              z-30
              h-[220px]
              w-[220px]
              -translate-x-1/2
              -translate-y-1/2
              cursor-pointer
              rounded-full
              group
            "
          >

            {/* ======================================================
                PREMIUM OUTER AURA
            ====================================================== */}

            <div
              className="
                absolute
                -inset-[9px]
                rounded-full
                opacity-75
                blur-[10px]
                transition-all
                duration-500
                group-hover:opacity-100
                group-hover:blur-[14px]
              "
              style={{
                background:
                  "conic-gradient(from 0deg, #d71920, #ff7a00, #ffd600, #00d9ff, #7c3cff, #d71920)",
              }}
            />


            {/* ======================================================
                PREMIUM OUTER BORDER
            ====================================================== */}

            <div
              className="
                absolute
                -inset-[3px]
                rounded-full
                border
                border-white/70
                bg-white/10
                shadow-[0_15px_50px_rgba(0,0,0,0.28)]
              "
            />


            {/* ======================================================
                ROTATING DISC

                ONLY THIS DIV HAS .cd-disc
            ====================================================== */}

            <div
              className="
                relative
                h-full
                w-full
                overflow-hidden
                rounded-full
                border
                border-white/30
                shadow-[0_15px_50px_rgba(0,0,0,0.38)]
                cd-disc
              "
              style={{
                background: `
                  radial-gradient(
                    circle at 50% 50%,
                    #202020 0%,
                    #090909 10%,
                    #181818 11%,
                    #040404 25%,
                    #171717 26%,
                    #050505 40%,
                    #151515 41%,
                    #030303 56%,
                    #141414 57%,
                    #020202 72%,
                    #111111 73%,
                    #020202 100%
                  )
                `,
              }}
            >

              {/* ==================================================
                  RAINBOW VINYL REFLECTION
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  rounded-full
                  opacity-75
                  mix-blend-screen
                "
                style={{
                  background: `
                    conic-gradient(
                      from 10deg,
                      transparent 0deg,
                      rgba(255,0,70,.45) 30deg,
                      transparent 60deg,
                      rgba(255,160,0,.28) 90deg,
                      transparent 125deg,
                      rgba(0,220,255,.38) 155deg,
                      transparent 195deg,
                      rgba(120,50,255,.40) 235deg,
                      transparent 275deg,
                      rgba(255,0,110,.40) 315deg,
                      transparent 350deg,
                      rgba(255,0,70,.45) 360deg
                    )
                  `,
                }}
              />


              {/* ==================================================
                  VINYL GROOVES
              ================================================== */}

              <div className="
                pointer-events-none
                absolute
                inset-[4%]
                rounded-full
                border
                border-white/[0.09]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[8%]
                rounded-full
                border
                border-white/[0.065]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[12%]
                rounded-full
                border
                border-white/[0.055]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[17%]
                rounded-full
                border
                border-white/[0.07]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[23%]
                rounded-full
                border
                border-white/[0.055]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[30%]
                rounded-full
                border
                border-white/[0.065]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[37%]
                rounded-full
                border
                border-white/[0.05]
              " />

              <div className="
                pointer-events-none
                absolute
                inset-[44%]
                rounded-full
                border
                border-white/[0.045]
              " />


              {/* ==================================================
                  PREMIUM LIGHT REFLECTION
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-[8%]
                  top-[5%]
                  h-[36%]
                  w-[24%]
                  rotate-[28deg]
                  rounded-full
                  bg-white/[0.15]
                  blur-[11px]
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  bottom-[9%]
                  right-[7%]
                  h-[23%]
                  w-[20%]
                  rounded-full
                  bg-cyan-300/[0.08]
                  blur-[13px]
                "
              />


              {/* ==================================================
                  OUTER VINYL HIGHLIGHT
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-[2%]
                  rounded-full
                  border
                  border-white/[0.12]
                "
              />

            </div>


            {/* ============================================================
                STATIC PREMIUM HOME HUB

                IMPORTANT:
                This is OUTSIDE .cd-disc,
                therefore it NEVER ROTATES.
            ============================================================ */}

            <div
              className="
                absolute
                left-1/2
                top-1/2
                z-40
                flex
                h-[88px]
                w-[88px]
                -translate-x-1/2
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/30
                bg-gradient-to-br
                from-[#f02a32]
                via-[#b51219]
                to-[#52070a]
                shadow-[0_5px_25px_rgba(0,0,0,0.58),inset_0_1px_2px_rgba(255,255,255,0.35)]
                transition-all
                duration-500
                group-hover:scale-[1.04]
                group-hover:shadow-[0_7px_32px_rgba(215,25,32,0.48),inset_0_1px_2px_rgba(255,255,255,0.45)]
              "
            >

              {/* ==================================================
                  INNER PREMIUM HUB
              ================================================== */}

              <div
                className="
                  relative
                  flex
                  h-[74px]
                  w-[74px]
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-white/20
                  bg-gradient-to-br
                  from-[#e1262d]/95
                  via-[#a40f15]/95
                  to-[#390407]/95
                  text-center
                  shadow-[inset_0_2px_8px_rgba(255,255,255,0.16),inset_0_-5px_12px_rgba(0,0,0,0.32)]
                "
              >

                {/* ==================================================
                    GLASS HIGHLIGHT
                ================================================== */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    left-[12%]
                    top-[7%]
                    h-[32%]
                    w-[55%]
                    rotate-[-18deg]
                    rounded-full
                    bg-white/[0.16]
                    blur-[5px]
                  "
                />


                {/* ==================================================
                    INFINIA
                ================================================== */}

                <span
                  className="
                    relative
                    z-10
                    text-[6px]
                    font-bold
                    uppercase
                    tracking-[0.38em]
                    text-white/65
                  "
                >
                  INFINIA
                </span>


                {/* ==================================================
                    HOME
                ================================================== */}

                <span
                  className="
                    relative
                    z-10
                    mt-[2px]
                    text-[20px]
                    font-black
                    uppercase
                    leading-none
                    tracking-[-0.06em]
                    text-white
                    drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]
                  "
                >
                  HOME
                </span>


                {/* ==================================================
                    PREMIUM DIVIDER
                ================================================== */}

                <span
                  className="
                    relative
                    z-10
                    mt-[5px]
                    h-[2px]
                    w-8
                    rounded-full
                    bg-gradient-to-r
                    from-transparent
                    via-white/90
                    to-transparent
                  "
                />


                {/* ==================================================
                    NEWS HUB
                ================================================== */}

                <span
                  className="
                    relative
                    z-10
                    mt-[4px]
                    text-[5px]
                    font-semibold
                    uppercase
                    tracking-[0.28em]
                    text-white/55
                  "
                >
                  NEWS HUB
                </span>

              </div>


              {/* ==================================================
                  SUBTLE STATIC HUB RING
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-[3px]
                  rounded-full
                  border
                  border-white/[0.10]
                "
              />

            </div>

          </Link>

        </div>


        {/* ====================================================
            MOBILE / TABLET
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            lg:hidden
            sm:grid-cols-3
          "
        >

          {englishCategories.map(
            (category) => {

              const slug =
                String(
                  category.slug || ""
                )
                  .trim()
                  .toLowerCase();


              const data =
                categoryData[slug];


              const displayName =
                category.name.replace(
                  /^English\s*/i,
                  ""
                );


              const count =
                articleCounts.get(
                  category.id
                ) || 0;


              return (

                <Link
                  key={category.id}
                  href={`/category/${slug}`}
                  className="
                    group
                    relative
                    min-h-[130px]
                    overflow-hidden
                    border
                    border-zinc-200
                    bg-white
                    p-4
                    transition
                    duration-200
                    hover:border-[#d71920]/50
                  "
                >

                  {data?.image && (

                    <img
                      src={data.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="
                        pointer-events-none
                        absolute
                        bottom-0
                        right-0
                        h-full
                        w-[58%]
                        object-contain
                        object-right-bottom
                        opacity-30
                        transition
                        duration-300
                        group-hover:opacity-55
                      "
                    />

                  )}


                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-white
                      via-white/90
                      to-transparent
                    "
                  />


                  <div
                    className="
                      relative
                      z-10
                    "
                  >

                    <span
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-[#d71920]
                      "
                    >
                      {slug
                        .replace(
                          "english-",
                          ""
                        )
                        .toUpperCase()}
                    </span>


                    <h3
                      className="
                        mt-1
                        text-lg
                        font-extrabold
                        text-[#111]
                        group-hover:text-[#d71920]
                      "
                    >
                      {displayName}
                    </h3>


                    <span
                      className="
                        mt-1
                        block
                        text-[9px]
                        text-zinc-400
                      "
                    >
                      {count}{" "}
                      {count === 1
                        ? "Article"
                        : "Articles"}
                    </span>

                  </div>


                  <span
                    className="
                      absolute
                      bottom-4
                      right-4
                      text-lg
                      text-zinc-400
                      transition
                      group-hover:translate-x-1
                      group-hover:text-[#d71920]
                    "
                  >
                    →
                  </span>

                </Link>

              );

            }
          )}

        </div>

      </section>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <section
        className="
          container-news
          px-4
          pb-10
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-zinc-200
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                font-semibold
                text-zinc-700
              "
            >
              Infinia Bharat News — English Desk
            </p>

            <p
              className="
                mt-1
                text-[11px]
                text-zinc-400
              "
            >
              News and stories across major categories.
            </p>

          </div>


          <Link
            href="/"
            className="
              flex
              w-fit
              items-center
              gap-2
              text-xs
              font-semibold
              text-[#d71920]
              transition
              hover:text-[#111]
            "
          >
            Back to Home
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* ======================================================
          ANIMATIONS
      ====================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `

            @keyframes categoryFlowerOpen {

              0% {
                opacity: 0;
                transform: scale(0.08);
              }

              35% {
                opacity: 0.75;
              }

              75% {
                opacity: 1;
              }

              100% {
                opacity: 1;
                transform: scale(1);
              }

            }


            @keyframes categoryLabelOpen {

              0% {
                opacity: 0;
                transform: scale(0.5);
              }

              55% {
                opacity: 0;
              }

              100% {
                opacity: 1;
                transform: scale(1);
              }

            }


            @keyframes realisticCdSpin {

              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }

            }


            .category-triangle {

              transform-box: fill-box;
              transform-origin: center;

              animation-name:
                categoryFlowerOpen;

              animation-duration:
                1.15s;

              animation-timing-function:
                cubic-bezier(
                  0.16,
                  1,
                  0.3,
                  1
                );

              animation-fill-mode:
                both;

              animation-iteration-count:
                1;

            }


            .category-label {

              transform-box: fill-box;
              transform-origin: center;

              animation-name:
                categoryLabelOpen;

              animation-duration:
                1.15s;

              animation-timing-function:
                cubic-bezier(
                  0.16,
                  1,
                  0.3,
                  1
                );

              animation-fill-mode:
                both;

              animation-iteration-count:
                1;

            }


            /* ================================================
               ONLY THE VINYL DISC ROTATES
               ================================================ */

            .cd-disc {

              animation:
                realisticCdSpin
                8s
                linear
                infinite;

              transform-origin:
                center center;

            }


            /* ================================================
               ACCESSIBILITY
               ================================================ */

            @media (
              prefers-reduced-motion: reduce
            ) {

              .category-triangle,
              .category-label,
              .cd-disc {

                animation:
                  none !important;

              }

            }

          `,
        }}
      />

    </main>

  );

}