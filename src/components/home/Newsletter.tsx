export default function Newsletter() {
  return (
    <section className="rounded-3xl bg-red-600 text-white p-12 text-center">

      <h2 className="text-4xl font-black">

        Never Miss Breaking News

      </h2>

      <p className="mt-4 text-white/80">

        Subscribe for daily headlines.

      </p>

      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">

        <input
          placeholder="Enter Email"
          className="rounded-xl px-5 py-4 text-black w-full md:w-[400px]"
        />

        <button className="rounded-xl bg-black px-8 py-4 font-bold">

          Subscribe

        </button>

      </div>

    </section>
  );
}