"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useState
} from "react";

import {
  Clock3,
  Eye
} from "lucide-react";


interface HeroArticle {
  id: string;
  slug?: string;
  title: string;
  thumbnail: string;
  shortDescription?: string;
  category?: string;
  views?: number;
  createdAt?: string;
}


interface HeroProps {

  featured:HeroArticle[];

}

function formatTime(createdAt?: string) {

  if (!createdAt) {
    return "—";
  }

  const createdTime =
    new Date(createdAt).getTime();

  if (isNaN(createdTime)) {
    return "—";
  }

  const difference =
    Math.max(0, Date.now() - createdTime);

  const seconds =
    Math.floor(difference / 1000);

  const minutes =
    Math.floor(seconds / 60);

  const hours =
    Math.floor(minutes / 60);

  const days =
    Math.floor(hours / 24);


  if (seconds < 60) {
    return `${seconds} sec ago`;
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Date(createdTime).toLocaleDateString(
    "hi-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

export default function HeroSection({

featured

}:HeroProps){


const hero = featured?.[0];

const sideStories = featured?.slice(1,5) || [];

const [, setTime] = useState(Date.now());

useEffect(() => {

  const timer = setInterval(() => {
    setTime(Date.now());
  }, 1000);

  return () => clearInterval(timer);

}, []);

if(!hero) return null;



return (

<section
className="
w-full
pt-1
mb-10
"
>


<div
className="
grid
grid-cols-1
lg:grid-cols-12
gap-4
"
>


{/* MAIN BANNER */}


<Link
  href={`/news/${hero.slug || hero.id}`}
  className="lg:col-span-8 group"
>


<article
className="
relative
overflow-hidden
h-[420px]
sm:h-[520px]
lg:h-[560px]
"
>


<Image

src={hero.thumbnail}

alt={hero.title}

fill

priority

sizes="(max-width:1024px)100vw,70vw"

className="
object-cover
transition
duration-700
group-hover:scale-105
"

/>




<div
className="
absolute
inset-0
bg-gradient-to-t
from-black
via-black/40
to-transparent
"
/>




<div
className="
absolute
bottom-0
p-5
sm:p-8
lg:p-10
text-white
"
>


<span
className="
bg-[#AD0000]
px-3
py-1
rounded-md
text-xs
font-bold
"
>

{hero.category || "News"}

</span>



<h1
className="
mt-4
text-2xl
sm:text-4xl
lg:text-5xl
font-black
leading-tight
line-clamp-3
"
>

{hero.title}

</h1>



<div
className="
mt-5
flex
gap-5
text-sm
text-zinc-200
"
>


<span className="flex gap-1 items-center">

<Clock3 size={15}/>

 {formatTime(hero.createdAt)}

</span>


<span className="flex gap-1 items-center">

<Eye size={15}/>

{hero.views || "12K"}

</span>


</div>


</div>



</article>


</Link>







{/* RIGHT STORIES */}


<div
className="
lg:col-span-4
flex
flex-col
gap-3
"
>


{

sideStories.map((story)=>(


<Link
  key={story.id}
  href={`/news/${story.slug || story.id}`}
  className="group"
>

<article
className="
flex
gap-3
border-b
border-zinc-200
bg-white
py-3
transition
hover:border-[#AD0000]
"
>



<div
className="
relative
w-32
h-24
shrink-0
overflow-hidden
rounded-lg
"
>


<Image
  src={story.thumbnail}
  alt={story.title}
  fill
  sizes="128px"
  className="
    object-cover
    group-hover:scale-110
    transition
  "
/>


</div>




<div
className="
flex
flex-col
justify-center
"
>


<span
className="
text-xs
font-bold
text-[#AD0000]
"
>

{story.category || "News"}

</span>



<h3
className="
mt-1
text-sm
font-bold
leading-5
line-clamp-3
"
>

{story.title}

</h3>



</div>



</article>


</Link>


))


}



</div>



</div>


</section>

);

}