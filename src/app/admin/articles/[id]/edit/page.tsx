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
getArticleById
} from "@/services/article.service";
import { auth } from "@/lib/firebase/firebase";

import {
getCategories
} from "@/services/category.service";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@/components/editor/NewsEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[400px] w-full animate-pulse rounded-xl border bg-zinc-100" />
    ),
  }
);

export default function EditArticlePage(){

const router = useRouter();

const params = useParams();

const id = String(params.id);


const [loading,setLoading] = useState(true);

const [saving,setSaving] = useState(false);


const [categories,setCategories] =
useState<any[]>([]);

const [keywordInput, setKeywordInput] = useState("");



const [form,setForm] = useState<any>({

title:"",

categoryId:"",

thumbnail:"",

shortDescription:"",

content:"",

seoTitle:"",

seoDescription:"",

keywords: [] as string[],

featured:false,

breaking:false,

priority:0,

status:"draft"

});



useEffect(()=>{

if(id){

loadData();

}

},[id]);




async function loadData(){

try{


const article =
await getArticleById(id);


const cats =
await getCategories();



setCategories(cats);



if(article){

setForm({

...article,
  keywords: Array.isArray(article.keywords)
    ? article.keywords
    : [],

author:
article.author ||
{
 uid:"",
 name:"INFINIA BHARAT NEWS",
 email:"",
 role:"admin"
}

});

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




function handleEditorChange(value:string){


setForm({

...form,

content:value

});


}




async function handleUpdate() {

  try {

    setSaving(true);

    const user = auth.currentUser;

    if (!user) {

      alert("Please login again");

      return;

    }

    const token =
      await user.getIdToken();


    // ======================================
    // IMPORTANT
    // createdAt ko edit/update nahi karna
    // ======================================

    const {
      createdAt,
      updatedAt,
      ...updateData
    } = form;


    const res =
      await fetch(
        `/api/admin/articles/${id}`,
        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`

          },

          body:
            JSON.stringify(updateData)

        }
      );


    const data =
      await res.json();


    if (!res.ok) {

      throw new Error(
        data.message ||
        "Failed to update article"
      );

    }


    alert(
      "Article Updated Successfully"
    );


    router.push(
      "/admin/articles"
    );


  }
  catch(error:any) {

    console.error(error);

    alert(
      error.message ||
      "Failed to update article"
    );

  }
  finally {

    setSaving(false);

  }

}




if(loading){

return (

<div className="p-10">

Loading Article...

</div>

)

}




return (

<div className="
max-w-5xl
mx-auto
p-6
space-y-5
">


<h1 className="
text-3xl
font-bold
">

Edit Article

</h1>



<input

name="title"

placeholder="Article Title"

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

placeholder="Thumbnail URL"

value={form.thumbnail || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>




<textarea

name="shortDescription"

placeholder="Short Description"

value={form.shortDescription || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
h-28
"

/>




<Editor

value={form.content || ""}

onChange={handleEditorChange}

/>




<input

name="seoTitle"

placeholder="SEO Title"

value={form.seoTitle || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
"

/>




<textarea

name="seoDescription"

placeholder="SEO Description"

value={form.seoDescription || ""}

onChange={handleChange}

className="
w-full
border
p-3
rounded-lg
h-24
"

/>


<div className="space-y-2">
  <label className="text-sm font-medium">
    Keywords
  </label>

  <div className="flex min-h-[44px] flex-wrap items-center gap-2 rounded-lg border p-2">
    {form.keywords.map((keyword: string, index: number) => (
      <span
        key={`${keyword}-${index}`}
        className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm"
      >
        {keyword}

        <button
          type="button"
          onClick={() =>
            setForm((prev: any) => ({
              ...prev,
              keywords: prev.keywords.filter(
                (_: string, i: number) => i !== index
              ),
            }))
          }
          className="ml-1 font-bold text-zinc-500 hover:text-red-600"
          aria-label={`Remove ${keyword}`}
        >
          ×
        </button>
      </span>
    ))}

    <input
      type="text"
      value={keywordInput}
      onChange={(e) => setKeywordInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();

          const newKeywords = keywordInput
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean);

          if (newKeywords.length > 0) {
            setForm((prev: any) => ({
              ...prev,
              keywords: [
                ...prev.keywords,
                ...newKeywords.filter(
                  (keyword) =>
                    !prev.keywords.some(
                      (existing: string) =>
                        existing.toLowerCase() === keyword.toLowerCase()
                    )
                ),
              ],
            }));
          }

          setKeywordInput("");
        }

        if (
          e.key === "Backspace" &&
          !keywordInput &&
          form.keywords.length > 0
        ) {
          setForm((prev: any) => ({
            ...prev,
            keywords: prev.keywords.slice(0, -1),
          }));
        }
      }}
      placeholder="Type a keyword and press Enter"
      className="min-w-[220px] flex-1 border-0 bg-transparent p-1 outline-none"
    />
  </div>

  <p className="text-xs text-zinc-500">
    Keyword type karke Enter dabayein. Comma-separated keywords bhi add kar sakte hain.
  </p>
</div>


<div className="
flex
gap-6
">


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

placeholder="Priority"

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
font-bold
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


);


}