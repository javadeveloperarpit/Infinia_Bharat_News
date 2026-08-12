import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Providers from "./providers";
import { siteConfig } from "@/config/site";
import PageLoadingBar from "@/components/navigation/PageLoadingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),

  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  keywords: [
    "भारत समाचार",
    "हिंदी समाचार",
    "आज की ताजा खबर",
    "ताजा खबर",
    "ब्रेकिंग न्यूज़",
    "Breaking News",
    "India News",
    "Hindi News",
    "Latest News",
    "Politics",
    "Sports",
    "Business",
    "Technology",
    "Entertainment",
    "INFINIA BHARAT NEWS",
  ],

  authors: [
    {
      name: "INFINIA BHARAT NEWS",
    },
  ],

  creator: "INFINIA BHARAT NEWS",

  publisher: "INFINIA BHARAT NEWS",

  category: "news",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: siteConfig.url,
  },

  icons: {
  icon: [
    {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    {
      url: "/favicon.svg",
      type: "image/svg+xml",
    },
    {
      url: "/favicon-96x96.png",
      type: "image/png",
      sizes: "96x96",
    },
  ],

  apple: [
    {
      url: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
},

  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,

    images: [
      {
        url: siteConfig.logo,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,

    images: [siteConfig.logo],
  },
};

export const viewport: Viewport = {
  themeColor: "#C8102E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <PageLoadingBar />

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}