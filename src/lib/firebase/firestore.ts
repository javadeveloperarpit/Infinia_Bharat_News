import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";

import { db } from "./firebase";


// Create Document
export async function createDocument(
  collectionName: string,
  data: DocumentData
) {

  const ref = await addDoc(
    collection(db, collectionName),
    data
  );

  return ref.id;

}


// Get Single Document
export async function getDocument<T>(
  collectionName:string,
  id:string
): Promise<T | null>{

  const snapshot =
    await getDoc(
      doc(
        db,
        collectionName,
        id
      )
    );


  if(!snapshot.exists()){
    return null;
  }


  return {
    id:snapshot.id,
    ...snapshot.data()
  } as T;

}

export async function setDocument(
  collectionName:string,
  id:string,
  data:DocumentData
){

  await setDoc(
    doc(
      db,
      collectionName,
      id
    ),
    data
  );

}

// Get Collection
export async function getCollection(
  collectionName:string,
  constraints:QueryConstraint[]=[]
){

 const q =
 query(
   collection(
    db,
    collectionName
   ),
   ...constraints
 );


 const snapshot =
   await getDocs(q);


 return snapshot.docs.map(
   item=>({
     id:item.id,
     ...item.data()
   })
 );

}



// Update Document
export async function updateDocument(
 collectionName:string,
 id:string,
 data:DocumentData
){

 await updateDoc(
   doc(
    db,
    collectionName,
    id
   ),
   data
 );

}



// Delete Document
export async function deleteDocument(
 collectionName:string,
 id:string
){

 await deleteDoc(
   doc(
    db,
    collectionName,
    id
   )
 );

}



// Query Helper
export function createQuery(
 field:string,
 operator:any,
 value:any
){

 return where(
   field,
   operator,
   value
 );

}



// Sorting Helper
export function createOrder(
 field:string,
 direction:"asc"|"desc"="desc"
){

 return orderBy(
   field,
   direction
 );

}



// Limit Helper
export function createLimit(
 count:number
){

 return limit(count);

}