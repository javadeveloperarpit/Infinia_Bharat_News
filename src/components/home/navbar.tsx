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


  const englishCategories =
    categories.filter((category) => {

      const slug =
        String(category.slug || "")
          .trim()
          .toLowerCase();

      const name =
        String(category.name || "")
          .trim()
          .toLowerCase();

      return (
        slug.startsWith("english-") ||
        name.startsWith("english ")
      );

    });


  const normalCategories =
    categories.filter((category) => {

      const slug =
        String(category.slug || "")
          .trim()
          .toLowerCase();

      const name =
        String(category.name || "")
          .trim()
          .toLowerCase();

      return (
        !slug.startsWith("english-") &&
        !name.startsWith("english ")
      );

    });


  return (
    <nav
      className="
        relative
        z-40
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
          overflow-y-visible
        "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >

        <NavbarLanguage
          categories={normalCategories}
          englishCategories={englishCategories}
        />

      </div>

    </nav>
  );
}