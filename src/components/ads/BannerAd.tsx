"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  BusinessAd,
} from "@/services/ads.service";



interface BannerAdProps {
  ads: BusinessAd[];
}



export default function BannerAd({
  ads,
}: BannerAdProps) {

  // ==================================================
  // ONLY ACTIVE BANNER ADS
  // ==================================================

  const bannerAds = ads
    .filter(
      (ad) =>
        ad.type === "banner" &&
        ad.active
    )
    .sort(
      (a, b) =>
        (b.priority ?? 1) -
        (a.priority ?? 1)
    );


  // ==================================================
  // CURRENT SLIDE
  // ==================================================

  const [currentIndex, setCurrentIndex] =
    useState(0);


  // ==================================================
  // RESET INDEX IF ADS CHANGE
  // ==================================================

  useEffect(() => {
    setCurrentIndex(0);
  }, [bannerAds.length]);


  // ==================================================
  // AUTO SLIDE
  // ==================================================

  useEffect(() => {

    if (bannerAds.length <= 1) {
      return;
    }

    const interval =
      window.setInterval(() => {

        setCurrentIndex(
          (current) =>
            (current + 1) %
            bannerAds.length
        );

      }, 5000);


    return () => {
      window.clearInterval(interval);
    };

  }, [bannerAds.length]);


  // ==================================================
  // DON'T RENDER WITHOUT ADS
  // ==================================================

  if (!bannerAds.length) {
    return null;
  }


  // ==================================================
  // CURRENT AD
  // ==================================================

  const ad =
    bannerAds[
      currentIndex
    ];


  if (!ad || ad.type !== "banner") {
    return null;
  }


  const image =
    ad.image || "";

  const link =
    ad.link || "";


  if (!image) {
    return null;
  }


  // ==================================================
  // RENDER
  // ==================================================

  return (
    <>
      <style>{`

        @keyframes infiniaBannerIn {

          from {
            opacity: 0;
            transform: translateY(-8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }


        .infinia-banner {

          width: 100%;

          display: flex;

          justify-content: center;

          box-sizing: border-box;

          animation:
            infiniaBannerIn
            0.35s
            ease-out;

        }


        .infinia-banner-inner {

          position: relative;

          width: 100%;

          max-width: 1100px;

          box-sizing: border-box;

        }


        .infinia-banner-link {

          position: relative;

          display: block;

          width: 100%;

          overflow: hidden;

          background: #000;

          border:
            1px solid
            rgba(255,255,255,0.16);

          border-radius: 6px;

          box-sizing: border-box;

          text-decoration: none;

          box-shadow:
            0 4px 20px
            rgba(0,0,0,0.18);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;

        }


        .infinia-banner-link:hover {

          transform:
            translateY(-1px);

          box-shadow:
            0 6px 24px
            rgba(0,0,0,0.24);

        }


        .infinia-banner-image {

          display: block;

          width: 100%;

          height: auto;

          max-width: 100%;

          object-fit: contain;

          object-position: center;

          user-select: none;

          -webkit-user-drag: none;

        }


        .infinia-banner-label {

          position: absolute;

          top: 6px;

          left: 7px;

          padding:
            3px
            6px;

          background:
            rgba(0,0,0,0.72);

          color: #fff;

          font-size: 8px;

          font-weight: 700;

          line-height: 1.2;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;

          pointer-events: none;

          z-index: 5;

          border-radius: 2px;

        }


        .infinia-banner-dots {

          position: absolute;

          left: 50%;

          bottom: 7px;

          transform:
            translateX(-50%);

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 5px;

          padding: 4px 7px;

          background:
            rgba(0,0,0,0.55);

          border-radius: 20px;

          z-index: 10;

        }


        .infinia-banner-dot {

          width: 6px;

          height: 6px;

          padding: 0;

          border: none;

          border-radius: 50%;

          background:
            rgba(255,255,255,0.5);

          cursor: pointer;

          transition:
            width 0.2s ease,
            background 0.2s ease;

        }


        .infinia-banner-dot.active {

          width: 18px;

          border-radius: 6px;

          background: #fff;

        }


        @media (max-width: 768px) {

          .infinia-banner {

            width: 100%;

          }


          .infinia-banner-inner {

            width: 100%;

            max-width: 100%;

          }


          .infinia-banner-link {

            border-radius: 4px;

          }


          .infinia-banner-image {

            width: 100%;

            height: auto;

          }


          .infinia-banner-label {

            top: 5px;

            left: 5px;

            padding:
              2px
              5px;

            font-size: 7px;

          }


          .infinia-banner-dots {

            bottom: 5px;

          }

        }


        @media (max-width: 380px) {

          .infinia-banner-label {

            top: 4px;

            left: 4px;

            font-size: 6px;

          }


          .infinia-banner-dot {

            width: 5px;

            height: 5px;

          }


          .infinia-banner-dot.active {

            width: 14px;

          }

        }


        @media (prefers-reduced-motion: reduce) {

          .infinia-banner {

            animation: none;

          }


          .infinia-banner-link {

            transition: none;

          }

        }

      `}</style>


      <div className="infinia-banner">

        <div className="infinia-banner-inner">


          {link ? (

            <a
              href={link}
              target={
                ad.openInNewTab !== false
                  ? "_blank"
                  : "_self"
              }
              rel={
                ad.openInNewTab !== false
                  ? "noopener noreferrer"
                  : undefined
              }
              className="infinia-banner-link"
            >

              <div className="infinia-banner-label">
                Advertisement
              </div>


              <img
                src={image}
                alt={
                  ad.title ||
                  "Advertisement"
                }
                className="infinia-banner-image"
                draggable={false}
              />

            </a>

          ) : (

            <div className="infinia-banner-link">

              <div className="infinia-banner-label">
                Advertisement
              </div>


              <img
                src={image}
                alt={
                  ad.title ||
                  "Advertisement"
                }
                className="infinia-banner-image"
                draggable={false}
              />

            </div>

          )}


          {/* ========================================
              SLIDE INDICATORS
          ======================================== */}

          {bannerAds.length > 1 && (

            <div className="infinia-banner-dots">

              {bannerAds.map(
                (banner, index) => (

                  <button
                    key={banner.id}
                    type="button"
                    aria-label={
                      `Show advertisement ${index + 1}`
                    }
                    className={
                      `infinia-banner-dot ${
                        index === currentIndex
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setCurrentIndex(index)
                    }
                  />

                )
              )}

            </div>

          )}

        </div>

      </div>
    </>
  );
}

