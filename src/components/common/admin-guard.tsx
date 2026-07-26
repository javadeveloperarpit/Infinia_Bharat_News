"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/auth.context";
import { useUserRole } from "@/features/auth/use-user-role";


export default function AdminGuard({
children
}:{
children:React.ReactNode
}){


const router = useRouter();


const {
user,
loading:authLoading
}=useAuth();


const {
role,
loading:roleLoading
}=useUserRole();



useEffect(()=>{



if(authLoading || roleLoading){

return;

}



if(!user){

router.replace("/login");

return;

}



if(
role &&
role !== "admin" &&
role !== "editor"
){

router.replace("/");

return;

}


},[
user,
role,
authLoading,
roleLoading
]);




if(
authLoading ||
roleLoading
){

return (

<div className="p-10">

Checking permissions...

</div>

);

}



if(!user){

return null;

}



if(
role !== "admin" &&
role !== "editor"
){

return null;

}



return children;


}