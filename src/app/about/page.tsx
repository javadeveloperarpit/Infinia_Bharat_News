import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `About Us | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS के बारे में जानें। हमारा उद्देश्य पाठकों तक तेज, विश्वसनीय और महत्वपूर्ण समाचार पहुंचाना है।",
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">
            About Us
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            INFINIA BHARAT NEWS
          </h1>

          <p className="mt-4 text-lg font-medium text-zinc-600">
            {siteConfig.slogan}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              हमारे बारे में
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              <strong>INFINIA BHARAT NEWS</strong> एक हिंदी डिजिटल न्यूज़
              प्लेटफॉर्म है, जिसका उद्देश्य भारत और दुनिया से जुड़ी महत्वपूर्ण
              खबरों को पाठकों तक तेज़ और सरल तरीके से पहुंचाना है।
            </p>

            <p className="mt-4 leading-8 text-zinc-600">
              हम राजनीति, देश-दुनिया, उत्तर प्रदेश, खेल, बिजनेस, टेक्नोलॉजी,
              मनोरंजन और अन्य महत्वपूर्ण विषयों से संबंधित समाचार प्रकाशित
              करते हैं।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              हमारा उद्देश्य
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              हमारा उद्देश्य पाठकों को महत्वपूर्ण घटनाओं की जानकारी समय पर
              उपलब्ध कराना और समाचारों को स्पष्ट एवं समझने योग्य तरीके से
              प्रस्तुत करना है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              हमारी प्राथमिकताएं
            </h2>

            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-zinc-600">
              <li>समाचारों की सटीकता और विश्वसनीयता।</li>
              <li>समय पर महत्वपूर्ण खबरों की जानकारी।</li>
              <li>पाठकों के लिए सरल और उपयोगी समाचार प्रस्तुति।</li>
              <li>पारदर्शिता और जिम्मेदार पत्रकारिता।</li>
            </ul>
          </div>

          <div className="rounded-xl bg-red-50 p-5">
            <p className="font-bold text-red-700">
              {siteConfig.slogan}
            </p>
          </div>

          <div>
            <p className="text-zinc-600">
              किसी सुझाव, प्रतिक्रिया या जानकारी के लिए हमारे
              <Link
                href="/contact"
                className="ml-1 font-bold text-red-600 hover:underline"
              >
                Contact Us
              </Link>{" "}
              पेज पर जाएं।
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}