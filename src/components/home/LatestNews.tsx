import NewsCard from "./news-card";

export default function LatestNews({
  articles,
}: {
  articles: any[];
}) {
  if (!articles?.length) return null;

  const latest = articles.slice(0, 5);
  const sidebar = articles.slice(5, 10);

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT */}

      <div className="lg:col-span-2">

        <div className="flex items-center justify-between mb-6">

          <div>
            <p className="text-red-600 font-bold uppercase tracking-widest text-sm">
              Live Updates
            </p>

            <h2 className="text-3xl font-extrabold">
              Latest News
            </h2>
          </div>

        </div>

        <div className="space-y-6">

          {latest.map((article) => (
            <NewsCard
              key={article.id}
              article={article}
            />
          ))}

        </div>

      </div>

      {/* RIGHT */}

      <aside>

        <div className="sticky top-24">

          <div className="rounded-2xl border bg-white shadow-sm">

            <div className="bg-red-600 text-white px-5 py-4 rounded-t-2xl">

              <h3 className="font-bold text-lg">
                Most Read
              </h3>

            </div>

            <div className="divide-y">

              {sidebar.map((item, index) => (

                <a
                   href={`/news/${item.slug}`}
  key={item.id}
                  className="flex gap-4 p-4 hover:bg-zinc-50 transition"
                >

                  <span className="text-3xl font-black text-red-600 w-8">

                    {index + 1}

                  </span>

                  <div>

                    <h4 className="font-semibold line-clamp-3">

                      {item.title}

                    </h4>

                    <p className="text-xs mt-2 text-zinc-500">

                      Latest Update

                    </p>

                  </div>

                </a>

              ))}

            </div>

          </div>

        </div>

      </aside>

    </section>
  );
}