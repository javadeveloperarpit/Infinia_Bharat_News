"use client";

import {
useState
} from "react";

import VideoShareButtons from "@/components/video/video-share-buttons";


interface Props{

video:any;

}



export default function VideoInfo({

video

}:Props){


const [expanded,setExpanded] =
useState(false);



function formatDate(date?:string){

if(!date)
return "";


return new Date(date)
.toLocaleDateString(
"hi-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);

}



return (

<div
className="
mt-8
"
>


<h1
className="
text-2xl
md:text-4xl
font-black
leading-tight
text-zinc-900
"
>

{video.title}

</h1>




<div
className="
flex
items-center
gap-3
mt-4
text-sm
text-zinc-500
"
>

<span>
📅 {formatDate(video.createdAt)}
</span>

<span>
•
</span>

<span>
INFINIA BHARAT NEWS
</span>

</div>




<div className="mt-5">

<VideoShareButtons

title={video.title}

url={
`https://infiniabharatnews.vercel.app/video/${video.id}`
}

/>

</div>





{/* Description Box */}

<div
className="
mt-8
rounded-2xl
bg-zinc-50
border
p-5
"
>


<p

className={`
text-zinc-700
leading-relaxed
whitespace-pre-line
text-sm
md:text-base

${
expanded
?
""
:
"line-clamp-3"
}

`}

>

{video.description}

</p>




{video.description?.length > 150 && (

<button

onClick={()=>setExpanded(!expanded)}

className="
mt-3
font-bold
text-black
text-sm
"

>

{
expanded
?
"Show less"
:
"Show more"
}

</button>

)}



</div>


</div>

);

}