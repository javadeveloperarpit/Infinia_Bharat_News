"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BellRing,
  ShieldCheck,
  X,
} from "lucide-react";

const PUSH_API =
  "https://infinia-push.infiniabharatnews.workers.dev";

/*
 * ============================================
 * TEST MODE
 * ============================================
 *
 * true  = popup दिखेगा even if already subscribed
 * false = production behavior
 */
const TEST_MODE = false;

const DISMISS_KEY =
  "infinia-push-dismissed";

const DISMISS_MINUTES = 10;

function urlBase64ToUint8Array(
  base64String: string
): Uint8Array {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    base64String
      .replace(/-/g, "+")
      .replace(/_/g, "/") + padding;

  const rawData =
    window.atob(base64);

  const output =
    new Uint8Array(rawData.length);

  for (
    let i = 0;
    i < rawData.length;
    i++
  ) {
    output[i] =
      rawData.charCodeAt(i);
  }

  return output;
}

export default function PushNotificationPopup() {
  const [visible, setVisible] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const timerRef =
    useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const schedulePopup = (
      delay: number
    ) => {
      if (timerRef.current !== null) {
        window.clearTimeout(
          timerRef.current
        );
      }

      timerRef.current =
        window.setTimeout(() => {
          if (!cancelled) {
            setVisible(true);
          }
        }, delay);
    };

    const checkNotificationStatus =
      async () => {
        try {
          if (
            typeof window ===
              "undefined" ||
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
          ) {
            return;
          }

          /*
           * ==========================================
           * PRODUCTION SUBSCRIPTION CHECK
           * ==========================================
           *
           * TEST_MODE=true होने पर इसे skip करेंगे
           * ताकि UI testing के लिए popup आता रहे।
           */
          if (!TEST_MODE) {
            if (
              Notification.permission ===
              "denied"
            ) {
              return;
            }

            if (
              Notification.permission ===
              "granted"
            ) {
              const registration =
                await navigator.serviceWorker.ready;

              const subscription =
                await registration.pushManager.getSubscription();

              if (subscription) {
                return;
              }
            }
          }

          /*
           * ==========================================
           * DISMISS COOLDOWN
           * ==========================================
           */
          const dismissed =
            localStorage.getItem(
              DISMISS_KEY
            );

          if (dismissed) {
            const dismissedAt =
              Number(dismissed);

            const minutesPassed =
              (Date.now() -
                dismissedAt) /
              (1000 * 60);

            if (
              minutesPassed <
              DISMISS_MINUTES
            ) {
              const remaining =
                DISMISS_MINUTES -
                minutesPassed;

              schedulePopup(
                remaining * 60 * 1000
              );

              return;
            }

            localStorage.removeItem(
              DISMISS_KEY
            );
          }

          /*
           * First appearance:
           * 7 seconds after page load.
           */
          schedulePopup(7000);
        } catch (error) {
          console.error(
            "Notification popup check failed:",
            error
          );
        }
      };

    checkNotificationStatus();

    return () => {
      cancelled = true;

      if (
        timerRef.current !== null
      ) {
        window.clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  /*
   * ============================================
   * CLOSE / NOT NOW
   * ============================================
   */
  const closePopup = () => {
    localStorage.setItem(
      DISMISS_KEY,
      Date.now().toString()
    );

    setVisible(false);
    setMessage("");
  };

  /*
   * ============================================
   * ENABLE NOTIFICATIONS
   * ============================================
   */
  const enableNotifications =
    async () => {
      try {
        setLoading(true);
        setMessage("");

        if (
          !("Notification" in window)
        ) {
          setMessage(
            "यह browser notifications support नहीं करता।"
          );
          return;
        }

        if (
          !("serviceWorker" in navigator)
        ) {
          setMessage(
            "Notification service उपलब्ध नहीं है।"
          );
          return;
        }

        if (
          !("PushManager" in window)
        ) {
          setMessage(
            "इस browser में push notifications उपलब्ध नहीं हैं।"
          );
          return;
        }

        /*
         * IMPORTANT:
         *
         * सीधे Notification.permission को
         * comparison में use कर रहे हैं।
         *
         * इससे TypeScript का
         * TS2367 error नहीं आएगा।
         */
        const browserPermission =
          Notification.permission;

        if (
          browserPermission ===
          "denied"
        ) {
          setMessage(
            "Notifications blocked हैं। Browser settings में जाकर INFINIA BHARAT NEWS के लिए notifications Allow करें।"
          );
          return;
        }

        /*
         * Request browser permission.
         */
        if (
          browserPermission !==
          "granted"
        ) {
          const requestedPermission =
            await Notification.requestPermission();

          if (
            requestedPermission !==
            "granted"
          ) {
            setMessage(
              "Notifications enable नहीं हुईं।"
            );
            return;
          }
        }

        /*
         * Wait for service worker.
         */
        const registration =
          await navigator.serviceWorker.ready;

        /*
         * Get VAPID public key.
         */
        const keyResponse =
          await fetch(
            `${PUSH_API}/vapid-public-key`,
            {
              cache: "no-store",
            }
          );

        if (!keyResponse.ok) {
          throw new Error(
            "VAPID key fetch failed."
          );
        }

        const keyData =
          await keyResponse.json();

        if (
          !keyData.success ||
          !keyData.publicKey
        ) {
          throw new Error(
            "Invalid notification configuration."
          );
        }

        const applicationServerKey =
          urlBase64ToUint8Array(
            keyData.publicKey
          );

        /*
         * Make a real ArrayBuffer.
         *
         * This fixes:
         *
         * ArrayBuffer |
         * SharedArrayBuffer
         *
         * TypeScript error.
         */
        const applicationServerBuffer =
          new Uint8Array(
            applicationServerKey
          ).slice().buffer as ArrayBuffer;

        /*
         * Existing subscription?
         */
        let subscription =
          await registration.pushManager.getSubscription();

        /*
         * Create subscription if needed.
         */
        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe(
              {
                userVisibleOnly: true,
                applicationServerKey:
                  applicationServerBuffer,
              }
            );
        }

        /*
         * Send subscription to worker.
         */
        const subscriptionJson =
          subscription.toJSON();

        const response =
          await fetch(
            `${PUSH_API}/subscribe`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify(
                subscriptionJson
              ),
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.message ||
              "Subscription failed."
          );
        }

        /*
         * Success.
         */
        localStorage.removeItem(
          DISMISS_KEY
        );

        setVisible(false);
      } catch (error) {
        console.error(
          "Push notification subscription failed:",
          error
        );

        setMessage(
          "Notifications enable नहीं हो सकीं। कृपया थोड़ी देर बाद फिर कोशिश करें।"
        );
      } finally {
        setLoading(false);
      }
    };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-x-0
        top-4
        z-[9999]
        flex
        justify-center
        px-3
        pointer-events-none
        sm:top-5
      "
      role="dialog"
      aria-modal="false"
      aria-labelledby="infinia-notification-title"
      aria-describedby="infinia-notification-description"
    >
      <div
        className="
          pointer-events-auto
          relative
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-[18px]
          border
          border-zinc-200
          bg-white
          shadow-[0_10px_35px_rgba(0,0,0,0.16)]
          ring-1
          ring-black/[0.03]
        "
      >
        {/* Red premium accent */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[3px]
            bg-[#C8102E]
          "
        />

        {/* Close button */}
        <button
          type="button"
          onClick={closePopup}
          aria-label="Close notification prompt"
          title="Close"
          className="
            absolute
            right-3
            top-3
            z-10
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-zinc-100
            hover:text-zinc-900
            focus:outline-none
            focus:ring-2
            focus:ring-[#C8102E]/30
            active:scale-95
          "
        >
          <X
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>

        <div
          className="
            px-4
            pb-4
            pt-4
            sm:px-5
            sm:pb-5
            sm:pt-5
          "
        >
          {/* =================================
              BRAND
          ================================= */}
          <div
            className="
              flex
              items-center
              gap-3
              pr-8
            "
          >
            <div
              className="
                relative
                h-11
                w-11
                shrink-0
                overflow-hidden
                rounded-xl
                border
                border-zinc-200
                bg-white
                shadow-sm
              "
            >
              <Image
                src="/icons/favicon-192x192.webp"
                alt="INFINIA BHARAT NEWS"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>

            <div className="min-w-0">
              <div
                className="
                  text-[13px]
                  font-extrabold
                  tracking-[-0.01em]
                  text-zinc-950
                "
              >
                INFINIA BHARAT NEWS
              </div>

              <div
                className="
                  mt-0.5
                  flex
                  items-center
                  gap-1.5
                  text-[11px]
                  font-medium
                  text-zinc-500
                "
              >
                <span
                  className="
                    inline-block
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-[#C8102E]
                  "
                  aria-hidden="true"
                />

                Breaking News Alerts
              </div>
            </div>
          </div>

          {/* =================================
              CONTENT
          ================================= */}
          <div className="mt-4">
            <h2
              id="infinia-notification-title"
              className="
                pr-7
                text-[17px]
                font-extrabold
                leading-[1.35]
                tracking-[-0.02em]
                text-zinc-950
                sm:text-[18px]
              "
            >
              जरूरी खबरें सबसे पहले पाएं
            </h2>

            <p
              id="infinia-notification-description"
              className="
                mt-1.5
                max-w-[380px]
                text-[13px]
                leading-[1.55]
                text-zinc-600
              "
            >
              Breaking News, बड़ी खबरें और
              महत्वपूर्ण अपडेट सीधे आपके
              device पर।
            </p>
          </div>

          {/* Trust */}
          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              text-[11px]
              font-medium
              text-zinc-500
            "
          >
            <ShieldCheck
              size={15}
              strokeWidth={2}
              className="
                shrink-0
                text-[#C8102E]
              "
              aria-hidden="true"
            />

            <span>
              आप कभी भी notifications बंद कर सकते हैं।
            </span>
          </div>

          {/* Error */}
          {message && (
            <div
              className="
                mt-3
                rounded-lg
                border
                border-red-100
                bg-red-50
                px-3
                py-2
                text-[11px]
                font-medium
                leading-5
                text-red-700
              "
              role="alert"
            >
              {message}
            </div>
          )}

          {/* =================================
              PRIMARY ACTION
          ================================= */}
          <button
            type="button"
            onClick={
              enableNotifications
            }
            disabled={loading}
            className="
              mt-4
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-[11px]
              bg-[#C8102E]
              px-4
              text-[13px]
              font-bold
              text-white
              shadow-[0_4px_12px_rgba(200,16,46,0.22)]
              transition
              hover:bg-[#B20E29]
              hover:shadow-[0_6px_16px_rgba(200,16,46,0.28)]
              focus:outline-none
              focus:ring-2
              focus:ring-[#C8102E]/30
              focus:ring-offset-2
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {loading ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                  "
                  aria-hidden="true"
                />

                Enable हो रहा है...
              </>
            ) : (
              <>
                <BellRing
                  size={17}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />

                Notifications ON करें

                <ArrowRight
                  size={16}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />
              </>
            )}
          </button>

          {/* Secondary */}
          <button
            type="button"
            onClick={closePopup}
            className="
              mt-2
              flex
              h-8
              w-full
              items-center
              justify-center
              rounded-lg
              text-[11px]
              font-semibold
              text-zinc-500
              transition
              hover:text-zinc-900
              focus:outline-none
              focus:ring-2
              focus:ring-zinc-300
            "
          >
            अभी नहीं
          </button>
        </div>
      </div>
    </div>
  );
}