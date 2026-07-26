"use client";


import {
useEffect,
useState
} from "react";


import {
getBreakingNews
} from "@/services/breaking.service";



export default function BreakingStrip(){


const [news,setNews]=useState<any[]>([]);



useEffect(()=>{


async function load(){

const data =
await getBreakingNews();

setNews(
data.filter(
(item:any)=>item.active
)
);


}


load();


},[]);





return (

<div className="
bg-red-600
text-white
flex
items-center
overflow-hidden
">


<div className="
bg-black
px-5
py-2
font-bold
shrink-0
">

BREAKING NEWS

</div>




<div className="
px-5
py-2
animate-pulse
">


{

news.length

?

news.map(
(item)=>(

<span
key={item.id}
className="mr-10"
>

{item.text}

</span>


))

:

<span>

Latest news updates coming soon

</span>

}



</div>



</div>

);


}