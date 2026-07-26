import { getToken } from "firebase/messaging";
import { messaging } from "./firebase";


export async function requestNotificationPermission(){

  if(typeof window === "undefined"){
    return null;
  }


  const permission =
    await Notification.requestPermission();


  if(permission !== "granted"){
    return null;
  }


  return permission;

}



export async function getFCMToken(){

  if(!messaging){
    return null;
  }


  try {

    const token =
      await getToken(
        messaging,
        {
          vapidKey:
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        }
      );


    return token;


  } catch(error){

    console.error(
      "FCM Token Error:",
      error
    );

    return null;

  }

}