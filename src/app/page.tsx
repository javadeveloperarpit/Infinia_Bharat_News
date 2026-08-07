import {
  getPublishedArticles,
  getFeaturedArticles,
  getPublishedArticlesByCategory
} from "@/services/public/article.public.service";


import {
  getPublishedVideos,
  getPublishedVideosByCategory
} from "@/services/public/video.public.service";


import {
  getCategories
} from "@/services/category.service";


import BreakingStrip 
from "@/components/home/breaking-strip";


import HeroSection 
from "@/components/home/hero-section";


import NewsGrid 
from "@/components/home/news-grid";


import CategorySection 
from "@/components/home/category-section";





export default async function Home(){



const [

  articles,

  featured,

  categories,

  videos


]=await Promise.all([


  getPublishedArticles(),


  getFeaturedArticles(),


  getCategories(),


  getPublishedVideos()


]);





const latestItems = [


  ...articles.map(article=>({

    ...article,

    type:"article"

  })),



  ...videos.map(video=>({

    ...video,

    type:"video"

  }))



]
.sort((a,b)=>{


  const dateA = new Date(
    a.createdAt || 0
  ).getTime();



  const dateB = new Date(
    b.createdAt || 0
  ).getTime();



  return dateB - dateA;


})
.slice(0,3);







const categoryData =

await Promise.all(


categories.map(async(category)=>{



const categoryId = category.id;



const [

  articles,

  videos

]=await Promise.all([



  getPublishedArticlesByCategory(

    categoryId!

  ),




  getPublishedVideosByCategory(

    categoryId!

  )



]);



return {


  ...category,


  articles,


  videos


};



})


);









return (


<main

className="

min-h-screen

bg-white

"

>




{/* Breaking */}


<BreakingStrip/>








{/* Hero */}



<section

className="

container-news

mt-5

"

>


<HeroSection


featured={featured}


/>


</section>









{/* Latest */}



<section

className="

container-news

mt-12

"

>


<NewsGrid


articles={latestItems}


/>


</section>









{/* Categories */}



<section

className="
container-news
mt-16
space-y-20
"

>


{


categoryData.map(category=>(



<CategorySection



key={category.id}



name={category.name}



nameHi={category.nameHi}



slug={category.slug}



articles={category.articles}



videos={category.videos}


/>



))


}



</section>







</main>


);


}