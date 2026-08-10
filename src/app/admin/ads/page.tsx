"use client";

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import AdFilters, {
  DEFAULT_AD_FILTERS,
  type AdFilterState,
} from "@/components/admin/ads/AdFilters";

import AdModal from "@/components/admin/ads/AdModal";
import AdsGrid from "@/components/admin/ads/AdsGrid";
import AdsHeader from "@/components/admin/ads/AdsHeader";
import AdsStats from "@/components/admin/ads/AdsStats";
import DeleteAdModal from "@/components/admin/ads/DeleteAdModal";

import type { AdsData } from "@/components/admin/ads/types";

import { useAds } from "@/components/admin/ads/useAds";

// ======================================================
// PAGE
// ======================================================

export default function AdsPage() {
  // ====================================================
  // FILTERS
  // ====================================================

  const [filters, setFilters] =
    useState<AdFilterState>(
      DEFAULT_AD_FILTERS
    );

  // ====================================================
  // MODALS
  // ====================================================

  const [showAdModal, setShowAdModal] =
    useState(false);

  const [editingAd, setEditingAd] =
    useState<AdsData | null>(null);

  const [deletingAd, setDeletingAd] =
    useState<AdsData | null>(null);

  // ====================================================
  // ADS HOOK
  // ====================================================

  const {
  ads,
  loading,
  saving,
  deletingId,
  refresh,
  create,
  update,
  remove,
  toggle,
} = useAds();
  // ====================================================
  // FILTER + SORT
  // ====================================================

  const filteredAds = useMemo(() => {
    let result = [...ads];

    // --------------------------------------------------
    // SEARCH
    // --------------------------------------------------

    const search =
      filters.search
        .trim()
        .toLowerCase();

    if (search) {
      result = result.filter((ad) => {
        return (
          ad.name
            .toLowerCase()
            .includes(search) ||
          ad.type
            .toLowerCase()
            .includes(search) ||
          ad.position
            .toLowerCase()
            .includes(search)
        );
      });
    }

    // --------------------------------------------------
    // TYPE
    // --------------------------------------------------

    if (filters.type !== "all") {
      result = result.filter(
        (ad) =>
          ad.type === filters.type
      );
    }

    // --------------------------------------------------
    // POSITION
    // --------------------------------------------------

    if (filters.position !== "all") {
      result = result.filter(
        (ad) =>
          ad.position ===
          filters.position
      );
    }

    // --------------------------------------------------
    // STATUS
    // --------------------------------------------------

    if (filters.status === "active") {
      result = result.filter(
        (ad) => ad.active
      );
    }

    if (
      filters.status === "inactive"
    ) {
      result = result.filter(
        (ad) => !ad.active
      );
    }

    // --------------------------------------------------
    // SORT
    // --------------------------------------------------

    result.sort((a, b) => {
      switch (filters.sort) {
        case "priority-asc":
          return (
            a.priority - b.priority
          );

        case "priority-desc":
          return (
            b.priority - a.priority
          );

        case "name-asc":
          return a.name.localeCompare(
            b.name
          );

        case "name-desc":
          return b.name.localeCompare(
            a.name
          );

        case "newest":
          return (
            new Date(
              b.createdAt ?? 0
            ).getTime() -
            new Date(
              a.createdAt ?? 0
            ).getTime()
          );

        case "oldest":
          return (
            new Date(
              a.createdAt ?? 0
            ).getTime() -
            new Date(
              b.createdAt ?? 0
            ).getTime()
          );

        default:
          return (
            b.priority - a.priority
          );
      }
    });

    return result;
  }, [ads, filters]);

  // ====================================================
  // CREATE
  // ====================================================

  function handleCreate() {
    setEditingAd(null);
    setShowAdModal(true);
  }

  // ====================================================
  // EDIT
  // ====================================================

  function handleEdit(ad: AdsData) {
    setEditingAd(ad);
    setShowAdModal(true);
  }

  // ====================================================
  // DELETE
  // ====================================================

  function handleDelete(id: string) {
    const ad = ads.find(
      (item) => item.id === id
    );

    if (!ad) return;

    setDeletingAd(ad);
  }

  // ====================================================
  // CONFIRM DELETE
  // ====================================================

  async function handleConfirmDelete() {
    if (!deletingAd) return;

    try {
      await remove(deletingAd.id);

      setDeletingAd(null);
    } catch (error) {
      console.error(
        "Failed to delete advertisement:",
        error
      );
    }
  }

  // ====================================================
  // TOGGLE
  // ====================================================

  async function handleToggle(
    id: string,
    active: boolean
  ) {
    try {
      await toggle(id, active);
    } catch (error) {
      console.error(
        "Failed to toggle advertisement:",
        error
      );
    }
  }

  // ====================================================
  // SAVE
  // ====================================================

  async function handleSave(
    data: Parameters<
      typeof create
    >[0]
  ) {
    try {
      if (editingAd) {
        await update(
          editingAd.id,
          data
        );
      } else {
        await create(data);
      }

      setShowAdModal(false);
      setEditingAd(null);

      await refresh();
    } catch (error) {
      console.error(
        "Failed to save advertisement:",
        error
      );

      throw error;
    }
  }

  // ====================================================
  // REFRESH
  // ====================================================

  const handleRefresh =
    useCallback(async () => {
      try {
        await refresh();
      } catch (error) {
        console.error(
          "Failed to refresh advertisements:",
          error
        );
      }
    }, [refresh]);

  // ====================================================
  // CANCEL MODAL
  // ====================================================

  function handleCloseModal() {
    if (saving) return;

    setShowAdModal(false);
    setEditingAd(null);
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        px-3
        py-4
        text-white
        sm:px-5
        sm:py-6
        lg:px-8
        lg:py-8
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1800px]
          space-y-5
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <AdsHeader
          onCreate={handleCreate}
          onRefresh={handleRefresh}
          loading={loading}
        />

        {/* ==================================================
            STATS
        ================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-6
          "
        >
          <AdsStats ads={ads} />
        </section>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
          "
        >
          <AdFilters
            filters={filters}
            onChange={setFilters}
            totalCount={ads.length}
            filteredCount={
              filteredAds.length
            }
          />
        </section>

        {/* ==================================================
            ADS GRID
        ================================================== */}

        <section>
          <AdsGrid
            ads={filteredAds}
            loading={loading}
            deletingId={deletingId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onCreate={handleCreate}
            onRefresh={handleRefresh}
          />
        </section>
      </div>

      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      <AdModal
        open={showAdModal}
        ad={editingAd}
        loading={saving}
        onClose={handleCloseModal}
        onSubmit={handleSave}
      />

      {/* ==================================================
          DELETE MODAL
      ================================================== */}

      <DeleteAdModal
        open={Boolean(deletingAd)}
        ad={deletingAd}
        deleting={
  deletingId === deletingAd?.id
}
        onClose={() =>
          setDeletingAd(null)
        }
        onConfirm={
          handleConfirmDelete
        }
      />
    </main>
  );
}