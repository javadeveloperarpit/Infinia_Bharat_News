import {
  createDocument,
  getDocument,
  updateDocument,
} from "@/lib/firebase/firestore";

import { User } from "@/types/user";


const COLLECTION = "users";



export async function createUserProfile(
 user:Omit<User,"id">
){

 return await createDocument(
  COLLECTION,
  user
 );

}



export async function getUserProfile(
 id:string
){

 return await getDocument<User>(
  COLLECTION,
  id
 );

}



export async function updateUserProfile(
 id:string,
 data:Partial<User>
){

 return await updateDocument(
  COLLECTION,
  id,
  data
 );

}