"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Author = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  image?: string;
  avatar?: string;
  photo?: string;
};

type PageLink = {
  title: string;
  description: string;
  href: string;
};

type Section = {
  title: string;
  description: string;
  links: PageLink[];
};

const sections: Section[] = [
  {
    title: "News",
    description:
      "Latest and important news stories published by Infinia Bharat News.",
    links: [
      {
        title: "Latest News",
        description: "The latest stories and developments from our newsroom.",
        href: "/latest",
      },
      {
        title: "India",
        description: "News, developments and major events from across India.",
        href: "/category/india",
      },
      {
        title: "World",
        description:
          "International news and important developments worldwide.",
        href: "/category/world",
      },
      {
        title: "Politics",
        description:
          "Indian politics, government, leaders and political developments.",
        href: "/category/politics",
      },
      {
        title: "Business",
        description:
          "Business, markets, economy, companies and finance news.",
        href: "/category/business",
      },
      {
        title: "Technology",
        description:
          "Technology, AI, gadgets, startups and digital developments.",
        href: "/category/technology",
      },
      {
        title: "Sports",
        description:
          "Sports news, results, players, tournaments and major updates.",
        href: "/category/sports",
      },
      {
        title: "Entertainment",
        description:
          "Bollywood, celebrities, movies, television and entertainment.",
        href: "/category/entertainment",
      },
    ],
  },
  {
    title: "Digital Content",
    description:
      "Video and short-form content published across the Infinia Bharat News platform.",
    links: [
      {
        title: "Videos",
        description: "News videos and important visual stories.",
        href: "/video",
      },
      {
        title: "Reels",
        description: "News reels and important visual stories.",
        href: "/reels",
      },
      {
        title: "Live TV",
        description: "Watch live television and live news coverage.",
        href: "/live-tv",
      },
      {
        title: "Trending",
        description:
          "Stories and topics currently attracting reader attention.",
        href: "/trending",
      },
      {
        title: "Viral",
        description:
          "Viral stories, internet trends and widely discussed developments.",
        href: "/category/viral",
      },
    ],
  },
  {
    title: "About Infinia Bharat News",
    description:
      "Information about the newsroom, editorial team and the organisation behind the publication.",
    links: [
      {
        title: "About Us",
        description:
          "Learn about Infinia Bharat News, our purpose and our newsroom.",
        href: "/about",
      },
      {
        title: "Our Authors",
        description:
          "Meet the writers, journalists and contributors behind our stories.",
        href: "/author",
      },
      {
        title: "Contact Us",
        description: "Contact the Infinia Bharat News team.",
        href: "/contact",
      },
      {
        title: "Advertise With Us",
        description:
          "Advertising and business opportunities with Infinia Bharat News.",
        href: "/advertise",
      },
    ],
  },
  {
    title: "Policies & Information",
    description:
      "Important information concerning website usage, privacy and legal terms.",
    links: [
      {
        title: "Privacy Policy",
        description:
          "How information and data are handled on this website.",
        href: "/privacy-policy",
      },
      {
        title: "Terms & Conditions",
        description:
          "Terms governing the use of the Infinia Bharat News website.",
        href: "/terms",
      },
      {
        title: "Contact",
        description: "Get in touch with the publication and its team.",
        href: "/contact",
      },
    ],
  },
];

const quickLinks: PageLink[] = [
  {
    title: "Home",
    description: "Infinia Bharat News homepage.",
    href: "/",
  },
  {
    title: "Latest News",
    description: "Latest stories from the newsroom.",
    href: "/latest",
  },
  {
    title: "India",
    description: "India news.",
    href: "/category/india",
  },
  {
    title: "World",
    description: "World news.",
    href: "/category/world",
  },
  {
    title: "Politics",
    description: "Politics news.",
    href: "/category/politics",
  },
  {
    title: "Business",
    description: "Business and economy news.",
    href: "/category/business",
  },
  {
    title: "Technology",
    description: "Technology news.",
    href: "/category/technology",
  },
  {
    title: "Sports",
    description: "Sports news.",
    href: "/category/sports",
  },
  {
    title: "Entertainment",
    description: "Entertainment news.",
    href: "/category/entertainment",
  },
  {
    title: "Videos",
    description: "Infinia Bharat News video section.",
    href: "/video",
  },
  {
    title: "Reels",
    description: "Infinia Bharat News video section.",
    href: "/reels",
  },
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [showAllAuthors, setShowAllAuthors] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAuthors() {
      try {
        const response = await fetch("/api/authors", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load authors");
        }

        const data = await response.json();

        const list: Author[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.authors)
            ? data.authors
            : [];

        if (mounted) {
          setAuthors(list);
        }
      } catch {
        if (mounted) {
          setAuthors([]);
        }
      } finally {
        if (mounted) {
          setAuthorsLoading(false);
        }
      }
    }

    loadAuthors();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleAuthors = useMemo(
    () => (showAllAuthors ? authors : authors.slice(0, 6)),
    [authors, showAllAuthors]
  );

  return (
    <main className="min-h-screen bg-white text-[#111]">
      {/* TOP STRIP */}
      <div className="border-b border-zinc-200 bg-[#f7f7f7]">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 text-[11px] font-semibold text-zinc-600 sm:px-6 lg:px-8">
          <span>Infinia Bharat News</span>

          <span className="hidden sm:block">
            Independent Digital News Platform
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111111]">
  <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">

    {/* LOGO */}
    <Link href="/" className="shrink-0">
      <Image
        src="/logo.webp"
        alt="Infinia Bharat News"
        width={220}
        height={70}
        priority
        className="h-auto w-[155px] object-contain sm:w-[185px]"
      />
    </Link>

    {/* DESKTOP NAV */}
    <nav className="hidden items-center gap-6 lg:flex">
      <Link href="/" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Home
      </Link>

      <Link href="/latest" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Latest
      </Link>

      <Link href="/category/india" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        India
      </Link>

      <Link href="/category/world" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        World
      </Link>

      <Link href="/category/politics" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Politics
      </Link>

      <Link href="/category/business" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Business
      </Link>

      <Link href="/category/sports" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Sports
      </Link>

      <Link href="/video" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Videos
      </Link>
      <Link href="/reels" className="text-sm font-semibold text-zinc-200 transition hover:text-red-500">
        Reels
      </Link>
    </nav>

    {/* RIGHT */}
    <div className="flex items-center gap-2">

      {/* SEARCH */}
      <Link
        href="/search"
        aria-label="Search"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-200 transition hover:border-red-500 hover:text-red-500"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </Link>

      {/* LIVE TV */}
      <Link
        href="/live-tv"
        className="hidden rounded-md bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 sm:block"
      >
        Live TV
      </Link>

      {/* MOBILE MENU */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-red-500 hover:text-red-500 lg:hidden"
      >
        {menuOpen ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        ) : (
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  </div>

  {/* MOBILE MENU */}
  {menuOpen && (
    <div className="border-t border-white/10 bg-[#111111] lg:hidden">
      <nav className="mx-auto grid max-w-[1400px] grid-cols-2 px-4 py-5 sm:px-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className="border-b border-white/10 px-2 py-3 text-sm font-semibold text-zinc-300 transition hover:text-red-500"
          >
            {link.title}
          </Link>
        ))}
      </nav>
    </div>
  )}
</header>

      {/* RED NEWS BAR */}
      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-hidden px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
          <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-black text-red-600">
            ABOUT
          </span>

          <span className="truncate">
            Infinia Bharat News — News, information and stories from India and
            the world
          </span>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="border-b border-zinc-200 bg-[#fafafa]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 text-xs text-zinc-500 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-red-600">
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-zinc-800">About Us</span>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                About Infinia Bharat News
              </p>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Infinia Bharat News
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                Infinia Bharat News is a digital-first news platform covering
                important developments from India and around the world. Our
                newsroom brings together news, analysis, videos and trending
                stories across multiple categories.
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">
                This page serves as a guide to Infinia Bharat News — helping
                readers, search engines and AI systems understand the
                publication, its sections, its editorial resources and the
                important pages available across the website.
              </p>
            </div>

            <div className="border-l-4 border-red-600 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Quick Overview
              </p>

              <div className="mt-5 grid grid-cols-2 gap-5">
                <div>
                  <div className="text-3xl font-black">24/7</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Digital News Cycle
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black">10+</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Coverage Areas
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black">India</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Primary Focus
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-black">World</div>
                  <div className="mt-1 text-xs text-zinc-500">
                    Global Coverage
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE */}
      <section className="border-b border-zinc-200 bg-[#f7f7f7]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Coverage
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              What Infinia Bharat News covers
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["India", "/category/india"],
              ["World", "/category/world"],
              ["Politics", "/category/politics"],
              ["Business", "/category/business"],
              ["Technology", "/category/technology"],
              ["Sports", "/category/sports"],
              ["Entertainment", "/category/entertainment"],
              ["Viral", "/category/viral"],
            ].map(([title, href]) => (
              <Link
                key={href}
                href={href}
                className="group bg-white p-6 transition hover:bg-red-600 hover:text-white"
              >
                <div className="mb-5 text-xs font-black text-red-600 group-hover:text-white">
                  {title.toUpperCase()}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-black">{title} News</span>

                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WEBSITE INDEX */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Website Index
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Explore Infinia Bharat News
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              A complete overview of the main sections and resources available
              on the website.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {sections.map((section) => (
              <section
                key={section.title}
                className="border border-zinc-200 bg-white"
              >
                <div className="border-b border-zinc-200 bg-[#f7f7f7] px-6 py-5">
                  <h3 className="text-xl font-black">{section.title}</h3>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    {section.description}
                  </p>
                </div>

                <div className="divide-y divide-zinc-100">
                  {section.links.map((link) => (
                    <Link
                      key={`${link.href}-${link.title}`}
                      href={link.href}
                      className="group flex items-start justify-between gap-5 px-6 py-5 transition hover:bg-red-50"
                    >
                      <div>
                        <h4 className="font-bold text-zinc-900 group-hover:text-red-600">
                          {link.title}
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-zinc-500">
                          {link.description}
                        </p>
                      </div>

                      <span className="mt-1 shrink-0 text-lg font-bold text-red-600 transition group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* EDITORIAL APPROACH */}
      <section className="border-y border-zinc-200 bg-[#f7f7f7]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Our Approach
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Fast news, clear information.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-zinc-600">
            <p>
              Infinia Bharat News aims to make important developments easier to
              discover and understand. The platform combines fast digital
              publishing with a focus on clear presentation.
            </p>

            <p>
              Our coverage spans national and international affairs, politics,
              business, technology, sports, entertainment and other topics
              relevant to digital readers.
            </p>

            <p>
              As the platform grows, our goal is to provide readers with a
              dependable destination for discovering news throughout the day.
            </p>
          </div>
        </div>
      </section>

      {/* AUTHORS */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Editorial Team
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Our Authors
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
                Meet the people contributing stories and information to
                Infinia Bharat News.
              </p>
            </div>

            <Link
              href="/author"
              className="text-sm font-bold text-red-600 hover:text-red-700"
            >
              View all authors →
            </Link>
          </div>

          {authorsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse border border-zinc-200 bg-zinc-50"
                />
              ))}
            </div>
          ) : authors.length === 0 ? (
            <div className="border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
              <p className="text-sm text-zinc-500">
                Author information will appear here.
              </p>

              <Link
                href="/author"
                className="mt-3 inline-block text-sm font-bold text-red-600"
              >
                Visit Authors →
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleAuthors.map((author) => {
                  const image =
  author.image ||
  author.avatar ||
  author.photo;

                  return (
                    <article
                      key={author.id}
                      className="border border-zinc-200 bg-white p-5 transition hover:border-red-300 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                          {image ? (
                            <Image
                              src={image}
                              alt={author.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-black text-red-600">
                              {author.name?.charAt(0)?.toUpperCase() || "A"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-black text-zinc-900">
                            {author.name}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-red-600">
                            {author.role || "News Author"}
                          </p>
                        </div>
                      </div>

                      {author.bio && (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-500">
                          {author.bio}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>

              {authors.length > 6 && (
                <div className="mt-7 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllAuthors((v) => !v)}
                    className="border border-zinc-300 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-zinc-700 hover:border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    {showAllAuthors ? "Show Less" : "Show All Authors"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* QUICK LINKS */}
      <section className="border-t border-zinc-200 bg-[#111] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                Infinia Bharat News
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Everything in one place.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
                Infinia Bharat News is a digital news publication covering
                India, world affairs, politics, business, technology, sports,
                entertainment, viral stories and other major developments.
                Readers can browse the latest news, category pages, videos, reels
                live television, authors and information about the publication
                from the links below.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-b border-white/10 pb-3 text-sm font-semibold text-zinc-300 transition hover:border-red-500 hover:text-white"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-7 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
              Stay Updated
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Read the latest stories from Infinia Bharat News.
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/latest"
              className="bg-white px-6 py-3 text-center text-sm font-black text-red-600 hover:bg-zinc-100"
            >
              Latest News
            </Link>

            <Link
              href="/contact"
              className="border border-white/40 px-6 py-3 text-center text-sm font-black text-white hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
<footer className="border-t border-white/10 bg-[#0b0b0b] text-white">
  <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">

    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

      {/* BRAND */}
      <div>
        <Link href="/" className="inline-block">
          <Image
            src="/logo.webp"
            alt="Infinia Bharat News"
            width={210}
            height={65}
            className="h-auto w-[165px]"
          />
        </Link>

        <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
          Infinia Bharat News is a digital news platform bringing important
          stories from India and around the world.
        </p>

        <Link
          href="/advertise"
          className="mt-5 inline-flex items-center gap-2 border border-[#d4af37]/40 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-black"
        >
          Advertise With Us
          <span>→</span>
        </Link>
      </div>

      {/* NEWS */}
      <div>
        <h3 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-[#d4af37]">
          News
        </h3>

        <div className="space-y-3 text-sm">
          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/latest"
          >
            Latest News
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/category/india"
          >
            India
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/category/world"
          >
            World
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/category/politics"
          >
            Politics
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/category/business"
          >
            Business
          </Link>
        </div>
      </div>

      {/* EXPLORE */}
      <div>
        <h3 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-[#d4af37]">
          Explore
        </h3>

        <div className="space-y-3 text-sm">
          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/video"
          >
            Videos
          </Link>
          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/reels"
          >
            Reels
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/live-tv"
          >
            Live TV
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/author"
          >
            Authors
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/advertise"
          >
            Advertise
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/contact"
          >
            Contact
          </Link>
        </div>
      </div>

      {/* LEGAL */}
      <div>
        <h3 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-[#d4af37]">
          Legal
        </h3>

        <div className="space-y-3 text-sm">
          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/privacy-policy"
          >
            Privacy Policy
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/terms"
          >
            Terms & Conditions
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/about"
          >
            About Us
          </Link>

          <Link
            className="block text-zinc-400 transition hover:text-white"
            href="/contact"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>

    {/* BOTTOM */}
    <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-xs text-zinc-500">
        © {new Date().getFullYear()}{" "}
        <span className="font-bold text-[#d4af37]">
          Infinia Bharat News
        </span>
        . All rights reserved.
      </p>

      <p className="text-xs font-semibold text-zinc-500">
        Independent Digital News Platform
      </p>
    </div>

  </div>
</footer>
    </main>
  );
}