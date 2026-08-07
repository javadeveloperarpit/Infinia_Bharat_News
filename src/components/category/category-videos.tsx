"use client";


import { useState } from "react";

import VideoCard from "@/components/home/video-card";



export default function CategoryVideos({

videos

}:any){



const [visible,setVisible] = useState(6);



if(!videos || videos.length===0){

return null;

}



const videoList = videos.slice(0,visible);



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

videoList.map((item:any)=>(


<VideoCard


key={item.id}


{...item}


/>


))

}


</div>




{

visible < videos.length &&


<div className="flex justify-center mt-10">


<button

onClick={()=>setVisible(prev=>prev+6)}

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