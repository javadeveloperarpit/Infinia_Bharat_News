"use client";

import {
  useEffect,
  useState
} from "react";

import {
  useParams,
  useRouter
} from "next/navigation";


import {
  getArticles,
  updateArticle
} from "@/services/article.service";


import {
  getCategories
} from "@/services/category.service";



export default function EditArticlePage(){


const params = useParams();

const router = useRouter();


const id =
params.id as string;



const [loading,setLoading] =
useState(true);


const [saving,setSaving] =
useState(false);



const [categories,setCategories] =
useState<any[]>([]);



const [form,setForm] = useState<any>({});


useEffect(()=>{

loadData();

},[]);





async function loadData(){


try{


const articles =
await getArticles();



const article =
articles.find(
(item:any)=>item.id===id
);



const cats =
await getCategories();



setCategories(cats);



if(article){

setForm(article);

}


}
catch(error){

console.error(error);

}
finally{

setLoading(false);

}


}






function handleChange(e:any){


const {
name,
value,
type,
checked
}=e.target;



setForm({

...form,

[name]:

type==="checkbox"
?
checked
:
name==="priority"
?
Number(value)
:
value

});


}






async function handleUpdate(){


try{


setSaving(true);



await updateArticle(

id,

form

);



alert(
"Article Updated"
);



router.push(
"/admin/articles"
);



}
catch(error){


console.error(error);

alert(
"Update Failed"
);


}
finally{

setSaving(false);

}


}






if(loading){

return (

<div className="p-6">

Loading...

</div>

)

}






return (

<div className="space-y-6">


<h1 className="text-3xl font-bold text-zinc-900">

Edit Article

</h1>




<div className="
bg-white
border
rounded-xl
p-6
space-y-5
">



<input

name="title"

value={form.title || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>





<select

name="categoryId"

value={form.categoryId || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

>


<option value="">

Select Category

</option>


{
categories.map((cat)=>(

<option

key={cat.id}

value={cat.id}

>

{cat.name}

</option>

))

}


</select>







<input

name="thumbnail"

value={form.thumbnail || ""}

onChange={handleChange}

placeholder="Thumbnail URL"

className="
w-full
border
p-3
rounded-lg
"

/>








<textarea

name="shortDescription"

value={form.shortDescription || ""}

onChange={handleChange}

rows={3}

className="
w-full
border
p-3
rounded-lg
"

/>







<textarea

name="content"

value={form.content || ""}

onChange={handleChange}

rows={8}

className="
w-full
border
p-3
rounded-lg
"

/>







<div className="flex gap-6">


<label>

<input

type="checkbox"

name="featured"

checked={form.featured || false}

onChange={handleChange}

/>

 Featured

</label>




<label>

<input

type="checkbox"

name="breaking"

checked={form.breaking || false}

onChange={handleChange}

/>

 Breaking

</label>


</div>







<input

type="number"

name="priority"

value={form.priority || 0}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>







<input

name="seoTitle"

value={form.seoTitle || ""}

onChange={handleChange}

placeholder="SEO Title"

className="
w-full
border
p-3
rounded-lg
"

/>







<textarea

name="seoDescription"

value={form.seoDescription || ""}

onChange={handleChange}

rows={3}

className="
w-full
border
p-3
rounded-lg
"

/>







<select

name="status"

value={form.status || "draft"}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

>


<option value="draft">

Draft

</option>


<option value="published">

Published

</option>


</select>








<button

onClick={handleUpdate}

disabled={saving}

className="
bg-red-600
text-white
px-6
py-3
rounded-lg
font-semibold
"

>

{
saving
?
"Updating..."
:
"Update Article"
}

</button>



</div>


</div>

);


}