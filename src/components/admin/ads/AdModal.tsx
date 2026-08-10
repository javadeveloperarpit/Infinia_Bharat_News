"use client";

import { X } from "lucide-react";

import AdForm from "./AdForm";
import type {
  AdsData,
  CreateAdData,
} from "./types";

// ======================================================
// PROPS
// ======================================================

interface AdModalProps {
  open: boolean;
  ad?: AdsData | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateAdData
  ) => Promise<void>;
}

// ======================================================
// COMPONENT
// ======================================================

export default function AdModal({
  open,
  ad = null,
  loading = false,
  onClose,
  onSubmit,
}: AdModalProps) {
  if (!open) {
    return null;
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    data: CreateAdData
  ): Promise<void> {
    await onSubmit(data);
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-center
        justify-center
        bg-black/75
        p-3
        backdrop-blur-sm
        sm:p-5
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >
      {/* ==================================================
          MODAL
      ================================================== */}

      <div
        className="
          flex
          h-[95vh]
          w-full
          max-w-5xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-950
          shadow-2xl
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-4
            border-b
            border-zinc-800
            bg-zinc-950
            px-4
            py-4
            sm:px-6
          "
        >
          <div className="min-w-0">
            <h2
              className="
                truncate
                text-base
                font-bold
                text-white
                sm:text-lg
              "
            >
              {ad
                ? "Edit Advertisement"
                : "Create Advertisement"}
            </h2>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-zinc-500
              "
            >
              {ad
                ? "Update advertisement configuration and settings."
                : "Configure a new advertisement for your website."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close advertisement modal"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              text-zinc-400
              transition
              hover:border-zinc-700
              hover:bg-zinc-800
              hover:text-white
              disabled:pointer-events-none
              disabled:opacity-40
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ==================================================
            FORM AREA
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
          "
        >
          <div
            className="
              px-4
              py-5
              sm:px-6
              sm:py-6
            "
          >
            <AdForm
              ad={ad}
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}