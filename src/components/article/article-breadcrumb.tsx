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
      className="
        mb-6
        overflow-hidden
        text-sm
        text-zinc-500
      "
    >
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link
            href="/"
            className="hover:text-red-600 transition-colors"
          >
            होम
          </Link>
        </li>

        <li aria-hidden="true">/</li>

        <li>
          {category?.slug ? (
            <Link
              href={`/category/${category.slug}`}
              className="hover:text-red-600 transition-colors"
            >
              {categoryName}
            </Link>
          ) : (
            <span>{categoryName}</span>
          )}
        </li>

        <li aria-hidden="true">/</li>

        <li
          className="
            min-w-0
            truncate
            text-zinc-800
            font-medium
          "
          aria-current="page"
        >
          {article.title}
        </li>
      </ol>
    </nav>
  );
}