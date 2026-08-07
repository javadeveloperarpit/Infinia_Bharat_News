interface Props{

videos:any[];

}



export default function RelatedVideos({

videos

}:Props){



return (

<div>

<h2
className="
font-black
text-xl
mb-5
"
>

Related Videos

</h2>



<div
className="
space-y-5
"
>


{
videos.map((video)=>(

<a

key={video.id}

href={`/video/${video.id}`}

className="
flex
gap-3
group
"
>


<img

src={video.thumbnail}

className="
w-40
h-24
rounded-xl
object-cover
"
/>



<div>

<h3
className="
font-bold
text-sm
line-clamp-2
group-hover:text-red-600
transition
"
>

{video.title}

</h3>


<p
className="
text-xs
text-zinc-500
mt-2
"
>

INFINIA BHARAT NEWS

</p>


</div>


</a>

))

}


</div>


</div>

);

}