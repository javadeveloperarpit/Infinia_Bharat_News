"use client";

import { useEffect, useState } from "react";

const PUSH_API =
  "https://infinia-push.infiniabharatnews.workers.dev";

const DISMISS_KEY =
  "infinia-push-dismissed";

const DISMISS_DAYS = 7;

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    base64String
      .replace(/-/g, "+")
      .replace(/_/g, "/") + padding;

  const rawData = window.atob(base64);

  return Uint8Array.from(
    Array.from(rawData).map((char) =>
      char.charCodeAt(0)
    )
  );
}

export default function PushNotificationPopup() {
  const [visible, setVisible] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    const checkNotificationStatus =
      async () => {
        try {
          if (
            typeof window === "undefined" ||
            !("Notification" in window) ||
            !("serviceWorker" in navigator) ||
            !("PushManager" in window)
          ) {
            return;
          }

          // Already denied — don't keep annoying the user.
          if (
            Notification.permission ===
            "denied"
          ) {
            return;
          }

          // Already allowed — check subscription.
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

          // Check dismiss cooldown.
          const dismissed =
            localStorage.getItem(
              DISMISS_KEY
            );

          if (dismissed) {
            const dismissedAt =
              Number(dismissed);

            const daysPassed =
              (Date.now() - dismissedAt) /
              (1000 * 60 * 60 * 24);

            if (
              daysPassed < DISMISS_DAYS
            ) {
              return;
            }

            localStorage.removeItem(
              DISMISS_KEY
            );
          }

          // Small delay so popup doesn't appear immediately.
          const timer = window.setTimeout(
            () => {
              setVisible(true);
            },
            7000
          );

          return () =>
            window.clearTimeout(timer);
        } catch (error) {
          console.error(
            "Notification popup check failed:",
            error
          );
        }
      };

    checkNotificationStatus();
  }, []);

  const closePopup = () => {
    localStorage.setItem(
      DISMISS_KEY,
      Date.now().toString()
    );

    setVisible(false);
  };

  const enableNotifications =
    async () => {
      try {
        setLoading(true);
        setMessage("");

        if (
          !("Notification" in window)
        ) {
          setMessage(
            "आपका browser notifications support नहीं करता।"
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

        let permission =
          Notification.permission;

        if (permission !== "granted") {
          permission =
            await Notification.requestPermission();
        }

        if (permission !== "granted") {
          setMessage(
            "Notifications enable नहीं हुईं। आप बाद में फिर कोशिश कर सकते हैं।"
          );
          return;
        }

        const registration =
          await navigator.serviceWorker.ready;

        const keyResponse =
          await fetch(
            `${PUSH_API}/vapid-public-key`
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

        let subscription =
          await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription =
            await registration.pushManager.subscribe(
              {
                userVisibleOnly: true,
                applicationServerKey,
              }
            );
        }

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
        bottom-5
        right-5
        z-[9999]
        w-[calc(100%-2rem)]
        max-w-[390px]
      "
    >
      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-zinc-200
          bg-white
          shadow-[0_12px_45px_rgba(0,0,0,0.18)]
          dark:border-zinc-800
          dark:bg-zinc-950
        "
      >
        {/* Top accent */}
        <div
          className="
            h-1
            w-full
            bg-[#C8102E]
          "
        />

        <button
          type="button"
          onClick={closePopup}
          aria-label="Close notification popup"
          className="
            absolute
            right-3
            top-3
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            text-zinc-400
            transition
            hover:bg-zinc-100
            hover:text-zinc-700
            dark:hover:bg-zinc-900
          "
        >
          ×
        </button>

        <div className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-red-50
                text-xl
                dark:bg-red-950/40
              "
            >
              🔔
            </div>

            <div>
              <p
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[#C8102E]
                "
              >
                INFINIA BHARAT NEWS
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-zinc-500
                  dark:text-zinc-400
                "
              >
                News alerts
              </p>
            </div>
          </div>

          <h3
            className="
              pr-8
              text-[19px]
              font-bold
              leading-7
              text-zinc-900
              dark:text-white
            "
          >
            बड़ी खबरें आते ही जानिए
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-zinc-600
              dark:text-zinc-400
            "
          >
            Breaking News और जरूरी
            अपडेट सीधे आपके browser पर।
            कोई खबर मिस न करें।
          </p>

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-x-4
              gap-y-2
              text-xs
              font-medium
              text-zinc-600
              dark:text-zinc-400
            "
          >
            <span>• Breaking News</span>
            <span>• Top Headlines</span>
            <span>• जरूरी Updates</span>
          </div>

          {message && (
            <p
              className="
                mt-3
                text-xs
                leading-5
                text-red-600
              "
            >
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={enableNotifications}
            disabled={loading}
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#C8102E]
              px-4
              py-3
              text-sm
              font-bold
              text-white
              shadow-sm
              transition
              hover:bg-[#a90d27]
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          >
            {loading ? (
              "Notifications enable हो रही हैं..."
            ) : (
              <>
                <span>🔔</span>
                Notifications ON करें
              </>
            )}
          </button>

          <button
            type="button"
            onClick={closePopup}
            className="
              mt-3
              w-full
              text-center
              text-xs
              font-medium
              text-zinc-500
              transition
              hover:text-zinc-800
              dark:hover:text-zinc-200
            "
          >
            अभी नहीं
          </button>
        </div>
      </div>
    </div>
  );
}