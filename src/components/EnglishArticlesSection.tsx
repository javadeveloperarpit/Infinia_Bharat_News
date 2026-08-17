import Link from "next/link";


interface EnglishArticle {

  id: string;

  title: string;

  slug: string;

  thumbnail: string;

  shortDescription: string;

  categoryName: string;

  categorySlug: string;

  createdAt?: string;

}


interface Props {

  articles: EnglishArticle[];

}


export default function EnglishArticlesSection({
  articles,
}: Props) {

  if (!articles.length) {
    return null;
  }


  return (

    <section
      className="
        container-news
        py-8
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-5
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <span
              className="
                text-xl
                bg-gradient-to-r
                from-[#ECCA6D]
                via-white
                to-[#ECCA6D]
                bg-clip-text
                text-transparent
              "
            >
              ✦
            </span>

            <h2
              className="
                text-xl
                md:text-2xl
                font-bold
                text-white
              "
            >
              English Articles
            </h2>

          </div>

          <p
            className="
              mt-1
              text-xs
              text-white/40
            "
          >
            Latest news and stories in English
          </p>

        </div>


        <Link
          href="/english-articles"
          className="
            text-xs
            font-semibold
            text-[#ECCA6D]
            hover:text-white
            transition
          "
        >
          View All →
        </Link>

      </div>


      {/* ARTICLES */}

      <div
  className="
    grid
    grid-cols-1
    sm:grid-cols-2
    lg:grid-cols-3
    gap-4
  "
>
  {articles.map(
    (article, index) => (
      <article
        key={article.id}
        className={`
          ${
            index >= 3
              ? "hidden sm:block"
              : ""
          }
          overflow-hidden
          rounded-xl
          border
          border-white/10
          bg-[#111]
          hover:border-[#ECCA6D]/30
          transition
        `}
      >

              <Link
                href={`/news/${article.slug}`}
              >

                <div
                  className="
                    aspect-[16/9]
                    overflow-hidden
                  "
                >

                  <img
                    src={
                      article.thumbnail
                    }
                    alt={
                      article.title
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                      transition
                      duration-500
                      hover:scale-105
                    "
                  />

                </div>

              </Link>


              <div
                className="
                  p-3
                "
              >

                {/* CATEGORY TAG */}

                <Link
                  href={`/category/${article.categorySlug}`}
                  className="
                    inline-flex
                    mb-2
                    rounded-full
                    border
                    border-[#ECCA6D]/20
                    bg-[#ECCA6D]/5
                    px-2
                    py-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wide
                    text-[#ECCA6D]
                    hover:bg-[#ECCA6D]/10
                  "
                >
                  {article.categoryName}
                </Link>


                <Link
                  href={`/news/${article.slug}`}
                >

                  <h3
                    className="
                      line-clamp-2
                      text-sm
                      font-bold
                      leading-5
                      text-white
                      hover:text-[#ECCA6D]
                      transition
                    "
                  >
                    {article.title}
                  </h3>

                </Link>


                {article.shortDescription && (

                  <p
                    className="
                      mt-2
                      line-clamp-2
                      text-xs
                      leading-5
                      text-white/45
                    "
                  >
                    {
                      article.shortDescription
                    }
                  </p>

                )}

              </div>

            </article>

          )
        )}

      </div>

    </section>

  );

}