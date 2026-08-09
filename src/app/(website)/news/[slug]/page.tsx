import { notFound } from "next/navigation";

import {
  getArticleBySlug,
  getRelatedArticles
} from "@/services/public/article.public.service";

import ArticleHeader from "@/components/article/article-header";
import ArticleContent from "@/components/article/article-content";
import ShareButtons from "@/components/article/share-buttons";
import AuthorBox from "@/components/article/author-box";
import RelatedNews from "@/components/article/related-news";
import ArticleSidebar from "@/components/article/article-sidebar";
import CommentsList from "@/components/comments/comments-list";


export default async function NewsPage({
  params
}: {
  params: Promise<{
    slug:string
  }>
}) {


const {
  slug
}=await params;



const article =
await getArticleBySlug(slug);



if(!article){

notFound();

}



const related =
await getRelatedArticles(
  article.categoryId,
  article.slug
);



const siteUrl =
process.env.NEXT_PUBLIC_SITE_URL || "https://infiniabharatnews.vercel.app";



const articleUrl =
`${siteUrl}/news/${article.slug}`;



return (
  <main className="container-news py-8 ">
    
    <div className="grid min-w-0 grid-cols-12 gap-4 lg:gap-8">

      {/* Share */}
      <aside className="hidden lg:block lg:col-span-1">
        <ShareButtons
          title={article.title}
          url={articleUrl}
        />
        
      </aside>

      {/* Article */}
      <article className="col-span-12 min-w-0 lg:col-span-8">

        <ArticleHeader article={article} />

        {/* Mobile Share */}
        <div className="lg:hidden sticky top-20 z-40 bg-white py-3 border-y mb-6">
          <ShareButtons
            title={article.title}
            url={articleUrl}
          />
        </div>
        <AuthorBox article={article} />

        {/* =========================================
            COMMENTS
        ========================================= */}

        <section
          id="comments"
          className="mt-10 border-t border-zinc-200 pt-8"
        >
          <CommentsList
            articleId={article.id}
            articleSlug={article.slug}
          />
        </section>


        <ArticleContent article={article} />

        
        <RelatedNews articles={related} />

      </article>

      {/* Sidebar */}
      <aside className="hidden min-w-0 lg:block lg:col-span-3">
        <ArticleSidebar related={related} />
      </aside>

    </div>
  </main>
);


}