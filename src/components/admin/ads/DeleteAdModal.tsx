"use client";

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import type { AdsData } from "./types";

interface DeleteAdModalProps {
  ad: AdsData | null;
  open: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAdModal({
  ad,
  open,
  deleting = false,
  onClose,
  onConfirm,
}: DeleteAdModalProps) {
  if (!open || !ad) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[120]
        flex
        items-center
        justify-center
        bg-black/75
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !deleting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-950
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-zinc-800
            px-5
            py-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-red-500/10
                text-red-400
              "
            >
              <AlertTriangle
                size={20}
              />
            </div>

            <div>
              <h2
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Delete Advertisement
              </h2>

              <p
                className="
                  mt-0.5
                  text-[11px]
                  text-zinc-600
                "
              >
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-zinc-500
              transition
              hover:bg-zinc-900
              hover:text-white
              disabled:pointer-events-none
              disabled:opacity-40
            "
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="p-5">
          <p
            className="
              text-sm
              leading-6
              text-zinc-400
            "
          >
            Are you sure you want to permanently
            delete
            <span
              className="
                mx-1
                font-semibold
                text-white
              "
            >
              "{ad.name}"
            </span>
            ?
          </p>

          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-500/10
              bg-red-500/5
              p-3
            "
          >
            <p
              className="
                text-xs
                leading-5
                text-red-300/80
              "
            >
              The advertisement configuration,
              targeting settings and stored
              analytics associated with this ad
              will be removed.
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            flex-col-reverse
            gap-2
            border-t
            border-zinc-800
            p-4
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="
              h-10
              rounded-xl
              border
              border-zinc-800
              bg-zinc-900
              px-4
              text-xs
              font-semibold
              text-zinc-300
              transition
              hover:bg-zinc-800
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="
              flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-red-500
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {deleting ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />

                Delete Advertisement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}