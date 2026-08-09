import Link from "next/link";

import {
searchArticles,
searchVideos
} from "@/services/public/search.public.service";



export default async function SearchPage({

searchParams,

}:{

searchParams:Promise<{
q?:string
}>

}){


const {
q
}=await searchParams;



const keyword =
q || "";



const articles =
await searchArticles(keyword);



const videos =
await searchVideos(keyword);





return (

<div
className="
max-w-7xl
mx-auto
px-4
py-10
"
>


{/* HEADER */}

<div
className="
mb-10
"
>


<h1
className="
text-3xl
md:text-5xl
font-black
text-zinc-900
"
>

Search Results

</h1>


<p
className="
mt-3
text-zinc-500
"
>

Showing results for

<span
className="
font-bold
text-red-600
mx-2
"
>

"{keyword}"

</span>

</p>


</div>





{/* ARTICLES */}


{
articles.length > 0 && (

<section>


<div
className="
flex
items-center
justify-between
mb-6
"
>


<h2
className="
text-2xl
font-black
"
>

📰 News

</h2>


<span
className="
text-sm
text-zinc-500
"
>

{articles.length} Results

</span>


</div>




<div
className="
grid
grid-cols-1
md:grid-cols-2
gap-6
"
>


{
articles.map((article)=>(


<Link

key={article.id}

href={`/news/${article.slug}`}

className="
group
flex
gap-4
rounded-2xl
border
bg-white
p-4
hover:shadow-xl
transition
"

>


<img

src={
article.thumbnail ||
"/placeholder-news.jpg"
}

alt={article.title}

className="
w-36
h-28
rounded-xl
object-cover
shrink-0
group-hover:scale-105
transition
"

/>



<div
className="
flex
flex-col
"
>


<h3
className="
font-black
line-clamp-2
group-hover:text-red-600
transition
"
>

{article.title}

</h3>



<p
className="
text-sm
text-zinc-500
mt-2
line-clamp-2
"
>

{article.shortDescription}

</p>



</div>


</Link>


))

}



</div>


</section>

)

}






{/* VIDEOS */}



{
videos.length > 0 && (

<section
className="
mt-14
"
>


<div
className="
flex
items-center
justify-between
mb-6
"
>


<h2
className="
text-2xl
font-black
"
>

▶ Videos

</h2>



<span
className="
text-sm
text-zinc-500
"
>

{videos.length} Results

</span>


</div>





<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-3
gap-6
"
>


{

videos.map((video)=>(


<Link

key={video.id}

href={`/video/${video.id}`}

className="
group
"
>


<div
className="
rounded-2xl
overflow-hidden
border
bg-white
hover:shadow-xl
transition
"
>


<div
className="
relative
aspect-video
overflow-hidden
"
>


<img

src={
video.thumbnail ||
"/placeholder-video.jpg"
}

alt={video.title}

className="
w-full
h-full
object-cover
group-hover:scale-110
transition
duration-500
"

/>


<div
className="
absolute
bottom-3
left-3
bg-red-600
text-white
text-xs
px-3
py-1
rounded-full
font-bold
"
>

VIDEO

</div>


</div>





<div
className="
p-4
"
>


<h3
className="
font-black
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
mt-3
"
>

INFINIA BHARAT NEWS

</p>


</div>


</div>


</Link>


))


}


</div>


</section>

)

}







{

!articles.length &&
!videos.length &&

(

<div
className="
py-24
text-center
"
>

<h2
className="
text-2xl
font-black
"
>

No Results Found

</h2>


<p
className="
text-zinc-500
mt-2
"
>

Try searching another keyword

</p>


</div>

)

}



</div>

);

}