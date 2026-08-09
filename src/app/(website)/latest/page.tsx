import Link from "next/link";

import {
  getPublishedArticles
} from "@/services/public/article.public.service";



export default async function LatestPage(){


const articles =
await getPublishedArticles();



return (

<main

className="
min-h-screen
bg-white
py-10
"

>


<div

className="
container-news
"

>



<h1

className="
text-3xl
md:text-5xl
font-black
mb-10
"

>

Latest News

</h1>





<div

className="
grid
grid-cols-1
md:grid-cols-2
lg:grid-cols-3
gap-8
"

>


{

articles.map((article)=>(


<Link

key={article.id}

href={`/news/${article.slug}`}

className="
group
rounded-2xl
overflow-hidden
border
bg-white
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
w-full
aspect-video
object-cover
group-hover:scale-105
transition
duration-500
"

/>



<div

className="
p-5
"

>


<h2

className="
text-xl
font-black
line-clamp-2
group-hover:text-red-600
transition
"

>

{article.title}

</h2>



<p

className="
mt-3
text-zinc-500
text-sm
line-clamp-3
"

>

{article.shortDescription}

</p>




<div

className="
mt-4
text-xs
text-zinc-400
"

>


{article.createdAt
?
new Date(
article.createdAt
).toLocaleDateString(
"en-IN"
)
:
""
}



</div>


</div>


</Link>


))


}


</div>



</div>


</main>


);

}