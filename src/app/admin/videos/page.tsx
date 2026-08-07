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
import { getYoutubeThumbnail } from "@/utils/youtube";
import Image from "next/image";



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

<th className="p-4 text-left">
Thumbnail
</th>

<th className="text-left">
Title
</th>

<th className="text-left">
YouTube
</th>

<th className="text-left">
Status
</th>

<th className="text-left">
Action
</th>

</tr>

</thead>


<tbody>

{videos.map((video) => (

<tr
key={video.id}
className="border-t hover:bg-zinc-50"
>

<td className="p-3">

<div
className="
relative
w-40
h-24
rounded-lg
overflow-hidden
border
"
>

<Image
src={getYoutubeThumbnail(video.youtubeUrl)}
alt={video.title}
fill
className="object-cover"
/>

</div>

</td>

<td className="font-medium max-w-sm">

{video.title}

</td>

<td>

<a

href={video.youtubeUrl}

target="_blank"

className="
text-blue-600
underline
"

>

Open Video

</a>

</td>

<td>

<span
className={`
px-3
py-1
rounded-full
text-xs
font-semibold
${
video.status === "published"
? "bg-green-100 text-green-700"
: "bg-yellow-100 text-yellow-700"
}
`}
>

{video.status}

</span>

</td>

<td>

<button

onClick={async()=>{

await deleteVideo(video.id);

load();

}}

className="
text-red-600
font-semibold
hover:underline
"

>

Delete

</button>

</td>

</tr>

))}

</tbody>

</table>


</div>

)

}