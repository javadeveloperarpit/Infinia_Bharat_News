"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";

interface Props{
  title:string;
  slug:string;
}

export default function SectionHeader({
  title,
  slug
}:Props){

  const language =
  useLanguageStore(
    state=>state.language
  );

  return(

    <div
      className="
      flex
      items-center
      justify-between
      mb-6
      "
    >

      <h2
        className="
        text-2xl
        md:text-3xl
        font-black
        "
      >
        {title}
      </h2>

      <Link
        href={`/category/${slug}`}
        className="
        flex
        items-center
        gap-1
        text-red-600
        font-bold
        text-sm
        hover:gap-2
        transition-all
        "
      >

        {
language==="hi"
?
"सभी देखें"
:
"View All"
}

        <ChevronRight size={18}/>

      </Link>

    </div>

  );

}