import {
  getPublishedVideos
} from "@/services/public/video.public.service";

import VideoCard from "@/components/video/video-card";


export default async function VideosPage(){


const videos =
await getPublishedVideos();



return (

<div className="
max-w-7xl
mx-auto
px-4
py-10
">


<h1 className="
text-4xl
font-black
mb-8
">

Latest Videos

</h1>



<div className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
gap-8
">


{
videos.map((video)=>(

<VideoCard

key={video.id}

video={video}

/>

))
}


</div>


</div>

);


}