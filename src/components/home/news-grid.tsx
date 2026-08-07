import NewsCard from "./news-card";
import VideoCard from "./video-card";


export default function NewsGrid({
  articles,
}:{
  articles:any[];
}){


if(!articles?.length) return null;


return (

<section className="mb-12">


<div className="flex items-center gap-3 mb-6">


<div
className="
w-1.5
h-9
bg-red-600
rounded-full
"
/>


<div>

<h2
className="
text-2xl
md:text-3xl
font-black
text-zinc-900
tracking-tight
"
>
Latest News
</h2>


<p
className="
text-sm
text-zinc-500
font-medium
"
>
देश और दुनिया की ताज़ा खबरें
</p>


</div>


</div>



<div
className="
h-[3px]
bg-red-600
w-full
mb-6
"
/>




<div
className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-3
gap-6
"
>


{
articles.map((item)=>(


<div
key={item.id}
className="
group
relative
"
>


{

item.type==="video"

?

<VideoCard

{...item}

/>


:

<NewsCard

article={item}

/>


}



</div>


))

}



</div>



</section>

);


}