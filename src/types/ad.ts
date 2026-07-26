export type AdType =
  | "business"
  | "google"
  | "sponsored"
  | "internal";


export type AdPosition =
  | "homepage-banner"
  | "article-top"
  | "article-middle"
  | "sidebar"
  | "footer";


export interface Advertisement {


  id:string;


  title:string;


  image:string;


  link?:string;


  position:AdPosition;


  type:AdType;


  active:boolean;


  clicks:number;


  startDate:any;


  endDate:any;


  createdBy:string;


  createdAt:any;


  updatedAt:any;

}