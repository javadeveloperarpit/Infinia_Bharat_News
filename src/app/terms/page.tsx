import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS की Terms and Conditions पढ़ें और वेबसाइट के उपयोग से संबंधित नियमों को समझें।",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">
            Terms & Conditions
          </p>

          <h1 className="mt-2 text-4xl font-black text-zinc-950 sm:text-5xl">
            नियम एवं शर्तें
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              1. वेबसाइट का उपयोग
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              INFINIA BHARAT NEWS का उपयोग करते हुए आप इन Terms & Conditions
              का पालन करने के लिए सहमत होते हैं।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              2. समाचार सामग्री
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट पर प्रकाशित समाचार और अन्य सामग्री केवल सामान्य
              informational purposes के लिए उपलब्ध कराई जाती है। समाचारों में
              समय के साथ बदलाव, अपडेट या correction हो सकते हैं।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              3. Content Usage
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट की सामग्री को बिना उचित अनुमति के commercial purpose के
              लिए reproduce, copy या redistribute नहीं किया जाना चाहिए।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              4. External Links
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट में third-party websites के links हो सकते हैं। उन
              websites की सामग्री और policies के लिए INFINIA BHARAT NEWS
              जिम्मेदार नहीं है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              5. Comments
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              उपयोगकर्ताओं द्वारा किए गए comments में abusive, defamatory,
              illegal, misleading या किसी व्यक्ति/समुदाय को नुकसान पहुंचाने
              वाली सामग्री नहीं होनी चाहिए। ऐसे comments को हटाने का अधिकार
              वेबसाइट के पास सुरक्षित है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              6. Disclaimer
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              हम समाचारों को सटीक और समय पर प्रस्तुत करने का प्रयास करते हैं,
              लेकिन किसी भी जानकारी की पूर्ण accuracy या completeness की
              गारंटी नहीं दी जाती।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              7. Terms में बदलाव
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              INFINIA BHARAT NEWS आवश्यकता के अनुसार इन Terms & Conditions को
              कभी भी update कर सकता है। बदलाव इसी page पर प्रकाशित किए जाएंगे।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              8. संपर्क
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              Terms & Conditions से संबंधित प्रश्नों के लिए:
            </p>

            <a
              href="mailto:arpitmishraqq1801@gmail.com"
              className="mt-3 inline-block font-bold text-red-600 hover:underline"
            >
              arpitmishraqq1801@gmail.com
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}