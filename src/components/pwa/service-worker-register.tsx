"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
      })
      .then((registration) => {
        console.log(
          "INFINIA PWA Service Worker registered:",
          registration.scope
        );

        // Check for new SW version
        registration.update();
      })
      .catch((error) => {
        console.error(
          "INFINIA PWA Service Worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}