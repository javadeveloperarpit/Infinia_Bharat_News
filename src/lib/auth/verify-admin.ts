import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";


export async function verifyAdmin(
  token:string
){

  const decoded =
    await adminAuth.verifyIdToken(
      token
    );


  const userDoc =
    await adminDb
    .collection("users")
    .doc(decoded.uid)
    .get();



  if(!userDoc.exists){

    throw new Error(
      "User profile not found"
    );

  }



  const user =
    userDoc.data();



  if(
    user?.role !== "admin"
  ){

    throw new Error(
      "Admin access required"
    );

  }


  return {

    uid:decoded.uid,

    ...user

  };


}