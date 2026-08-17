import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS की Terms and Conditions पढ़ें और वेबसाइट के उपयोग, content, comments, external links और disclaimer से संबंधित नियमों को समझें।",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

const quickLinks = [
  { title: "Home", href: "/" },
  { title: "Latest", href: "/latest" },
  { title: "India", href: "/category/india" },
  { title: "World", href: "/category/world" },
  { title: "Politics", href: "/category/politics" },
  { title: "Business", href: "/category/business" },
  { title: "Sports", href: "/category/sports" },
  { title: "Videos", href: "/videos" },
  { title: "Reels", href: "/reels" },
];

const sections = [
  { id: "use", number: "01", title: "वेबसाइट का उपयोग" },
  { id: "news", number: "02", title: "समाचार सामग्री" },
  { id: "content", number: "03", title: "Content Usage" },
  { id: "links", number: "04", title: "External Links" },
  { id: "comments", number: "05", title: "Comments" },
  { id: "advertising", number: "06", title: "विज्ञापन" },
  { id: "disclaimer", number: "07", title: "Disclaimer" },
  { id: "availability", number: "08", title: "Website Availability" },
  { id: "updates", number: "09", title: "Terms में बदलाव" },
  { id: "contact", number: "10", title: "संपर्क करें" },
];

export default function TermsPage() {
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
              src="/logo.png"
              alt="Infinia Bharat News"
              width={220}
              height={70}
              priority
              className="h-auto w-[155px] object-contain sm:w-[185px]"
            />
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-6 lg:flex">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-zinc-200 transition hover:text-red-500"
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
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

            <Link
              href="/live-tv"
              className="hidden rounded-md bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 sm:block"
            >
              Live TV
            </Link>

            <Link
              href="/menu"
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-red-500 hover:text-red-500 lg:hidden"
            >
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
            </Link>
          </div>
        </div>
      </header>

      {/* RED BAR */}
      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-hidden px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
          <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-black text-red-600">
            TERMS
          </span>

          <span className="truncate">
            Infinia Bharat News — Terms & Conditions
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

          <span className="font-semibold text-zinc-800">
            Terms & Conditions
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Website Terms & Legal Information
              </p>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Terms & Conditions
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                {siteConfig.name} की यह Terms & Conditions वेबसाइट के उपयोग,
                समाचार सामग्री, comments, external links और अन्य digital
                services से संबंधित नियमों और शर्तों को स्पष्ट करती है।
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">
                वेबसाइट का उपयोग करके आप इन Terms & Conditions को पढ़ने और
                इनके लागू प्रावधानों का पालन करने के लिए सहमत होते हैं।
              </p>
            </div>

            {/* QUICK INFO */}
            <div className="border-l-4 border-red-600 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Terms Overview
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    Website Use
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    वेबसाइट का उपयोग lawful और responsible तरीके से किया जाना
                    चाहिए।
                  </p>
                </div>

                <div>
                  <p className="text-sm font-black text-zinc-900">
                    News Content
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    News और information सामान्य informational purposes के लिए
                    उपलब्ध कराई जाती है।
                  </p>
                </div>

                <div>
                  <p className="text-sm font-black text-zinc-900">
                    User Conduct
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Comments और interactions में abusive, illegal या
                    misleading content की अनुमति नहीं है।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TERMS */}
      <section className="bg-[#f7f7f7]">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* SIDE NAV */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-zinc-200 bg-white">
                <div className="border-b border-zinc-200 bg-[#111] px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-wider text-red-500">
                    On This Page
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    Terms & Conditions
                  </p>
                </div>

                <nav className="divide-y divide-zinc-100">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <span className="text-[10px] font-black text-red-600">
                        {section.number}
                      </span>

                      <span>{section.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* CONTENT */}
            <article className="border border-zinc-200 bg-white">
              {/* ARTICLE HEADER */}
              <div className="border-b border-zinc-200 bg-white px-6 py-7 sm:px-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    Official Terms
                  </span>

                  <span className="text-xs font-semibold text-zinc-400">
                    {siteConfig.name}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black text-zinc-950 sm:text-3xl">
                  Terms of Use & Website Conditions
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  यह page {siteConfig.name} वेबसाइट के उपयोगकर्ताओं के लिए
                  लागू सामान्य terms और conditions की जानकारी प्रदान करता है।
                </p>
              </div>

              <div className="divide-y divide-zinc-200">
                {/* 01 */}
                <section
                  id="use"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      01
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        वेबसाइट का उपयोग
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        {siteConfig.name} का उपयोग करते हुए आप इन Terms &
                        Conditions का पालन करने के लिए सहमत होते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट का उपयोग किसी illegal, fraudulent, harmful,
                        abusive या unauthorized purpose के लिए नहीं किया जाना
                        चाहिए।
                      </p>

                      <div className="mt-5 border-l-4 border-red-600 bg-red-50 p-5">
                        <p className="text-sm font-semibold leading-7 text-red-900">
                          Website का उपयोग करते समय लागू कानूनों और अन्य
                          व्यक्तियों के अधिकारों का सम्मान करना आवश्यक है।
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 02 */}
                <section
                  id="news"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      02
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        समाचार सामग्री
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट पर प्रकाशित समाचार, articles, videos,
                        headlines, photographs और अन्य सामग्री सामान्य
                        informational और news purposes के लिए उपलब्ध कराई
                        जाती है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        समाचारों में समय के साथ updates, corrections,
                        clarifications या changes किए जा सकते हैं। किसी
                        publication को अंतिम या पूर्ण रूप से अपरिवर्तनीय
                        information नहीं माना जाना चाहिए।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 03 */}
                <section
                  id="content"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      03
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Content Usage
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट की original content, branding, graphics,
                        design elements और अन्य protected materials को बिना
                        उचित authorization के commercial purpose के लिए copy,
                        reproduce, modify या redistribute नहीं किया जाना
                        चाहिए।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        जहां किसी content के लिए third-party rights लागू
                        होते हैं, वहां संबंधित rights holder की terms और
                        permissions लागू हो सकती हैं।
                      </p>

                      <div className="mt-5 border border-zinc-200 bg-zinc-50 p-5">
                        <p className="text-sm leading-7 text-zinc-600">
                          उचित attribution या permission के बिना copyrighted
                          material का unauthorized commercial reuse न करें।
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 04 */}
                <section
                  id="links"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      04
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        External Links
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हमारी website पर external websites, social media
                        platforms, videos या अन्य online resources के links
                        उपलब्ध हो सकते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        किसी external website पर जाने के बाद उस website की
                        अपनी terms, privacy policy और content policies लागू हो
                        सकती हैं। {siteConfig.name} उन external websites की
                        availability, accuracy या policies के लिए जिम्मेदार
                        नहीं है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 05 */}
                <section
                  id="comments"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      05
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Comments & User Content
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Users द्वारा किए गए comments या अन्य submissions
                        respectful, lawful और relevant होने चाहिए।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Abusive, defamatory, hateful, threatening, illegal,
                        misleading, spam या किसी व्यक्ति अथवा समुदाय को
                        नुकसान पहुंचाने वाली सामग्री publish नहीं की जानी
                        चाहिए।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        {siteConfig.name} को ऐसे comments या user-generated
                        content को remove, restrict या moderate करने का अधिकार
                        सुरक्षित है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 06 */}
                <section
                  id="advertising"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      06
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        विज्ञापन और Third-Party Services
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट पर third-party advertising, analytics, video
                        hosting या अन्य digital services का उपयोग किया जा
                        सकता है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        ऐसे services अपनी individual terms, policies और
                        technical requirements के अनुसार operate कर सकती हैं।
                        Users को संबंधित third-party service की policies को
                        भी review करना चाहिए।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 07 */}
                <section
                  id="disclaimer"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      07
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Disclaimer
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हम समाचारों और अन्य information को accurate और timely
                        रखने का प्रयास करते हैं, लेकिन किसी भी information की
                        पूर्ण accuracy, completeness या continuous availability
                        की guarantee नहीं दी जाती।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        महत्वपूर्ण financial, legal, medical या अन्य
                        professional decisions लेने से पहले users को
                        appropriate qualified professional या authoritative
                        source से independent verification करनी चाहिए।
                      </p>

                      <div className="mt-5 border-l-4 border-red-600 bg-zinc-50 p-5">
                        <p className="text-sm font-semibold leading-7 text-zinc-700">
                          Website पर उपलब्ध information को professional advice
                          का substitute नहीं माना जाना चाहिए।
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 08 */}
                <section
                  id="availability"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      08
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Website Availability
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हम website और इसकी services को उपलब्ध और functional
                        रखने का प्रयास करते हैं। हालांकि maintenance,
                        technical issues, hosting problems, network failures
                        या अन्य परिस्थितियों के कारण website temporarily
                        unavailable हो सकती है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Website की किसी भी specific feature या service की
                        uninterrupted availability की guarantee नहीं दी जाती।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 09 */}
                <section
                  id="updates"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      09
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Terms में बदलाव
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Website, technology, services या applicable
                        requirements में बदलाव के अनुसार इन Terms & Conditions
                        को समय-समय पर update किया जा सकता है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Updated version इसी page पर प्रकाशित की जाएगी। Users
                        को समय-समय पर इस page को review करने की सलाह दी जाती
                        है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 10 */}
                <section
                  id="contact"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      10
                    </span>

                    <div className="w-full">
                      <h2 className="text-2xl font-black text-zinc-950">
                        Terms से संबंधित संपर्क
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Terms & Conditions, website content या website usage
                        से संबंधित किसी प्रश्न के लिए आप {siteConfig.name}
                        से संपर्क कर सकते हैं।
                      </p>

                      <a
                        href="mailto:arpitmishraqq1801@gmail.com"
                        className="mt-5 inline-flex items-center gap-2 bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700"
                      >
                        arpitmishraqq1801@gmail.com
                        <span>→</span>
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* RELATED LINKS */}
      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">
              More Information
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight">
              Infinia Bharat News
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/about"
              className="group border border-zinc-200 bg-white p-6 transition hover:border-red-500 hover:bg-red-50"
            >
              <p className="text-xs font-black uppercase text-red-600">
                About
              </p>

              <h3 className="mt-3 text-lg font-black">About Us</h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Infinia Bharat News और उसके newsroom के बारे में जानें।
              </p>

              <span className="mt-4 block font-bold text-red-600 transition group-hover:translate-x-1">
                Read More →
              </span>
            </Link>

            <Link
              href="/privacy-policy"
              className="group border border-zinc-200 bg-white p-6 transition hover:border-red-500 hover:bg-red-50"
            >
              <p className="text-xs font-black uppercase text-red-600">
                Privacy
              </p>

              <h3 className="mt-3 text-lg font-black">Privacy Policy</h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Privacy, cookies और data handling से संबंधित जानकारी पढ़ें।
              </p>

              <span className="mt-4 block font-bold text-red-600 transition group-hover:translate-x-1">
                Read More →
              </span>
            </Link>

            <Link
              href="/contact"
              className="group border border-zinc-200 bg-white p-6 transition hover:border-red-500 hover:bg-red-50"
            >
              <p className="text-xs font-black uppercase text-red-600">
                Contact
              </p>

              <h3 className="mt-3 text-lg font-black">Contact Us</h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                सामान्य पूछताछ, feedback और अन्य requests के लिए संपर्क करें।
              </p>

              <span className="mt-4 block font-bold text-red-600 transition group-hover:translate-x-1">
                Contact →
              </span>
            </Link>

            <Link
              href="/advertise"
              className="group border border-zinc-200 bg-white p-6 transition hover:border-red-500 hover:bg-red-50"
            >
              <p className="text-xs font-black uppercase text-red-600">
                Business
              </p>

              <h3 className="mt-3 text-lg font-black">
                Advertise With Us
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Infinia Bharat News पर advertising opportunities के बारे में
                जानें।
              </p>

              <span className="mt-4 block font-bold text-red-600 transition group-hover:translate-x-1">
                Explore →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-7 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-100">
              Need Help?
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
              Terms से जुड़ा कोई सवाल है?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100">
              हमारी टीम से संपर्क करने के लिए Contact Us page पर जाएं।
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="bg-white px-6 py-3 text-center text-sm font-black text-red-600 transition hover:bg-zinc-100"
            >
              Contact Us
            </Link>

            <Link
              href="/privacy-policy"
              className="border border-white/40 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-white/10"
            >
              Privacy Policy
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
                  src="/logo.png"
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
                {[
                  ["Latest News", "/latest"],
                  ["India", "/category/india"],
                  ["World", "/category/world"],
                  ["Politics", "/category/politics"],
                  ["Business", "/category/business"],
                ].map(([title, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block text-zinc-400 transition hover:text-white"
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </div>

            {/* EXPLORE */}
            <div>
              <h3 className="mb-5 text-sm font-black uppercase tracking-[0.12em] text-[#d4af37]">
                Explore
              </h3>

              <div className="space-y-3 text-sm">
                {[
                  ["Videos", "/videos"],
                  ["Reels", "/reels"],
                  ["Live TV", "/live-tv"],
                  ["Authors", "/author"],
                  ["Advertise", "/advertise"],
                  ["Contact", "/contact"],
                ].map(([title, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block text-zinc-400 transition hover:text-white"
                  >
                    {title}
                  </Link>
                ))}
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