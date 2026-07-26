import {
getPublishedArticles,
getFeaturedArticles
} from "@/services/public/article.public.service";


import NewsGrid from "@/components/home/news-grid";
import HeroSection from "@/components/home/hero-section";



export default async function Home(){



const articles =
await getPublishedArticles();



const featured =
await getFeaturedArticles();





return (

<main>

<HeroSection
featured={featured}
/>


<NewsGrid
articles={articles}
/>


</main>

);


}