export type NotificationType =
  | "breaking"
  | "article"
  | "video"
  | "system";


export interface Notification {


  id:string;


  title:string;


  message:string;


  type:NotificationType;


  target:string;


  sent:boolean;


  createdBy:string;


  createdAt:any;

}