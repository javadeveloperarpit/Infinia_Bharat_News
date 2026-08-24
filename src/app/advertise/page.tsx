import type { Metadata } from "next";
import AdvertiseClient from "./advertise-client";

export const metadata: Metadata = {
  title:
    "Advertise With Us | Digital Advertising & Brand Promotion",

  description:
    "Advertise your brand with our digital news platform. Explore homepage advertising, sponsored content, business promotion, video promotion and custom brand campaigns.",

  alternates: {
    canonical: "/advertise",
  },

  openGraph: {
    title:
      "Advertise With Us | Digital Advertising & Brand Promotion",

    description:
      "Partner with us for digital advertising, sponsored content, business promotion and brand campaigns.",

    url: "/advertise",

    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function AdvertisePage() {
  return <AdvertiseClient />;
}