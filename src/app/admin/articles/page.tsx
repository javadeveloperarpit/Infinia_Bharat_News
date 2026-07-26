"use client";

import {
  useEffect,
  useState
} from "react";


import Link from "next/link";


import {
  getArticles,
  deleteArticle
} from "@/services/article.service";

import {
 getCategories
} from "@/services/category.service";



export default function ArticlesPage(){


const [articles,setArticles] = useState<any[]>([]);

const [loading,setLoading] = useState(true);

const [categoryNames,setCategoryNames] = useState<any>({});



async function loadArticles(){


try{


const data =
await getArticles();



const categories =
await getCategories();



const categoryMap:any = {};



categories.forEach(
(category:any)=>{


categoryMap[category.id] =
category.name;


}

);



setCategoryNames(categoryMap);



setArticles(data);



}
catch(error){


console.error(
"Articles Load Error:",
error
);


}
finally{


setLoading(false);


}


}





useEffect(()=>{


loadArticles();


},[]);







async function handleDelete(
id:string
){


const confirmDelete =
confirm(
"Delete this article?"
);



if(!confirmDelete)
return;



try{


await deleteArticle(id);


alert(
"Article Deleted"
);


loadArticles();


}
catch(error){


console.error(error);


alert(
"Delete failed"
);


}


}






return (

<div className="space-y-6">





<div className="
flex
justify-between
items-center
">


<h1 className="
text-3xl
font-bold
text-zinc-900
">

Articles

</h1>




<Link

href="/admin/articles/create"

className="
bg-red-600
text-white
px-5
py-3
rounded-lg
font-semibold
"

>

+ Create Article

</Link>



</div>







<div className="
bg-white
rounded-xl
border
overflow-hidden
">





{
loading ?

(

<div className="
p-6
text-zinc-500
">

Loading articles...

</div>

)

:

articles.length===0

?

(

<div className="
p-6
text-zinc-500
">

No articles found

</div>

)


:

(

<table className="
w-full
">


<thead className="
bg-zinc-100
">

<tr>

<th className="
p-4
text-left
">

Title

</th>


<th className="
p-4
text-left
">

Category

</th>


<th className="
p-4
text-left
">

Status

</th>


<th className="
p-4
text-left
">

Action

</th>


</tr>

</thead>





<tbody>


{
articles.map((article)=>(


<tr

key={article.id}

className="
border-t
"

>


<td className="
p-4
font-medium
">

{article.title}

</td>




<td className="
p-4
">

{categoryNames[article.categoryId] || "N/A"}

</td>





<td className="
p-4
">

<span className="
px-3
py-1
rounded-full
bg-zinc-200
text-sm
">

{article.status}

</span>


</td>





<td className="
p-4
space-x-3
">


<Link

href={`/admin/articles/${article.id}/edit`}

className="
text-blue-600
font-semibold
"

>

Edit

</Link>



<button

onClick={()=>handleDelete(article.id)}

className="
text-red-600
font-semibold
"

>

Delete

</button>


</td>



</tr>



))

}



</tbody>




</table>

)

}





</div>





</div>

);


}