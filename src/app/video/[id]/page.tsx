import { notFound } from "next/navigation";


import {
  getVideoById,
  getRelatedVideos,
} from "@/services/public/video.public.service";


import VideoPlayer from "@/components/video/video-player";
import VideoInfo from "@/components/video/video-info";
import RelatedVideos from "@/components/video/related-videos";



export default async function VideoPage({

params,

}: {

params: Promise<{
id:string;
}>

}) {



const {
id
} = await params;




const video =
await getVideoById(id);




if(!video){

  notFound();

}




const related =
await getRelatedVideos(

  video.categoryId,

  video.id

);





return (

<div
className="
max-w-7xl
mx-auto
px-4
py-8
"
>


<div
className="
grid
grid-cols-12
gap-8
"
>


<main
className="
col-span-12
lg:col-span-8
"
>


<VideoPlayer

youtubeUrl={
video.youtubeUrl
}

/>


<VideoInfo

video={video}

/>


</main>




<aside
className="
hidden
lg:block
lg:col-span-4
"
>


<div
className="
sticky
top-24
"
>

<RelatedVideos

videos={related}

/>

</div>


</aside>


</div>


</div>

);

}