import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TopStrip, Header, Navbar, Footer } from '../components/Layout';
import { ArticleCard, AdCarousel } from '../components/ContentCards';
import { useAppContext } from '../context/AppContext';
import { Share2, Facebook, Instagram, Phone as WhatsApp, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AdsenseAd from "../components/AdsenseAd";

export default function SingleArticle() {
  const { id } = useParams();
  const { t, language } = useAppContext();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, allArtRes, adsRes] = await Promise.all([
          fetch(`https://infinia-bharat-news-rf52.onrender.com/api/articles`), 
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/articles'),
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/ads')
        ]);
        
        const allArticles = await allArtRes.json();
        const found = allArticles.find((a: any) => a.id.toString() === id);
        setArticle(found);
        setRelated(allArticles.filter((a: any) => a.id.toString() !== id).slice(0, 3));
        setAds(await adsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  if (!article) return <div className="p-20 text-center font-bold">Loading...</div>;

  const title = language === 'hi' ? article.title_hi : article.title_en;
  const description = language === 'hi' ? article.description_hi : article.description_en;

  const shareUrl = `${window.location.origin}/article/${id}`;

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareOnInstagram = async () => {
    // Instagram doesn't support direct link sharing via URL, fallback to navigator.share
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert(t('लिंक कॉपी किया गया!', 'Link copied to clipboard!'));
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors">
      {/* NewsArticle Schema */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      image: [`${window.location.origin}${article.image_url}`],
      datePublished: article.created_at,
      dateModified: article.created_at,
      author: {
        "@type": "Organization",
        name: "Infinia Bharat News"
      },
      publisher: {
        "@type": "Organization",
        name: "Infinia Bharat News",
        logo: {
          "@type": "ImageObject",
          url: `${window.location.origin}/logo.png`
        }
      },
      mainEntityOfPage: `${window.location.origin}/article/${article.id}`
    })
  }}
/>
      <TopStrip />
      <Header />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <article className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-black leading-tight dark:text-white">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-widest">
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
              <span className="bg-[#5C0611] text-white px-2 py-0.5 rounded text-[10px]">{article.category}</span>
            </div>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={article.image_url || `https://picsum.photos/seed/${article.id}/1200/675`} 
              alt={title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed">
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-bold uppercase text-sm dark:text-white">{t('इस खबर को साझा करें:', 'Share this news:')}</span>
              <div className="flex gap-2">
                <button onClick={shareOnWhatsApp} className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-transform"><WhatsApp size={20} /></button>
                <button onClick={shareOnFacebook} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform"><Facebook size={20} /></button>
                <button onClick={shareOnInstagram} className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:scale-110 transition-transform"><Instagram size={20} /></button>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-2 font-bold text-red-600 hover:underline">
              <ChevronLeft size={20} /> {t('मुख्य पृष्ठ पर वापस जाएं', 'Back to Home')}
            </Link>
          </div>
        </article>

        <section className="py-8">
          <AdCarousel ads={ads} />
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-black uppercase italic border-b-2 border-red-600 pb-2 dark:text-white">
            {t('संबंधित लेख', 'Related Articles')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map(art => <ArticleCard key={art.id} article={art} />)}
          </div>
        </section>

        <section className="py-8">
          <div className="border-4 border-dashed border-gray-300 dark:border-zinc-800 p-12 text-center text-gray-400 font-bold rounded-2xl">
           <AdsenseAd />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
