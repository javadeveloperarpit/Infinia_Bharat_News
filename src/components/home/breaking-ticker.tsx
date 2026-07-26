"use client";


import {
useEffect,
useState
} from "react";


import {
getBreakingNews
} from "@/services/breaking.service";



export default function BreakingTicker(){


const [news,setNews] = useState<any[]>([]);



useEffect(()=>{


async function loadNews(){


try{


const data =
await getBreakingNews();


setNews(
data.filter(
(item:any)=>item.active
)
);


}
catch(error){

console.error(
"Breaking News Error",
error
);

}


}


loadNews();


},[]);




const text = news.length

?

news.map(
(item)=>item.text
).join("     •     ")

:

"Latest breaking news updates coming soon";





return (

<div className="
bg-black
text-white
border-y
border-zinc-800
overflow-hidden
">


<div className="
container-news
flex
items-center
h-12
">


{/* LABEL */}

<div className="
bg-red-600
h-full
px-5
flex
items-center
font-bold
text-sm
shrink-0
relative
">


<span className="
animate-pulse
mr-2
">

●

</span>


BREAKING NEWS


</div>





{/* TICKER */}

<div className="
overflow-hidden
flex-1
">


<div className="
whitespace-nowrap
animate-[ticker_20s_linear_infinite]
font-medium
text-sm
pl-8
">


{text}


</div>


</div>



</div>



</div>

);


}