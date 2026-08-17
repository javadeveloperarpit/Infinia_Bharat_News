"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const advertisingOptions = [
  "Homepage Banner",
  "Article Advertisement",
  "Business Promotion",
  "Sponsored Content",
  "Video / Shorts Promotion",
  "Brand Campaign",
  "Other",
];

const budgetOptions = [
  "Under ₹5,000",
  "₹5,000 – ₹10,000",
  "₹10,000 – ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000+",
  "Let's discuss",
];

export default function AdvertisePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    advertisingType: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        "/api/advertising-inquiries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to submit inquiry."
        );
      }

      setSuccess(
        "Thank you! Your advertising inquiry has been submitted. Our team will contact you soon."
      );

      setForm({
        name: "",
        company: "",
        email: "",
        phone: "",
        website: "",
        advertisingType: "",
        budget: "",
        message: "",
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#111]">

      {/* TOP STRIP */}

      <div className="border-b border-zinc-800 bg-[#080808]">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-4 text-[11px] font-semibold text-zinc-400 sm:px-6 lg:px-8">
          <span className="text-[#d4af37]">
            Infinia Bharat News
          </span>

          <span className="hidden sm:block">
            Advertising & Business
          </span>
        </div>
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111111]">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link
            href="/"
            className="shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Infinia Bharat News"
              width={220}
              height={70}
              priority
              className="h-auto w-[155px] object-contain sm:w-[185px]"
            />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {[
              ["Home", "/"],
              ["Latest", "/latest"],
              ["India", "/category/india"],
              ["World", "/category/world"],
              ["Politics", "/category/politics"],
              ["Business", "/category/business"],
              ["Sports", "/category/sports"],
              ["Videos", "/videos"],
            ].map(([title, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
              >
                {title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">

            <Link
              href="/search"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-zinc-200 hover:border-red-500 hover:text-red-500"
              aria-label="Search"
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

            <Link
              href="/live-tv"
              className="hidden rounded-md bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700 sm:block"
            >
              Live TV
            </Link>

            <button
              type="button"
              onClick={() =>
                setMenuOpen((v) => !v)
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#111] lg:hidden">
            <nav className="grid grid-cols-2 px-4 py-5 sm:px-6">
              {[
                ["Home", "/"],
                ["Latest", "/latest"],
                ["India", "/category/india"],
                ["World", "/category/world"],
                ["Politics", "/category/politics"],
                ["Business", "/category/business"],
                ["Sports", "/category/sports"],
                ["Videos", "/videos"],
                ["Advertise", "/advertise"],
              ].map(([title, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="border-b border-white/10 px-2 py-3 text-sm font-semibold text-zinc-300 hover:text-red-500"
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* RED BAR */}

      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
          <span className="bg-white px-2 py-1 text-[10px] font-black text-red-600">
            ADVERTISE
          </span>

          <span>
            Partner with Infinia Bharat News
          </span>
        </div>
      </div>

      {/* BREADCRUMB */}

      <div className="border-b border-zinc-200 bg-[#fafafa]">
        <div className="mx-auto max-w-[1400px] px-4 py-3 text-xs text-zinc-500 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="hover:text-red-600"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="font-semibold text-zinc-800">
            Advertise With Us
          </span>
        </div>
      </div>

      {/* HERO */}

      <section className="bg-[#080808] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">

          <div className="max-w-4xl">

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37]">
              Advertising & Partnerships
            </p>

            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Put your brand in front of
              <span className="text-[#d4af37]">
                {" "}digital news audiences.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 sm:text-lg">
              Partner with Infinia Bharat News for
              digital advertising, sponsored
              campaigns, brand promotions and
              custom advertising opportunities.
            </p>

          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">

            {[
              ["Digital Reach", "News-focused audience"],
              ["Multiple Formats", "Flexible advertising options"],
              ["Direct Partnership", "Work with our team"],
            ].map(([title, description]) => (
              <div
                key={title}
                className="border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="text-lg font-black text-white">
                  {title}
                </div>

                <div className="mt-2 text-sm text-zinc-500">
                  {description}
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* FORM SECTION */}

      <section className="bg-[#f7f7f7]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-16">

          {/* LEFT */}

          <div>

            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Let's Work Together
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Tell us about your campaign.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
              Fill out the form and our team can
              review your advertising requirements
              and get back to you.
            </p>

            <div className="mt-8 space-y-4">

              {[
                "Website advertising",
                "Brand promotions",
                "Sponsored content",
                "Business campaigns",
                "Video and Shorts promotion",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold text-zinc-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
                    ✓
                  </span>

                  {item}
                </div>
              ))}

            </div>
          </div>

          {/* FORM */}

          <div className="border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">

            {success && (
              <div className="mb-6 border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-6 text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  label="Your Name *"
                  value={form.name}
                  onChange={(value) =>
                    updateField("name", value)
                  }
                  placeholder="Your full name"
                  required
                />

                <Field
                  label="Company / Brand"
                  value={form.company}
                  onChange={(value) =>
                    updateField("company", value)
                  }
                  placeholder="Company name"
                />

                <Field
                  label="Email Address *"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField("email", value)
                  }
                  placeholder="you@example.com"
                  required
                />

                <Field
                  label="Phone Number"
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="+91"
                />

                <Field
                  label="Website"
                  value={form.website}
                  onChange={(value) =>
                    updateField("website", value)
                  }
                  placeholder="https://example.com"
                />

                <SelectField
                  label="Advertising Type"
                  value={form.advertisingType}
                  onChange={(value) =>
                    updateField(
                      "advertisingType",
                      value
                    )
                  }
                  options={advertisingOptions}
                />

                <SelectField
                  label="Estimated Budget"
                  value={form.budget}
                  onChange={(value) =>
                    updateField("budget", value)
                  }
                  options={budgetOptions}
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-zinc-800">
                  Message *
                </label>

                <textarea
                  required
                  value={form.message}
                  onChange={(event) =>
                    updateField(
                      "message",
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Tell us about your advertising requirements..."
                  className="w-full resize-none border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Advertising Inquiry"}
              </button>

              <p className="text-center text-xs leading-5 text-zinc-500">
                By submitting this form, you
                agree that our team may contact
                you regarding your advertising
                inquiry.
              </p>

            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-[#080808] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <Image
                src="/logo.png"
                alt="Infinia Bharat News"
                width={210}
                height={65}
                className="h-auto w-[165px]"
              />

              <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
                Infinia Bharat News is a digital
                news platform bringing important
                stories from India and around the
                world.
              </p>
            </div>

            <FooterColumn
              title="News"
              links={[
                ["Latest News", "/latest"],
                ["India", "/category/india"],
                ["World", "/category/world"],
                ["Politics", "/category/politics"],
                ["Business", "/category/business"],
              ]}
            />

            <FooterColumn
              title="Explore"
              links={[
                ["Videos", "/videos"],
                ["Live TV", "/live-tv"],
                ["Authors", "/author"],
                ["Advertise", "/advertise"],
                ["Contact", "/contact"],
              ]}
            />

            <FooterColumn
              title="Legal"
              links={[
                ["Privacy Policy", "/privacy-policy"],
                ["Terms & Conditions", "/terms"],
                ["About Us", "/about"],
              ]}
            />

          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-zinc-500">
            © {new Date().getFullYear()} Infinia Bharat News. All rights reserved.
          </div>

        </div>
      </footer>

    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-800">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-zinc-800">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
      >
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-black text-[#d4af37]">
        {title}
      </h3>

      <div className="space-y-2 text-sm text-zinc-400">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}