export type ArticleStatus =
  | "draft"
  | "review"
  | "published";


export interface ArticleSEO {

  title:string;

  description:string;

  keywords:string[];

}


export interface Article {


  id:string;


  title:string;


  slug:string;


  excerpt:string;


  content:string;


  featuredImage:string;


  category:string;


  tags:string[];


  authorId:string;


  authorName:string;


  status:ArticleStatus;


  featured:boolean;


  views:number;


  seo:ArticleSEO;


  createdAt:any;


  updatedAt:any;


  publishedAt?:any;

}