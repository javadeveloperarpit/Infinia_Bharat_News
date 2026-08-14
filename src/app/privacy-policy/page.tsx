import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.name}`,
  description:
    "INFINIA BHARAT NEWS की Privacy Policy पढ़ें और जानें कि वेबसाइट उपयोगकर्ताओं की जानकारी और डेटा को कैसे संभालती है।",
  alternates: {
    canonical: `${siteConfig.url}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-wider text-red-600">
            Privacy Policy
          </p>

          <h1 className="mt-2 text-4xl font-black text-zinc-950 sm:text-5xl">
            गोपनीयता नीति
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <article className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              1. परिचय
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              यह Privacy Policy बताती है कि {siteConfig.name} वेबसाइट का उपयोग
              करते समय आपकी जानकारी को किस प्रकार संभाला जाता है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              2. जानकारी का संग्रह
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट का उपयोग करते समय कुछ तकनीकी जानकारी जैसे IP address,
              browser type, device information, pages visited और सामान्य
              analytics information स्वतः एकत्र हो सकती है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              3. Cookies
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट बेहतर अनुभव, analytics और आवश्यक सेवाओं के लिए cookies
              या इसी प्रकार की तकनीकों का उपयोग कर सकती है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              4. विज्ञापन
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट पर third-party advertising services का उपयोग किया जा
              सकता है। ये सेवाएं विज्ञापन दिखाने के लिए cookies या समान
              तकनीकों का उपयोग कर सकती हैं।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              5. Third-Party Services
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              वेबसाइट पर analytics, advertising, video hosting या अन्य
              third-party services का उपयोग किया जा सकता है। इन सेवाओं की
              अपनी privacy policies हो सकती हैं।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              6. External Links
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              हमारी वेबसाइट पर अन्य websites के links हो सकते हैं। उन websites
              की privacy practices के लिए संबंधित website की privacy policy
              देखना आपकी जिम्मेदारी है।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              7. Policy Updates
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              इस Privacy Policy में समय-समय पर बदलाव किए जा सकते हैं। किसी भी
              बदलाव के बाद updated policy इसी page पर उपलब्ध होगी।
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-black text-zinc-950">
              8. संपर्क
            </h2>

            <p className="mt-4 leading-8 text-zinc-600">
              Privacy Policy से संबंधित प्रश्नों के लिए हमसे संपर्क करें:
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