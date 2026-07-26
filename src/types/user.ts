export type UserRole =
  | "admin"
  | "editor"
  | "author"
  | "subscriber"
  | "user";


export interface User {

  id:string;

  uid:string;

  name:string;

  email:string;

  role:UserRole;

  status:
  | "active"
  | "blocked";


  photoURL?:string;


  createdAt:any;

  updatedAt:any;

}