"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Radio,
  Tv,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  ExternalLink,
  GripVertical,
} from "lucide-react";

import {
  getLiveTv,
  createLiveTv,
  updateLiveTv,
  deleteLiveTv,
  toggleLiveTv,
} from "@/services/live-tv.service";


// ======================================================
// TYPES
// ======================================================

interface LiveTvChannel {

  id: string;

  title: string;

  youtubeUrl: string;

  enabled: boolean;

  order: number;

  logo?: string;

}


// ======================================================
// YOUTUBE ID
// ======================================================

function getYoutubeId(
  url: string
) {

  if (!url) {
    return "";
  }

  try {

    const parsed =
      new URL(url);

    const hostname =
      parsed.hostname
        .replace(
          "www.",
          ""
        )
        .toLowerCase();


    // youtube.com/watch?v=

    if (
      hostname ===
        "youtube.com" ||
      hostname ===
        "m.youtube.com"
    ) {

      const videoId =
        parsed.searchParams.get(
          "v"
        );

      if (videoId) {
        return videoId;
      }


      // /live/VIDEO_ID

      const liveMatch =
        parsed.pathname.match(
          /\/live\/([^/?]+)/
        );

      if (liveMatch?.[1]) {
        return liveMatch[1];
      }


      // /embed/VIDEO_ID

      const embedMatch =
        parsed.pathname.match(
          /\/embed\/([^/?]+)/
        );

      if (embedMatch?.[1]) {
        return embedMatch[1];
      }

    }


    // youtu.be/VIDEO_ID

    if (
      hostname ===
      "youtu.be"
    ) {

      return (
        parsed.pathname
          .split("/")
          .filter(Boolean)[0] ||
        ""
      );

    }

  }
  catch {

    return "";

  }

  return "";

}


// ======================================================
// PAGE
// ======================================================

export default function LiveTvAdminPage() {

  const [
    channels,
    setChannels,
  ] =
    useState<LiveTvChannel[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    deleting,
    setDeleting,
  ] =
    useState("");


  const [
    editingId,
    setEditingId,
  ] =
    useState<string | null>(
      null
    );


  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  // ====================================================
  // FORM
  // ====================================================

  const [
    title,
    setTitle,
  ] =
    useState("");


  const [
    youtubeUrl,
    setYoutubeUrl,
  ] =
    useState("");


  const [
    enabled,
    setEnabled,
  ] =
    useState(true);


  const [
    order,
    setOrder,
  ] =
    useState(0);


  // ====================================================
  // LOAD
  // ====================================================

  async function loadChannels() {

    try {

      setLoading(true);

      setError("");


      const data =
        await getLiveTv();


      const sorted =
        [...data]
          .sort(
            (
              a: any,
              b: any
            ) =>
              Number(
                a.order ?? 0
              ) -
              Number(
                b.order ?? 0
              )
          );


      setChannels(
        sorted as LiveTvChannel[]
      );

    }
    catch (error) {

      console.error(
        "Live TV Load Error:",
        error
      );

      setError(
        "Failed to load Live TV channels."
      );

    }
    finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadChannels();

  }, []);


  // ====================================================
  // RESET FORM
  // ====================================================

  function resetForm() {

    setTitle("");

    setYoutubeUrl("");

    setEnabled(true);

    setOrder(
      channels.length
    );

    setEditingId(
      null
    );

    setError("");

  }


  // ====================================================
  // OPEN CREATE
  // ====================================================

  function openCreate() {

    resetForm();

    setModalOpen(true);

  }


  // ====================================================
  // OPEN EDIT
  // ====================================================

  function openEdit(
    channel: LiveTvChannel
  ) {

    setEditingId(
      channel.id
    );

    setTitle(
      channel.title || ""
    );

    setYoutubeUrl(
      channel.youtubeUrl || ""
    );

    setEnabled(
      channel.enabled === true
    );

    setOrder(
      Number(
        channel.order ?? 0
      )
    );

    setError("");

    setModalOpen(true);

  }


  // ====================================================
  // CLOSE MODAL
  // ====================================================

  function closeModal() {

    if (saving) {
      return;
    }

    setModalOpen(false);

    resetForm();

  }


  // ====================================================
  // SAVE
  // ====================================================

  async function handleSave() {

    setError("");

    setSuccess("");


    if (!title.trim()) {

      setError(
        "Please enter a channel name."
      );

      return;

    }


    if (!youtubeUrl.trim()) {

      setError(
        "Please enter the Live stream URL."
      );

      return;

    }


    if (
      !getYoutubeId(
        youtubeUrl
      )
    ) {

      setError(
        "Please enter a valid YouTube URL."
      );

      return;

    }


    try {

      setSaving(true);


      const data = {

        title:
          title.trim(),

        youtubeUrl:
          youtubeUrl.trim(),

        enabled,

        order:
          Number(order) || 0,

      };


      if (editingId) {

        await updateLiveTv(
          editingId,
          data
        );

        setSuccess(
          "Live TV channel updated successfully."
        );

      }
      else {

        await createLiveTv(
          data
        );

        setSuccess(
          "Live TV channel added successfully."
        );

      }


      setModalOpen(false);

      resetForm();

      await loadChannels();

    }
    catch (error: any) {

      console.error(
        "Live TV Save Error:",
        error
      );

      setError(
        error?.message ||
        "Failed to save Live TV channel."
      );

    }
    finally {

      setSaving(false);

    }

  }


  // ====================================================
  // TOGGLE
  // ====================================================

  async function handleToggle(
    channel: LiveTvChannel
  ) {

    try {

      await toggleLiveTv(
        channel.id,
        !channel.enabled
      );


      setChannels(
        (previous) =>
          previous.map(
            (item) =>
              item.id ===
              channel.id
                ? {
                    ...item,
                    enabled:
                      !channel.enabled,
                  }
                : item
          )
      );

    }
    catch (error) {

      console.error(
        "Live TV Toggle Error:",
        error
      );

      setError(
        "Failed to change channel status."
      );

    }

  }


  // ====================================================
  // DELETE
  // ====================================================

  async function handleDelete(
    channel: LiveTvChannel
  ) {

    const confirmed =
      window.confirm(
        `Delete "${channel.title}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      setDeleting(
        channel.id
      );


      await deleteLiveTv(
        channel.id
      );


      setChannels(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !==
              channel.id
          )
      );


      setSuccess(
        "Live TV channel deleted."
      );

    }
    catch (error) {

      console.error(
        "Live TV Delete Error:",
        error
      );

      setError(
        "Failed to delete channel."
      );

    }
    finally {

      setDeleting("");

    }

  }


  // ====================================================
  // PREVIEW
  // ====================================================

  function getPreviewUrl(
    url: string
  ) {

    const id =
      getYoutubeId(url);

    if (!id) {
      return "";
    }

    return `https://www.youtube.com/embed/${id}?autoplay=0&controls=1&rel=0&modestbranding=1`;
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (

    <div
      className="
        w-full
        min-w-0
        space-y-6
      "
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-red-50
                text-red-600
              "
            >

              <Radio
                size={24}
              />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-bold
                  text-zinc-900
                  sm:text-3xl
                "
              >
                Live TV
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                Manage all your live news channels.
              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={
            openCreate
          }
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-red-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-red-700
            active:scale-[0.98]
            lg:w-auto
          "
        >

          <Plus
            size={18}
          />

          Add Live Channel

        </button>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
          "
        >

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X
              size={17}
            />
          </button>

        </div>

      )}


      {success && (

        <div
          className="
            rounded-lg
            border
            border-green-200
            bg-green-50
            px-4
            py-3
            text-sm
            font-medium
            text-green-700
          "
        >

          {success}

        </div>

      )}


      {/* ==================================================
          STATS
      ================================================== */}

      {!loading && (

        <div
          className="
            grid
            grid-cols-2
            gap-4
            sm:grid-cols-3
          "
        >

          <div
            className="
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-4
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-zinc-500
              "
            >
              Total Channels
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-black
                text-zinc-900
              "
            >
              {
                channels.length
              }
            </p>

          </div>


          <div
            className="
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-4
              shadow-sm
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-zinc-500
              "
            >
              Live Now
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-black
                text-red-600
              "
            >
              {
                channels.filter(
                  (item) =>
                    item.enabled
                ).length
              }
            </p>

          </div>


          <div
            className="
              col-span-2
              rounded-xl
              border
              border-zinc-200
              bg-white
              p-4
              shadow-sm
              sm:col-span-1
            "
          >

            <p
              className="
                text-xs
                font-medium
                text-zinc-500
              "
            >
              Status
            </p>

            <p
              className="
                mt-1
                flex
                items-center
                gap-2
                text-sm
                font-bold
                text-green-600
              "
            >

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-green-500
                "
              />

              System Ready

            </p>

          </div>

        </div>

      )}


      {/* ==================================================
          CHANNELS
      ================================================== */}

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-zinc-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-zinc-100
            px-4
            py-4
            sm:px-6
          "
        >

          <h2
            className="
              font-bold
              text-zinc-900
            "
          >
            Live Channels
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-zinc-500
            "
          >
            Enabled channels can appear on your public Live TV page.
          </p>

        </div>


        {loading ? (

          <div
            className="
              flex
              min-h-[260px]
              items-center
              justify-center
              text-sm
              text-zinc-500
            "
          >
            Loading channels...
          </div>

        ) : channels.length === 0 ? (

          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              px-5
              text-center
            "
          >

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-zinc-100
                text-zinc-400
              "
            >

              <Tv
                size={30}
              />

            </div>


            <h3
              className="
                mt-4
                font-bold
                text-zinc-800
              "
            >
              No Live Channels
            </h3>


            <p
              className="
                mt-1
                max-w-sm
                text-sm
                text-zinc-500
              "
            >
              Add your first live news channel to start broadcasting.
            </p>


            <button
              type="button"
              onClick={
                openCreate
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-red-600
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                hover:bg-red-700
              "
            >

              <Plus
                size={17}
              />

              Add Channel

            </button>

          </div>

        ) : (

          <div
            className="
              divide-y
              divide-zinc-100
            "
          >

            {channels.map(
              (
                channel
              ) => {

                const preview =
                  getPreviewUrl(
                    channel.youtubeUrl
                  );


                return (

                  <div
                    key={
                      channel.id
                    }
                    className="
                      p-4
                      transition
                      hover:bg-zinc-50
                      sm:p-6
                    "
                  >

                    <div
                      className="
                        flex
                        flex-col
                        gap-5
                        xl:flex-row
                        xl:items-center
                      "
                    >

                      {/* PREVIEW */}

                      <div
                        className="
                          relative
                          aspect-video
                          w-full
                          shrink-0
                          overflow-hidden
                          rounded-xl
                          bg-black
                          xl:w-64
                        "
                      >

                        {preview ? (

                          <iframe
                            src={
                              preview
                            }
                            title={
                              channel.title
                            }
                            className="
                              absolute
                              inset-0
                              h-full
                              w-full
                            "
                            allow="
                              autoplay;
                              encrypted-media;
                              picture-in-picture
                            "
                            allowFullScreen
                          />

                        ) : (

                          <div
                            className="
                              flex
                              h-full
                              items-center
                              justify-center
                              text-xs
                              text-zinc-500
                            "
                          >
                            Invalid stream
                          </div>

                        )}

                      </div>


                      {/* INFO */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-bold

                              ${
                                channel.enabled
                                  ? "bg-red-50 text-red-600"
                                  : "bg-zinc-100 text-zinc-500"
                              }
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                rounded-full

                                ${
                                  channel.enabled
                                    ? "animate-pulse bg-red-500"
                                    : "bg-zinc-400"
                                }
                              `}
                            />

                            {channel.enabled
                              ? "LIVE"
                              : "OFFLINE"
                            }

                          </span>


                          <span
                            className="
                              rounded-full
                              bg-zinc-100
                              px-3
                              py-1
                              text-xs
                              font-medium
                              text-zinc-500
                            "
                          >
                            #{channel.order}
                          </span>

                        </div>


                        <h3
                          className="
                            mt-3
                            line-clamp-2
                            text-lg
                            font-bold
                            text-zinc-900
                            sm:text-xl
                          "
                        >
                          {channel.title}
                        </h3>


                        <p
                          className="
                            mt-2
                            break-all
                            text-xs
                            text-zinc-400
                          "
                        >
                          {channel.youtubeUrl}
                        </p>


                        {/* ACTIONS */}

                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                channel
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-zinc-200
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-zinc-700
                              transition
                              hover:bg-zinc-100
                            "
                          >

                            {channel.enabled ? (
                              <EyeOff
                                size={15}
                              />
                            ) : (
                              <Eye
                                size={15}
                              />
                            )}

                            {channel.enabled
                              ? "Disable"
                              : "Enable"
                            }

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              openEdit(
                                channel
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-zinc-200
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-zinc-700
                              transition
                              hover:bg-zinc-100
                            "
                          >

                            <Edit3
                              size={15}
                            />

                            Edit

                          </button>


                          <a
                            href={
                              channel.youtubeUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-zinc-200
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-zinc-700
                              transition
                              hover:bg-zinc-100
                            "
                          >

                            <ExternalLink
                              size={15}
                            />

                            Open

                          </a>


                          <button
                            type="button"
                            disabled={
                              deleting ===
                              channel.id
                            }
                            onClick={() =>
                              handleDelete(
                                channel
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-red-100
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-red-600
                              transition
                              hover:bg-red-50
                              disabled:opacity-50
                            "
                          >

                            <Trash2
                              size={15}
                            />

                            {deleting ===
                            channel.id
                              ? "Deleting..."
                              : "Delete"
                            }

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        )}

      </div>


      {/* ==================================================
          MODAL
      ================================================== */}

      {modalOpen && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-zinc-100
                px-5
                py-4
                sm:px-6
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-zinc-900
                  "
                >
                  {editingId
                    ? "Edit Live Channel"
                    : "Add Live Channel"
                  }
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-zinc-500
                  "
                >
                  Configure your live broadcast.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeModal
                }
                className="
                  rounded-lg
                  p-2
                  text-zinc-400
                  hover:bg-zinc-100
                  hover:text-zinc-700
                "
              >

                <X
                  size={20}
                />

              </button>

            </div>


            {/* FORM */}

            <div
              className="
                space-y-5
                p-5
                sm:p-6
              "
            >

              {/* TITLE */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-zinc-800
                  "
                >
                  Channel Name
                </label>

                <input
                  type="text"
                  value={
                    title
                  }
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="INFINIA Bharat News"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-zinc-200
                    px-3
                    py-3
                    text-sm
                    outline-none
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-500/10
                  "
                />

              </div>


              {/* URL */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-zinc-800
                  "
                >
                  Live Stream URL
                </label>

                <input
                  type="url"
                  value={
                    youtubeUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setYoutubeUrl(
                      event.target.value
                    )
                  }
                  placeholder="Paste your live stream URL"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-zinc-200
                    px-3
                    py-3
                    text-sm
                    outline-none
                    focus:border-red-500
                    focus:ring-2
                    focus:ring-red-500/10
                  "
                />

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-zinc-500
                  "
                >
                  Supports normal YouTube,
                  /live/, /embed/ and youtu.be URLs.
                </p>

              </div>


              {/* ORDER */}

              <div>

                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-zinc-800
                  "
                >
                  Display Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    order
                  }
                  onChange={(
                    event
                  ) =>
                    setOrder(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-zinc-200
                    px-3
                    py-3
                    text-sm
                    outline-none
                    focus:border-red-500
                  "
                />

              </div>


              {/* ENABLE */}

              <button
                type="button"
                onClick={() =>
                  setEnabled(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  p-4
                  text-left
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-lg

                      ${
                        enabled
                          ? "bg-red-100 text-red-600"
                          : "bg-zinc-200 text-zinc-500"
                      }
                    `}
                  >

                    {enabled ? (
                      <Eye
                        size={18}
                      />
                    ) : (
                      <EyeOff
                        size={18}
                      />
                    )}

                  </div>


                  <div>

                    <p
                      className="
                        text-sm
                        font-bold
                        text-zinc-900
                      "
                    >
                      {enabled
                        ? "Channel Enabled"
                        : "Channel Disabled"
                      }
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-zinc-500
                      "
                    >
                      {enabled
                        ? "This channel can appear on the public Live TV page."
                        : "This channel will remain hidden."
                      }
                    </p>

                  </div>

                </div>


                <div
                  className={`
                    relative
                    h-6
                    w-11
                    rounded-full
                    transition

                    ${
                      enabled
                        ? "bg-red-600"
                        : "bg-zinc-300"
                    }
                  `}
                >

                  <span
                    className={`
                      absolute
                      top-1
                      h-4
                      w-4
                      rounded-full
                      bg-white
                      shadow
                      transition

                      ${
                        enabled
                          ? "left-6"
                          : "left-1"
                      }
                    `}
                  />

                </div>

              </button>


              {/* PREVIEW */}

              {getYoutubeId(
                youtubeUrl
              ) && (

                <div>

                  <div
                    className="
                      mb-2
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-zinc-800
                      "
                    >
                      Preview
                    </p>

                    <span
                      className="
                        text-xs
                        text-green-600
                      "
                    >
                      Stream detected
                    </span>

                  </div>


                  <div
                    className="
                      relative
                      aspect-video
                      overflow-hidden
                      rounded-xl
                      bg-black
                    "
                  >

                    <iframe
                      src={
                        getPreviewUrl(
                          youtubeUrl
                        )
                      }
                      title="Live Stream Preview"
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                      "
                      allow="
                        autoplay;
                        encrypted-media;
                        picture-in-picture
                      "
                      allowFullScreen
                    />

                  </div>

                </div>

              )}


              {/* ERROR */}

              {error && (

                <div
                  className="
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>

              )}


              {/* ACTIONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  border-t
                  border-zinc-100
                  pt-5
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saving
                  }
                  className="
                    rounded-lg
                    border
                    border-zinc-200
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-zinc-700
                    hover:bg-zinc-50
                  "
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    handleSave
                  }
                  disabled={
                    saving
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    hover:bg-red-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  <Save
                    size={17}
                  />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Channel"
                      : "Add Channel"
                  }

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}