"use client";

interface Props {
  article: any;
}

export default function ArticleContent({
  article,
}: Props) {
  return (
    <article
      className="
        article-content

        w-full
        min-w-0
        max-w-full

        overflow-hidden

        prose
        prose-lg
        max-w-none

        break-words
        [overflow-wrap:anywhere]

        prose-headings:max-w-full
        prose-p:max-w-full
        prose-li:max-w-full

        prose-img:mx-auto
        prose-img:block
        prose-img:h-auto
        prose-img:max-w-full

        prose-video:max-w-full
        prose-iframe:max-w-full

        prose-table:w-full
        prose-table:max-w-full

        prose-pre:max-w-full
      "
      dangerouslySetInnerHTML={{
        __html: article.content,
      }}
    />
  );
}

