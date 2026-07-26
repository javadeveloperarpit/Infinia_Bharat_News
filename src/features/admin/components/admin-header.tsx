"use client";


import {
 Bell
} from "lucide-react";


export default function AdminHeader(){

return (

<header

className="
h-16
border-b
bg-white
flex
items-center
justify-between
px-6
"

>


<h1
className="
font-semibold
"
>
Admin Dashboard
</h1>



<button

className="
relative
"

>

<Bell size={22}/>

</button>


</header>

);


}