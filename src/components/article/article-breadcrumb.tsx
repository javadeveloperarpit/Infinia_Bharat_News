import Link from "next/link";

interface Props {
  article: any;
  category?: {
    name?: string;
    slug?: string;
  };
}

export default function ArticleBreadcrumb({
  article,
  category,
}: Props) {
  const categoryName =
    article.categoryHi ||
    article.category ||
    category?.name ||
    "समाचार";

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 w-full"
    >
      <ol
        className="
          flex
          items-center
          gap-2
          overflow-hidden
          text-sm
          font-medium
        "
      >
        {/* HOME */}
        <li className="shrink-0">
          <Link
            href="/"
            className="
              text-zinc-500
              transition-colors
              hover:text-red-600
            "
          >
            होम
          </Link>
        </li>

        {/* SEPARATOR */}
        <li
          aria-hidden="true"
          className="shrink-0 text-zinc-300"
        >
          /
        </li>

        {/* CATEGORY */}
        <li className="shrink-0">
          {category?.slug ? (
            <Link
              href={`/category/${category.slug}`}
              className="
                inline-flex
                items-center
                bg-red-600
                px-3
                py-1.5
                text-xs
                sm:text-sm
                font-bold
                text-white
                uppercase
                tracking-wide
                transition-all
                duration-200
                hover:bg-red-700
                hover:-translate-y-px
              "
            >
              {categoryName}
            </Link>
          ) : (
            <span
              className="
                inline-flex
                items-center
                bg-red-600
                px-3
                py-1.5
                text-xs
                sm:text-sm
                font-bold
                text-white
                uppercase
                tracking-wide
              "
            >
              {categoryName}
            </span>
          )}
        </li>

        {/* SEPARATOR */}
        <li
          aria-hidden="true"
          className="shrink-0 text-zinc-300"
        >
          /
        </li>

        {/* ARTICLE TITLE */}
        <li
          aria-current="page"
          className="
            min-w-0
            flex-1
            truncate
            text-zinc-700
            font-semibold
          "
          title={article.title}
        >
          {article.title}
        </li>
      </ol>
    </nav>
  );
}