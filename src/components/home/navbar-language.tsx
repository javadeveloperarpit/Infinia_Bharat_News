"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useLanguageStore,
} from "@/store/language-store";


interface Category {
  id: string;
  name: string;
  nameHi: string;
  slug: string;
  status: "active" | "inactive";
}


interface Props {
  categories: Category[];
}


export default function NavbarLanguage({
  categories,
}: Props) {

  const pathname = usePathname();


  const language =
    useLanguageStore(
      (state) => state.language
    );


  return (
    <div
      className="
        flex
        items-center
        gap-8
        h-12
        min-w-max
      "
    >

      {/* HOME */}

      <Link
        href="/"
        className={`
          text-sm
          font-semibold
          transition
          ${
            pathname === "/"
              ? "text-[#ECCA6D]"
              : "text-white/80 hover:text-[#ECCA6D]"
          }
        `}
      >
        {language === "hi"
          ? "होम"
          : "HOME"}
      </Link>


      {/* CATEGORIES */}

      {categories.map((category) => (

        <Link
          key={category.id}
          href={`/category/${category.slug}`}
          className={`
            text-sm
            font-semibold
            transition
            ${
              pathname ===
              `/category/${category.slug}`
                ? "text-[#ECCA6D]"
                : "text-white/80 hover:text-[#ECCA6D]"
            }
          `}
        >

          {language === "hi"
            ? category.nameHi
            : category.name}

        </Link>

      ))}

    </div>
  );
}