import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live TV – Watch Live News & Television | Infinia Bharat News",

  description:
    "Watch live TV and live news channels online with Infinia Bharat News. Stream breaking news, national news and live television broadcasts in real time.",

  keywords: [
    "live tv",
    "live TV India",
    "live news",
    "live news India",
    "watch live news",
    "live television",
    "Indian news live",
    "breaking news live",
    "news channel live",
    "Infinia Bharat News",
  ],

  alternates: {
    canonical: "https://infiniabharatnews.vercel.app/live-tv",
  },

  openGraph: {
    title: "Live TV – Watch Live News Online | Infinia Bharat News",

    description:
      "Watch live news and television broadcasts online with Infinia Bharat News.",

    url: "https://infiniabharatnews.vercel.app/live-tv",

    siteName: "Infinia Bharat News",

    type: "website",

    images: [
      {
        url: "https://infiniabharatnews.vercel.app/icons/favicon-512x512.png",
        width: 512,
        height: 512,
        alt: "Infinia Bharat News",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Live TV – Watch Live News Online | Infinia Bharat News",

    description:
      "Watch live news and television broadcasts online with Infinia Bharat News.",

    images: [
      "https://infiniabharatnews.vercel.app/icons/favicon-512x512.png",
    ],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function LiveTvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}