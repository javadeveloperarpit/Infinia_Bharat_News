"use client";

import {
  useEffect,
  useState,
} from "react";

import AdRenderer from "@/components/ads/AdRenderer";

import {
  getAds,
  type BusinessAd,
} from "@/services/ads.service";

export default function GlobalAds() {
  const [ads, setAds] =
    useState<BusinessAd[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadAds() {
      try {
        const data = await getAds();

        if (mounted) {
          setAds(data);
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
      {/* ================================================= */}
      {/* GLOBAL POPUP */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="popup"
        position="global_popup"
      />

      {/* ================================================= */}
      {/* PAGE TRANSITION */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="page_transition"
        position="page_transition"
      />

      {/* ================================================= */}
      {/* FLOATING TV */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="floating_tv"
        position="floating_tv"
      />

      {/* ================================================= */}
      {/* 3D CUBE */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="cube"
      />

      {/* ================================================= */}
      {/* STICKY BOTTOM */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="sticky_bottom"
        position="sticky_bottom"
      />

      {/* ================================================= */}
      {/* BANNER */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="banner"
      />

      {/* ================================================= */}
      {/* NATIVE */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="native"
      />

      {/* ================================================= */}
      {/* SHORTS VIDEO */}
      {/* ================================================= */}

      <AdRenderer
        ads={ads}
        type="shorts_video"
      />
    </>
  );
}