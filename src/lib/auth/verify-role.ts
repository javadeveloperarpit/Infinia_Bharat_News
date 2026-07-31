import { adminAuth, adminDb } from "@/lib/firebase/firebase-admin";


export async function verifyRole(
  token:string,
  allowedRoles:string[]
){

  const decoded =
    await adminAuth.verifyIdToken(token);


  const userDoc =
    await adminDb
      .collection("users")
      .doc(decoded.uid)
      .get();


  if(!userDoc.exists){

    throw new Error(
      "User not found"
    );

  }


  const user =
    userDoc.data();


  if(
    !allowedRoles.includes(
      user?.role
    )
  ){

    throw new Error(
      "Permission denied"
    );

  }


  return {

    uid: decoded.uid,

    ...user

  };

}