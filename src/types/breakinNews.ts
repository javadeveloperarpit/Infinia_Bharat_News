export type BreakingPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";


export interface BreakingNews {


  id:string;


  title:string;


  slug:string;


  description:string;


  priority:BreakingPriority;


  active:boolean;


  expiryTime:any;


  createdBy:string;


  createdAt:any;

}