"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import type {
  AdsData,
  AdType,
  AdPosition,
  AdFrequency,
  AdVideoType,
  AdCubeFace,
  CreateAdData,
} from "./types";

// ======================================================
// PROPS
// ======================================================

interface AdFormProps {
  ad?: AdsData | null;

  loading?: boolean;

  onSubmit: (
    data: CreateAdData
  ) => Promise<void>;

  onCancel?: () => void;
}

// ======================================================
// CUBE FACE DATA
// ======================================================

interface CubeFaceData {
  imageUrl: string;
  targetUrl: string;
}

// ======================================================
// DEFAULT CUBE
// ======================================================

const DEFAULT_CUBE: Record<
  AdCubeFace,
  CubeFaceData
> = {
  front: {
    imageUrl: "",
    targetUrl: "",
  },

  right: {
    imageUrl: "",
    targetUrl: "",
  },

  back: {
    imageUrl: "",
    targetUrl: "",
  },

  left: {
    imageUrl: "",
    targetUrl: "",
  },

  top: {
    imageUrl: "",
    targetUrl: "",
  },

  bottom: {
    imageUrl: "",
    targetUrl: "",
  },
};

// ======================================================
// COMPONENT
// ======================================================

export default function AdForm({
  ad,
  loading = false,
  onSubmit,
  onCancel,
}: AdFormProps) {
  // ====================================================
  // BASIC
  // ====================================================

  const [name, setName] = useState("");

  const [type, setType] =
    useState<AdType>("image");

  const [position, setPosition] =
    useState<AdPosition>("top");

  const [active, setActive] =
    useState(true);

  const [priority, setPriority] =
    useState(0);

  const [targetUrl, setTargetUrl] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [mobileImageUrl, setMobileImageUrl] =
    useState("");

  // ====================================================
  // VIDEO
  // ====================================================

  const [videoType, setVideoType] =
    useState<AdVideoType>("youtube");

  const [videoUrl, setVideoUrl] =
    useState("");

  // ====================================================
  // HTML / TEXT
  // ====================================================

  const [htmlCode, setHtmlCode] =
    useState("");

  const [text, setText] =
    useState("");

  // ====================================================
  // SETTINGS
  // ====================================================

  const [frequency, setFrequency] =
    useState<AdFrequency>("always");

  const [startDate, setStartDate] =
    useState("");

  const [endDate, setEndDate] =
    useState("");

  const [openInNewTab, setOpenInNewTab] =
    useState(true);

  // ====================================================
  // CUBE
  // ====================================================

  const [cubeFaces, setCubeFaces] =
    useState<Record<
      AdCubeFace,
      CubeFaceData
    >>(DEFAULT_CUBE);

  // ====================================================
  // LOAD EDIT DATA
  // ====================================================

  useEffect(() => {
    if (!ad) {
      resetForm();
      return;
    }

    setName(ad.name ?? "");

    setType(ad.type ?? "image");

    setPosition(
      ad.position ?? "top"
    );

    setActive(
      ad.active ?? true
    );

    setPriority(
      ad.priority ?? 0
    );

    setTargetUrl(
      ad.targetUrl ?? ""
    );

    setImageUrl(
      ad.imageUrl ?? ""
    );

    setMobileImageUrl(
      ad.mobileImageUrl ?? ""
    );

    setVideoType(
      ad.videoType ?? "youtube"
    );

    setVideoUrl(
      ad.videoUrl ?? ""
    );

    setHtmlCode(
      ad.htmlCode ?? ""
    );

    setText(
      ad.text ?? ""
    );

    setFrequency(
      ad.frequency ?? "always"
    );

    setStartDate(
      ad.startDate ?? ""
    );

    setEndDate(
      ad.endDate ?? ""
    );

    setOpenInNewTab(
      ad.openInNewTab ?? true
    );

    if (ad.cubeFaces) {
      setCubeFaces({
        ...DEFAULT_CUBE,
        ...ad.cubeFaces,
      });
    } else {
      setCubeFaces(
        DEFAULT_CUBE
      );
    }
  }, [ad]);

  // ====================================================
  // RESET
  // ====================================================

  function resetForm() {
    setName("");

    setType("image");

    setPosition("top");

    setActive(true);

    setPriority(0);

    setTargetUrl("");

    setImageUrl("");

    setMobileImageUrl("");

    setVideoType("youtube");

    setVideoUrl("");

    setHtmlCode("");

    setText("");

    setFrequency("always");

    setStartDate("");

    setEndDate("");

    setOpenInNewTab(true);

    setCubeFaces({
      ...DEFAULT_CUBE,
    });
  }

  // ====================================================
  // UPDATE CUBE FACE
  // ====================================================

  function updateCubeFace(
    face: AdCubeFace,
    field: keyof CubeFaceData,
    value: string
  ) {
    setCubeFaces(
      (previous) => ({
        ...previous,

        [face]: {
          ...previous[face],
          [field]: value,
        },
      })
    );
  }

  // ====================================================
  // SUBMIT
  // ====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const data: CreateAdData = {
      name: name.trim(),

      type,

      position,

      active,

      priority:
        Number(priority) || 0,

      targetUrl:
        targetUrl.trim(),

      imageUrl:
        imageUrl.trim(),

      mobileImageUrl:
        mobileImageUrl.trim(),

      videoType:
        type === "video"
          ? videoType
          : undefined,

      videoUrl:
        type === "video"
          ? videoUrl.trim()
          : undefined,

      htmlCode:
        type === "html"
          ? htmlCode
          : undefined,

      text:
        type === "text"
          ? text.trim()
          : undefined,

      cubeFace:
        type === "cube"
          ? "front"
          : undefined,

      frequency,

      startDate:
        startDate || null,

      endDate:
        endDate || null,

      openInNewTab,

      ...(type === "cube"
        ? {
            cubeFaces,
          } as unknown as Partial<CreateAdData>
        : {}),
    };

    await onSubmit(data);
  }

  // ====================================================
  // INPUT CLASS
  // ====================================================

  const inputClass = `
    w-full
    rounded-xl
    border
    border-zinc-700
    bg-zinc-900
    px-3
    py-2.5
    text-sm
    text-white
    outline-none
    transition
    placeholder:text-zinc-500
    focus:border-red-500
    focus:ring-2
    focus:ring-red-500/20
  `;

  const labelClass = `
    mb-1.5
    block
    text-sm
    font-medium
    text-zinc-300
  `;

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      {/* ==================================================
          BASIC INFORMATION
      ================================================== */}

      <section>
        <h3
          className="
            mb-4
            text-base
            font-semibold
            text-white
          "
        >
          Basic Information
        </h3>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >
          {/* NAME */}

          <div>
            <label
              className={labelClass}
            >
              Ad Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Enter ad name"
              className={inputClass}
              required
            />
          </div>

          {/* TYPE */}

          <div>
            <label
              className={labelClass}
            >
              Ad Type
            </label>

            <select
              value={type}
              onChange={(event) =>
                setType(
                  event.target.value as AdType
                )
              }
              className={inputClass}
            >
              <option value="image">
                Image
              </option>

              <option value="video">
                Video
              </option>

              <option value="html">
                HTML
              </option>

              <option value="text">
                Text
              </option>

              <option value="cube">
                3D Cube
              </option>
            </select>
          </div>

          {/* POSITION */}

          <div>
            <label
              className={labelClass}
            >
              Position
            </label>

            <select
              value={position}
              onChange={(event) =>
                setPosition(
                  event.target.value as AdPosition
                )
              }
              className={inputClass}
            >
              <option value="top">
                Top
              </option>

              <option value="header">
                Header
              </option>

              <option value="below-navbar">
                Below Navbar
              </option>

              <option value="between-articles">
                Between Articles
              </option>

              <option value="sidebar">
                Sidebar
              </option>

              <option value="article-top">
                Article Top
              </option>

              <option value="article-middle">
                Article Middle
              </option>

              <option value="article-bottom">
                Article Bottom
              </option>

              <option value="footer">
                Footer
              </option>

              <option value="popup">
                Popup
              </option>

              <option value="shorts">
                Shorts
              </option>
            </select>
          </div>

          {/* PRIORITY */}

          <div>
            <label
              className={labelClass}
            >
              Priority
            </label>

            <input
              type="number"
              min="0"
              value={priority}
              onChange={(event) =>
                setPriority(
                  Number(
                    event.target.value
                  )
                )
              }
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          IMAGE
      ================================================== */}

      {type === "image" && (
        <section>
          <h3
            className="
              mb-4
              text-base
              font-semibold
              text-white
            "
          >
            Image Advertisement
          </h3>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <div>
              <label
                className={labelClass}
              >
                Desktop Image URL
              </label>

              <input
                value={imageUrl}
                onChange={(event) =>
                  setImageUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>

            <div>
              <label
                className={labelClass}
              >
                Mobile Image URL
              </label>

              <input
                value={mobileImageUrl}
                onChange={(event) =>
                  setMobileImageUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          VIDEO
      ================================================== */}

      {type === "video" && (
        <section>
          <h3
            className="
              mb-4
              text-base
              font-semibold
              text-white
            "
          >
            Video Advertisement
          </h3>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            <div>
              <label
                className={labelClass}
              >
                Video Type
              </label>

              <select
                value={videoType}
                onChange={(event) =>
                  setVideoType(
                    event.target.value as AdVideoType
                  )
                }
                className={inputClass}
              >
                <option value="youtube">
                  YouTube
                </option>

                <option value="direct">
                  MP4 / Direct Video
                </option>
              </select>
            </div>

            <div>
              <label
                className={labelClass}
              >
                Video URL
              </label>

              <input
                value={videoUrl}
                onChange={(event) =>
                  setVideoUrl(
                    event.target.value
                  )
                }
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          HTML
      ================================================== */}

      {type === "html" && (
        <section>
          <h3
            className="
              mb-4
              text-base
              font-semibold
              text-white
            "
          >
            HTML Advertisement
          </h3>

          <textarea
            value={htmlCode}
            onChange={(event) =>
              setHtmlCode(
                event.target.value
              )
            }
            rows={8}
            placeholder="Paste advertisement HTML..."
            className={inputClass}
          />
        </section>
      )}

      {/* ==================================================
          TEXT
      ================================================== */}

      {type === "text" && (
        <section>
          <h3
            className="
              mb-4
              text-base
              font-semibold
              text-white
            "
          >
            Text Advertisement
          </h3>

          <textarea
            value={text}
            onChange={(event) =>
              setText(
                event.target.value
              )
            }
            rows={5}
            placeholder="Enter advertisement text..."
            className={inputClass}
          />
        </section>
      )}

      {/* ==================================================
          CUBE
      ================================================== */}

      {type === "cube" && (
        <section>
          <div
            className="
              mb-4
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <h3
                className="
                  text-base
                  font-semibold
                  text-white
                "
              >
                3D Cube Advertisement
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-500
                "
              >
                Configure each face of the
                rotating Y-axis cube.
              </p>
            </div>

            <span
              className="
                rounded-full
                border
                border-red-500/20
                bg-red-500/10
                px-3
                py-1
                text-xs
                font-semibold
                text-red-400
              "
            >
              Y-Axis
            </span>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {(
              Object.keys(
                cubeFaces
              ) as AdCubeFace[]
            ).map((face) => (
              <div
                key={face}
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-900/60
                  p-4
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-sm
                      font-semibold
                      capitalize
                      text-white
                    "
                  >
                    {face} Face
                  </span>

                  <span
                    className="
                      text-[10px]
                      uppercase
                      tracking-wider
                      text-zinc-500
                    "
                  >
                    Cube
                  </span>
                </div>

                <div className="space-y-3">
                  <input
                    value={
                      cubeFaces[face]
                        .imageUrl
                    }
                    onChange={(event) =>
                      updateCubeFace(
                        face,
                        "imageUrl",
                        event.target.value
                      )
                    }
                    placeholder="Image URL"
                    className={inputClass}
                  />

                  <input
                    value={
                      cubeFaces[face]
                        .targetUrl
                    }
                    onChange={(event) =>
                      updateCubeFace(
                        face,
                        "targetUrl",
                        event.target.value
                      )
                    }
                    placeholder="Click URL"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          LINK
      ================================================== */}

      {type !== "cube" && (
        <section>
          <label
            className={labelClass}
          >
            Target URL
          </label>

          <input
            value={targetUrl}
            onChange={(event) =>
              setTargetUrl(
                event.target.value
              )
            }
            placeholder="https://example.com"
            className={inputClass}
          />
        </section>
      )}

      {/* ==================================================
          SCHEDULE
      ================================================== */}

      <section>
        <h3
          className="
            mb-4
            text-base
            font-semibold
            text-white
          "
        >
          Schedule & Settings
        </h3>

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {/* FREQUENCY */}

          <div>
            <label
              className={labelClass}
            >
              Frequency
            </label>

            <select
              value={frequency}
              onChange={(event) =>
                setFrequency(
                  event.target.value as AdFrequency
                )
              }
              className={inputClass}
            >
              <option value="always">
                Always
              </option>

              <option value="low">
                Low
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="high">
                High
              </option>
            </select>
          </div>

          {/* START DATE */}

          <div>
            <label
              className={labelClass}
            >
              Start Date
            </label>

            <input
              type="datetime-local"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          {/* END DATE */}

          <div>
            <label
              className={labelClass}
            >
              End Date
            </label>

            <input
              type="datetime-local"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
              className={inputClass}
            />
          </div>

          {/* ACTIVE */}

          <div className="flex items-end">
            <label
              className="
                flex
                w-full
                cursor-pointer
                items-center
                justify-between
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900
                px-4
                py-3
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-white
                "
              >
                Active
              </span>

              <input
                type="checkbox"
                checked={active}
                onChange={(event) =>
                  setActive(
                    event.target.checked
                  )
                }
                className="
                  h-4
                  w-4
                  accent-red-600
                "
              />
            </label>
          </div>
        </div>

        {/* NEW TAB */}

        <label
          className="
            mt-4
            flex
            cursor-pointer
            items-center
            gap-3
            text-sm
            text-zinc-300
          "
        >
          <input
            type="checkbox"
            checked={openInNewTab}
            onChange={(event) =>
              setOpenInNewTab(
                event.target.checked
              )
            }
            className="
              h-4
              w-4
              accent-red-600
            "
          />

          Open advertisement
          in new tab
        </label>
      </section>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div
        className="
          flex
          flex-col-reverse
          gap-3
          border-t
          border-zinc-800
          pt-5
          sm:flex-row
          sm:justify-end
        "
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              rounded-xl
              border
              border-zinc-700
              px-5
              py-2.5
              text-sm
              font-semibold
              text-zinc-300
              transition
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            rounded-xl
            bg-red-600
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-red-500
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Saving..."
            : ad
              ? "Update Advertisement"
              : "Create Advertisement"}
        </button>
      </div>
    </form>
  );
}
