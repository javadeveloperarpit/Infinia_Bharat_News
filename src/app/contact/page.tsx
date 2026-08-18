import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description:
    "Contact Infinia Bharat News for general inquiries, news tips, feedback, corrections, advertising and business opportunities.",
  keywords: [
    "Infinia Bharat News contact",
    "contact Infinia Bharat News",
    "news tips",
    "news feedback",
    "advertising inquiry",
    "Infinia Bharat News email",
  ],
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
  openGraph: {
    title: `Contact Us | ${siteConfig.name}`,
    description:
      "Contact Infinia Bharat News for news tips, feedback, general inquiries, corrections and advertising opportunities.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    type: "website",
  },
};

const contactEmail = "arpitmishraqq1801@gmail.com";

const quickLinks = [
  { title: "Home", href: "/" },
  { title: "Latest", href: "/latest" },
  { title: "India", href: "/category/india" },
  { title: "World", href: "/category/world" },
  { title: "Politics", href: "/category/politics" },
  { title: "Business", href: "/category/business" },
  { title: "Sports", href: "/category/sports" },
  { title: "Videos", href: "/video" },
  { title: "Reels", href: "/reels" },
  { title: "Live TV", href: "/live-tv" },
];

const contactOptions = [
  {
    number: "01",
    title: "General Inquiries",
    label: "GENERAL",
    description:
      "For questions about Infinia Bharat News, our website, published content, services or any other general matter, contact our team by email.",
    action: "Send General Inquiry",
    subject: "General Inquiry - INFINIA BHARAT NEWS",
  },
  {
    number: "02",
    title: "News Tips & Information",
    label: "NEWSROOM",
    description:
      "Have information about an important event, local development, public issue or breaking news? Send the details to our newsroom.",
    action: "Send News Tip",
    subject: "News Tip - INFINIA BHARAT NEWS",
  },
  {
    number: "03",
    title: "Feedback & Suggestions",
    label: "FEEDBACK",
    description:
      "Your feedback helps us improve. You can contact us with suggestions about our website, news coverage, user experience or digital content.",
    action: "Send Feedback",
    subject: "Feedback - INFINIA BHARAT NEWS",
  },
  {
    number: "04",
    title: "Advertising & Business",
    label: "BUSINESS",
    description:
      "For advertising, brand partnerships and business opportunities, please visit our dedicated advertising page.",
    action: "Advertising & Business",
    href: "/advertise",
  },
];

export default function ContactPage() {
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

      {/* HEADER */}
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
            <Link
              href="/"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Home
            </Link>

            <Link
              href="/latest"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Latest
            </Link>

            <Link
              href="/category/india"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              India
            </Link>

            <Link
              href="/category/world"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              World
            </Link>

            <Link
              href="/category/politics"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Politics
            </Link>

            <Link
              href="/category/business"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Business
            </Link>

            <Link
              href="/category/sports"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Sports
            </Link>

            <Link
              href="/video"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Videos
            </Link>

            <Link
              href="/reels"
              className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
            >
              Reels
            </Link>
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* SEARCH */}
            <Link
              href="/search"
              aria-label="Search Infinia Bharat News"
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
            <details className="relative lg:hidden">
              <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 text-white hover:border-red-500 hover:text-red-500">
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
              </summary>

              <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-zinc-700 bg-[#111] shadow-2xl">
                <nav className="grid grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-red-600 hover:text-white"
                    >
                      {link.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* RED NEWS BAR */}
      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-hidden px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
          <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-black text-red-600">
            CONTACT
          </span>

          <span className="truncate">
            Contact Infinia Bharat News — News tips, feedback, inquiries and
            business opportunities
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

          <span className="font-semibold text-zinc-800">Contact Us</span>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Contact Infinia Bharat News
              </p>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                हमसे संपर्क करें
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                Infinia Bharat News से संपर्क करने के लिए नीचे दिए गए माध्यमों
                का उपयोग करें। समाचार टिप, प्रतिक्रिया, सामान्य पूछताछ,
                correction request या business inquiry के लिए हमारी टीम को
                ईमेल करें।
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">
                हम पाठकों, समाचार स्रोतों, contributors, businesses और अन्य
                stakeholders से प्राप्त महत्वपूर्ण संदेशों को समझने और उचित
                टीम तक पहुंचाने का प्रयास करते हैं।
              </p>
            </div>

            {/* EMAIL CARD */}
            <div className="border-l-4 border-red-600 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Primary Contact
              </p>

              <h2 className="mt-3 text-2xl font-black text-zinc-950">
                Email Us
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                General communication and newsroom-related inquiries.
              </p>

              <a
                href={`mailto:${contactEmail}`}
                className="mt-5 block break-all text-sm font-bold text-zinc-950 hover:text-red-600"
              >
                {contactEmail}
              </a>

              <a
                href={`mailto:${contactEmail}?subject=General%20Inquiry%20-%20INFINIA%20BHARAT%20NEWS`}
                className="mt-5 inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-700"
              >
                Email Our Team
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="border-b border-zinc-200 bg-[#f7f7f7]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Contact Options
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              How can we help?
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              Choose the most relevant contact option so that your message
              clearly reaches the right purpose.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-zinc-200 bg-zinc-200 md:grid-cols-2">
            {contactOptions.map((item) => {
              const href =
                item.href ||
                `mailto:${contactEmail}?subject=${encodeURIComponent(
                  item.subject || ""
                )}`;

              return (
                <article
                  key={item.number}
                  className="group bg-white p-6 transition hover:bg-red-600 hover:text-white sm:p-8"
                >
                  <div className="flex items-start justify-between gap-5">
                    <span className="text-sm font-black text-red-600 group-hover:text-red-100">
                      {item.number}
                    </span>

                    <span className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400 group-hover:text-red-100">
                      {item.label}
                    </span>
                  </div>

                  <h3 className="mt-7 text-2xl font-black">
                    {item.title}
                  </h3>

                  <p className="mt-3 min-h-[96px] text-sm leading-7 text-zinc-500 group-hover:text-red-50">
                    {item.description}
                  </p>

                  <a
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 border border-zinc-300 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-zinc-800 transition group-hover:border-white group-hover:bg-white group-hover:text-red-600"
                  >
                    {item.action}
                    <span>→</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEWS TIPS */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              Newsroom
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Have a news tip?
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-zinc-600">
            <p>
              यदि आपके पास किसी महत्वपूर्ण घटना, स्थानीय समस्या, सार्वजनिक
              मुद्दे या समाचार से संबंधित विश्वसनीय जानकारी है, तो आप उसे
              हमारे newsroom तक भेज सकते हैं।
            </p>

            <p>
              ईमेल में घटना की तारीख, स्थान, संबंधित जानकारी और उपलब्ध
              supporting material जैसे photographs, videos या documents का
              उल्लेख करें। इससे आपकी जानकारी को बेहतर तरीके से समझने में मदद
              मिलती है।
            </p>

            <p className="border-l-4 border-red-600 bg-[#f7f7f7] px-5 py-4 text-sm leading-7 text-zinc-600">
              कृपया केवल वही जानकारी साझा करें जिसे आप सत्य और विश्वसनीय
              मानते हैं। किसी भी समाचार tip का प्रकाशन editorial review और
              verification पर निर्भर करता है।
            </p>

            <a
              href={`mailto:${contactEmail}?subject=News%20Tip%20-%20INFINIA%20BHARAT%20NEWS`}
              className="inline-flex items-center gap-2 bg-zinc-950 px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-600"
            >
              Send News Tip
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ADVERTISING */}
      <section className="border-y border-zinc-200 bg-[#f7f7f7]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col justify-between gap-8 border border-zinc-200 bg-white p-7 sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Business & Advertising
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Advertise with Infinia Bharat News
              </h2>

              <p className="mt-4 text-base leading-7 text-zinc-600">
                Brands and businesses interested in advertising, partnerships
                or other commercial opportunities can visit our dedicated
                advertising page and submit an inquiry.
              </p>
            </div>

            <Link
              href="/advertise"
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              Advertising & Business
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* RESPONSE / EMAIL */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="border-t-4 border-red-600 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Email
              </p>

              <h3 className="mt-3 text-xl font-black">
                Direct Communication
              </h3>

              <a
                href={`mailto:${contactEmail}`}
                className="mt-4 block break-all text-sm font-bold text-zinc-700 hover:text-red-600"
              >
                {contactEmail}
              </a>
            </div>

            <div className="border-t-4 border-zinc-900 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-zinc-700">
                Newsroom
              </p>

              <h3 className="mt-3 text-xl font-black">
                News Tips & Information
              </h3>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Share important news and information with our newsroom by
                email.
              </p>
            </div>

            <div className="border-t-4 border-[#d4af37] bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-[#a88618]">
                Business
              </p>

              <h3 className="mt-3 text-xl font-black">
                Advertising & Partnerships
              </h3>

              <Link
                href="/advertise"
                className="mt-4 inline-block text-sm font-bold text-zinc-700 hover:text-red-600"
              >
                Visit Advertising Page →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT INFORMATION */}
      <section className="border-t border-zinc-200 bg-[#111] text-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-500">
                Before You Email
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Help us understand your message.
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-zinc-400">
              <p>
                ईमेल करते समय अपने संदेश का subject स्पष्ट रखें और अपनी query
                या information को संक्षिप्त तथा स्पष्ट तरीके से लिखें।
              </p>

              <p>
                यदि आप किसी published story के संबंध में संपर्क कर रहे हैं,
                तो संभव हो तो उस article का URL और संबंधित headline भी शामिल
                करें।
              </p>

              <p>
                Advertising और business-related requests के लिए हमारी dedicated
                advertising page का उपयोग करें।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-7 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
              Infinia Bharat News
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Need to get in touch with our team?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50">
              For general inquiries, news tips and feedback, send us an email
              and include a clear subject for your message.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${contactEmail}?subject=General%20Inquiry%20-%20INFINIA%20BHARAT%20NEWS`}
              className="bg-white px-6 py-3 text-center text-sm font-black text-red-600 transition hover:bg-zinc-100"
            >
              Email Us
            </a>

            <Link
              href="/about"
              className="border border-white/40 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white/10"
            >
              About Us
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
                Infinia Bharat News is a digital news platform bringing
                important stories from India and around the world.
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