import Link from "next/link";
import Image from "next/image";


export default function NewsCard({
article
}:{
article:any
}){


return (

<Link

href={`/news/${article.id}`}

className="
group
bg-white
rounded-xl
overflow-hidden
border
border-zinc-200
hover:shadow-xl
transition-all
duration-300
"

>


<div
className="
relative
overflow-hidden
h-52
"
>


<Image

src={article.thumbnail}

alt={article.title}

fill

className="
object-cover
group-hover:scale-110
transition-transform
duration-500
"

/>


{/* Image Gradient */}

<div

className="
absolute
inset-0
bg-gradient-to-t
from-black/70
via-transparent
"

></div>



{
article.category &&

<span

className="
absolute
top-3
left-3
bg-red-600
text-white
text-xs
font-bold
px-3
py-1
rounded-full
"

>

{article.category}

</span>

}



</div>




<div
className="
p-4
"
>


<h2

className="
font-bold
text-lg
leading-snug
text-zinc-900
line-clamp-2
group-hover:text-red-600
transition
"

>

{article.title}

</h2>



<p

className="
text-sm
text-zinc-500
mt-3
line-clamp-2
"

>

{article.shortDescription}

</p>



<div

className="
flex
justify-between
items-center
mt-4
text-xs
text-zinc-400
"

>

<span>

{
article.createdAt
?
"Latest"
:
""
}

</span>


<span>

Read More →

</span>


</div>



</div>


</Link>

)

}