"use client";

import { useEffect, useState } from "react";

interface RelativeTimeProps {
  createdAt?: string;
  className?: string;
}

function getTimeText(createdAt?: string) {
  if (!createdAt) {
    return "Today";
  }

  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return "Today";
  }

  const difference = Math.max(0, Date.now() - createdTime);

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  // Deterministic date fallback.
  // No locale-dependent formatting during hydration.
  const day = String(new Date(createdTime).getDate()).padStart(2, "0");

  const month = String(
    new Date(createdTime).getMonth() + 1
  ).padStart(2, "0");

  const year = new Date(createdTime).getFullYear();

  return `${day}/${month}/${year}`;
}

export default function RelativeTime({
  createdAt,
  className,
}: RelativeTimeProps) {
  // IMPORTANT:
  // Server + first client render must be identical.
  const [time, setTime] = useState("Published");

  useEffect(() => {
    const update = () => {
      setTime(getTimeText(createdAt));
    };

    update();

    // Update every minute instead of every second.
    const timer = window.setInterval(update, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, [createdAt]);

  return (
    <span className={className}>
      {time}
    </span>
  );
}

