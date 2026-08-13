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
    default:
      "INFINIA BHARAT NEWS | हिंदी न्यूज़, ताज़ा खबरें और ब्रेकिंग न्यूज़",
    template: `%s | ${siteConfig.name}`,
  },

  description: siteConfig.description,

  applicationName: siteConfig.name,

  manifest: "/site.webmanifest",

  authors: [
    {
      name: siteConfig.name,
    },
  ],

  creator: siteConfig.name,

  publisher: siteConfig.name,

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

    title:
      "INFINIA BHARAT NEWS | हिंदी न्यूज़, ताज़ा खबरें और ब्रेकिंग न्यूज़",

    description: siteConfig.description,

    images: [
      {
        url: siteConfig.logo,
        width: 1200,
        height: 630,
        alt: "INFINIA BHARAT NEWS",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "INFINIA BHARAT NEWS | हिंदी न्यूज़, ताज़ा खबरें और ब्रेकिंग न्यूज़",

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