"use client";


import {
useEffect,
useState
} from "react";


import Link from "next/link";


import {
getVideos,
deleteVideo
} from "@/services/video.service";



export default function Videos(){


const [videos,setVideos]=useState<any[]>([]);



async function load(){

setVideos(
await getVideos()
);

}



useEffect(()=>{

load();

},[]);





return (

<div>


<div className="flex justify-between">

<h1 className="text-3xl font-bold">

Videos

</h1>


<Link

href="/admin/videos/create"

className="bg-red-600 text-white px-5 py-3 rounded"

>

+ Add Video

</Link>


</div>





<table className="w-full mt-6 bg-white">


<thead>

<tr>

<th className="p-4">
Title
</th>

<th>
Youtube
</th>

<th>
Action
</th>

</tr>

</thead>



<tbody>


{
videos.map(video=>(


<tr key={video.id}
className="border-t"
>


<td className="p-4">

{video.title}

</td>



<td>

{video.youtubeId}

</td>



<td>

<button

onClick={async()=>{

await deleteVideo(video.id);

load();

}}

className="text-red-600"

>

Delete

</button>


</td>


</tr>


))

}



</tbody>


</table>


</div>

)

}