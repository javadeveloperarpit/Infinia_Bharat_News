"use client";

import NewsCard from "@/components/home/news-card";
import {useState} from "react";


export default function CategoryGrid({

articles

}:any){


const [visible,setVisible]=useState(18);


const items =
articles.slice(0,visible);



return(

<section>


<div
className="
grid
grid-cols-2
xl:grid-cols-4
gap-5
"
>


{
items.map((item:any)=>(


<NewsCard

key={item.id}

article={item}

/>


))

}


</div>



{
visible < articles.length &&


<div className="flex justify-center mt-10">


<button

onClick={()=>setVisible(prev=>prev+18)}

className="
px-8
py-3
rounded-full
bg-red-600
text-white
font-bold
hover:bg-red-700
transition
"

>

Load More

</button>


</div>


}


</section>

);

}