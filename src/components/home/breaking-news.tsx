"use client";


import {
useEffect,
useState
} from "react";


import {
getBreakingNews
} from "@/services/breaking.service";



export default function BreakingNews(){



const [news,setNews] = useState<any[]>([]);



useEffect(()=>{


async function load(){


const data =
await getBreakingNews();


const activeNews = data.filter(

(item:any)=>

item.active === true &&

new Date(item.expiry) > new Date()

);


setNews(activeNews);

setNews(data);


}


load();



const timer =
setInterval(

load,

60000

);



return ()=>clearInterval(timer);



},[]);






if(news.length===0)
return null;






return (


<div

className="
w-full
bg-[#730708]
border-y
border-[#ECCA6D]/30
overflow-hidden
"


>


<div

className="
container-news
flex
items-center
h-11
"


>


{/* LABEL */}


<div

className="
bg-[#ECCA6D]
text-[#730708]
font-bold
px-5
h-full
flex
items-center
text-sm
shrink-0
"

>

BREAKING

</div>







{/* TICKER */}


<div

className="
overflow-hidden
relative
flex-1
"


>


<div

className="
whitespace-nowrap
animate-[ticker_20s_linear_infinite]
text-white
font-medium
text-sm
pl-6
"


>


{

news.map(

(item,index)=>(


<span

key={item.id}

>

{item.text}


{index !== news.length-1 &&

<span className="
mx-8
text-[#ECCA6D]
">

◆

</span>

}


</span>


)

)

}



</div>



</div>




</div>



</div>



);


}