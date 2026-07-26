export type VideoType =
  | "short"
  | "normal"
  | "live";


export type VideoStatus =
  | "draft"
  | "review"
  | "published";


export interface Video {


  id:string;


  title:string;


  slug:string;


  youtubeId:string;


  thumbnail:string;


  description:string;


  categoryId:string;


  tags:string[];


  authorId:string;


  authorName:string;


  type:VideoType;


  status:VideoStatus;


  featured:boolean;


  views:number;


  createdAt:any;


  updatedAt:any;

}