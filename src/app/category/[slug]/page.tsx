import { getCategories } from "@/services/category.service";

import {
  getCategoryArticles,
  getCategoryVideos,
} from "@/services/public/category.public.service";

import CategoryHero from "@/components/category/category-hero";
import CategoryGrid from "@/components/category/category-grid";
import CategoryVideos from "@/components/category/category-videos";

interface Props {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lang?: "hi" | "en";
  }>;
}



const labels = {

  hi:{
    articles:"ताज़ा खबरें",
    videos:"वीडियो",
    view:"सभी देखें",

    articleSub:"इस कैटेगरी की बड़ी खबरें",
    videoSub:"लेटेस्ट वीडियो अपडेट",

    noArticle:"अभी कोई खबर उपलब्ध नहीं है",
    noVideo:"अभी कोई वीडियो उपलब्ध नहीं है",

    articleDesc:
    "हमारी न्यूज़ टीम नई खबरों पर काम कर रही है। जल्द ही अपडेट मिलेगा।",

    videoDesc:
    "इस कैटेगरी के वीडियो अपडेट जल्द उपलब्ध होंगे।"
  },


  en:{

    articles:"Latest Articles",
    videos:"Videos",
    view:"View All",

    articleSub:"Top stories from this category",
    videoSub:"Latest video updates",

    noArticle:"No Articles Available",
    noVideo:"No Videos Available",

    articleDesc:
    "Our newsroom is preparing fresh updates. Stay tuned.",

    videoDesc:
    "Videos from this category will be available soon."

  }

};



function SectionTitle({
title,
subtitle
}:{
title:string;
subtitle:string;
}){


return (

<div
className="
mb-7
flex
items-center
justify-between
"
>


<div>


<div
className="
flex
items-center
gap-3
"
>

<div
className="
h-9
w-1.5
rounded-full
bg-red-600
"
/>


<h2
className="
text-3xl
font-black
text-zinc-900
"
>

{title}

</h2>


</div>


<p
className="
mt-2
ml-5
text-sm
text-zinc-500
"
>

{subtitle}

</p>


</div>






</div>

);

}





function EmptyState({
icon,
title,
description
}:{
icon:string;
title:string;
description:string;
}){


return (

<div
className="
rounded-3xl
border
bg-white
p-10
text-center
"
>


<div
className="
text-5xl
"
>

{icon}

</div>


<h3
className="
mt-4
text-2xl
font-black
"
>

{title}

</h3>


<p
className="
mt-3
text-zinc-500
"
>

{description}

</p>


</div>

);

}





export default async function CategoryPage({
params,
searchParams
}:Props){



const {slug}=await params;


const {lang="hi"} = await searchParams;



const categories =
await getCategories();



const category =
categories.find(
(item:any)=>item.slug===slug
);



if(!category){

return null;

}



const [
articles,
videos
]=await Promise.all([

getCategoryArticles(category.id),

getCategoryVideos(category.id)

]);



const t =
labels[lang];



return (

<main
className="
container-news
py-10
space-y-12
"
>


<CategoryHero

name={category.name}

nameHi={category.nameHi}

/>



<SectionTitle

title={t.articles}

subtitle={t.articleSub}

/>



{

articles.length > 0 ?


<CategoryGrid

articles={articles}

/>


:

<EmptyState

icon="📰"

title={t.noArticle}

description={t.articleDesc}

/>


}





<SectionTitle

title={t.videos}

subtitle={t.videoSub}



/>



{

videos.length > 0 ?


<CategoryVideos

videos={videos}

/>


:

<EmptyState

icon="🎥"

title={t.noVideo}

description={t.videoDesc}

/>


}



</main>

);

}