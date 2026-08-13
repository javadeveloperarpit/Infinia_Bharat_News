import Link from "next/link";

import {
  getCategories,
} from "@/services/public/category.public.service";

import NavbarLanguage from "./navbar-language";


interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: "active" | "inactive";
}


export default async function Navbar() {

  const categories: Category[] =
    await getCategories();


  return (
    <nav
      className="
        w-full
        bg-[#090909]
        border-b
        border-[#ECCA6D]/20
      "
    >

      <div
        className="
          container-news
          overflow-x-auto
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        <NavbarLanguage
          categories={categories}
        />

      </div>

    </nav>
  );
}