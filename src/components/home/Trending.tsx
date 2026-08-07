import Link from "next/link";

export default function Trending({
  articles,
}: {
  articles: any[];
}) {
  if (!articles?.length) return null;

  return (
    <section className="rounded-3xl bg-[#111] p-8 text-white">

      <div className="mb-8">

        <span className="text-red-500 font-bold uppercase tracking-widest">

          Trending

        </span>

        <h2 className="text-3xl font-black mt-2">

          Top Trending Stories

        </h2>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {articles.map((article, index) => (

          <Link
            href={`/news/${article.id}`}
            key={article.id}
            className="group"
          >

            <div className="text-6xl font-black text-white/10">

              0{index + 1}

            </div>

            <h3 className="mt-2 font-bold group-hover:text-red-500 transition line-clamp-3">

              {article.title}

            </h3>

          </Link>

        ))}

      </div>

    </section>
  );
}