import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS की Privacy Policy पढ़ें और जानें कि वेबसाइट उपयोगकर्ताओं की जानकारी, cookies, advertising और data को कैसे संभालती है।",
  alternates: {
    canonical: `${siteConfig.url}/privacy-policy`,
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
  { id: "introduction", number: "01", title: "परिचय" },
  { id: "information", number: "02", title: "जानकारी का संग्रह" },
  { id: "cookies", number: "03", title: "Cookies और Tracking" },
  { id: "advertising", number: "04", title: "विज्ञापन" },
  { id: "third-party", number: "05", title: "Third-Party Services" },
  { id: "external-links", number: "06", title: "External Links" },
  { id: "data-security", number: "07", title: "Data Security" },
  { id: "children", number: "08", title: "Children's Privacy" },
  { id: "updates", number: "09", title: "Policy Updates" },
  { id: "contact", number: "10", title: "संपर्क करें" },
];

export default function PrivacyPolicyPage() {
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
                aria-hidden="true"
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
              <summary
                aria-label="Open menu"
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-white/15 text-white transition hover:border-red-500 hover:text-red-500 [&::-webkit-details-marker]:hidden"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </svg>
              </summary>

              <div className="absolute right-0 top-12 w-[280px] overflow-hidden border border-white/10 bg-[#111111] shadow-2xl">
                <nav className="grid grid-cols-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="border-b border-r border-white/10 px-4 py-4 text-sm font-semibold text-zinc-300 transition hover:bg-red-600 hover:text-white"
                    >
                      {link.title}
                    </Link>
                  ))}

                  <Link
                    href="/live-tv"
                    className="col-span-2 bg-red-600 px-4 py-3 text-center text-xs font-black uppercase tracking-wide text-white"
                  >
                    Watch Live TV
                  </Link>
                </nav>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* RED BAR */}
      <div className="border-b border-red-700 bg-red-600">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 overflow-hidden px-4 py-2 text-xs font-bold text-white sm:px-6 lg:px-8">
          <span className="shrink-0 bg-white px-2 py-1 text-[10px] font-black text-red-600">
            PRIVACY
          </span>

          <span className="truncate">
            Infinia Bharat News — Privacy Policy & Data Protection Information
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
            Privacy Policy
          </span>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                Privacy & Data Protection
              </p>

              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>

              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                {siteConfig.name} की यह Privacy Policy बताती है कि हमारी
                वेबसाइट का उपयोग करते समय जानकारी किस प्रकार एकत्र, उपयोग और
                सुरक्षित की जा सकती है।
              </p>

              <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-500">
                हमारा उद्देश्य पाठकों को समाचार और डिजिटल सामग्री उपलब्ध
                कराते हुए उनकी privacy और personal information के महत्व का
                सम्मान करना है।
              </p>
            </div>

            {/* QUICK INFO */}
            <div className="border-l-4 border-red-600 bg-[#f7f7f7] p-6">
              <p className="text-xs font-black uppercase tracking-wider text-red-600">
                Privacy Overview
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-black text-zinc-900">
                    Information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    केवल आवश्यक या technical information परिस्थितियों के
                    अनुसार एकत्र की जा सकती है।
                  </p>
                </div>

                <div>
                  <p className="text-sm font-black text-zinc-900">
                    Cookies
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    बेहतर अनुभव, analytics और advertising के लिए cookies का
                    उपयोग हो सकता है।
                  </p>
                </div>

                <div>
                  <p className="text-sm font-black text-zinc-900">
                    Third Parties
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    कुछ services अपनी अलग privacy policies के अनुसार
                    information process कर सकती हैं।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN POLICY */}
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
                    Privacy Policy
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

            {/* POLICY CONTENT */}
            <article className="border border-zinc-200 bg-white">
              {/* ARTICLE HEADER */}
              <div className="border-b border-zinc-200 bg-white px-6 py-7 sm:px-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    Official Policy
                  </span>

                  <span className="text-xs font-semibold text-zinc-400">
                    {siteConfig.name}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black text-zinc-950 sm:text-3xl">
                  Privacy Policy & Data Protection
                </h2>

                <p className="mt-3 text-sm leading-7 text-zinc-500">
                  यह पेज {siteConfig.name} वेबसाइट की privacy practices के
                  बारे में विस्तृत जानकारी प्रदान करता है।
                </p>
              </div>

              <div className="divide-y divide-zinc-200">
                {/* 01 */}
                <section
                  id="introduction"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      01
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        परिचय
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        {siteConfig.name} एक digital news platform है जो भारत
                        और दुनिया से संबंधित समाचार, वीडियो और अन्य digital
                        content उपलब्ध कराता है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        यह Privacy Policy बताती है कि वेबसाइट पर आने वाले
                        visitors और users से संबंधित information को किस प्रकार
                        handle किया जा सकता है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 02 */}
                <section
                  id="information"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      02
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        जानकारी का संग्रह
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट का उपयोग करते समय कुछ technical information
                        automatically collect हो सकती है। इसमें IP address,
                        browser type, device information, operating system,
                        visited pages, referral information और सामान्य usage
                        data शामिल हो सकते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        यदि कोई user स्वयं contact form, inquiry, email,
                        comment या अन्य communication माध्यम से information
                        प्रदान करता है, तो उस information को संबंधित request
                        का उत्तर देने के लिए उपयोग किया जा सकता है।
                      </p>

                      <div className="mt-5 border-l-4 border-red-600 bg-red-50 p-5">
                        <p className="text-sm font-semibold leading-7 text-red-900">
                          हम users द्वारा स्वयं उपलब्ध कराई गई information को
                          केवल संबंधित purpose और applicable services के
                          संदर्भ में उपयोग करने का प्रयास करते हैं।
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 03 */}
                <section
                  id="cookies"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      03
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Cookies और Tracking Technologies
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        वेबसाइट बेहतर user experience, website functionality,
                        analytics और advertising purposes के लिए cookies,
                        pixels या इसी प्रकार की technologies का उपयोग कर
                        सकती है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Cookies browser में preferences या technical
                        information store कर सकती हैं। Users अपने browser
                        settings के माध्यम से cookies को manage या disable कर
                        सकते हैं, हालांकि इससे website की कुछ functionalities
                        प्रभावित हो सकती हैं।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 04 */}
                <section
                  id="advertising"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      04
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        विज्ञापन और Advertising Services
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        {siteConfig.name} पर third-party advertising services
                        का उपयोग किया जा सकता है। ऐसे advertising partners
                        अपनी advertising technologies के माध्यम से cookies या
                        अन्य identifiers का उपयोग कर सकते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Advertising providers की अपनी privacy policies और data
                        practices हो सकती हैं। Users को संबंधित advertising
                        provider की policies और available privacy controls को
                        भी देखना चाहिए।
                      </p>

                      <div className="mt-5 border border-zinc-200 bg-zinc-50 p-5">
                        <p className="text-sm leading-7 text-zinc-600">
                          Advertising preferences और personalized advertising
                          controls संबंधित advertising provider द्वारा
                          उपलब्ध विकल्पों के अनुसार manage किए जा सकते हैं।
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 05 */}
                <section
                  id="third-party"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      05
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Third-Party Services
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Website पर analytics, advertising, video hosting,
                        authentication, content delivery और अन्य third-party
                        services का उपयोग किया जा सकता है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        इन third-party providers द्वारा information को process
                        करने के तरीके उनकी अपनी privacy policies द्वारा
                        नियंत्रित हो सकते हैं। {siteConfig.name} third-party
                        services की individual privacy practices के लिए
                        जिम्मेदार नहीं है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 06 */}
                <section
                  id="external-links"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      06
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        External Links
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हमारी website पर external websites, social media
                        platforms, videos या अन्य online resources के links हो
                        सकते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        किसी external website पर जाने के बाद उस website की
                        privacy policy और terms लागू हो सकती हैं। Users को
                        किसी third-party website के साथ information share करने
                        से पहले उसकी policies को पढ़ने की सलाह दी जाती है।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 07 */}
                <section
                  id="data-security"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      07
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Data Security
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हम information को unauthorized access, alteration,
                        disclosure या destruction से बचाने के लिए reasonable
                        technical और organisational measures अपनाने का
                        प्रयास करते हैं।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हालांकि, internet पर data transmission या electronic
                        storage का कोई भी तरीका पूर्ण रूप से secure होने की
                        guarantee नहीं देता।
                      </p>
                    </div>
                  </div>
                </section>

                {/* 08 */}
                <section
                  id="children"
                  className="scroll-mt-28 px-6 py-8 sm:px-10"
                >
                  <div className="flex gap-4">
                    <span className="hidden text-xs font-black text-red-600 sm:block">
                      08
                    </span>

                    <div>
                      <h2 className="text-2xl font-black text-zinc-950">
                        Children's Privacy
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        हमारी website सामान्य audience के लिए news और
                        information platform है। हम जानबूझकर बच्चों से
                        unnecessary personal information collect करने का
                        उद्देश्य नहीं रखते।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        यदि किसी parent या guardian को लगे कि किसी बच्चे ने
                        website के माध्यम से personal information उपलब्ध कराई
                        है, तो वे हमसे संपर्क कर सकते हैं।
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
                        Privacy Policy Updates
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Website, technology, services या applicable
                        requirements में बदलाव के अनुसार इस Privacy Policy को
                        समय-समय पर update किया जा सकता है।
                      </p>

                      <p className="mt-4 leading-8 text-zinc-600">
                        किसी महत्वपूर्ण बदलाव के बाद updated version इसी page
                        पर प्रकाशित किया जाएगा। Users को समय-समय पर इस page को
                        review करने की सलाह दी जाती है।
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
                        Privacy से संबंधित संपर्क
                      </h2>

                      <p className="mt-4 leading-8 text-zinc-600">
                        Privacy Policy, data handling या privacy से संबंधित
                        किसी प्रश्न के लिए आप {siteConfig.name} से संपर्क कर
                        सकते हैं।
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
              href="/terms"
              className="group border border-zinc-200 bg-white p-6 transition hover:border-red-500 hover:bg-red-50"
            >
              <p className="text-xs font-black uppercase text-red-600">
                Legal
              </p>

              <h3 className="mt-3 text-lg font-black">
                Terms & Conditions
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Website के उपयोग से संबंधित terms और conditions पढ़ें।
              </p>

              <span className="mt-4 block font-bold text-red-600 transition group-hover:translate-x-1">
                Read More →
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
              Privacy से जुड़ा कोई सवाल है?
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