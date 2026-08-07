"use client";

import {
  FaFacebookF,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6";

import { Link2 } from "lucide-react";

interface Props {
  title: string;
  url: string;
}

export default function ShareButtons({
  title,
  url,
}: Props) {
  function copyLink() {
    navigator.clipboard.writeText(url);
    alert("Link copied");
  }

  return (
    <div
      className="
      sticky
      top-24
      z-30

      flex
      flex-row
      md:flex-col

      gap-3
      items-center

      w-fit
      "
    >
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
        w-11
        h-11
        rounded-full
        bg-blue-600
        text-white
        flex
        items-center
        justify-center
        hover:scale-110
        transition
        shadow-lg
        "
      >
        <FaFacebookF size={18} />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
        w-11
        h-11
        rounded-full
        bg-black
        text-white
        flex
        items-center
        justify-center
        hover:scale-110
        transition
        shadow-lg
        "
      >
        <FaXTwitter size={18} />
      </a>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(
          `${title} ${url}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="
        w-11
        h-11
        rounded-full
        bg-green-600
        text-white
        flex
        items-center
        justify-center
        hover:scale-110
        transition
        shadow-lg
        "
      >
        <FaWhatsapp size={18} />
      </a>

      <button
        onClick={copyLink}
        className="
        w-11
        h-11
        rounded-full
        bg-zinc-800
        text-white
        flex
        items-center
        justify-center
        hover:scale-110
        transition
        shadow-lg
        "
      >
        <Link2 size={18} />
      </button>
    </div>
  );
}