import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getAuthorBySlug,
  getAuthorArticles,
} from "@/services/public/author.public.service";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Newspaper,
  UserRound,
} from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Not Found",
      description: "यह लेखक उपलब्ध नहीं है।",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    `${author.name} - पत्रकार एवं लेखक`;

  const description =
    author.bio ||
    `${author.name} द्वारा INFINIA BHARAT NEWS पर प्रकाशित नवीनतम समाचार और लेख पढ़ें।`;

  const url =
    `/author/${author.slug}`;

  return {
    title,

    description,

    alternates: {
      canonical: url,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "profile",
      title,
      description,
      url,
      siteName: "INFINIA BHARAT NEWS",
      locale: "hi_IN",

      ...(author.photo
        ? {
            images: [
              {
                url: author.photo,
                alt: author.name,
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,

      ...(author.photo
        ? {
            images: [author.photo],
          }
        : {}),
    },
  };
}

// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// ==========================================
// AUTHOR PAGE
// ==========================================

export default async function AuthorPage({
  params,
}: Props) {

  const { slug } = await params;

  // ========================================
  // GET AUTHOR
  // ========================================

  const author = await getAuthorBySlug(slug);

  if (!author) {
    notFound();
  }

  // ========================================
  // GET AUTHOR ARTICLES
  // ========================================

  const articles = await getAuthorArticles(
    author.uid
  );

  // ========================================
  // ROLE
  // ========================================

  const role =
    author.role === "admin"
      ? "Editor in Chief"
      : author.role === "editor"
        ? "Editor"
        : author.role || "News Author";

  return (
    <main className="min-h-screen bg-zinc-50">

      {/* ===================================== */}
      {/* AUTHOR HERO */}
      {/* ===================================== */}

      <section className="border-b border-zinc-200 bg-white">

        {/* COVER */}

        <div
          className="
            relative
            h-44
            overflow-hidden
            bg-gradient-to-r
            from-zinc-950
            via-red-950
            to-red-700
            sm:h-56
          "
        >

          <div
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_top_right,white,transparent_35%)]
              opacity-20
            "
          />

          <div
            className="
              absolute
              bottom-5
              right-6
              select-none
              text-6xl
              font-black
              tracking-tight
              text-white/10
              sm:text-8xl
            "
          >
            INFINIA
          </div>

        </div>

        {/* PROFILE */}

        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              relative
              -mt-16
              pb-7
              sm:-mt-20
            "
          >

            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >

              {/* LEFT */}

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-end
                "
              >

                {/* PHOTO */}

                {author.photo ? (

                  <img
                    src={author.photo}
                    alt={author.name}
                    className="
                      h-32
                      w-32
                      rounded-full
                      border-4
                      border-white
                      bg-zinc-100
                      object-cover
                      shadow-xl
                      sm:h-40
                      sm:w-40
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-32
                      w-32
                      items-center
                      justify-center
                      rounded-full
                      border-4
                      border-white
                      bg-red-100
                      text-4xl
                      font-black
                      text-red-600
                      shadow-xl
                      sm:h-40
                      sm:w-40
                      sm:text-5xl
                    "
                  >
                    {author.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                )}

                {/* NAME */}

                <div className="pb-1">

                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >

                    <h1
                      className="
                        text-3xl
                        font-black
                        tracking-tight
                        text-zinc-950
                        sm:text-4xl
                      "
                    >
                      {author.name}
                    </h1>

                    <span
                      className="
                        inline-flex
                        items-center
                        rounded-full
                        bg-red-50
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-red-600
                      "
                    >
                      {role}
                    </span>

                  </div>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-zinc-500
                    "
                  >
                    @{author.slug}
                  </p>

                </div>

              </div>

              {/* ARTICLE COUNT */}

              <div
                className="
                  min-w-[140px]
                  rounded-xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  px-5
                  py-3
                "
              >

                <div
                  className="
                    text-2xl
                    font-black
                    text-zinc-950
                  "
                >
                  {articles.length}
                </div>

                <div
                  className="
                    text-xs
                    font-medium
                    text-zinc-500
                  "
                >
                  Published Articles
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================== */}
      {/* CONTENT */}
      {/* ===================================== */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-12
          "
        >

          {/* ================================= */}
          {/* SIDEBAR */}
          {/* ================================= */}

          <aside
            className="
              space-y-5
              lg:col-span-3
            "
          >

            {/* ABOUT */}

            <div
              className="
                rounded-2xl
                border
                border-zinc-200
                bg-white
                p-5
              "
            >

              <h2
                className="
                  text-lg
                  font-black
                  text-zinc-950
                "
              >
                About the Author
              </h2>

              <p
                className="
                  mt-3
                  text-sm
                  leading-6
                  text-zinc-600
                "
              >
                {author.bio ||
                  `${author.name} is a ${role.toLowerCase()} at INFINIA BHARAT NEWS.`}
              </p>

            </div>

            {/* AUTHOR INFORMATION */}

            <div
              className="
                rounded-2xl
                border
                border-zinc-200
                bg-white
                p-5
              "
            >

              <h2
                className="
                  text-lg
                  font-black
                  text-zinc-950
                "
              >
                Author Information
              </h2>

              <div className="mt-4 space-y-4">

                {/* ROLE */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-zinc-600
                  "
                >

                  <UserRound
                    size={17}
                    className="shrink-0 text-red-600"
                  />

                  <span>
                    {role}
                  </span>

                </div>

                {/* EMAIL */}

                {author.email && (
                  <a
                    href={`mailto:${author.email}`}
                    className="
                      flex
                      items-start
                      gap-3
                      text-sm
                      text-zinc-600
                      transition
                      hover:text-red-600
                    "
                  >

                    <Mail
                      size={17}
                      className="
                        mt-0.5
                        shrink-0
                        text-red-600
                      "
                    />

                    <span
                      className="
                        break-all
                        leading-5
                      "
                    >
                      {author.email}
                    </span>

                  </a>
                )}

                {/* ARTICLES */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-zinc-600
                  "
                >

                  <Newspaper
                    size={17}
                    className="shrink-0 text-red-600"
                  />

                  <span>
                    {articles.length}{" "}
                    {articles.length === 1
                      ? "published article"
                      : "published articles"}
                  </span>

                </div>

              </div>

            </div>

          </aside>

          {/* ================================= */}
          {/* ARTICLES */}
          {/* ================================= */}

          <div className="lg:col-span-9">

            <div className="mb-6">

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Newspaper
                  size={21}
                  className="text-red-600"
                />

                <h2
                  className="
                    text-2xl
                    font-black
                    text-zinc-950
                    sm:text-3xl
                  "
                >
                  Latest Articles
                </h2>

              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                Latest stories published by{" "}
                {author.name}
              </p>

            </div>

            {/* NO ARTICLES */}

            {articles.length === 0 ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-white
                  p-12
                  text-center
                "
              >

                <Newspaper
                  size={42}
                  className="
                    mx-auto
                    text-zinc-300
                  "
                />

                <h3
                  className="
                    mt-4
                    text-lg
                    font-bold
                    text-zinc-900
                  "
                >
                  No published articles
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-zinc-500
                  "
                >
                  This author has not published
                  any articles yet.
                </p>

              </div>

            ) : (

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >

                {articles.map(
                  (article) => (

                    <Link
                      key={article.id}
                      href={`/news/${article.slug}`}
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        border-zinc-200
                        bg-white
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-xl
                      "
                    >

                      {/* IMAGE */}

                      <div
                        className="
                          relative
                          aspect-video
                          overflow-hidden
                          bg-zinc-100
                        "
                      >

                        {article.thumbnail ? (

                          <img
                            src={
                              article.thumbnail
                            }
                            alt={
                              article.title
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition-transform
                              duration-500
                              group-hover:scale-105
                            "
                          />

                        ) : (

                          <div
                            className="
                              flex
                              h-full
                              w-full
                              items-center
                              justify-center
                              bg-zinc-100
                              text-zinc-400
                            "
                          >
                            <Newspaper
                              size={40}
                            />
                          </div>

                        )}

                        {/* CATEGORY */}

                        {article.category && (
                          <span
                            className="
                              absolute
                              left-3
                              top-3
                              rounded-full
                              bg-red-600
                              px-3
                              py-1
                              text-[11px]
                              font-bold
                              text-white
                            "
                          >
                            {article.category}
                          </span>
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="p-5">

                        <h3
                          className="
                            text-lg
                            font-black
                            leading-7
                            text-zinc-950
                            transition
                            group-hover:text-red-600
                          "
                        >
                          {article.title}
                        </h3>

                        {article.shortDescription && (
                          <p
                            className="
                              mt-2
                              line-clamp-2
                              text-sm
                              leading-6
                              text-zinc-500
                            "
                          >
                            {
                              article.shortDescription
                            }
                          </p>
                        )}

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-between
                            border-t
                            border-zinc-100
                            pt-4
                            text-xs
                            text-zinc-400
                          "
                        >

                          <span
                            className="
                              flex
                              items-center
                              gap-1.5
                            "
                          >

                            <CalendarDays
                              size={14}
                            />

                            {formatDate(
                              article.createdAt
                            )}

                          </span>

                          <span
                            className="
                              font-bold
                              text-red-600
                              transition
                              group-hover:translate-x-1
                            "
                          >
                            Read →
                          </span>

                        </div>

                      </div>

                    </Link>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}
