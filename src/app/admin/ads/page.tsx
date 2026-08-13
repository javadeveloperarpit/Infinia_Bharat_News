"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  X
} from "lucide-react";

import {
  createAd,
  getAds,
  deleteAd,
  updateAd,
  type AdsData,
  type AdType,
  type AdFrequency,
  type AdCubeFace,
  type NormalAdLayout,
  type FloatingAdLayout,
  type StickyBottomAdLayout,
} from "@/services/ads.service";

const LIVE_WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "/";

// ======================================================
// TYPES
// ======================================================

type PreviewDevice = "desktop" | "mobile";

type FormState = {
  title: string;

  type: AdType;

  image: string;

  link: string;

  active: boolean;

  priority: number;

  mobileEnabled: boolean;

  desktopEnabled: boolean;

  openInNewTab: boolean;

  delay: number;

  frequency: AdFrequency;

  closeable: boolean;

  videoUrl: string;

  videoType: "youtube" | "mp4";

  videoOrientation:
    | "vertical"
    | "horizontal"
    | "auto";

  videoPoster: string;

  duration: number;

  autoplay: boolean;

  muted: boolean;

  width: number;

  cubeFaces: AdCubeFace[];

  rotationSpeed: number;

  cubeSameImage: boolean;

  normalLayout: NormalAdLayout;

  floatingLayout: FloatingAdLayout;

  stickyBottomLayout: StickyBottomAdLayout;
};

// ======================================================
// CONSTANTS
// ======================================================

const DESKTOP_WIDTH = 1366;
const DESKTOP_HEIGHT = 768;

const MOBILE_WIDTH = 440;
const MOBILE_HEIGHT = 956;

// ======================================================
// DEFAULT LAYOUTS
// ======================================================

const DEFAULT_NORMAL_LAYOUT: NormalAdLayout = {
  desktop: {
    scale: 1,
  },

  mobile: {
    scale: 1,
  },
};

const DEFAULT_STICKY_BOTTOM_LAYOUT: StickyBottomAdLayout = {
  desktop: {
    width: 1100,
    height: 92,
  },

  mobile: {
    width: 440,
    height: 72,
  },
};

const DEFAULT_FLOATING_LAYOUT: FloatingAdLayout = {
  desktop: {
    width: DESKTOP_WIDTH,
    height: DESKTOP_HEIGHT,
    x: 0,
    y: 0,
    scale: 1,
  },

  mobile: {
    width: MOBILE_WIDTH,
    height: MOBILE_HEIGHT,
    x: 0,
    y: 0,
    scale: 1,
  },
};

// ======================================================
// EMPTY FACE
// ======================================================

function emptyFace(): AdCubeFace {
  return {
    image: "",
    link: "",
  };
}

// ======================================================
// DEFAULT FORM
// ======================================================

function createDefaultForm(): FormState {
  return {
    title: "",

    type: "banner",

    image: "",

    link: "",

    active: true,

    priority: 1,

    mobileEnabled: true,

    desktopEnabled: true,

    openInNewTab: true,

    delay: 5,

    frequency: "once_session",

    closeable: true,

    videoUrl: "",

    videoType: "youtube",

    videoOrientation: "horizontal",

    videoPoster: "",

    duration: 10,

    autoplay: true,

    muted: true,

    width: 320,

    cubeFaces: [
      emptyFace(),
      emptyFace(),
      emptyFace(),
      emptyFace(),
    ],

    rotationSpeed: 4,

    cubeSameImage: false,

    normalLayout: {
      desktop: {
        ...DEFAULT_NORMAL_LAYOUT.desktop,
      },

      mobile: {
        ...DEFAULT_NORMAL_LAYOUT.mobile,
      },
    },

    floatingLayout: {
      desktop: {
        ...DEFAULT_FLOATING_LAYOUT.desktop,
      },

      mobile: {
        ...DEFAULT_FLOATING_LAYOUT.mobile,
      },
    },

    stickyBottomLayout: {
      desktop: {
        ...DEFAULT_STICKY_BOTTOM_LAYOUT.desktop,
      },

      mobile: {
        ...DEFAULT_STICKY_BOTTOM_LAYOUT.mobile,
      },
    },
  };
}

function adToForm(ad: any): FormState {
  const defaultForm = createDefaultForm();

  return {
    ...defaultForm,

    title: String(ad.title || ""),
    type: ad.type as AdType,

    image: String(ad.image || ""),
    link: String(ad.link || ""),

    active: ad.active ?? true,
    priority: Number(ad.priority ?? 1),

    mobileEnabled:
      ad.mobileEnabled ?? true,

    desktopEnabled:
      ad.desktopEnabled ?? true,

    openInNewTab:
      ad.openInNewTab ?? true,

    delay:
      Number(ad.delay ?? 5),

    frequency:
      ad.frequency ?? "once_session",

    closeable:
      ad.closeable ?? true,

    videoUrl:
      String(ad.videoUrl || ""),

    videoType:
      ad.videoType ?? "youtube",

    videoOrientation:
      ad.videoOrientation ?? "auto",

    videoPoster:
      String(ad.videoPoster || ""),

    duration:
      Number(ad.duration ?? 10),

    autoplay:
      ad.autoplay ?? true,

    muted:
      ad.muted ?? true,

    width:
      Number(ad.width ?? 320),

    cubeFaces:
      Array.isArray(ad.cubeFaces)
        ? ad.cubeFaces.map((face: any) => ({
            image: String(face?.image || ""),
            link: String(face?.link || ""),
          }))
        : defaultForm.cubeFaces,

    rotationSpeed:
      Number(ad.rotationSpeed ?? 4),

    cubeSameImage:
      ad.cubeSameImage ?? false,

    normalLayout: {
      desktop: {
        scale:
          Number(
            ad.layout?.desktop?.scale ?? 1
          ),
      },
      mobile: {
        scale:
          Number(
            ad.layout?.mobile?.scale ?? 1
          ),
      },
    },

    floatingLayout: {
      desktop: {
        width:
          Number(
            ad.layout?.desktop?.width ??
              DESKTOP_WIDTH
          ),

        height:
          Number(
            ad.layout?.desktop?.height ??
              DESKTOP_HEIGHT
          ),

        x:
          Number(
            ad.layout?.desktop?.x ?? 0
          ),

        y:
          Number(
            ad.layout?.desktop?.y ?? 0
          ),

        scale:
          Number(
            ad.layout?.desktop?.scale ?? 1
          ),
      },

      mobile: {
        width:
          Number(
            ad.layout?.mobile?.width ??
              MOBILE_WIDTH
          ),

        height:
          Number(
            ad.layout?.mobile?.height ??
              MOBILE_HEIGHT
          ),

        x:
          Number(
            ad.layout?.mobile?.x ?? 0
          ),

        y:
          Number(
            ad.layout?.mobile?.y ?? 0
          ),

        scale:
          Number(
            ad.layout?.mobile?.scale ?? 1
          ),
      },
    },

    stickyBottomLayout: {
      desktop: {
        width:
          Number(
            ad.layout?.desktop?.width ??
              1100
          ),

        height:
          Number(
            ad.layout?.desktop?.height ??
              92
          ),
      },

      mobile: {
        width:
          Number(
            ad.layout?.mobile?.width ??
              440
          ),

        height:
          Number(
            ad.layout?.mobile?.height ??
              72
          ),
      },
    },
  };
}
// ======================================================
// AD TYPES
// ======================================================

const AD_TYPES: {
  value: AdType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "banner",
    label: "Banner",
    description: "Premium display creative",
    icon: "▭",
  },

  {
    value: "cube",
    label: "3D Cube",
    description: "Four-face rotating creative",
    icon: "◇",
  },

  {
    value: "popup",
    label: "Popup",
    description: "Timed promotional overlay",
    icon: "▣",
  },

  {
    value: "page_transition",
    label: "Page Transition",
    description: "Pre-navigation promotion",
    icon: "→",
  },

  {
    value: "shorts_video",
    label: "Shorts Video",
    description: "Vertical or horizontal video",
    icon: "▶",
  },

  {
    value: "floating_tv",
    label: "Floating TV",
    description: "Floating video window",
    icon: "▣",
  },

  {
    value: "sticky_bottom",
    label: "Sticky Bottom",
    description: "Persistent bottom creative",
    icon: "▬",
  },

  {
    value: "native",
    label: "Native",
    description: "Content-style sponsored card",
    icon: "▤",
  },
];


// ======================================================
// FREQUENCIES
// ======================================================

const FREQUENCIES: {
  value: AdFrequency;
  label: string;
}[] = [
  {
    value: "always",
    label: "Every impression",
  },

  {
    value: "once_session",
    label: "Once per session",
  },

  {
    value: "once_day",
    label: "Once per day",
  },

  {
    value: "once",
    label: "One time only",
  },
];

// ======================================================
// HELPERS
// ======================================================

function isFloatingAd(type: AdType) {
  return (
    type === "cube" ||
    type === "floating_tv"
  );
}

function isVideoAd(type: AdType) {
  return (
    type === "shorts_video" ||
    type === "floating_tv"
  );
}

function isPopupAd(type: AdType) {
  return (
    type === "popup" ||
    type === "page_transition"
  );
}

function supportsScaleControl(type: AdType) {
  return (
    type === "popup" ||
    type === "page_transition" ||
    type === "cube" ||
    type === "floating_tv"
  );
}

function isStickyBottomAd(type: AdType) {
  return type === "sticky_bottom";
}

function needsImage(type: AdType) {
  return (
    type === "banner" ||
    type === "popup" ||
    type === "native" ||
    type === "sticky_bottom" ||
    type === "page_transition"
  );
}

function supportsLink(type: AdType) {
  return (
    type === "banner" ||
    type === "popup" ||
    type === "native" ||
    type === "sticky_bottom" ||
    type === "page_transition"
  );
}

function isYouTubeUrl(url: string) {
  if (!url?.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url.trim());

    const host = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be"
    );
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url: string) {
  if (!url?.trim()) {
    return null;
  }

  try {
    const parsed = new URL(url.trim());

    const hostname = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    let videoId = "";

    if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      videoId =
        parsed.searchParams.get("v") || "";

      if (!videoId) {
        const shorts =
          parsed.pathname.match(
            /^\/shorts\/([^/?]+)/
          );

        if (shorts) {
          videoId = shorts[1];
        }
      }

      if (!videoId) {
        const embed =
          parsed.pathname.match(
            /^\/embed\/([^/?]+)/
          );

        if (embed) {
          videoId = embed[1];
        }
      }
    }

    if (hostname === "youtu.be") {
      videoId =
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] || "";
    }

    if (!videoId) {
      return null;
    }

    return (
      `https://www.youtube.com/embed/${videoId}` +
      `?autoplay=1` +
      `&mute=1` +
      `&controls=1` +
      `&rel=0` +
      `&playsinline=1`
    );
  } catch {
    return null;
  }
}

// ======================================================
// BUILD FIRESTORE PAYLOAD
//
// IMPORTANT:
// Only relevant attributes are sent.
// ======================================================

function buildAdPayload(
  form: FormState
): AdsData {
  const common = {
    title: form.title.trim(),

    active: form.active,

    priority: form.priority,

    mobileEnabled:
      form.mobileEnabled,

    desktopEnabled:
      form.desktopEnabled,

    openInNewTab:
      form.openInNewTab,
  };

  // ====================================================
  // BANNER
  // ====================================================

  if (form.type === "banner") {
    return {
      ...common,

      type: "banner",

      image: form.image.trim(),

      link: form.link.trim(),
    };
  }

  // ====================================================
  // NATIVE
  // ====================================================

  if (form.type === "native") {
    return {
      ...common,

      type: "native",

      image: form.image.trim(),

      link: form.link.trim(),
    };
  }

  // ====================================================
  // POPUP
  // ====================================================

  if (form.type === "popup") {
    return {
      ...common,

      type: "popup",

      image: form.image.trim(),

      link: form.link.trim(),

      delay: form.delay,

      frequency: form.frequency,

      closeable: form.closeable,

      layout: {
        desktop: {
          scale:
            form.normalLayout.desktop.scale,
        },

        mobile: {
          scale:
            form.normalLayout.mobile.scale,
        },
      },
    };
  }

  // ====================================================
  // PAGE TRANSITION
  // ====================================================

  if (
    form.type ===
    "page_transition"
  ) {
    return {
      ...common,

      type: "page_transition",

      image: form.image.trim(),

      link: form.link.trim(),

      delay: form.delay,

      frequency: form.frequency,

      closeable: form.closeable,

      layout: {
        desktop: {
          scale:
            form.normalLayout.desktop.scale,
        },

        mobile: {
          scale:
            form.normalLayout.mobile.scale,
        },
      },
    };
  }

  // ====================================================
  // STICKY BOTTOM
  // ====================================================

  if (
    form.type ===
    "sticky_bottom"
  ) {
    return {
      ...common,

      type: "sticky_bottom",

      image: form.image.trim(),

      link: form.link.trim(),

      closeable: form.closeable,

      layout: {
        desktop: {
          width:
            form.stickyBottomLayout.desktop.width,
          height:
            form.stickyBottomLayout.desktop.height,
        },

        mobile: {
          width:
            form.stickyBottomLayout.mobile.width,
          height:
            form.stickyBottomLayout.mobile.height,
        },
      },
    };
  }

  // ====================================================
  // SHORTS VIDEO
  // ====================================================

  if (
    form.type ===
    "shorts_video"
  ) {
    return {
      ...common,

      type: "shorts_video",

      videoUrl:
        form.videoUrl.trim(),

      videoType:
        form.videoType,

      videoOrientation:
        form.videoOrientation,

      ...(form.videoPoster.trim()
        ? {
            videoPoster:
              form.videoPoster.trim(),
          }
        : {}),

      duration:
        form.duration,

      autoplay:
        form.autoplay,

      muted:
        form.muted,
    };
  }

  // ====================================================
  // FLOATING TV
  //
  // X/Y AVAILABLE
  // ====================================================

  if (
    form.type ===
    "floating_tv"
  ) {
    return {
      ...common,

      type: "floating_tv",

      videoUrl:
        form.videoUrl.trim(),

      videoType:
        form.videoType,

      videoOrientation:
        form.videoOrientation,

      ...(form.videoPoster.trim()
        ? {
            videoPoster:
              form.videoPoster.trim(),
          }
        : {}),

      duration:
        form.duration,

      autoplay:
        form.autoplay,

      muted:
        form.muted,

      width:
        form.width,

      layout: {
        desktop: {
          ...form.floatingLayout
            .desktop,
        },

        mobile: {
          ...form.floatingLayout
            .mobile,
        },
      },
    };
  }

  // ====================================================
  // CUBE
  //
  // X/Y AVAILABLE
  // ====================================================

  return {
    ...common,

    type: "cube",

    cubeFaces:
      form.cubeFaces,

    rotationSpeed:
      form.rotationSpeed,

    cubeSameImage:
      form.cubeSameImage,

    width:
      form.width,

    layout: {
      desktop: {
        ...form.floatingLayout
          .desktop,
      },

      mobile: {
        ...form.floatingLayout
          .mobile,
      },
    },
  };
}

// ======================================================
// UI COMPONENTS
// ======================================================

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <h2 className="text-sm font-black text-zinc-950">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            {description}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
      {children}
    </label>
  );
}

function Input({
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 ${
        props.className || ""
      }`}
    />
  );
}

function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm font-medium text-zinc-900 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10 ${
        props.className || ""
      }`}
    >
      {children}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className="flex items-center gap-2"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-red-600"
            : "bg-zinc-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>

      <span className="text-xs font-bold text-zinc-700">
        {label}
      </span>
    </button>
  );
}

function ToggleCard({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-green-200 bg-green-50"
          : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-900">
          {title}
        </span>

        <span
          className={`h-2.5 w-2.5 rounded-full ${
            checked
              ? "bg-green-500"
              : "bg-zinc-300"
          }`}
        />
      </div>

      <div className="mt-1 text-[10px] text-zinc-500">
        {description}
      </div>
    </button>
  );
}

function DeviceTab({
  active,
  onClick,
  label,
  dimensions,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dimensions: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-3 transition ${
        active
          ? "bg-white text-zinc-950 shadow-sm"
          : "text-zinc-500 hover:bg-white/60"
      }`}
    >
      <div className="text-xs font-black">
        {label}
      </div>

      <div className="mt-0.5 text-[8px] font-bold opacity-60">
        {dimensions}
      </div>
    </button>
  );
}

// ======================================================
// POSITION ARROW
// ONLY USED FOR FLOATING ADS
// ======================================================

function ArrowButton({
  symbol,
  label,
  onClick,
}: {
  symbol: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-black text-zinc-700 transition hover:bg-zinc-100"
    >
      {symbol}
    </button>
  );
}

function PositionControl({
  x,
  y,
  onMove,
  onCenter,
}: {
  x: number;
  y: number;
  onMove: (
    axis: "x" | "y",
    amount: number
  ) => void;
  onCenter: () => void;
}) {
  const [step, setStep] =
    useState(10);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black text-zinc-900">
            Position
          </div>

          <div className="mt-0.5 text-[10px] text-zinc-500">
            X / Y screen coordinates
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-white p-1">
          {[1, 5, 10, 25].map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStep(value)
                }
                className={`rounded-md px-2.5 py-1.5 text-[9px] font-black ${
                  step === value
                    ? "bg-zinc-950 text-white"
                    : "text-zinc-500 hover:bg-zinc-100"
                }`}
              >
                {value}px
              </button>
            )
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="grid w-28 grid-cols-3 grid-rows-3 gap-1">
          <div />

          <ArrowButton
            label="Move up"
            symbol="↑"
            onClick={() =>
              onMove(
                "y",
                -step
              )
            }
          />

          <div />

          <ArrowButton
            label="Move left"
            symbol="←"
            onClick={() =>
              onMove(
                "x",
                -step
              )
            }
          />

          <button
            type="button"
            onClick={onCenter}
            className="flex h-9 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white"
          >
            ●
          </button>

          <ArrowButton
            label="Move right"
            symbol="→"
            onClick={() =>
              onMove(
                "x",
                step
              )
            }
          />

          <div />

          <ArrowButton
            label="Move down"
            symbol="↓"
            onClick={() =>
              onMove(
                "y",
                step
              )
            }
          />

          <div />
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <div className="text-[9px] font-black uppercase text-zinc-400">
              X
            </div>

            <div className="mt-1 text-sm font-black text-zinc-900">
              {x}px
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
            <div className="text-[9px] font-black uppercase text-zinc-400">
              Y
            </div>

            <div className="mt-1 text-sm font-black text-zinc-900">
              {y}px
            </div>
          </div>

          <button
            type="button"
            onClick={onCenter}
            className="col-span-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[10px] font-black text-zinc-600"
          >
            Center Creative
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function AdsPage() {
  const [ads, setAds] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState<FormState>(
      createDefaultForm()
    );

  const [preview, setPreview] =
    useState(true);

  const [
    previewDevice,
    setPreviewDevice,
  ] =
    useState<PreviewDevice>(
      "desktop"
    );

  const previewFrameRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const [
    previewWidth,
    setPreviewWidth,
  ] = useState(500);

  const [editingAdId, setEditingAdId] =
  useState<string | null>(null);

  // ====================================================
  // PREVIEW WIDTH
  // ====================================================

  useEffect(() => {
    const element =
      previewFrameRef.current;

    if (!element) {
      return;
    }

    const observer =
      new ResizeObserver(
        (entries) => {
          const width =
            entries[0]
              ?.contentRect.width ||
            500;

          setPreviewWidth(
            Math.max(280, width)
          );
        }
      );

    observer.observe(element);

    return () =>
      observer.disconnect();
  }, []);

  // ====================================================
  // LOAD ADS
  // ====================================================

  async function loadAds() {
    try {
      setLoading(true);

      const data =
        await getAds();

      setAds(data || []);
    } catch (error) {
      console.error(
        "ADS LOAD ERROR:",
        error
      );

      setAds([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAds();
  }, []);

  // ====================================================
  // FIELD UPDATE
  // ====================================================

  function updateField<
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  // ====================================================
  // NORMAL SCALE
  // ====================================================

  function updateNormalScale(
    device: PreviewDevice,
    scale: number
  ) {
    setForm((prev) => ({
      ...prev,

      normalLayout: {
        ...prev.normalLayout,

        [device]: {
          scale,
        },
      },
    }));
  }

  // ====================================================
  // FLOATING LAYOUT
  // ====================================================

  function updateFloatingLayout(
    device: PreviewDevice,
    key:
      | "width"
      | "height"
      | "x"
      | "y"
      | "scale",
    value: number
  ) {
    setForm((prev) => ({
      ...prev,

      floatingLayout: {
        ...prev.floatingLayout,

        [device]: {
          ...prev.floatingLayout[
            device
          ],

          [key]: value,
        },
      },
    }));
  }

  // ====================================================
  // STICKY BOTTOM LAYOUT
  // WIDTH + HEIGHT ONLY
  // ====================================================

  function updateStickyBottomLayout(
    device: PreviewDevice,
    key: "width" | "height",
    value: number
  ) {
    setForm((prev) => ({
      ...prev,

      stickyBottomLayout: {
        ...prev.stickyBottomLayout,

        [device]: {
          ...prev.stickyBottomLayout[device],
          [key]: value,
        },
      },
    }));
  }

  // ====================================================
  // MOVE FLOATING CREATIVE
  // ====================================================

  function moveCreative(
    axis: "x" | "y",
    amount: number
  ) {
    if (
      !isFloatingAd(
        form.type
      )
    ) {
      return;
    }

    const current =
      form.floatingLayout[
        previewDevice
      ];

    updateFloatingLayout(
      previewDevice,
      axis,
      current[axis] + amount
    );
  }

  // ====================================================
  // CENTER FLOATING CREATIVE
  // ====================================================

  function centerCreative() {
    if (
      !isFloatingAd(
        form.type
      )
    ) {
      return;
    }

    updateFloatingLayout(
      previewDevice,
      "x",
      0
    );

    updateFloatingLayout(
      previewDevice,
      "y",
      0
    );
  }

  // ====================================================
  // RESET LAYOUT
  // ====================================================

  function resetLayout() {
    if (
      isFloatingAd(
        form.type
      )
    ) {
      const defaults =
        DEFAULT_FLOATING_LAYOUT[
          previewDevice
        ];

      setForm((prev) => ({
        ...prev,

        floatingLayout: {
          ...prev.floatingLayout,

          [previewDevice]: {
            ...defaults,
          },
        },
      }));

      return;
    }

    if (isStickyBottomAd(form.type)) {
      const defaults =
        DEFAULT_STICKY_BOTTOM_LAYOUT[
          previewDevice
        ];

      setForm((prev) => ({
        ...prev,

        stickyBottomLayout: {
          ...prev.stickyBottomLayout,

          [previewDevice]: {
            ...defaults,
          },
        },
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,

      normalLayout: {
        ...prev.normalLayout,

        [previewDevice]: {
          ...DEFAULT_NORMAL_LAYOUT[
            previewDevice
          ],
        },
      },
    }));
  }

  
  // ====================================================
  // CHANGE TYPE
  // Position is no longer part of the ad model.
  function changeType(type: AdType) {
    setForm((prev) => ({
      ...prev,
      type,
      image: needsImage(type) ? prev.image : "",
      link: supportsLink(type) ? prev.link : "",
      videoUrl: isVideoAd(type) ? prev.videoUrl : "",
      videoOrientation:
        type === "shorts_video" ? "vertical" : "horizontal",
    }));
  }

  // CUBE FACE UPDATE
  // ====================================================

  function updateCubeFace(
    index: number,
    key: keyof AdCubeFace,
    value: string
  ) {
    setForm((prev) => {
      const faces = [
        ...(prev.cubeFaces || []),
      ];

      faces[index] = {
        ...(faces[index] ||
          emptyFace()),

        [key]: value,
      };

      if (
        prev.cubeSameImage &&
        index === 0
      ) {
        return {
          ...prev,

          cubeFaces:
            faces.map(
              (face) => ({
                ...face,
                [key]: value,
              })
            ),
        };
      }

      return {
        ...prev,
        cubeFaces: faces,
      };
    });
  }

  // ====================================================
  // SAME CUBE IMAGE
  // ====================================================

  function toggleSameCubeImage(
    enabled: boolean
  ) {
    setForm((prev) => {
      if (!enabled) {
        return {
          ...prev,
          cubeSameImage:
            false,
        };
      }

      const first =
        prev.cubeFaces[0] ||
        emptyFace();

      return {
        ...prev,

        cubeSameImage: true,

        cubeFaces:
          prev.cubeFaces.map(
            () => ({
              image:
                first.image,
              link:
                first.link,
            })
          ),
      };
    });
  }

  // ====================================================
  // SAVE
  // ====================================================

  async function saveAd() {
    if (!form.title.trim()) {
      alert(
        "Please enter a campaign title."
      );

      return;
    }

    if (
      needsImage(form.type) &&
      !form.image.trim()
    ) {
      alert(
        "Please add the creative image URL."
      );

      return;
    }

    if (
      supportsLink(form.type) &&
      !form.link.trim()
    ) {
      alert(
        "Please add the destination URL."
      );

      return;
    }

    if (
      form.type ===
      "cube"
    ) {
      if (
        form.cubeFaces.length !==
          4 ||
        form.cubeFaces.some(
          (face) =>
            !face.image.trim()
        )
      ) {
        alert(
          "Please add an image to all four cube faces."
        );

        return;
      }
    }

    if (
      isVideoAd(form.type) &&
      !form.videoUrl.trim()
    ) {
      alert(
        "Please add a video URL."
      );

      return;
    }

    try {
      setSaving(true);

      const payload =
        buildAdPayload(form);

      if (editingAdId) {
  await updateAd(
    form.type,
    editingAdId,
    payload
  );

  alert(
    "Campaign updated successfully."
  );
} else {
  await createAd(payload);

  alert(
    "Campaign created successfully."
  );
}

setEditingAdId(null);

setForm(
  createDefaultForm()
);

await loadAds();

      alert(
        "Campaign created successfully."
      );

      setForm(
        createDefaultForm()
      );

      await loadAds();
    } catch (error) {
      console.error(
        "AD CREATE ERROR:",
        error
      );

      alert(
        "Failed to create campaign."
      );
    } finally {
      setSaving(false);
    }
  }

  function editAd(ad: any) {
  setEditingAdId(ad.id);

  setForm(
    adToForm(ad)
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function cancelEdit() {
  setEditingAdId(null);

  setForm(
    createDefaultForm()
  );
}

  // ====================================================
  // DELETE
  // ====================================================

  async function remove(
    type: AdType,
    id: string
  ) {
    const confirmed =
      confirm(
        "Delete this campaign permanently?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAd(
        type,
        id
      );

      await loadAds();
    } catch (error) {
      console.error(
        "AD DELETE ERROR:",
        error
      );

      alert(
        "Failed to delete campaign."
      );
    }
  }

  // ====================================================
  // STATS
  // ====================================================

  const activeCount =
    useMemo(
      () =>
        ads.filter(
          (ad) => ad.active
        ).length,
      [ads]
    );

  const videoCount =
    useMemo(
      () =>
        ads.filter(
          (ad) =>
            isVideoAd(
              ad.type
            )
        ).length,
      [ads]
    );

  const cubeCount =
    useMemo(
      () =>
        ads.filter(
          (ad) =>
            ad.type ===
            "cube"
        ).length,
      [ads]
    );

  // ====================================================
  // CURRENT LAYOUT
  // ====================================================

  const currentFloatingLayout =
    form.floatingLayout[
      previewDevice
    ];

  const currentNormalLayout =
    form.normalLayout[
      previewDevice
    ];

  const currentStickyBottomLayout =
    form.stickyBottomLayout[
      previewDevice
    ];

  const currentScale =
    isFloatingAd(form.type)
      ? currentFloatingLayout.scale
      : currentNormalLayout.scale;

  const currentRenderLayout = {
    x: isFloatingAd(form.type)
      ? currentFloatingLayout.x
      : 0,
    y: isFloatingAd(form.type)
      ? currentFloatingLayout.y
      : 0,
    scale: supportsScaleControl(form.type)
      ? currentScale
      : 1,
  };

  // ====================================================
  // PREVIEW CANVAS
  // ====================================================

  const baseWidth =
    previewDevice ===
    "desktop"
      ? DESKTOP_WIDTH
      : MOBILE_WIDTH;

  const baseHeight =
    previewDevice ===
    "desktop"
      ? DESKTOP_HEIGHT
      : MOBILE_HEIGHT;

  const availableWidth =
    Math.max(
      260,
      previewWidth - 32
    );

  const canvasScale =
    Math.min(
      availableWidth /
        baseWidth,
      0.95
    );

  const displayedHeight =
    baseHeight *
    canvasScale;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="overflow-hidden rounded-3xl bg-[#09090b] shadow-2xl">
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-red-600/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-black tracking-[0.16em] text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                ADS OPERATIONS
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Advertising
                <span className="text-red-500">
                  {" "}
                  Control
                </span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                Design, position and
                deploy premium
                advertising
                experiences across
                every device.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Stat
                value={ads.length}
                label="Campaigns"
              />

              <Stat
                value={
                  activeCount
                }
                label="Active"
                accent="green"
              />

              <Stat
                value={
                  videoCount +
                  cubeCount
                }
                label="Advanced"
                accent="gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN */}
      {/* ================================================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
        {/* ================================================= */}
        {/* LEFT */}
        {/* ================================================= */}

        <div className="space-y-6">
          {/* ================================================= */}
          {/* TYPE */}
          {/* ================================================= */}

          <Section
            title="Creative Format"
            description="Choose exactly how the campaign should be rendered."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {AD_TYPES.map(
                (item) => {
                  const selected =
                    form.type ===
                    item.value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      onClick={() =>
                        changeType(
                          item.value
                        )
                      }
                      className={`relative rounded-2xl border p-4 text-left transition-all ${
                        selected
                          ? "border-red-500 bg-red-50 shadow-lg shadow-red-100"
                          : "border-zinc-200 bg-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                          ✓
                        </span>
                      )}

                      <span
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${
                          selected
                            ? "bg-red-600 text-white"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {
                          item.icon
                        }
                      </span>

                      <div className="text-sm font-black text-zinc-900">
                        {
                          item.label
                        }
                      </div>

                      <div className="mt-1 text-[10px] leading-4 text-zinc-500">
                        {
                          item.description
                        }
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </Section>

          {/* ================================================= */}
          {/* CAMPAIGN */}
          {/* ================================================= */}

          <Section
            title="Campaign Identity"
            description="Only fields relevant to the selected creative are shown."
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <FieldLabel>
                  Campaign Name
                </FieldLabel>

                <Input
                  value={
                    form.title
                  }
                  onChange={(e) =>
                    updateField(
                      "title",
                      e.target
                        .value
                    )
                  }
                  placeholder="e.g. Premium Membership Campaign"
                />
              </div>

              {/* IMAGE */}

              {needsImage(
                form.type
              ) && (
                <div>
                  <FieldLabel>
                    Creative Image URL
                  </FieldLabel>

                   {/* ==================================================
      RECOMMENDED IMAGE SIZE
      ================================================== */}

  {form.type === "banner" && (
    <p className="mt-1 mb-2 text-[11px] font-semibold text-blue-600">
      Recommended image size:{" "}
      <strong>8:1</strong>
    </p>
  )}

  {form.type === "sticky_bottom" && (
    <p className="mt-1 mb-2 text-[11px] font-semibold text-orange-600">
      Recommended image size:{" "}
      <strong>8:1</strong>
    </p>
  )}

                  <Input
                    value={
                      form.image
                    }
                    onChange={(e) =>
                      updateField(
                        "image",
                        e.target
                          .value
                      )
                    }
                    placeholder="https://cdn.example.com/creative.webp"
                  />
                </div>
              )}

              {/* LINK */}

              {supportsLink(
                form.type
              ) && (
                <div>
                  <FieldLabel>
                    Destination URL
                  </FieldLabel>

                  <Input
                    value={
                      form.link
                    }
                    onChange={(e) =>
                      updateField(
                        "link",
                        e.target
                          .value
                      )
                    }
                    placeholder="https://example.com/offer"
                  />
                </div>
              )}


              {/* PRIORITY */}

              <div>
                <FieldLabel>
                  Priority
                </FieldLabel>

                <Input
                  type="number"
                  min={1}
                  value={
                    form.priority
                  }
                  onChange={(e) =>
                    updateField(
                      "priority",
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </div>
            </div>
          </Section>

          {/* ================================================= */}
          {/* VIDEO */}
          {/* ================================================= */}

          {isVideoAd(
            form.type
          ) && (
            <Section
              title={
                form.type ===
                "floating_tv"
                  ? "Floating Video"
                  : "Shorts Video"
              }
              description="Configure the video source and playback behaviour."
            >
              <div className="space-y-5">
                {form.type ===
                  "shorts_video" && (
                  <div>
                    <FieldLabel>
                      Video Orientation
                    </FieldLabel>

                    <div className="grid grid-cols-3 gap-3">
                      {(
                        [
                          "vertical",
                          "horizontal",
                          "auto",
                        ] as const
                      ).map(
                        (
                          orientation
                        ) => (
                          <button
                            key={
                              orientation
                            }
                            type="button"
                            onClick={() =>
                              updateField(
                                "videoOrientation",
                                orientation
                              )
                            }
                            className={`rounded-2xl border p-4 text-left ${
                              form.videoOrientation ===
                              orientation
                                ? "border-red-500 bg-red-50"
                                : "border-zinc-200 bg-white"
                            }`}
                          >
                            <div className="text-xs font-black capitalize">
                              {
                                orientation
                              }
                            </div>

                            <div className="mt-1 text-[9px] text-zinc-500">
                              {orientation ===
                              "vertical"
                                ? "9:16"
                                : orientation ===
                                    "horizontal"
                                  ? "16:9"
                                  : "Source decides"}
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <FieldLabel>
                    Video Source
                  </FieldLabel>

                  <Input
                    value={
                      form.videoUrl
                    }
                    onChange={(e) =>
                      updateField(
                        "videoUrl",
                        e.target
                          .value
                      )
                    }
                    placeholder="YouTube URL or direct .mp4/.webm URL"
                  />

                  {form.videoUrl && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                      {isYouTubeUrl(
                        form.videoUrl
                      )
                        ? "YouTube source detected"
                        : "Direct video source detected"}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>
                      Video Type
                    </FieldLabel>

                    <Select
                      value={
                        form.videoType
                      }
                      onChange={(e) =>
                        updateField(
                          "videoType",
                          e.target
                            .value as
                            | "youtube"
                            | "mp4"
                        )
                      }
                    >
                      <option value="youtube">
                        YouTube
                      </option>

                      <option value="mp4">
                        MP4
                      </option>
                    </Select>
                  </div>

                  <div>
                    <FieldLabel>
                      Playback Duration
                    </FieldLabel>

                    <Input
                      type="number"
                      min={1}
                      value={
                        form.duration
                      }
                      onChange={(e) =>
                        updateField(
                          "duration",
                          Number(
                            e.target
                              .value
                          )
                        )
                      }
                    />
                  </div>
                </div>

                {form.type ===
                  "floating_tv" && (
                  <div>
                    <FieldLabel>
                      Player Width
                    </FieldLabel>

                    <Input
                      type="number"
                      min={180}
                      max={600}
                      value={
                        form.width
                      }
                      onChange={(e) =>
                        updateField(
                          "width",
                          Number(
                            e.target
                              .value
                          )
                        )
                      }
                    />
                  </div>
                )}

                <div>
                  <FieldLabel>
                    Video Poster
                  </FieldLabel>

                  <Input
                    value={
                      form.videoPoster
                    }
                    onChange={(e) =>
                      updateField(
                        "videoPoster",
                        e.target
                          .value
                      )
                    }
                    placeholder="Optional poster image URL"
                  />
                </div>

                <div className="flex flex-wrap gap-5">
                  <Toggle
                    checked={
                      form.autoplay
                    }
                    onChange={(value) =>
                      updateField(
                        "autoplay",
                        value
                      )
                    }
                    label="Autoplay"
                  />

                  <Toggle
                    checked={
                      form.muted
                    }
                    onChange={(value) =>
                      updateField(
                        "muted",
                        value
                      )
                    }
                    label="Start muted"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* ================================================= */}
          {/* CUBE */}
          {/* ================================================= */}

          {form.type ===
            "cube" && (
            <Section
              title="3D Cube Creative"
              description="Four independent faces. X/Y positioning is available because the cube is a floating creative."
            >
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                <Toggle
                  checked={
                    form.cubeSameImage
                  }
                  onChange={
                    toggleSameCubeImage
                  }
                  label="Sync Face 1 across all faces"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {form.cubeFaces.map(
                  (
                    face,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                    >
                      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-4 py-3">
                        <span className="text-xs font-black">
                          Face{" "}
                          {index +
                            1}
                        </span>

                        <span className="rounded-full bg-zinc-200 px-2 py-1 text-[8px] font-black uppercase text-zinc-500">
                          {index ===
                          0
                            ? "Front"
                            : index ===
                                1
                              ? "Right"
                              : index ===
                                  2
                                ? "Back"
                                : "Left"}
                        </span>
                      </div>

                      <div className="space-y-3 p-4">
                        <Input
                          value={
                            face.image
                          }
                          disabled={
                            form.cubeSameImage &&
                            index !==
                              0
                          }
                          onChange={(
                            e
                          ) =>
                            updateCubeFace(
                              index,
                              "image",
                              e.target
                                .value
                            )
                          }
                          placeholder="Face image URL"
                        />

                        <Input
                          value={
                            face.link
                          }
                          disabled={
                            form.cubeSameImage &&
                            index !==
                              0
                          }
                          onChange={(
                            e
                          ) =>
                            updateCubeFace(
                              index,
                              "link",
                              e.target
                                .value
                            )
                          }
                          placeholder="Face destination URL"
                        />

                        {face.image && (
                          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-zinc-100">
                            <img
                              src={
                                face.image
                              }
                              alt=""
                              className="h-28 w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-5">
                <FieldLabel>
                  Cube Size
                </FieldLabel>

                <Input
                  type="number"
                  min={80}
                  max={400}
                  value={
                    form.width
                  }
                  onChange={(e) =>
                    updateField(
                      "width",
                      Number(
                        e.target
                          .value
                      )
                    )
                  }
                />
              </div>

              <div className="mt-5">
                <FieldLabel>
                  Rotation Speed
                </FieldLabel>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={
                      form.rotationSpeed
                    }
                    onChange={(e) =>
                      updateField(
                        "rotationSpeed",
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                    className="w-full accent-purple-600"
                  />

                  <span className="w-12 rounded-lg bg-zinc-100 px-2 py-2 text-center text-xs font-black">
                    {
                      form.rotationSpeed
                    }
                    s
                  </span>
                </div>
              </div>
            </Section>
          )}

          {/* ================================================= */}
          {/* POPUP / TRANSITION */}
          {/* ================================================= */}

          {isPopupAd(
            form.type
          ) && (
            <Section
              title="Delivery Rules"
              description="Control when the promotion appears."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>
                    Delay
                  </FieldLabel>

                  <Input
                    type="number"
                    min={0}
                    value={
                      form.delay
                    }
                    onChange={(e) =>
                      updateField(
                        "delay",
                        Number(
                          e.target
                            .value
                        )
                      )
                    }
                  />
                </div>

                <div>
                  <FieldLabel>
                    Frequency
                  </FieldLabel>

                  <Select
                    value={
                      form.frequency
                    }
                    onChange={(e) =>
                      updateField(
                        "frequency",
                        e.target
                          .value as AdFrequency
                      )
                    }
                  >
                    {FREQUENCIES.map(
                      (item) => (
                        <option
                          key={
                            item.value
                          }
                          value={
                            item.value
                          }
                        >
                          {
                            item.label
                          }
                        </option>
                      )
                    )}
                  </Select>
                </div>

                <div className="flex items-end">
                  <Toggle
                    checked={
                      form.closeable
                    }
                    onChange={(value) =>
                      updateField(
                        "closeable",
                        value
                      )
                    }
                    label="Allow close"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* ================================================= */}
          {/* AUDIENCE */}
          {/* ================================================= */}

          <Section
            title="Audience & Delivery"
            description="Define where this campaign is allowed to appear."
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ToggleCard
                checked={
                  form.active
                }
                onChange={(value) =>
                  updateField(
                    "active",
                    value
                  )
                }
                title="Active"
                description="Campaign enabled"
              />

              <ToggleCard
                checked={
                  form.mobileEnabled
                }
                onChange={(value) =>
                  updateField(
                    "mobileEnabled",
                    value
                  )
                }
                title="Mobile"
                description="Phone & tablet"
              />

              <ToggleCard
                checked={
                  form.desktopEnabled
                }
                onChange={(value) =>
                  updateField(
                    "desktopEnabled",
                    value
                  )
                }
                title="Desktop"
                description="Desktop displays"
              />

              {(supportsLink(
                form.type
              ) ||
                form.type ===
                  "cube") && (
                <ToggleCard
                  checked={
                    form.openInNewTab
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "openInNewTab",
                      value
                    )
                  }
                  title="New Tab"
                  description="Open destination separately"
                />
              )}
            </div>
          </Section>

          {/* ================================================= */}
          {/* RESPONSIVE LAYOUT */}
          {/* ================================================= */}

          <Section
            title="Responsive Layout"
            description={
              isFloatingAd(form.type)
                ? "X/Y position and scale are available only for floating creatives."
                : isStickyBottomAd(form.type)
                  ? "Sticky Bottom supports responsive width and height only."
                  : supportsScaleControl(form.type)
                    ? "This creative uses automatic placement. Only scale can be adjusted."
                    : "This creative uses automatic placement with no layout controls."
            }
          >
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
              <DeviceTab
                active={previewDevice === "desktop"}
                onClick={() => setPreviewDevice("desktop")}
                label="Desktop"
                dimensions="1366 × 768"
              />

              <DeviceTab
                active={previewDevice === "mobile"}
                onClick={() => setPreviewDevice("mobile")}
                label="Mobile"
                dimensions="440 × 956"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {isFloatingAd(form.type) ? (
                <PositionControl
                  x={currentFloatingLayout.x}
                  y={currentFloatingLayout.y}
                  onMove={moveCreative}
                  onCenter={centerCreative}
                />
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-xs font-black text-zinc-900">
                    Automatic Placement
                  </div>
                  <div className="mt-2 text-[10px] leading-5 text-zinc-500">
                    This ad does not use free X/Y positioning. Its location is determined by:
                  </div>
                  
                </div>
              )}

              {supportsScaleControl(form.type) && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-xs font-black text-zinc-900">Creative Scale</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-500">25%</span>
                    <span className="text-sm font-black text-red-600">{Math.round(currentScale * 100)}%</span>
                    <span className="text-[10px] font-bold text-zinc-500">200%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="5"
                    value={Math.round(currentScale * 100)}
                    onChange={(e) => {
                      const value = Number(e.target.value) / 100;
                      if (isFloatingAd(form.type)) {
                        updateFloatingLayout(previewDevice, "scale", value);
                      } else {
                        updateNormalScale(previewDevice, value);
                      }
                    }}
                    className="mt-3 w-full accent-red-600"
                  />
                  <button
                    type="button"
                    onClick={resetLayout}
                    className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[10px] font-black text-zinc-600"
                  >
                    Reset {previewDevice === "desktop" ? "Desktop" : "Mobile"} Layout
                  </button>
                </div>
              )}

              {isStickyBottomAd(form.type) && (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-xs font-black text-zinc-900">Sticky Bottom Size</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Width</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        value={currentStickyBottomLayout.width}
                        onChange={(e) =>
                          updateStickyBottomLayout(
                            previewDevice,
                            "width",
                            Number(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Height</FieldLabel>
                      <Input
                        type="number"
                        min="1"
                        value={currentStickyBottomLayout.height}
                        onChange={(e) =>
                          updateStickyBottomLayout(
                            previewDevice,
                            "height",
                            Number(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetLayout}
                    className="mt-4 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[10px] font-black text-zinc-600"
                  >
                    Reset {previewDevice === "desktop" ? "Desktop" : "Mobile"} Size
                  </button>
                </div>
              )}

              {!supportsScaleControl(form.type) &&
                !isStickyBottomAd(form.type) &&
                !isFloatingAd(form.type) && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-xs font-black text-zinc-900">Fixed Creative</div>
                    <div className="mt-2 text-[10px] leading-5 text-zinc-500">
                      This ad type does not store scale, X/Y, width, or height layout values.
                    </div>
                  </div>
                )}
            </div>
          </Section>

          {/* ================================================= */}
          {/* CREATE */}
          {/* ================================================= */}

          <button
  type="button"
  onClick={saveAd}
  disabled={saving}
  className="group relative w-full overflow-hidden rounded-2xl bg-red-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
>
  <span className="relative z-10">
    {saving
      ? editingAdId
        ? "Updating Campaign..."
        : "Deploying Campaign..."
      : editingAdId
        ? "Update Campaign"
        : "Create & Deploy Campaign"}
  </span>
</button>
{editingAdId && (
  <button
    type="button"
    onClick={cancelEdit}
    className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-black text-zinc-700 hover:bg-zinc-100"
  >
    Cancel Edit
  </button>
)}
        </div>

        {/* ================================================= */}
        {/* RIGHT PREVIEW */}
        {/* ================================================= */}

        <div className="xl:sticky xl:top-5 xl:self-start">
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl">
            <div className="border-b border-zinc-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-zinc-950">
                    Creative Preview
                  </div>

                  <div className="mt-0.5 text-[10px] text-zinc-500">
                    Production coordinate canvas
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPreview(
                      (v) => !v
                    )
                  }
                  className="rounded-full bg-zinc-100 px-3 py-1.5 text-[9px] font-black text-zinc-600"
                >
                  {preview
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-zinc-100 p-1">
                <DeviceTab
                  active={
                    previewDevice ===
                    "desktop"
                  }
                  onClick={() =>
                    setPreviewDevice(
                      "desktop"
                    )
                  }
                  label="Desktop"
                  dimensions="1366 × 768"
                />

                <DeviceTab
                  active={
                    previewDevice ===
                    "mobile"
                  }
                  onClick={() =>
                    setPreviewDevice(
                      "mobile"
                    )
                  }
                  label="Mobile"
                  dimensions="440 × 956"
                />
              </div>
            </div>

            {preview && (
              <div
                ref={
                  previewFrameRef
                }
                className="bg-[#e9e9ed] p-4"
              >
                <div className="mb-3 flex items-center justify-between rounded-xl bg-zinc-950 px-3 py-2.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white">
                    {previewDevice ===
                    "desktop"
                      ? "Desktop Canvas"
                      : "Mobile Canvas"}
                  </span>

                  <span className="text-[9px] font-bold text-zinc-400">
                    {baseWidth} ×{" "}
                    {baseHeight}
                  </span>
                </div>

                <div
                  className={`relative mx-auto overflow-hidden bg-white shadow-2xl ${
                    previewDevice ===
                    "mobile"
                      ? "rounded-[28px] border-[5px] border-zinc-900"
                      : "rounded-xl border border-zinc-300"
                  }`}
                  style={{
                    width:
                      baseWidth *
                      canvasScale,

                    height:
                      displayedHeight,
                  }}
                >
                  <div
                    className="absolute left-0 top-0 origin-top-left"
                    style={{
                      width:
                        baseWidth,

                      height:
                        baseHeight,

                      transform:
                        `scale(${canvasScale})`,
                    }}
                  >
                    {previewDevice ===
                      "mobile" && (
                      <div className="pointer-events-none absolute left-1/2 top-2 z-[200] h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
                    )}

                    {/* =====================================================
    REAL LIVE WEBSITE
===================================================== */}

<div className="absolute inset-0 overflow-hidden bg-white">

  <iframe
    src={LIVE_WEBSITE_URL}
    title="Live Website Preview"
    className="absolute left-0 top-0 block border-0"
    style={{
      width: baseWidth,
      height: baseHeight,
    }}
    loading="eager"
    allow="autoplay; fullscreen; picture-in-picture"
  />

  {/* =================================================
      AD OVERLAY
  ================================================= */}

  <div
    className="pointer-events-none absolute inset-0"
    style={{
      width: baseWidth,
      height: baseHeight,
    }}
  >

    <div
      className="pointer-events-auto absolute left-1/2 top-1/2"
      style={{
        transform:
          `translate(-50%, -50%) ` +
          `translate(${currentRenderLayout.x}px, ${currentRenderLayout.y}px) ` +
          `scale(${currentRenderLayout.scale})`,

        transformOrigin: "center center",

        zIndex: 99999,
      }}
    >
      <PreviewCreative
        form={form}
        device={previewDevice}
        onClose={() =>
          setPreview(false)
        }
      />
    </div>

  </div>

</div>

                    {/* COORDINATE BADGE */}

                    <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-[9px] font-black text-white">
                      {isFloatingAd(form.type) ? (
                        <>
                          X {currentFloatingLayout.x}
                          {" · "}
                          Y {currentFloatingLayout.y}
                          {" · "}
                          {Math.round(currentFloatingLayout.scale * 100)}%
                        </>
                      ) : supportsScaleControl(form.type) ? (
                        <>
                          
                          {" · "}
                          {Math.round(currentScale * 100)}%
                        </>
                      ) : isStickyBottomAd(form.type) ? (
                        <>
                          {currentStickyBottomLayout.width}
                          {" × "}
                          {currentStickyBottomLayout.height}
                        </>
                      ) : (
                        <>AUTOMATIC PLACEMENT</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* EXISTING CAMPAIGNS */}
      {/* ================================================= */}

      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-black text-zinc-950">
              Campaign Library
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Existing campaigns and
              deployment status.
            </p>
          </div>

          <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-[10px] font-black text-zinc-600">
            {ads.length} Campaigns
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={
                    item
                  }
                  className="animate-pulse rounded-2xl border border-zinc-200 p-4"
                >
                  <div className="h-36 rounded-xl bg-zinc-200" />

                  <div className="mt-4 h-4 w-2/3 rounded bg-zinc-200" />

                  <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200" />
                </div>
              )
            )}
          </div>
        ) : ads.length ===
          0 ? (
          <div className="p-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-xl">
              ◇
            </div>

            <div className="mt-4 text-sm font-black">
              No campaigns yet
            </div>

            <div className="mt-1 text-xs text-zinc-500">
              Your deployed campaigns
              will appear here.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map(
              (ad) => (
                <div
                  key={
                    `${ad.type}-${ad.id}`
                  }
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative h-40 overflow-hidden bg-zinc-100">
                    {ad.image ? (
                      <img
                        src={
                          ad.image
                        }
                        alt={
                          ad.title ||
                          "Campaign"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-zinc-950 text-xs font-black text-white">
                        {ad.type ===
                        "cube"
                          ? "3D CUBE"
                          : isVideoAd(
                                ad.type
                              )
                            ? "VIDEO"
                            : (
                                ad.type ||
                                "CAMPAIGN"
                              ).toUpperCase()}
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-black/75 px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white">
                      {
                        ad.type
                      }
                    </div>

                    <div
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[8px] font-black ${
                        ad.active
                          ? "bg-green-500 text-white"
                          : "bg-zinc-900/80 text-zinc-300"
                      }`}
                    >
                      {ad.active
                        ? "LIVE"
                        : "OFF"}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-black text-zinc-950">
                      {ad.title ||
                        "Untitled Campaign"}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[8px] font-black text-zinc-600">
                        AUTOMATIC
                      </span>

                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[8px] font-black text-zinc-600">
                        P
                        {ad.priority ??
                          1}
                      </span>

                      {ad.layout &&
                        supportsScaleControl(ad.type) &&
                        !isFloatingAd(ad.type) && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[8px] font-black text-red-600">
                            D {Math.round((ad.layout.desktop?.scale ?? 1) * 100)}%
                          </span>
                        )}

                      {ad.type === "sticky_bottom" && ad.layout && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[8px] font-black text-orange-600">
                          D {ad.layout.desktop?.width ?? 1100} × {ad.layout.desktop?.height ?? 92}
                        </span>
                      )}

                      {ad.layout &&
                        isFloatingAd(
                          ad.type
                        ) && (
                          <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[8px] font-black text-purple-600">
                            X{" "}
                            {ad
                              .layout
                              .desktop
                              ?.x ??
                              0}
                            {" "}
                            Y{" "}
                            {ad
                              .layout
                              .desktop
                              ?.y ??
                              0}
                          </span>
                        )}

                      {ad.type ===
                        "shorts_video" && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[8px] font-black text-blue-600">
                          {ad.videoOrientation ===
                          "vertical"
                            ? "9:16"
                            : ad.videoOrientation ===
                                "horizontal"
                              ? "16:9"
                              : "AUTO"}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">

  <button
    type="button"
    onClick={() =>
      editAd(ad)
    }
    className="rounded-xl border border-blue-200 px-4 py-2.5 text-[10px] font-black text-blue-600 transition hover:bg-blue-50"
  >
    Edit Campaign
  </button>

  <button
    type="button"
    onClick={() =>
      remove(
        ad.type,
        ad.id
      )
    }
    className="rounded-xl border border-red-200 px-4 py-2.5 text-[10px] font-black text-red-600 transition hover:bg-red-50"
  >
    Delete Campaign
  </button>

</div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================================================
// PREVIEW CREATIVE
// ======================================================

function PreviewCreative({
  form,
  device,
  onClose,
}: {
  form: FormState;
  device: PreviewDevice;
  onClose: () => void;
}) {
  // ====================================================
  // BANNER
  // ====================================================

  if (
    form.type ===
    "banner"
  ) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl"
        style={{
          width: 728,
          height: 90,
        }}
      >
        {form.image ? (
          <img
            src={
              form.image
            }
            alt={
              form.title ||
              "Banner Advertisement"
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs font-black text-zinc-400">
            Banner Advertisement
          </div>
        )}
      </div>
    );
  }

  // ====================================================
  // NATIVE
  // ====================================================

  if (
    form.type ===
    "native"
  ) {
    return (
      <div className="w-[360px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        {form.image ? (
          <img
            src={
              form.image
            }
            alt=""
            className="h-40 w-full object-cover"
          />
        ) : (
          <EmptyPreview label="Creative image" />
        )}

        <div className="p-4">
          <div className="text-[8px] font-black uppercase tracking-widest text-red-600">
            Sponsored
          </div>

          <div className="mt-1 text-base font-black text-zinc-950">
            {form.title ||
              "Sponsored Story"}
          </div>

          <div className="mt-2 text-[10px] text-zinc-500">
            Premium promoted content
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // POPUP
  // ====================================================

  if (
    form.type ===
    "popup"
  ) {
    return (
      <div className="relative w-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        {form.closeable && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-sm font-black text-white"
          >
            ×
          </button>
        )}

        {form.image ? (
          <img
            src={
              form.image
            }
            alt=""
            className="h-[210px] w-full object-cover"
          />
        ) : (
          <EmptyPreview label="Popup creative" />
        )}

        <div className="p-5">
          <div className="text-lg font-black">
            {form.title ||
              "Premium Promotion"}
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            Limited-time promotion
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // PAGE TRANSITION
  // ====================================================

  if (
    form.type ===
    "page_transition"
  ) {
    return (
      <div className="relative w-[360px] overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl">
        {form.closeable && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white"
          >
            ×
          </button>
        )}

        {form.image ? (
          <img
            src={
              form.image
            }
            alt=""
            className="h-[210px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[210px] items-center justify-center bg-zinc-900 text-xs font-black text-zinc-500">
            PAGE TRANSITION
          </div>
        )}

        <div className="p-5">
          <div className="text-[9px] font-black uppercase tracking-widest text-red-500">
            Sponsored
          </div>

          <div className="mt-2 text-xl font-black text-white">
            {form.title ||
              "Opening promotion"}
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            Preparing destination
          </div>

          <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-red-600" />
          </div>
        </div>
      </div>
    );
  }

  // ====================================================
  // STICKY
  // ====================================================

 if (
  form.type ===
  "sticky_bottom"
) {
  return (
    <div
      className="relative overflow-visible"
      style={{
        width:
          form.stickyBottomLayout[
            device
          ].width,
        height:
          form.stickyBottomLayout[
            device
          ].height,
        maxWidth: "100%",
      }}
    >
      {/* CLOSE BUTTON */}

      {form.closeable && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close advertisement"
          title="Close advertisement"
          className="absolute -top-[34px] right-0 z-20 flex h-[34px] w-[34px] items-center justify-center rounded-tl-md border border-b-0 border-white/85 bg-black text-white shadow-[0_-4px_15px_rgba(0,0,0,0.3)]"
        >
          <X
            size={19}
            strokeWidth={2.8}
          />
        </button>
      )}

      {/* ADVERTISEMENT LABEL */}

      <div className="absolute left-[7px] top-[6px] z-10 rounded-[2px] bg-black/70 px-[6px] py-[3px] text-[8px] font-bold uppercase tracking-[0.08em] text-white">
        Advertisement
      </div>

      {/* ADVERTISEMENT */}

      {form.image ? (
        form.link ? (
          <a
            href={form.link}
            target={
              form.openInNewTab !== false
                ? "_blank"
                : "_self"
            }
            rel={
              form.openInNewTab !== false
                ? "noopener noreferrer"
                : undefined
            }
            className="block h-full w-full overflow-hidden rounded-t-lg border border-white/20 border-b-0 bg-black shadow-[0_-8px_35px_rgba(0,0,0,0.4)]"
          >
            <img
              src={form.image}
              alt={
                form.title ||
                "Advertisement"
              }
              className="block h-full w-full select-none object-cover object-center"
              draggable={false}
            />
          </a>
        ) : (
          <div className="block h-full w-full overflow-hidden rounded-t-lg border border-white/20 border-b-0 bg-black shadow-[0_-8px_35px_rgba(0,0,0,0.4)]">
            <img
              src={form.image}
              alt={
                form.title ||
                "Advertisement"
              }
              className="block h-full w-full select-none object-cover object-center"
              draggable={false}
            />
          </div>
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-t-lg border border-white/20 border-b-0 bg-black text-xs font-bold uppercase tracking-widest text-white/50">
          Advertisement
        </div>
      )}
    </div>
  );
}

  // ====================================================
  // CUBE
  // ====================================================

  if (
    form.type ===
    "cube"
  ) {
    const size =
      form.width || 160;

    const depth =
      size / 2-0.4;

    const transforms = [
      `rotateY(0deg) translateZ(${depth}px)`,
      `rotateY(90deg) translateZ(${depth}px)`,
      `rotateY(180deg) translateZ(${depth}px)`,
      `rotateY(-90deg) translateZ(${depth}px)`,
    ];

    return (
      <>
        <style>
          {`
            @keyframes adsCubeSpin {
              from {
                transform:
                  rotateX(-8deg)
                  rotateY(0deg);
              }

              to {
                transform:
                  rotateX(-8deg)
                  rotateY(360deg);
              }
            }
          `}
        </style>

        <div
          className="relative flex items-center justify-center"
          style={{
            width:
              size + 30,

            height:
              size + 30,
          }}
        >
          {form.closeable && (
            <button
              type="button"
              onClick={
                onClose
              }
              className="absolute -right-2 -top-2 z-50 flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-black text-white shadow-lg"
            >
              ×
            </button>
          )}

          <div
            className="relative"
            style={{
              width: size,
              height: size,
              perspective:
                "800px",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transformStyle:
                  "preserve-3d",

                WebkitTransformStyle:
                  "preserve-3d",

                animation:
                  `adsCubeSpin ${
                    form.rotationSpeed ||
                    4
                  }s linear infinite`,
              }}
            >
              {form.cubeFaces
                .slice(0, 4)
                .map(
                  (
                    face,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="absolute inset-0 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-2xl"
                      style={{
                        transform:
                          transforms[
                            index
                          ],

                        WebkitTransform:
                          transforms[
                            index
                          ],

                        backfaceVisibility:
                          "hidden",

                        WebkitBackfaceVisibility:
                          "hidden",
                      }}
                    >
                      {face.image ? (
                        <img
                          src={
                            face.image
                          }
                          alt={`Cube Face ${
                            index +
                            1
                          }`}
                          className="h-full w-full object-cover"
                          draggable={
                            false
                          }
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-black text-white">
                          Face{" "}
                          {index +
                            1}
                        </div>
                      )}
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      </>
    );
  }

  // ====================================================
  // VIDEO
  // ====================================================

  if (
    form.type ===
      "shorts_video" ||
    form.type ===
      "floating_tv"
  ) {
    const youtube =
      getYouTubeEmbedUrl(
        form.videoUrl
      );

    const isVertical =
      form.type ===
        "shorts_video" &&
      form.videoOrientation ===
        "vertical";

    const isAuto =
      form.type ===
        "shorts_video" &&
      form.videoOrientation ===
        "auto";

    const width =
      form.type ===
      "floating_tv"
        ? form.width ||
          320
        : isVertical
          ? 240
          : 360;

    const aspectClass =
      isVertical
        ? "aspect-[9/16]"
        : "aspect-video";

    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-black shadow-2xl"
        style={{
          width,
        }}
      >
        {youtube ? (
          <div
            className={`relative ${aspectClass}`}
          >
            <iframe
              src={
                youtube
              }
              title={
                form.title ||
                "Video Advertisement"
              }
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : form.videoUrl ? (
          <div
            className={`relative ${aspectClass}`}
          >
            <video
              src={
                form.videoUrl
              }
              poster={
                form.videoPoster ||
                undefined
              }
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay={
                form.autoplay
              }
              muted={
                form.muted
              }
              loop
              playsInline
              controls
              preload="metadata"
            />
          </div>
        ) : (
          <div
            className={`flex items-center justify-center text-xs font-bold text-zinc-500 ${
              isVertical
                ? "aspect-[9/16]"
                : "aspect-video"
            }`}
          >
            Add video source
          </div>
        )}

        <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-md bg-red-600 px-2 py-1 text-[8px] font-black text-white">
          SPONSORED
        </div>

        {isVertical && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[8px] font-black text-white">
            9:16
          </div>
        )}

        {!isVertical &&
          !isAuto &&
          form.type ===
            "shorts_video" && (
            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-[8px] font-black text-white">
              16:9
            </div>
          )}

        {form.type ===
          "floating_tv" &&
          form.closeable && (
            <button
              type="button"
              onClick={
                onClose
              }
              className="absolute right-2 top-2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-xs font-black text-white"
            >
              ×
            </button>
          )}
      </div>
    );
  }

  return null;
}

// ======================================================
// EMPTY PREVIEW
// ======================================================

function EmptyPreview({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex h-36 w-full items-center justify-center bg-zinc-100 text-xs font-black text-zinc-400">
      {label}
    </div>
  );
}

// ======================================================
// STAT
// ======================================================

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: "green" | "gold";
}) {
  return (
    <div className="text-center">
      <div
        className={`text-xl font-black ${
          accent ===
          "green"
            ? "text-green-400"
            : accent ===
                "gold"
              ? "text-yellow-400"
              : "text-white"
        }`}
      >
        {value}
      </div>

      <div className="mt-0.5 text-[8px] font-black uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}

