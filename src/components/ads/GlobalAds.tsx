"use client";

import {
  useEffect,
  useState,
} from "react";

import AdRenderer from "@/components/ads/AdRenderer";

import type {
  BusinessAd,
} from "@/services/ads.service";

export default function GlobalAds() {
  const [ads, setAds] =
    useState<BusinessAd[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadAds() {
      try {
        const response = await fetch(
          "/data/ads.json",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Ads JSON returned ${response.status}`
          );
        }

        const data = await response.json();

        if (mounted) {
          setAds(
            Array.isArray(data?.ads)
              ? data.ads
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load advertisements:",
          error
        );
      }
    }

    loadAds();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ads.length) {
    return null;
  }

  return (
    <>
      {/* GLOBAL POPUP */}

      <AdRenderer
        ads={ads}
        type="popup"
      />

      {/* PAGE TRANSITION */}

      <AdRenderer
        ads={ads}
        type="page_transition"
      />

      {/* FLOATING TV */}

      <AdRenderer
        ads={ads}
        type="floating_tv"
      />

      {/* 3D CUBE */}

      <AdRenderer
        ads={ads}
        type="cube"
      />

      {/* STICKY BOTTOM */}

      <AdRenderer
        ads={ads}
        type="sticky_bottom"
      />

      {/* BANNER */}

      <AdRenderer
        ads={ads}
        type="banner"
      />

      {/* SHORTS VIDEO */}

      <AdRenderer
        ads={ads}
        type="shorts_video"
      />

      {/* NATIVE */}

      <AdRenderer
        ads={ads}
        type="native"
      />
    </>
  );
}