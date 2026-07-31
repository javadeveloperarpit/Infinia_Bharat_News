import NewsCard from "./news-card";


export default function NewsGrid({
  articles
}:{
  articles:any[]
}){


return (

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
articles.map(article=>(

<NewsCard

key={article.id}

article={article}

/>

))
}

</div>

)

}