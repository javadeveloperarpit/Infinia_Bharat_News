import CommentsList from "@/components/comments/comments-list";

export default function TestComments() {
  return (
    <main className="min-h-screen bg-white p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">
          Comments Test
        </h1>

        <CommentsList
          articleId="test-article-001"
          articleSlug="test-article"
        />
      </div>
    </main>
  );
}