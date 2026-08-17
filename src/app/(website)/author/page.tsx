import type { Metadata } from "next";
import Link from "next/link";

import {
  getAuthorsDirectory,
} from "@/services/public/author.public.service";

import { siteConfig } from "@/config/site";

import {
  ArrowRight,
  CalendarDays,
  Newspaper,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: `Authors & Journalists | ${siteConfig.name}`,

  description:
    `Meet the journalists, editors and contributors behind ${siteConfig.name}. Read their latest published stories and explore their author profiles.`,

  alternates: {
    canonical: `${siteConfig.url}/authors`,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    title: `Authors & Journalists | ${siteConfig.name}`,
    description:
      `Meet the journalists, editors and contributors behind ${siteConfig.name}.`,
    url: `${siteConfig.url}/authors`,
    siteName: siteConfig.name,
    locale: "en_IN",
    images: [
      {
        url: `${siteConfig.url}${siteConfig.logo}`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Authors`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `Authors & Journalists | ${siteConfig.name}`,
    description:
      `Meet the journalists, editors and contributors behind ${siteConfig.name}.`,
    images: [
      `${siteConfig.url}${siteConfig.logo}`,
    ],
  },
};

// ======================================================
// HELPERS
// ======================================================

function roleLabel(role?: string) {
  if (!role) return "News Author";

  const value =
    role.toLowerCase();

  if (value === "admin")
    return "Editor in Chief";

  if (value === "editor")
    return "Editor";

  if (value === "reporter")
    return "Reporter";

  if (value === "journalist")
    return "Journalist";

  if (value === "writer")
    return "Writer";

  return role
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
}

function formatDate(value?: string) {
  if (!value) return "";

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

// ======================================================
// PAGE
// ======================================================

export default async function AuthorsPage() {
  const authorData =
    await getAuthorsDirectory();

  const totalAuthors =
    authorData.length;

  const totalArticles =
    authorData.reduce(
      (total, item) =>
        total +
        item.articles.length,
      0
    );

  const roles =
    new Set(
      authorData.map((item) =>
        roleLabel(
          item.author.role
        )
      )
    );

  const pageUrl =
    `${siteConfig.url}/authors`;

  // ====================================================
  // STRUCTURED DATA
  // ====================================================

  const itemListSchema = {
    "@context":
      "https://schema.org",
    "@type": "ItemList",
    "@id":
      `${pageUrl}#authors`,
    name:
      `${siteConfig.name} Authors`,
    numberOfItems:
      totalAuthors,

    itemListElement:
      authorData.map(
        (item, index) => ({
          "@type": "ListItem",
          position:
            index + 1,
          name:
            item.author.name,
          url:
            `${siteConfig.url}/author/${item.author.slug}`,
        })
      ),
  };

  const collectionSchema = {
    "@context":
      "https://schema.org",
    "@type":
      "CollectionPage",
    "@id":
      `${pageUrl}#webpage`,
    url: pageUrl,
    name:
      `Authors & Journalists | ${siteConfig.name}`,

    description:
      `Meet the journalists, editors and contributors behind ${siteConfig.name}.`,

    isPartOf: {
      "@type":
        "WebSite",
      "@id":
        `${siteConfig.url}/#website`,
      name:
        siteConfig.name,
      url:
        siteConfig.url,
    },

    about: {
      "@type":
        "NewsMediaOrganization",
      "@id":
        `${siteConfig.url}/#organization`,
      name:
        siteConfig.name,
      url:
        siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify([
              collectionSchema,
              itemListSchema,
            ]),
        }}
      />

      <main className="min-h-screen bg-[#f5f5f5] text-zinc-950">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="border-b border-zinc-200 bg-white">

          <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

            <div className="max-w-4xl">

              <div className="mb-4 flex items-center gap-3">

                <span className="h-1 w-8 bg-red-600" />

                <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-red-600">
                  Editorial Team
                </span>

              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                Authors & Journalists
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                Meet the journalists, editors and
                contributors behind the stories
                published by{" "}
                <strong>
                  {siteConfig.name}
                </strong>.
              </p>

            </div>

            {/* STATS */}

            <div className="mt-8 grid max-w-2xl grid-cols-3 border-y border-zinc-200">

              <div className="px-3 py-5 sm:px-5">

                <div className="text-2xl font-black sm:text-3xl">
                  {totalAuthors}
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 sm:text-[10px]">
                  Authors
                </div>

              </div>

              <div className="border-x border-zinc-200 px-3 py-5 sm:px-5">

                <div className="text-2xl font-black sm:text-3xl">
                  {totalArticles}
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 sm:text-[10px]">
                  Stories
                </div>

              </div>

              <div className="px-3 py-5 sm:px-5">

                <div className="text-2xl font-black sm:text-3xl">
                  {roles.size}
                </div>

                <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 sm:text-[10px]">
                  Roles
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            DIRECTORY BAR
        ================================================= */}

        <section className="border-b border-zinc-200 bg-white">

          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

            <div>

              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-600">
                Infinia Bharat News
              </div>

              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                Our Editorial Team
              </h2>

            </div>

            <div className="hidden items-center gap-2 text-xs font-bold text-zinc-500 sm:flex">

              <span className="h-2 w-2 rounded-full bg-red-600" />

              {totalAuthors} active authors

            </div>

          </div>

        </section>

        {/* =================================================
            AUTHORS
        ================================================= */}

        <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

          {authorData.length === 0 ? (

            <div className="border border-zinc-200 bg-white px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">

                <UserRound
                  size={28}
                  className="text-zinc-400"
                />

              </div>

              <h2 className="mt-5 text-xl font-black">
                No authors available
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                No active authors are currently
                available.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {authorData.map(
                ({
                  author,
                  articles,
                  latestArticle,
                }) => (

                  <article
                    key={author.uid}
                    className="group overflow-hidden border border-zinc-200 bg-white transition duration-300 hover:border-red-200 hover:shadow-md"
                  >

                    {/* RED TOP LINE */}

                    <div className="h-1 w-full bg-red-600" />

                    <div className="p-5 sm:p-6">

                      {/* AUTHOR */}

                      <div className="flex items-start gap-4">

                        <Link
                          href={`/author/${author.slug}`}
                          className="shrink-0"
                        >

                          {author.photo ? (

                            <img
                              src={author.photo}
                              alt={author.name}
                              width={82}
                              height={82}
                              loading="lazy"
                              className="h-[82px] w-[82px] rounded-full border border-zinc-200 object-cover"
                            />

                          ) : (

                            <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-zinc-100 text-xl font-black text-zinc-700">
                              {initials(
                                author.name
                              )}
                            </div>

                          )}

                        </Link>

                        <div className="min-w-0 pt-1">

                          <Link
                            href={`/author/${author.slug}`}
                          >

                            <h3 className="text-lg font-black leading-tight transition-colors group-hover:text-red-600">
                              {author.name}
                            </h3>

                          </Link>

                          <div className="mt-2 flex items-center gap-2">

                            <span className="h-1.5 w-1.5 rounded-full bg-red-600" />

                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                              {roleLabel(
                                author.role
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* BIO */}

                      <p className="mt-5 line-clamp-3 min-h-[72px] text-sm leading-6 text-zinc-600">

                        {author.bio ||
                          `${author.name} is a member of the editorial team at ${siteConfig.name}.`}

                      </p>

                      {/* LATEST STORY */}

                      {latestArticle && (

                        <Link
                          href={`/news/${latestArticle.slug}`}
                          className="mt-5 block border-y border-zinc-100 py-4"
                        >

                          <div className="mb-2 flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-wider text-red-600">

                            <Newspaper
                              size={12}
                            />

                            Latest Story

                          </div>

                          <h4 className="line-clamp-2 text-sm font-extrabold leading-5 text-zinc-900 transition-colors group-hover:text-red-600">

                            {latestArticle.title}

                          </h4>

                          {latestArticle.createdAt && (

                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">

                              <CalendarDays
                                size={12}
                              />

                              {formatDate(
                                latestArticle.createdAt
                              )}

                            </div>

                          )}

                        </Link>

                      )}

                      {/* FOOTER */}

                      <div className="mt-5 flex items-center justify-between">

                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">

                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100">

                            <Newspaper
                              size={14}
                            />

                          </span>

                          {articles.length}{" "}
                          {articles.length === 1
                            ? "story"
                            : "stories"}

                        </div>

                        <Link
                          href={`/author/${author.slug}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-900 transition-colors hover:text-red-600"
                        >

                          View Profile

                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-1"
                          />

                        </Link>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            EDITORIAL NOTE
        ================================================= */}

        <section className="border-t border-zinc-200 bg-white">

          <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">

                <ShieldCheck
                  size={19}
                />

              </div>

              <div>

                <h2 className="text-sm font-black">
                  Editorial Team
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500 sm:text-sm">
                  Meet the people responsible for
                  reporting, researching and publishing
                  stories at {siteConfig.name}.
                </p>

              </div>

            </div>

            <Link
              href="/news"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-red-700"
            >

              Explore Latest News

              <ArrowRight
                size={14}
              />

            </Link>

          </div>

        </section>

      </main>
    </>
  );
}