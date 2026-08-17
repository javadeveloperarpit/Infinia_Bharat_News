import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Providers from "./providers";
import { siteConfig } from "@/config/site";
import PageLoadingBar from "@/components/navigation/PageLoadingBar";
import ServiceWorkerRegister from "@/components/pwa/service-worker-register";

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

  keywords: [...siteConfig.keywords],

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
      url: "/icon.svg",
      type: "image/svg+xml",
    },
    {
      url: "/icons/favicon-96x96.webp",
      type: "image/webp",
      sizes: "96x96",
    },
    {
      url: "/icons/favicon-192x192.webp",
      type: "image/webp",
      sizes: "192x192",
    },
    {
      url: "/icons/favicon-512x512.webp",
      type: "image/webp",
      sizes: "512x512",
    },
  ],

  apple: [
    {
      url: "/apple-icon.webp",
      sizes: "192x192",
      type: "image/webp",
    },
  ],
},

  openGraph: {
    type: "website",

    locale: siteConfig.locale,

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
  themeColor: siteConfig.themeColor,

  width: "device-width",

  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",

  "@id": `${siteConfig.url}/#organization`,

  name: siteConfig.name,

  url: siteConfig.url,

  logo: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/logos/logo-light.webp`,
    width: 1200,
    height: 630,
  },

  image: `${siteConfig.url}${siteConfig.logo}`,

  description: siteConfig.description,

  publishingPrinciples:
    `${siteConfig.url}/about`,

  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${siteConfig.url}/contact`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",

  "@id": `${siteConfig.url}/#website`,

  name: siteConfig.name,

  url: siteConfig.url,

  description: siteConfig.description,

  inLanguage: siteConfig.language,

  publisher: {
    "@id": `${siteConfig.url}/#organization`,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.language.split("-")[0]}
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Google AdSense Verification */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6155856047825271"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegister />

<script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(
        organizationSchema
      ),
    }}
  />

  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(
        websiteSchema
      ),
    }}
  />
        <PageLoadingBar />

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}