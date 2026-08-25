"use client";

import { useState } from "react";

const PUSH_API =
  "https://infinia-push.infiniabharatnews.workers.dev";

export default function PushSubscribe() {
  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const subscribeToPush =
    async () => {
      try {
        setLoading(true);
        setStatus("");

        if (
          typeof window === "undefined"
        ) {
          return;
        }

        if (
          !("Notification" in window)
        ) {
          setStatus(
            "Your browser does not support notifications."
          );
          return;
        }

        if (
          !("serviceWorker" in navigator)
        ) {
          setStatus(
            "Service Worker is not supported."
          );
          return;
        }

        if (
          !("PushManager" in window)
        ) {
          setStatus(
            "Push notifications are not supported."
          );
          return;
        }

        // Ask permission
        const permission =
          await Notification.requestPermission();

        if (
          permission !== "granted"
        ) {
          setStatus(
            "Notification permission was not granted."
          );
          return;
        }

        // Existing PWA Service Worker
        const registration =
          await navigator.serviceWorker.ready;

        // Get VAPID public key
        const keyResponse =
          await fetch(
            `${PUSH_API}/vapid-public-key`
          );

        if (!keyResponse.ok) {
          throw new Error(
            "Unable to fetch VAPID public key."
          );
        }

        const keyData =
          await keyResponse.json();

        if (
          !keyData.success ||
          !keyData.publicKey
        ) {
          throw new Error(
            "Invalid VAPID public key response."
          );
        }

        const applicationServerKey =
          urlBase64ToUint8Array(
            keyData.publicKey
          );

        // Existing subscription?
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

        // Send to Cloudflare Worker
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

        setStatus(
          "Notifications enabled successfully! 🔔"
        );
      } catch (error) {
        console.error(
          "Push subscription error:",
          error
        );

        setStatus(
          error instanceof Error
            ? error.message
            : "Unable to enable notifications."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <button
      type="button"
      onClick={subscribeToPush}
      disabled={loading}
    >
      {loading
        ? "Enabling..."
        : "🔔 Enable Notifications"}
    </button>
  );
}

function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 -
        (base64String.length % 4)) %
        4
    );

  const base64 =
    (
      base64String
        .replace(/-/g, "+")
        .replace(/_/g, "/") +
      padding
    );

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) => char.charCodeAt(0)
    )
  );
}