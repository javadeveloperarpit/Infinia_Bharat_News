interface Props {
  youtubeUrl:string;
}


export default function VideoPlayer({
youtubeUrl
}:Props){


function getVideoId(url:string){

try{

const urlObj =
new URL(url);


return urlObj.searchParams.get("v");

}
catch{

return "";

}

}


const videoId =
getVideoId(youtubeUrl);



if(!videoId){

return null;

}



return (

<div
className="
relative
w-full
aspect-video
rounded-3xl
overflow-hidden
bg-black
shadow-2xl
border
border-zinc-200
"
>


<iframe

src={
`https://www.youtube.com/embed/${videoId}`
}

title="video"

className="
absolute
inset-0
w-full
h-full
"

allowFullScreen

allow="
autoplay;
clipboard-write;
encrypted-media;
picture-in-picture
"

/>


</div>

);

}