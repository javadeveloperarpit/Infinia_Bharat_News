"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createAd,
  deleteAd,
  getAds,
  toggleAdStatus,
  updateAd,
} from "@/services/ads.service";

import type {
  AdsData,
  CreateAdData,
  UpdateAdData,
} from "./types";

import type {
  AdFilterState,
} from "./AdFilters";

// ======================================================
// RETURN TYPE
// ======================================================

export interface UseAdsReturn {
  ads: AdsData[];

  filteredAds: AdsData[];

  loading: boolean;

  saving: boolean;

  deletingId: string | null;

  error: string | null;

  filters: AdFilterState;

  setFilters: (
    filters: AdFilterState
  ) => void;

  refresh: () => Promise<void>;

  create: (
    data: CreateAdData
  ) => Promise<string>;

  update: (
    id: string,
    data: UpdateAdData
  ) => Promise<void>;

  remove: (
    id: string
  ) => Promise<void>;

  toggle: (
    id: string,
    active: boolean
  ) => Promise<void>;

  clearError: () => void;
}

// ======================================================
// DEFAULT FILTERS
// ======================================================

const DEFAULT_FILTERS: AdFilterState = {
  search: "",
  type: "all",
  position: "all",
  status: "all",
  sort: "priority-desc",
};

// ======================================================
// ERROR HELPER
// ======================================================

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

// ======================================================
// HOOK
// ======================================================

export function useAds(): UseAdsReturn {
  // ====================================================
  // STATE
  // ====================================================

  const [ads, setAds] =
    useState<AdsData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [filters, setFilters] =
    useState<AdFilterState>(
      DEFAULT_FILTERS
    );

  // ====================================================
  // FETCH
  // ====================================================

  const refresh =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getAds();

        setAds(result);
      } catch (error) {
        console.error(
          "Failed to load advertisements:",
          error
        );

        setError(
          getErrorMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ====================================================
  // CREATE
  // ====================================================

  const create = useCallback(
    async (
      data: CreateAdData
    ): Promise<string> => {
      try {
        setSaving(true);
        setError(null);

        const id =
          await createAd(data);

        await refresh();

        return id;
      } catch (error) {
        console.error(
          "Failed to create advertisement:",
          error
        );

        const message =
          getErrorMessage(error);

        setError(message);

        throw error;
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  // ====================================================
  // UPDATE
  // ====================================================

  const update = useCallback(
    async (
      id: string,
      data: UpdateAdData
    ): Promise<void> => {
      try {
        setSaving(true);
        setError(null);

        await updateAd(
          id,
          data
        );

        await refresh();
      } catch (error) {
        console.error(
          "Failed to update advertisement:",
          error
        );

        const message =
          getErrorMessage(error);

        setError(message);

        throw error;
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  // ====================================================
  // DELETE
  // ====================================================

  const remove = useCallback(
    async (
      id: string
    ): Promise<void> => {
      if (!id) {
        return;
      }

      try {
        setDeletingId(id);
        setError(null);

        await deleteAd(id);

        setAds((previous) =>
          previous.filter(
            (ad) =>
              ad.id !== id
          )
        );
      } catch (error) {
        console.error(
          "Failed to delete advertisement:",
          error
        );

        const message =
          getErrorMessage(error);

        setError(message);

        throw error;
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  // ====================================================
  // TOGGLE
  // ====================================================

  const toggle = useCallback(
    async (
      id: string,
      active: boolean
    ): Promise<void> => {
      try {
        setError(null);

        // Optimistic UI

        setAds((previous) =>
          previous.map((ad) =>
            ad.id === id
              ? {
                  ...ad,
                  active,
                }
              : ad
          )
        );

        await toggleAdStatus(
          id,
          active
        );
      } catch (error) {
        console.error(
          "Failed to toggle advertisement:",
          error
        );

        // Rollback

        setAds((previous) =>
          previous.map((ad) =>
            ad.id === id
              ? {
                  ...ad,
                  active: !active,
                }
              : ad
          )
        );

        const message =
          getErrorMessage(error);

        setError(message);

        throw error;
      }
    },
    []
  );

  // ====================================================
  // FILTER + SORT
  // ====================================================

  const filteredAds =
    useMemo(() => {
      let result = [
        ...ads,
      ];

      // ----------------------------------------------
      // SEARCH
      // ----------------------------------------------

      const search =
        filters.search
          .trim()
          .toLowerCase();

      if (search) {
        result = result.filter(
          (ad) => {
            const name =
              ad.name
                ?.toLowerCase() ??
              "";

            const type =
              ad.type
                ?.toLowerCase() ??
              "";

            const position =
              ad.position
                ?.toLowerCase() ??
              "";

            const targetUrl =
              ad.targetUrl
                ?.toLowerCase() ??
              "";

            return (
              name.includes(
                search
              ) ||
              type.includes(
                search
              ) ||
              position.includes(
                search
              ) ||
              targetUrl.includes(
                search
              )
            );
          }
        );
      }

      // ----------------------------------------------
      // TYPE
      // ----------------------------------------------

      if (
        filters.type !==
        "all"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.type ===
              filters.type
          );
      }

      // ----------------------------------------------
      // POSITION
      // ----------------------------------------------

      if (
        filters.position !==
        "all"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.position ===
              filters.position
          );
      }

      // ----------------------------------------------
      // STATUS
      // ----------------------------------------------

      if (
        filters.status ===
        "active"
      ) {
        result =
          result.filter(
            (ad) =>
              ad.active
          );
      }

      if (
        filters.status ===
        "inactive"
      ) {
        result =
          result.filter(
            (ad) =>
              !ad.active
          );
      }

      // ----------------------------------------------
      // SORT
      // ----------------------------------------------

      result.sort(
        (a, b) => {
          switch (
            filters.sort
          ) {
            case "priority-desc":
              return (
                (b.priority ??
                  0) -
                (a.priority ??
                  0)
              );

            case "priority-asc":
              return (
                (a.priority ??
                  0) -
                (b.priority ??
                  0)
              );

            case "name-asc":
              return (
                a.name.localeCompare(
                  b.name
                )
              );

            case "name-desc":
              return (
                b.name.localeCompare(
                  a.name
                )
              );

            case "newest":
              return (
                getTime(
                  b.createdAt
                ) -
                getTime(
                  a.createdAt
                )
              );

            case "oldest":
              return (
                getTime(
                  a.createdAt
                ) -
                getTime(
                  b.createdAt
                )
              );

            default:
              return 0;
          }
        }
      );

      return result;
    }, [ads, filters]);

  // ====================================================
  // CLEAR ERROR
  // ====================================================

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  // ====================================================
  // RETURN
  // ====================================================

  return {
    ads,

    filteredAds,

    loading,

    saving,

    deletingId,

    error,

    filters,

    setFilters,

    refresh,

    create,

    update,

    remove,

    toggle,

    clearError,
  };
}

// ======================================================
// DATE HELPER
// ======================================================

function getTime(
  value:
    | string
    | null
    | undefined
): number {
  if (!value) {
    return 0;
  }

  const time =
    new Date(value).getTime();

  return Number.isNaN(time)
    ? 0
    : time;
}