import type { Metadata } from "next";
import TermsPageClient from "./TermsPageClient";

export const metadata: Metadata = {
  title: "Terms & Conditions | Infinia Bharat News",
  description:
    "Infinia Bharat News की Terms & Conditions पढ़ें। वेबसाइट के उपयोग, समाचार सामग्री, comments, external links, advertising और अन्य नियमों की जानकारी यहां उपलब्ध है।",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return <TermsPageClient />;
}