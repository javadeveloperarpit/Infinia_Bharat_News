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
  categoryId: string;
  imagePrompt: string;
  keywords?: string[];
}

export default function AINewsPage() {

  const router = useRouter();


  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

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


  /*
  |--------------------------------------------------------------------------
  | LOAD TRENDING NEWS
  |--------------------------------------------------------------------------
  */

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

      console.error(
        "Load News Error:",
        error
      );


      setError(
        error.message ||
        "Unable to load trending news"
      );


    } finally {

      setLoading(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    loadNews();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | GENERATE ARTICLE
  |--------------------------------------------------------------------------
  */

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
              link: item.link,
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


      if (!data.article) {

        throw new Error(
          "AI returned empty article"
        );

      }


      setArticle({
  ...data.article,
  categoryId: data.article.categoryId || "",
  keywords: Array.isArray(data.article.keywords)
    ? data.article.keywords
    : [],
});


    } catch (error: any) {

      console.error(
        "AI Generation Error:",
        error
      );


      setError(
        error.message ||
        "AI generation failed"
      );


    } finally {

      setGenerating(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | OPEN CHATGPT + COPY IMAGE PROMPT
  |--------------------------------------------------------------------------
  */

  async function openChatGPT() {

    if (!article?.imagePrompt) {

      setError(
        "Image prompt is not available."
      );

      return;

    }


    /*
     * IMPORTANT:
     *
     * Generated title is deliberately
     * included with imagePrompt.
     *
     * This gives ChatGPT additional
     * visual context.
     */

    const prompt = `
Create a professional 16:9 HD thumbnail for an Indian digital news website.

Use this exact image-generation brief:

${article.imagePrompt}

IMPORTANT NEWS CONTEXT:

Article Title:
${article.title}

SEO Title:
${article.seoTitle}

Suggested Category:
${article.suggestedCategory}

The article title is provided as visual context.
Use it to understand the exact news development and determine the correct primary visual subject.

Do NOT write the article title, SEO title, category name, or any other text inside the image.

IMPORTANT IMAGE REQUIREMENTS:

- Photorealistic editorial news photography
- Premium Indian television-news visual quality
- 16:9 landscape
- 4K quality
- Strong cinematic composition
- Realistic natural lighting
- Accurate subject representation
- Realistic people and environments
- Red, black, white and subtle gold visual palette
- Clean professional newsroom aesthetic
- Strong visual hierarchy
- Sharp primary subject
- Realistic depth of field
- Professional news-agency photography style
- Suitable for a premium Indian digital news website

DO NOT CREATE:

- Cartoon
- Illustration
- Anime
- 3D render
- Poster design
- Advertisement style
- Fake facts
- Fake statistics
- Fake events
- Fake people
- Misleading imagery
- Watermark
- Logo
- Channel branding
- Headline text
- Caption text
- Subtitle text
- Fake newspaper
- Fake social media post
- Fake UI
- Unnecessary graphics
- Unnecessary text inside the image

The image must look like a real professional editorial photograph captured by a news photographer.

The visual scene must accurately represent the actual news topic and article title.

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
        "Clipboard Error:",
        error
      );

    }


    window.open(
      "https://chatgpt.com/",
      "_blank",
      "noopener,noreferrer"
    );

  }


  /*
  |--------------------------------------------------------------------------
  | EDIT ARTICLE
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | suggestedCategory ko preserve karna hai.
  |
  | Create Article Page existing
  | categories ke saath isko match karke
  | actual categoryId banayega.
  |
  |--------------------------------------------------------------------------
  */

  function editArticle() {
  if (!article) return;

  sessionStorage.setItem(
    "ai_article",
    JSON.stringify({
      ...article,
      categoryId: article.categoryId || "",
      thumbnail: "",
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


  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (

    <div
      className="
        space-y-6
        pb-10
      "
    >

      {/* =========================================================
          HEADER
      ========================================================== */}

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


        {/* REFRESH */}

        <button
          onClick={
            loadNews
          }
          disabled={
            loading
          }
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
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* =========================================================
          ERROR
      ========================================================== */}

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


      {/* =========================================================
          MAIN GRID
      ========================================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-12
          gap-6
        "
      >


        {/* =======================================================
            TRENDING NEWS
        ======================================================== */}

        <section
          className="
            xl:col-span-5
            bg-white
            border
            rounded-2xl
            overflow-hidden
          "
        >

          {/* HEADER */}

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


          {/* NEWS LIST */}

          <div
            className="
              divide-y
            "
          >

            {loading ? (

              <div
                className="
                  p-10
                  flex
                  justify-center
                "
              >

                <Loader2
                  className="
                    animate-spin
                    text-red-600
                  "
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
                    key={
                      `${item.title}-${index}`
                    }
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

                      {/* NUMBER */}

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


                      {/* CONTENT */}

                      <div
                        className="
                          min-w-0
                          flex-1
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


                        {/* ACTIONS */}

                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            gap-3
                          "
                        >

                          {/* GENERATE */}

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

                            {generating &&
                            selected?.title ===
                              item.title
                              ? "Generating..."
                              : "Generate"}

                          </button>


                          {/* SOURCE */}

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
                                hover:bg-zinc-50
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


        {/* =======================================================
            AI RESULT
        ======================================================== */}

        <section
          className="
            xl:col-span-7
            bg-white
            border
            rounded-2xl
            overflow-hidden
          "
        >

          {/* HEADER */}

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
                className="
                  text-red-600
                "
              />

              AI Article

            </h2>

          </div>


          {/* =====================================================
              EMPTY STATE
          ====================================================== */}

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
                  category, summary,
                  article and professional
                  image prompt.
                </p>

              </div>

            )}


          {/* =====================================================
              GENERATING
          ====================================================== */}

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


          {/* =====================================================
              ARTICLE
          ====================================================== */}

          {article &&
            !generating && (

              <div
                className="
                  p-5
                  space-y-6
                "
              >

                {/* =================================================
                    TITLE
                ================================================== */}

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
                      leading-tight
                    "
                  >
                    {article.title}
                  </h2>

                </div>


                {/* =================================================
                    CATEGORY
                ================================================== */}

                <div
                  className="
                    rounded-xl
                    border
                    bg-red-50
                    border-red-100
                    p-4
                  "
                >

                  <label
                    className="
                      text-xs
                      font-bold
                      text-red-600
                    "
                  >
                    SUGGESTED CATEGORY
                  </label>


                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <span
                      className="
                        inline-flex
                        items-center
                        px-3
                        py-1.5
                        rounded-full
                        bg-red-600
                        text-white
                        text-sm
                        font-bold
                      "
                    >

                      {article.suggestedCategory ||
                        "Not specified"}

                    </span>

                  </div>


                  <p
                    className="
                      text-xs
                      text-zinc-500
                      mt-2
                    "
                  >
                    This category will be
                    matched automatically with
                    your existing categories
                    when you open the Article
                    Editor.
                  </p>

                </div>


                {/* =================================================
                    SEO TITLE
                ================================================== */}

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


                {/* =================================================
                    SEO DESCRIPTION
                ================================================== */}

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
                    {article.seoDescription}
                  </p>

                </div>

                  {/* =================================================
    SEO KEYWORDS
================================================== */}

<div>

  <label
    className="
      text-xs
      font-bold
      text-zinc-500
    "
  >
    SEO KEYWORDS
  </label>

  <div
    className="
      mt-3
      flex
      flex-wrap
      gap-2
    "
  >

    {Array.isArray(article.keywords) &&
    article.keywords.length > 0 ? (

      article.keywords.map(
        (keyword, index) => (

          <span
            key={`${keyword}-${index}`}
            className="
              inline-flex
              items-center
              rounded-full
              border
              bg-zinc-50
              px-3
              py-1.5
              text-xs
              font-medium
              text-zinc-700
            "
          >
            {keyword}
          </span>

        )
      )

    ) : (

      <span
        className="
          text-sm
          text-zinc-400
        "
      >
        No keywords generated
      </span>

    )}

  </div>

</div>

                {/* =================================================
                    SHORT DESCRIPTION
                ================================================== */}

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
                    {article.shortDescription}
                  </p>

                </div>


                {/* =================================================
                    ARTICLE PREVIEW
                ================================================== */}

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


                {/* =================================================
                    AI IMAGE PROMPT
                ================================================== */}

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

                  {/* HEADER */}

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
                      {article.imagePrompt}
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


                {/* =================================================
                    EDIT ARTICLE
                ================================================== */}

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