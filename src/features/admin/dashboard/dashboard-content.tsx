"use client";

import {
  useEffect,
  useState
} from "react";


import StatCard 
from "../components/stat-card";


import {
  getDashboardStats
} from "@/services/dashboard.service";



export default function DashboardContent(){


const [stats,setStats] = useState({

articles:0,

videos:0,

users:0,

breakingNews:0,

liveTv:0,

ads:0

});


useEffect(()=>{


async function loadStats(){


try{


const data =
await getDashboardStats();


setStats(data);


}
catch(error){

console.error(
"Dashboard Stats Error:",
error
);

}


}



loadStats();


},[]);




return (

<div
className="
space-y-6
"
>


<h1
className="
text-3xl
font-bold
text-zinc-900
"
>
Dashboard
</h1>




<div
className="
grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5
"
>


<StatCard

title="Total Articles"

value={String(stats.articles)}

description="Published news articles"

/>



<StatCard

title="Videos"

value={String(stats.videos)}

description="Uploaded videos"

/>



<StatCard

title="Users"

value={String(stats.users)}

description="Registered users"

/>



<StatCard

title="Business Ads"

value={String(stats.ads)}

description="Active advertisements"

/>



</div>





<div
className="
bg-white
rounded-xl
border
p-6
"
>


<h2
className="
font-bold
text-xl
mb-4
"
>
Recent Activity
</h2>


<p
className="
text-zinc-500
"
>
No activity yet
</p>



</div>



</div>

);


}