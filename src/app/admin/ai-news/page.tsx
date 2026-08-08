"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Sparkles,
  RefreshCw,
  ArrowRight,
  Newspaper,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";

import { useRouter } from "next/navigation";

interface TrendingNews {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface GeneratedArticle {
  title: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
  content: string;
  suggestedCategory: string;
  imagePrompt: string;
}

export default function AINewsPage() {
  const router = useRouter();

  const [news, setNews] =
    useState<TrendingNews[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [generating, setGenerating] =
    useState(false);

  const [selected, setSelected] =
    useState<TrendingNews | null>(null);

  const [article, setArticle] =
    useState<GeneratedArticle | null>(null);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  async function loadNews() {
    try {
      setLoading(true);
      setError("");

      const res =
        await fetch(
          "/api/admin/ai-news",
          {
            cache: "no-store",
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to load news"
        );
      }

      setNews(
        Array.isArray(data.news)
          ? data.news
          : []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.message ||
          "Unable to load trending news"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  async function generate(
    item: TrendingNews
  ) {
    try {
      setGenerating(true);
      setSelected(item);
      setArticle(null);
      setError("");
      setCopied(false);

      const res =
        await fetch(
          "/api/admin/ai-news",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              title: item.title,
              source: item.source,
            }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "AI generation failed"
        );
      }

      setArticle(
        data.article
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error.message ||
          "AI generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function openChatGPT() {
    if (!article?.imagePrompt) {
      setError(
        "Image prompt is not available."
      );

      return;
    }

    const prompt = `
Create a professional 16:9 HD thumbnail for an Indian digital news website.

Use this exact image-generation brief:

${article.imagePrompt}

IMPORTANT:
- Photorealistic editorial news photography
- Premium Indian television-news visual quality
- 16:9 landscape
- 4K quality
- Strong cinematic composition
- Realistic lighting
- Accurate subject representation
- Red, black, white and subtle gold visual palette
- Clean professional newsroom aesthetic
- No cartoon
- No illustration
- No fake facts
- No fake statistics
- No watermark
- No logo
- No headline text
- No unnecessary text inside the image

Generate ONLY the image.
`;

    try {
      await navigator.clipboard.writeText(
        prompt.trim()
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Clipboard error:",
        error
      );
    }

    window.open(
      "https://chatgpt.com/",
      "_blank",
      "noopener,noreferrer"
    );
  }

  function editArticle() {
    if (!article) return;

    sessionStorage.setItem(
      "ai_article",
      JSON.stringify({
        ...article,

        thumbnail: "",

        categoryId: "",

        featured: false,

        breaking: false,

        priority: 0,

        status: "draft",
      })
    );

    router.push(
      "/admin/articles/create?from=ai"
    );
  }

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-11
                h-11
                rounded-xl
                bg-red-600
                text-white
                flex
                items-center
                justify-center
              "
            >
              <Sparkles
                size={22}
              />
            </div>

            <div>
              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  font-black
                  text-zinc-900
                "
              >
                AI News
              </h1>

              <p
                className="
                  text-sm
                  text-zinc-500
                "
              >
                Trending topics ready
                for your newsroom
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadNews}
          disabled={loading}
          className="
            flex
            items-center
            justify-center
            gap-2
            px-4
            py-2.5
            rounded-lg
            border
            bg-white
            hover:bg-zinc-50
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={17}
          />

          Refresh
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            text-red-700
            p-4
          "
        >
          {error}
        </div>
      )}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-12
          gap-6
        "
      >

        {/* TRENDING */}

        <section
          className="
            xl:col-span-5
            bg-white
            border
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              p-5
              border-b
            "
          >
            <h2
              className="
                font-black
                text-lg
                flex
                items-center
                gap-2
              "
            >
              <Newspaper
                size={20}
              />

              Trending Topics
            </h2>

            <p
              className="
                text-sm
                text-zinc-500
                mt-1
              "
            >
              Topics not already present
              in your articles
            </p>
          </div>

          <div className="divide-y">

            {loading ? (
              <div
                className="
                  p-10
                  flex
                  justify-center
                "
              >
                <Loader2
                  className="animate-spin"
                />
              </div>
            ) : news.length === 0 ? (
              <div
                className="
                  p-10
                  text-center
                  text-zinc-500
                "
              >
                No new trending topics
                found.
              </div>
            ) : (
              news.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="
                      p-5
                      hover:bg-zinc-50
                      transition
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <span
                        className="
                          shrink-0
                          w-7
                          h-7
                          rounded-full
                          bg-red-50
                          text-red-600
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-bold
                        "
                      >
                        {index + 1}
                      </span>

                      <div
                        className="
                          min-w-0
                        "
                      >
                        <h3
                          className="
                            font-semibold
                            text-sm
                            leading-6
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            text-xs
                            text-zinc-400
                            mt-2
                          "
                        >
                          {item.source}
                        </p>

                        <div
                          className="
                            mt-4
                            flex
                            gap-3
                          "
                        >
                          <button
                            onClick={() =>
                              generate(
                                item
                              )
                            }
                            disabled={
                              generating
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              bg-red-600
                              hover:bg-red-700
                              text-white
                              px-3
                              py-2
                              rounded-lg
                              text-xs
                              font-bold
                              disabled:opacity-50
                            "
                          >
                            <Sparkles
                              size={14}
                            />

                            Generate
                          </button>

                          {item.link && (
                            <a
                              href={
                                item.link
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="
                                flex
                                items-center
                                gap-1
                                px-3
                                py-2
                                rounded-lg
                                border
                                text-xs
                              "
                            >
                              <ExternalLink
                                size={13}
                              />

                              Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </section>

        {/* AI RESULT */}

        <section
          className="
            xl:col-span-7
            bg-white
            border
            rounded-2xl
            overflow-hidden
          "
        >
          <div
            className="
              p-5
              border-b
            "
          >
            <h2
              className="
                font-black
                text-lg
                flex
                items-center
                gap-2
              "
            >
              <Sparkles
                size={20}
                className="text-red-600"
              />

              AI Article
            </h2>
          </div>

          {/* EMPTY */}

          {!article &&
            !generating && (
              <div
                className="
                  min-h-[400px]
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  p-8
                "
              >
                <Sparkles
                  size={40}
                  className="
                    text-zinc-300
                    mb-4
                  "
                />

                <h3
                  className="
                    font-bold
                    text-lg
                  "
                >
                  Select a trending topic
                </h3>

                <p
                  className="
                    text-zinc-500
                    text-sm
                    mt-2
                    max-w-md
                  "
                >
                  AI will prepare the
                  title, SEO data,
                  summary, article and
                  professional image
                  prompt.
                </p>
              </div>
            )}

          {/* GENERATING */}

          {generating && (
            <div
              className="
                min-h-[400px]
                flex
                flex-col
                items-center
                justify-center
              "
            >
              <Loader2
                size={40}
                className="
                  animate-spin
                  text-red-600
                "
              />

              <p
                className="
                  mt-4
                  font-semibold
                "
              >
                Writing article...
              </p>

              <p
                className="
                  text-sm
                  text-zinc-500
                  mt-1
                "
              >
                Please wait
              </p>
            </div>
          )}

          {/* ARTICLE */}

          {article &&
            !generating && (
              <div
                className="
                  p-5
                  space-y-6
                "
              >

                {/* TITLE */}

                <div>
                  <label
                    className="
                      text-xs
                      font-bold
                      text-zinc-500
                    "
                  >
                    ARTICLE TITLE
                  </label>

                  <h2
                    className="
                      text-2xl
                      font-black
                      mt-2
                    "
                  >
                    {article.title}
                  </h2>
                </div>

                {/* SEO TITLE */}

                <div>
                  <label
                    className="
                      text-xs
                      font-bold
                      text-zinc-500
                    "
                  >
                    SEO TITLE
                  </label>

                  <p
                    className="
                      mt-2
                      font-semibold
                    "
                  >
                    {article.seoTitle}
                  </p>
                </div>

                {/* SEO DESCRIPTION */}

                <div>
                  <label
                    className="
                      text-xs
                      font-bold
                      text-zinc-500
                    "
                  >
                    SEO DESCRIPTION
                  </label>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-zinc-600
                      leading-6
                    "
                  >
                    {
                      article.seoDescription
                    }
                  </p>
                </div>

                {/* SHORT DESCRIPTION */}

                <div>
                  <label
                    className="
                      text-xs
                      font-bold
                      text-zinc-500
                    "
                  >
                    SHORT DESCRIPTION
                  </label>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-zinc-600
                      leading-6
                    "
                  >
                    {
                      article.shortDescription
                    }
                  </p>
                </div>

                {/* ARTICLE PREVIEW */}

                <div
                  className="
                    rounded-xl
                    bg-zinc-50
                    border
                    p-4
                  "
                >
                  <div
                    className="
                      text-xs
                      font-bold
                      text-zinc-500
                      mb-3
                    "
                  >
                    ARTICLE PREVIEW
                  </div>

                  <div
                    className="
                      prose
                      prose-sm
                      max-w-none
                    "
                    dangerouslySetInnerHTML={{
                      __html:
                        article.content,
                    }}
                  />
                </div>

                {/* AI IMAGE PROMPT */}

                <div
                  className="
                    rounded-xl
                    border
                    border-yellow-200
                    bg-yellow-50
                    p-4
                    space-y-4
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
                      <ImageIcon
                        size={18}
                      />

                      <p
                        className="
                          text-sm
                          font-bold
                        "
                      >
                        AI Thumbnail
                      </p>
                    </div>

                    <p
                      className="
                        text-xs
                        text-zinc-600
                        mt-1
                      "
                    >
                      ChatGPT me professional
                      thumbnail generate karein.
                    </p>
                  </div>

                  {/* PROMPT */}

                  <div
                    className="
                      rounded-lg
                      bg-white
                      border
                      p-3
                    "
                  >
                    <p
                      className="
                        text-[11px]
                        font-bold
                        text-zinc-400
                        uppercase
                        mb-1
                      "
                    >
                      Generated Image Prompt
                    </p>

                    <p
                      className="
                        text-xs
                        text-zinc-600
                        leading-5
                      "
                    >
                      {
                        article.imagePrompt
                      }
                    </p>
                  </div>

                  {/* CHATGPT BUTTON */}

                  <button
                    type="button"
                    onClick={
                      openChatGPT
                    }
                    className="
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      bg-zinc-900
                      hover:bg-black
                      text-white
                      px-4
                      py-3
                      rounded-lg
                      text-sm
                      font-bold
                    "
                  >
                    {copied ? (
                      <>
                        <Check
                          size={17}
                        />

                        Prompt Copied —
                        Opened ChatGPT
                      </>
                    ) : (
                      <>
                        <Copy
                          size={17}
                        />

                        Generate Thumbnail
                        in ChatGPT
                      </>
                    )}
                  </button>

                  <p
                    className="
                      text-[11px]
                      text-zinc-500
                      text-center
                    "
                  >
                    Button prompt ko clipboard
                    me copy karke ChatGPT
                    kholega. Wahan paste karke
                    Enter dabana hai.
                  </p>
                </div>

                {/* EDIT ARTICLE */}

                <button
                  onClick={
                    editArticle
                  }
                  className="
                    w-full
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    px-5
                    py-3
                    rounded-xl
                    font-bold
                  "
                >
                  Edit in Article Editor

                  <ArrowRight
                    size={18}
                  />
                </button>

              </div>
            )}
        </section>
      </div>
    </div>
  );
}