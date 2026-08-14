import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Contact Us | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS से संपर्क करें। समाचार, सुझाव, प्रतिक्रिया और अन्य पूछताछ के लिए हमसे संपर्क करें।",
  alternates: {
    canonical: `${siteConfig.url}/contact`,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">
            Contact Us
          </p>

          <h1 className="mt-2 text-4xl font-black text-zinc-950 sm:text-5xl">
            हमसे संपर्क करें
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            INFINIA BHARAT NEWS से संपर्क करने के लिए नीचे दिए गए माध्यमों का
            उपयोग करें।
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-zinc-950">
              सामान्य पूछताछ
            </h2>

            <p className="mt-3 leading-7 text-zinc-600">
              वेबसाइट, समाचार, सुझाव या किसी अन्य सामान्य विषय के लिए हमसे
              संपर्क कर सकते हैं।
            </p>

            <a
              href="mailto:arpitmishraqq1801@gmail.com"
              className="mt-5 inline-block font-bold text-red-600 hover:underline"
            >
              arpitmishraqq1801@gmail.com
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-zinc-950">
              समाचार / सुझाव
            </h2>

            <p className="mt-3 leading-7 text-zinc-600">
              यदि आपके पास किसी महत्वपूर्ण घटना या समाचार से संबंधित जानकारी
              है, तो आप हमें ईमेल के माध्यम से भेज सकते हैं।
            </p>

            <a
              href="mailto:arpitmishraqq1801@gmail.com"
              className="mt-5 inline-block font-bold text-red-600 hover:underline"
            >
              समाचार भेजें →
            </a>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-black text-zinc-950">
              प्रतिक्रिया और सुझाव
            </h2>

            <p className="mt-3 leading-7 text-zinc-600">
              आपकी प्रतिक्रिया हमारे लिए महत्वपूर्ण है। वेबसाइट के अनुभव,
              सामग्री या किसी तकनीकी समस्या से संबंधित सुझाव भी आप हमें भेज
              सकते हैं।
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <p className="text-sm leading-7 text-red-800">
            कृपया ईमेल करते समय अपने संदेश का विषय स्पष्ट रखें ताकि आपकी
            पूछताछ को सही तरीके से समझा और जवाब दिया जा सके।
          </p>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          <Link
            href="/about"
            className="font-bold text-red-600 hover:underline"
          >
            About Us
          </Link>
          {" · "}
          <Link
            href="/privacy-policy"
            className="font-bold text-red-600 hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </section>
    </main>
  );
}