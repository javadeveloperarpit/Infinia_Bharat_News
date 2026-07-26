import {
 getDocument,
 updateDocument
} from "@/lib/firebase/firestore";


import { SiteSettings } from "@/types/settings";


const COLLECTION="settings";

const SETTINGS_ID="website";



export async function getSettings(){

 return await getDocument(
  COLLECTION,
  SETTINGS_ID
 );

}



export async function updateSettings(
 data:Partial<SiteSettings>
){

 return await updateDocument(
  COLLECTION,
  SETTINGS_ID,
  data
 );

}