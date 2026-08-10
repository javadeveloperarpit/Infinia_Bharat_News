"use client";

import {
  Box,
  Code2,
  ExternalLink,
  Image as ImageIcon,
  PlaySquare,
  Type,
  X,
} from "lucide-react";

import type {
  AdsData,
  AdCubeFace,
} from "./types";

interface AdPreviewModalProps {
  ad: AdsData | null;

  open: boolean;

  onClose: () => void;
}

// ======================================================
// CUBE FACE
// ======================================================

interface CubeFaceProps {
  face: AdCubeFace;

  imageUrl: string;

  targetUrl: string;
}

function CubeFaceView({
  face,
  imageUrl,
  targetUrl,
}: CubeFaceProps) {
  const content = (
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        bg-zinc-900
      "
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${face} advertisement face`}
          className="
            h-full
            w-full
            object-cover
          "
        />
      ) : (
        <div
          className="
            flex
            h-full
            w-full
            items-center
            justify-center
            bg-zinc-900
            text-center
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-zinc-600
          "
        >
          {face} face
        </div>
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/20
          to-transparent
        "
      />
    </div>
  );

  if (!targetUrl) {
    return content;
  }

  return (
    <a
      href={targetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full"
    >
      {content}
    </a>
  );
}

// ======================================================
// CUBE PREVIEW
// ======================================================

function CubePreview({
  ad,
}: {
  ad: AdsData;
}) {
  const faces = ad.cubeFaces;

  const cubeSize = 260;

  return (
    <div
      className="
        flex
        min-h-[430px]
        w-full
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent_55%)]
      "
    >
      <div
        className="
          [perspective:1000px]
        "
        style={{
          width: cubeSize,
          height: cubeSize,
        }}
      >
        <div
          className="
            relative
            h-full
            w-full
            [transform-style:preserve-3d]
            animate-[adCubeRotate_12s_linear_infinite]
          "
        >
          {/* FRONT */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="front"
              imageUrl={
                faces?.front?.imageUrl ?? ""
              }
              targetUrl={
                faces?.front?.targetUrl ?? ""
              }
            />
          </div>

          {/* RIGHT */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `rotateY(90deg) translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="right"
              imageUrl={
                faces?.right?.imageUrl ?? ""
              }
              targetUrl={
                faces?.right?.targetUrl ?? ""
              }
            />
          </div>

          {/* BACK */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `rotateY(180deg) translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="back"
              imageUrl={
                faces?.back?.imageUrl ?? ""
              }
              targetUrl={
                faces?.back?.targetUrl ?? ""
              }
            />
          </div>

          {/* LEFT */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `rotateY(-90deg) translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="left"
              imageUrl={
                faces?.left?.imageUrl ?? ""
              }
              targetUrl={
                faces?.left?.targetUrl ?? ""
              }
            />
          </div>

          {/* TOP */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `rotateX(90deg) translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="top"
              imageUrl={
                faces?.top?.imageUrl ?? ""
              }
              targetUrl={
                faces?.top?.targetUrl ?? ""
              }
            />
          </div>

          {/* BOTTOM */}

          <div
            className="
              absolute
              inset-0
              overflow-hidden
              rounded-xl
              border
              border-white/10
              bg-zinc-900
              [backface-visibility:hidden]
            "
            style={{
              transform:
                `rotateX(-90deg) translateZ(${cubeSize / 2}px)`,
            }}
          >
            <CubeFaceView
              face="bottom"
              imageUrl={
                faces?.bottom?.imageUrl ?? ""
              }
              targetUrl={
                faces?.bottom?.targetUrl ?? ""
              }
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes adCubeRotate {
          from {
            transform: rotateY(0deg);
          }

          to {
            transform: rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
}

// ======================================================
// IMAGE PREVIEW
// ======================================================

function ImagePreview({
  ad,
}: {
  ad: AdsData;
}) {
  return (
    <div
      className="
        flex
        min-h-[350px]
        items-center
        justify-center
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-4
      "
    >
      {ad.imageUrl ? (
        <img
          src={ad.imageUrl}
          alt={ad.name}
          className="
            max-h-[60vh]
            max-w-full
            rounded-xl
            object-contain
          "
        />
      ) : (
        <div
          className="
            flex
            flex-col
            items-center
            gap-3
            text-zinc-600
          "
        >
          <ImageIcon size={32} />

          <span className="text-sm">
            No image configured
          </span>
        </div>
      )}
    </div>
  );
}

// ======================================================
// VIDEO PREVIEW
// ======================================================

function VideoPreview({
  ad,
}: {
  ad: AdsData;
}) {
  if (!ad.videoUrl) {
    return (
      <div
        className="
          flex
          min-h-[350px]
          flex-col
          items-center
          justify-center
          gap-3
          rounded-2xl
          border
          border-zinc-800
          bg-zinc-900
          text-zinc-600
        "
      >
        <PlaySquare size={32} />

        <span className="text-sm">
          No video configured
        </span>
      </div>
    );
  }

  if (ad.videoType === "youtube") {
    const videoId =
      extractYouTubeId(
        ad.videoUrl
      );

    return (
      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-zinc-800
          bg-black
        "
      >
        {videoId ? (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title={ad.name}
              className="
                h-full
                w-full
                border-0
              "
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
              "
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="
              flex
              min-h-[350px]
              items-center
              justify-center
              text-sm
              text-zinc-600
            "
          >
            Invalid YouTube URL
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-black
      "
    >
      <video
        src={ad.videoUrl}
        controls
        playsInline
        className="
          max-h-[60vh]
          w-full
          object-contain
        "
      />
    </div>
  );
}

// ======================================================
// YOUTUBE ID
// ======================================================

function extractYouTubeId(
  url: string
): string | null {
  const patterns = [
    /youtu\.be\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^?&/]+)/,
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/shorts\/([^?&/]+)/,
  ];

  for (const pattern of patterns) {
    const match =
      url.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

// ======================================================
// HTML PREVIEW
// ======================================================

function HtmlPreview({
  ad,
}: {
  ad: AdsData;
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-white
      "
    >
      <iframe
        srcDoc={ad.htmlCode ?? ""}
        title={ad.name}
        sandbox="allow-scripts allow-forms allow-popups"
        className="
          min-h-[350px]
          w-full
          border-0
        "
      />
    </div>
  );
}

// ======================================================
// TEXT PREVIEW
// ======================================================

function TextPreview({
  ad,
}: {
  ad: AdsData;
}) {
  return (
    <div
      className="
        flex
        min-h-[300px]
        items-center
        justify-center
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-8
        text-center
      "
    >
      <p
        className="
          max-w-2xl
          text-xl
          font-semibold
          leading-relaxed
          text-white
        "
      >
        {ad.text ||
          "No advertisement text configured."}
      </p>
    </div>
  );
}

// ======================================================
// COMPONENT
// ======================================================

export default function AdPreviewModal({
  ad,
  open,
  onClose,
}: AdPreviewModalProps) {
  if (!open || !ad) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[110]
        flex
        items-center
        justify-center
        bg-black/80
        p-3
        backdrop-blur-sm
        sm:p-6
      "
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[94vh]
          w-full
          max-w-4xl
          flex-col
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
            shrink-0
            items-center
            justify-between
            gap-3
            border-b
            border-zinc-800
            px-4
            py-3
            sm:px-5
          "
        >
          <div className="min-w-0">
            <div className="
              flex
              items-center
              gap-2
            ">
              <span
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-500/10
                  text-red-400
                "
              >
                {ad.type === "cube" ? (
                  <Box size={16} />
                ) : ad.type === "image" ? (
                  <ImageIcon size={16} />
                ) : ad.type === "video" ? (
                  <PlaySquare size={16} />
                ) : ad.type === "html" ? (
                  <Code2 size={16} />
                ) : (
                  <Type size={16} />
                )}
              </span>

              <h2
                className="
                  truncate
                  text-sm
                  font-semibold
                  text-white
                  sm:text-base
                "
              >
                {ad.name}
              </h2>
            </div>

            <p
              className="
                mt-1
                text-[11px]
                capitalize
                text-zinc-600
              "
            >
              {ad.type} advertisement
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-zinc-800
              bg-zinc-900
              text-zinc-400
              transition
              hover:bg-zinc-800
              hover:text-white
            "
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-3
            sm:p-5
          "
        >
          {ad.type === "image" && (
            <ImagePreview ad={ad} />
          )}

          {ad.type === "video" && (
            <VideoPreview ad={ad} />
          )}

          {ad.type === "html" && (
            <HtmlPreview ad={ad} />
          )}

          {ad.type === "text" && (
            <TextPreview ad={ad} />
          )}

          {ad.type === "cube" && (
            <CubePreview ad={ad} />
          )}

          {/* TARGET URL */}

          {ad.targetUrl && (
            <div
              className="
                mt-4
                flex
                flex-col
                gap-3
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-wider
                    text-zinc-600
                  "
                >
                  Target URL
                </p>

                <p
                  className="
                    mt-1
                    truncate
                    text-xs
                    text-zinc-400
                  "
                >
                  {ad.targetUrl}
                </p>
              </div>

              <a
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-zinc-800
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  transition
                  hover:bg-zinc-700
                "
              >
                Open Link

                <ExternalLink
                  size={13}
                />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}