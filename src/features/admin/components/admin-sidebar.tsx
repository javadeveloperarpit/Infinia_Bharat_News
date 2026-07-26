"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  FileText,
  Video,
  Bell,
  Image,
  Users,
  Settings
} from "lucide-react";


const menu = [

  {
    name:"Dashboard",
    href:"/admin",
    icon:LayoutDashboard
  },

  {
    name:"Articles",
    href:"/admin/articles",
    icon:FileText
  },

  {
    name:"Videos",
    href:"/admin/videos",
    icon:Video
  },

  {
    name:"Breaking News",
    href:"/admin/breaking-news",
    icon:Bell
  },

  {
    name:"Ads",
    href:"/admin/ads",
    icon:Image
  },

  {
    name:"Users",
    href:"/admin/users",
    icon:Users
  },

  {
    name:"Settings",
    href:"/admin/settings",
    icon:Settings
  }

];


export default function AdminSidebar(){

return (

<aside
className="
w-64
min-h-screen
bg-zinc-950
text-white
p-5
"
>


<h2
className="
text-xl
font-bold
mb-8
text-red-500
"
>
INFINIA CMS
</h2>



<nav
className="
space-y-2
"
>


{
menu.map((item)=>{


const Icon=item.icon;


return (

<Link

key={item.name}

href={item.href}

className="
flex
items-center
gap-3
p-3
rounded-lg
hover:bg-zinc-800
transition
"

>


<Icon size={20}/>


<span>
{item.name}
</span>


</Link>

);


})
}


</nav>


</aside>

);


}