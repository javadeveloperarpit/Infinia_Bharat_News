"use client";

interface Props {
  article:any;
}


export default function ArticleContent({
  article
}:Props){

return (

<article

className="
article-content
prose
prose-lg
max-w-none
"

dangerouslySetInnerHTML={{
__html: article.content
}}

/>

);

}