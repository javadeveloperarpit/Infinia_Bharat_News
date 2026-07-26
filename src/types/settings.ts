export interface SocialLinks {

  facebook?: string;

  instagram?: string;

  youtube?: string;

  twitter?: string;

}


export interface ContactInfo {

  email?: string;

  phone?: string;

}


export interface SiteSettings {


  id:string;


  siteName:string;


  shortName:string;


  logo:string;


  favicon:string;


  description:string;


  social:SocialLinks;


  contact:ContactInfo;


  maintenanceMode:boolean;


  updatedAt:any;

}