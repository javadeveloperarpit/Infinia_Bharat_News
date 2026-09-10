import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Infinia Bharat News | Official News Platform",

  description:
    "Infinia Bharat News के बारे में जानें। हमारी न्यूज़ वेबसाइट, मिशन, संपादकीय दृष्टिकोण, कवरेज और विश्वसनीय समाचारों के प्रति हमारी प्रतिबद्धता के बारे में पूरी जानकारी यहां पढ़ें।",

  alternates: {
    canonical: "/about",
  },

  openGraph: {
    title: "About Infinia Bharat News | Official News Platform",
    description:
      "जानिए Infinia Bharat News क्या है, हमारा मिशन क्या है और हम भारत एवं दुनिया की खबरें किस दृष्टिकोण से प्रकाशित करते हैं।",
    url: "/about",
    siteName: "Infinia Bharat News",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}