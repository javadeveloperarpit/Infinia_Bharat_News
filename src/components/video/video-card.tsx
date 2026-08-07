import Image from "next/image";
import Link from "next/link";


interface Props {

  video:any;

}



export default function VideoCard({
  video
}:Props){



function formatDate(date?:string){

  if(!date) return "";

  return new Date(date)
  .toLocaleDateString(
    "hi-IN",
    {
      day:"numeric",
      month:"short",
      year:"numeric"
    }
  );

}



return (

<Link

href={`/video/${video.id}`}

className="
group
block
"


>


<div className="
rounded-2xl
overflow-hidden
bg-white
border
shadow-sm
hover:shadow-xl
transition
">



{/* THUMBNAIL */}

<div className="
relative
aspect-video
bg-zinc-100
overflow-hidden
">


<Image

src={
video.thumbnail ||
"/placeholder.jpg"
}

alt={
video.title
}

fill

className="
object-cover
group-hover:scale-105
transition
duration-300
"

sizes="
( max-width:768px ) 100vw,
33vw
"

/>



{/* PLAY BUTTON */}

<div className="
absolute
inset-0
flex
items-center
justify-center
">


<div className="
w-14
h-14
rounded-full
bg-black/70
text-white
flex
items-center
justify-center
text-xl
opacity-0
group-hover:opacity-100
transition
">


▶

</div>


</div>


</div>





{/* CONTENT */}

<div className="
p-4
">


<h2 className="
font-black
text-lg
leading-snug
line-clamp-2
group-hover:text-red-600
transition
">

{video.title}

</h2>




<div className="
mt-3
text-sm
text-zinc-500
flex
flex-col
gap-1
">


<span>

✍️
{" "}
{
video.author?.name ||
"INFINIA BHARAT NEWS"
}

</span>



<span>

📅
{" "}
{
formatDate(video.createdAt)
}

</span>


</div>


</div>


</div>


</Link>

);

}