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
        const response =
          await fetch(
            "/data/ads.json",
            {
              cache: "no-store",
            }
          );

        // --------------------------------------------
        // JSON FILE NOT AVAILABLE
        // --------------------------------------------

        if (!response.ok) {
          if (mounted) {
            setAds([]);
          }

          return;
        }

        // --------------------------------------------
        // READ AS TEXT FIRST
        // --------------------------------------------

        const text =
          await response.text();

        // --------------------------------------------
        // EMPTY JSON FILE
        // --------------------------------------------

        if (!text.trim()) {
          if (mounted) {
            setAds([]);
          }

          return;
        }

        // --------------------------------------------
        // SAFE JSON PARSE
        // --------------------------------------------

        let data: unknown;

        try {
          data = JSON.parse(text);
        } catch {
          if (mounted) {
            setAds([]);
          }

          return;
        }

        // --------------------------------------------
        // EXTRACT ADS
        // --------------------------------------------

        const loadedAds =
          Array.isArray(
            (data as { ads?: unknown })?.ads
          )
            ? (data as {
                ads: BusinessAd[];
              }).ads
            : [];

        if (mounted) {
          setAds(loadedAds);
        }

      } catch {
        // ------------------------------------------
        // ANY NETWORK / FETCH ERROR
        // Treat as "no ads"
        // ------------------------------------------

        if (mounted) {
          setAds([]);
        }
      }
    }

    loadAds();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------
  // NO ADS
  // ----------------------------------------------

  if (!ads.length) {
    return null;
  }

  // ----------------------------------------------
  // GLOBAL ADS
  // ----------------------------------------------

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