import {
  getPublishedArticlesByCategory
} from "./article.public.service";


import {
  getPublishedVideosByCategory
} from "./video.public.service";



export interface CategoryContent {


id:string;

title:string;

thumbnail:string;

type:"article"|"video";

categoryId:string;

shortDescription?:string;

youtubeUrl?:string;

createdAt?:any;


}





export async function getCategoryContent(

categoryId:string

):Promise<CategoryContent[]> {



const [

articles,

videos

] = await Promise.all([


getPublishedArticlesByCategory(
categoryId
),


getPublishedVideosByCategory(
categoryId
)


]);





const articleData:CategoryContent[] =

articles.map(item=>({


id:item.id,

title:item.title,

thumbnail:item.thumbnail,

type:"article",

categoryId:item.categoryId,

shortDescription:item.shortDescription,

createdAt:item.createdAt


}));






const videoData:CategoryContent[] =

videos.map(item=>({


id:item.id,

title:item.title,

thumbnail:item.thumbnail,

type:"video",

categoryId:item.categoryId,

youtubeUrl:item.youtubeUrl,

createdAt:item.createdAt


}));






return [

...articleData,

...videoData

]

.sort(

(a,b)=>{


const dateA =
a.createdAt?.seconds || 0;


const dateB =
b.createdAt?.seconds || 0;



return dateB-dateA;


}

)

.slice(0,18);



}