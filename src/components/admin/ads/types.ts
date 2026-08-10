export type AdType =
  | "image"
  | "video"
  | "html"
  | "text"
  | "cube";

export type AdPosition =
  | "top"
  | "header"
  | "below-navbar"
  | "between-articles"
  | "sidebar"
  | "article-top"
  | "article-middle"
  | "article-bottom"
  | "footer"
  | "popup"
  | "shorts";

export type AdFrequency =
  | "always"
  | "once"
  | "daily"
  | "session";

export type AdVideoType =
  | "youtube"
  | "mp4";

export type AdCubeFace =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom";

export interface AdCubeFaceData {
  imageUrl: string;
  targetUrl: string;
}

export interface AdsCubeFaces {
  front: AdCubeFaceData;
  back: AdCubeFaceData;
  left: AdCubeFaceData;
  right: AdCubeFaceData;
  top: AdCubeFaceData;
  bottom: AdCubeFaceData;
}

export interface AdsData {
  id: string;

  name: string;

  type: AdType;

  position: AdPosition;

  active: boolean;

  priority: number;

  frequency: AdFrequency;

  startDate?: string | null;

  endDate?: string | null;

  imageUrl?: string;

  mobileImageUrl?: string;

  videoUrl?: string;

  videoType?: AdVideoType;

  htmlCode?: string;

  text?: string;

  targetUrl?: string;

  openInNewTab?: boolean;

  /**
   * Currently selected cube face.
   */
  cubeFace?: AdCubeFace;

  /**
   * Complete six-face cube configuration.
   */
  cubeFaces?: AdsCubeFaces;

  impressions: number;

  clicks: number;

  createdAt?: string | null;

  updatedAt?: string | null;
}

export type CreateAdData = Omit<
  AdsData,
  | "id"
  | "impressions"
  | "clicks"
  | "createdAt"
  | "updatedAt"
>;

export type UpdateAdData =
  Partial<CreateAdData>;