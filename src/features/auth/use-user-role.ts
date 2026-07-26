"use client";

import {
  useEffect,
  useState
} from "react";


import {
  useAuth
} from "./auth.context";


import {
  getUserProfile
} from "@/repositories/user.repository";



export function useUserRole(){


  const {
    user
  } = useAuth();



  const [role,setRole] =
  useState<string | null>(null);



  const [loading,setLoading] =
  useState(true);





  useEffect(()=>{


    async function loadRole(){


      try{


        if(!user){

          setRole(null);
          setLoading(false);

          return;

        }




        const profile =
        await getUserProfile(user.uid);



        if(profile){

 setRole(profile.role);

}
else{

setRole(null);

}



      }
      catch(error){


        console.error(
          "ROLE FETCH ERROR:",
          error
        );


        setRole(null);


      }
      finally{


        setLoading(false);


      }


    }




    loadRole();



  },[user]);





  return {

    role,
    loading

  };


}