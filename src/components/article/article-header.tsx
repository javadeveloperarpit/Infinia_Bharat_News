import Image from "next/image";
import Link from "next/link";

interface Props {
  article: any;
}

export default function ArticleHeader({
  article,
}: Props) {
  function formatDate(date?: string) {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function readingTime(content?: string) {
    if (!content) return 1;

    const words = content
      .replace(/<[^>]*>/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .length;

    return Math.max(1, Math.ceil(words / 200));
  }

  const authorName =
    article.author?.name ||
    "INFINIA BHARAT NEWS";

  const authorSlug =
    article.author?.slug;

  const publishedDate =
    article.createdAt
      ? new Date(article.createdAt)
      : null;

  const validPublishedDate =
    publishedDate &&
    !isNaN(publishedDate.getTime())
      ? publishedDate
      : null;

  const readingMinutes =
    readingTime(article.content);

  return (
    <header className="mb-10">

      {/* =========================================
          BREAKING NEWS
      ========================================= */}

      {article.breaking && (
        <div className="mb-5 flex items-center">
          <span
            className="
              rounded-md
              bg-black
              px-4
              py-1.5
              text-xs
              font-bold
              text-white
            "
          >
            BREAKING
          </span>
        </div>
      )}

      {/* =========================================
          TITLE
      ========================================= */}

      <h1
        className="
          text-3xl
          font-black
          leading-[1.1]
          tracking-tight
          text-zinc-900
          md:text-5xl
          xl:text-6xl
        "
      >
        {article.title}
      </h1>

      {/* =========================================
          SHORT DESCRIPTION
      ========================================= */}

      {article.shortDescription && (
        <p
          className="
            mt-5
            max-w-4xl
            text-lg
            leading-relaxed
            text-zinc-600
            md:text-xl
          "
        >
          {article.shortDescription}
        </p>
      )}

      {/* =========================================
          ARTICLE META
      ========================================= */}

      <div
        className="
          mt-6
          flex
          flex-wrap
          items-center
          gap-4
          border-b
          pb-6
          text-sm
          text-zinc-500
        "
      >

        {/* AUTHOR */}

        <span className="flex items-center gap-2">
          <span aria-hidden="true">
            ✍️
          </span>

          {authorSlug ? (
            <Link
              href={`/author/${authorSlug}`}
              className="
                font-semibold
                text-zinc-800
                transition
                hover:text-red-600
              "
            >
              {authorName}
            </Link>
          ) : (
            <strong className="text-zinc-800">
              {authorName}
            </strong>
          )}
        </span>

        <span
          aria-hidden="true"
          className="text-zinc-300"
        >
          •
        </span>

        {/* PUBLISHED DATE */}

        {validPublishedDate && (
          <>
            <time
              dateTime={
                validPublishedDate.toISOString()
              }
              className="flex items-center gap-2"
            >
              <span aria-hidden="true">
                📅
              </span>

              <span>
                {formatDate(
                  article.createdAt
                )}
              </span>
            </time>

            <span
              aria-hidden="true"
              className="text-zinc-300"
            >
              •
            </span>
          </>
        )}

        {/* READING TIME */}

        <span
          className="flex items-center gap-2"
          aria-label={`पढ़ने में लगभग ${readingMinutes} मिनट लगेंगे`}
        >
          <span aria-hidden="true">
            ⏱️
          </span>

          <span>
            {readingMinutes} min read
          </span>
        </span>

      </div>

      {/* =========================================
          HERO IMAGE
      ========================================= */}

      {article.thumbnail && (
        <div
          className="
            relative
            mt-8
            aspect-[16/9]
            w-full
            overflow-hidden
            rounded-2xl
            bg-zinc-100
            shadow-xl
          "
        >
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            priority
            sizes="
              (max-width: 768px) 100vw,
              (max-width: 1280px) 75vw,
              850px
            "
            className="object-cover"
          />
        </div>
      )}

    </header>
  );
}