"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { BusinessAd } from "@/services/ads.service";

type Device = "desktop" | "mobile";

interface StickyBottomAdProps {
  ad: BusinessAd;
  device: Device;
}

export default function StickyBottomAd({
  ad,
  device,
}: StickyBottomAdProps) {
  const [expanded, setExpanded] = useState(true);

  // ==================================================
  // STRICT AD TYPE CHECK
  // ==================================================

  if (ad.type !== "sticky_bottom") {
    return null;
  }

  const image = ad.image || "";
  const link = ad.link || "";

  const mobile = device === "mobile";

  // ==================================================
  // RESTORE COLLAPSED STATE
  // ==================================================

  useEffect(() => {
    try {
      const collapsed = sessionStorage.getItem(
        `infinia-sticky-bottom-collapsed-${ad.id}`
      );

      if (collapsed === "true") {
        setExpanded(false);
      }
    } catch {
      // Ignore storage errors
    }
  }, [ad.id]);

  // ==================================================
  // TOGGLE
  // ==================================================

  const handleToggle = () => {
    setExpanded((current) => {
      const next = !current;

      try {
        sessionStorage.setItem(
          `infinia-sticky-bottom-collapsed-${ad.id}`,
          String(!next)
        );
      } catch {
        // Ignore storage errors
      }

      return next;
    });
  };

  // ==================================================
  // DON'T RENDER WITHOUT IMAGE
  // ==================================================

  if (!image) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes infiniaStickyBottomIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }

          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .infinia-sticky-bottom {
          position: fixed;

          left: 0;
          right: 0;
          bottom: 0;

          width: 100%;

          display: flex;
          align-items: flex-end;
          justify-content: center;

          z-index: 999999;

          pointer-events: none;

          padding:
            0
            max(8px, env(safe-area-inset-right))
            env(safe-area-inset-bottom)
            max(8px, env(safe-area-inset-left));

          box-sizing: border-box;

          animation:
            infiniaStickyBottomIn
            0.35s
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .infinia-sticky-bottom-inner {
          position: relative;

          width:
            ${mobile
              ? "100%"
              : "min(1100px, calc(100vw - 32px))"};

          max-width:
            ${mobile ? "440px" : "1100px"};

          box-sizing: border-box;

          pointer-events: auto;
        }

        .infinia-sticky-bottom-link {
          display: block;

          width: 100%;

          overflow: hidden;

          background: #000;

          border:
            1px solid
            rgba(255,255,255,0.18);

          border-bottom: none;

          border-radius:
            ${mobile
              ? "6px 6px 0 0"
              : "8px 8px 0 0"};

          box-shadow:
            0 -8px 35px
            rgba(0,0,0,0.4);

          box-sizing: border-box;

          transition:
            height 0.3s
            cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.25s ease;
        }

        .infinia-sticky-bottom-image {
          display: block;

          width: 100%;

          height:
            ${mobile ? "72px" : "92px"};

          max-width: 100%;

          object-fit: cover;

          object-position: center;

          user-select: none;

          -webkit-user-drag: none;

          transition:
            opacity 0.25s ease;
        }

        /* ==================================================
           CENTERED GOOGLE-STYLE TOGGLE BUTTON
           ================================================== */

        .infinia-sticky-bottom-toggle {
          position: absolute;

          /*
           * IMPORTANT:
           * Center relative to the COMPLETE ad container.
           */
          left: 50%;
          right: auto;

          top: -34px;

          transform: translateX(-50%);

          width: 64px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;
          margin: 0;

          border:
            1px solid
            rgba(255,255,255,0.85);

          border-bottom: none;

          border-radius:
            8px 8px 0 0;

          background:
            rgba(0,0,0,0.95);

          color: #fff;

          cursor: pointer;

          z-index: 30;

          box-shadow:
            0 -4px 15px
            rgba(0,0,0,0.3);

          box-sizing: border-box;

          line-height: 0;

          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .infinia-sticky-bottom-toggle:hover {
          background: #000;
        }

        .infinia-sticky-bottom-toggle:active {
          transform:
            translateX(-50%)
            scale(0.96);
        }

        .infinia-sticky-bottom-toggle svg {
          width: 26px;
          height: 26px;

          display: block;

          flex-shrink: 0;

          margin: 0;
        }

        /* ==================================================
           ADVERTISEMENT LABEL
           ================================================== */

        .infinia-sticky-bottom-label {
          position: absolute;

          top: 6px;
          left: 7px;

          padding: 3px 6px;

          background:
            rgba(0,0,0,0.7);

          color: #fff;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 0.08em;

          text-transform: uppercase;

          pointer-events: none;

          z-index: 10;

          border-radius: 2px;

          transition:
            opacity 0.2s ease;
        }

        /* ==================================================
           COLLAPSED STATE
           ================================================== */

        .infinia-sticky-bottom.is-collapsed
          .infinia-sticky-bottom-link {
          height: 0;

          border-color: transparent;

          box-shadow: none;

          opacity: 0;

          pointer-events: none;
        }

        .infinia-sticky-bottom.is-collapsed
          .infinia-sticky-bottom-image {
          opacity: 0;
        }

        .infinia-sticky-bottom.is-collapsed
          .infinia-sticky-bottom-label {
          opacity: 0;

          pointer-events: none;
        }

        /* ==================================================
           COLLAPSED TOGGLE
           ================================================== */

        .infinia-sticky-bottom.is-collapsed
          .infinia-sticky-bottom-toggle {
          top: -34px;

          border-radius:
            8px 8px 8px 8px;

          border-bottom:
            1px solid
            rgba(255,255,255,0.85);
        }

        /* ==================================================
           MOBILE
           ================================================== */

        @media (max-width: 768px) {
          .infinia-sticky-bottom {
            padding-left: 0;
            padding-right: 0;
          }

          .infinia-sticky-bottom-inner {
            width: 100%;
            max-width: 440px;
          }

          .infinia-sticky-bottom-image {
            width: 100%;
            height: 72px;

            object-fit: cover;
          }

          .infinia-sticky-bottom-toggle {
            left: 50%;
            right: auto;

            width: 64px;
            height: 34px;

            top: -34px;

            transform: translateX(-50%);
          }

          .infinia-sticky-bottom-toggle:active {
            transform:
              translateX(-50%)
              scale(0.96);
          }

          .infinia-sticky-bottom-toggle svg {
            width: 26px;
            height: 26px;
          }
        }

        /* ==================================================
           VERY SMALL MOBILE
           ================================================== */

        @media (max-width: 380px) {
          .infinia-sticky-bottom-image {
            height: 64px;
          }

          .infinia-sticky-bottom-toggle {
            width: 60px;
          }
        }

        /* ==================================================
           REDUCED MOTION
           ================================================== */

        @media (prefers-reduced-motion: reduce) {
          .infinia-sticky-bottom {
            animation: none;
          }

          .infinia-sticky-bottom-link,
          .infinia-sticky-bottom-image,
          .infinia-sticky-bottom-toggle {
            transition: none;
          }
        }
      `}</style>

      <div
        className={`infinia-sticky-bottom ${
          !expanded ? "is-collapsed" : ""
        }`}
      >
        <div className="infinia-sticky-bottom-inner">

          {/* ==========================================
              CENTERED EXPAND / COLLAPSE BUTTON
              ========================================== */}

          <button
            type="button"
            className="infinia-sticky-bottom-toggle"
            onClick={handleToggle}
            aria-label={
              expanded
                ? "Collapse advertisement"
                : "Expand advertisement"
            }
            title={
              expanded
                ? "Collapse advertisement"
                : "Expand advertisement"
            }
          >
            {expanded ? (
              <ChevronDown
                size={26}
                strokeWidth={2.8}
              />
            ) : (
              <ChevronUp
                size={26}
                strokeWidth={2.8}
              />
            )}
          </button>

          {/* ==========================================
              ADVERTISEMENT LABEL
              ========================================== */}

          <div className="infinia-sticky-bottom-label">
            Advertisement
          </div>

          {/* ==========================================
              ADVERTISEMENT
              ========================================== */}

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
              className="infinia-sticky-bottom-link"
            >
              <img
                src={image}
                alt={
                  ad.title ||
                  "Advertisement"
                }
                className="infinia-sticky-bottom-image"
                draggable={false}
              />
            </a>
          ) : (
            <div className="infinia-sticky-bottom-link">
              <img
                src={image}
                alt={
                  ad.title ||
                  "Advertisement"
                }
                className="infinia-sticky-bottom-image"
                draggable={false}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

