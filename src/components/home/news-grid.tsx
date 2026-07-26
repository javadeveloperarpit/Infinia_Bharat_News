import NewsCard from "./news-card";


export default function NewsGrid({
articles
}:{
articles:any[]
}){


return (

<div className="
grid
grid-cols-1
md:grid-cols-3
gap-5
">


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