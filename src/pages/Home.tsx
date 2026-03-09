import { useState, useEffect } from 'react';
import { TopStrip, Header, Navbar, BreakingNews, Newsletter, Footer } from '../components/Layout';
import { ArticleCard, VideoCard, AdCarousel } from '../components/ContentCards';
import { useAppContext } from '../context/AppContext';
import { motion } from 'motion/react';
import { Tv } from 'lucide-react';
import AdsenseAd from "../components/AdsenseAd";

export default function Home() {
  const { t, language, searchQuery } = useAppContext();
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [liveTvUrl, setLiveTvUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const [articlePage, setArticlePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, vidRes, newsRes, adsRes, setRes] = await Promise.all([
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/articles'),
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/videos'),
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/breaking-news'),
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/ads'),
          fetch('https://infinia-bharat-news-rf52.onrender.com/api/settings')
        ]);
        
        setArticles(await artRes.json());
        setVideos(await vidRes.json());
        setBreakingNews(await newsRes.json());
        setAds(await adsRes.json());
        const settings = await setRes.json();
        setLiveTvUrl(settings.live_tv_url || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredArticles = articles.filter(art => {
    const title = language === 'hi' ? art.title_hi : art.title_en;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredVideos = videos.filter(vid => {
    const title = language === 'hi' ? vid.title_hi : vid.title_en;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedArticles = filteredArticles.slice(0, articlePage * 6);
  const displayedVideos = filteredVideos.slice(0, videoPage * 6);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500">
      <TopStrip />
      <Header />
      <Navbar />
      <BreakingNews news={breakingNews.map(n => language === 'hi' ? n.content_hi : n.content_en)} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-16">
        {/* Articles Section */}
        <section id="articles" className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-[#5C0611] pb-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
              {t('ताज़ा लेख', 'Latest Articles')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[600px]">
            {displayedArticles.length > 0 ? (
              displayedArticles.map(art => <ArticleCard key={art.id} article={art} />)
            ) : (
              <div className="col-span-full flex items-center justify-center text-gray-400 font-bold text-xl h-64 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                {t('अभी तक कोई लेख नहीं है', 'No Article yet')}
              </div>
            )}
          </div>

          {filteredArticles.length > displayedArticles.length && (
            <div className="flex justify-center">
              <button 
                onClick={() => setArticlePage(p => p + 1)}
                className="bg-[#5C0611] text-white px-12 py-3 rounded-full font-bold hover:bg-[#5C0611]/80 transition-colors shadow-xl"
              >
                {t('और लेख लोड करें', 'Load More Articles')}
              </button>
            </div>
          )}
        </section>

        {/* Videos Section */}
        <section id="videos" className="bg-black -mx-4 px-4 py-16 space-y-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b-2 border-[#5C0611] pb-2">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                {t('वीडियो गैलरी', 'Video Gallery')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
              {displayedVideos.length > 0 ? (
                displayedVideos.map(vid => <VideoCard key={vid.id} video={vid} />)
              ) : (
                <div className="col-span-full flex items-center justify-center text-white font-bold text-xl h-64 border-2 border-dashed border-zinc-800 rounded-xl">
                  {t('अभी तक कोई वीडियो नहीं है', 'No videos')}
                </div>
              )}
            </div>

            {filteredVideos.length > displayedVideos.length && (
              <div className="flex justify-center">
                <button 
                  onClick={() => setVideoPage(p => p + 1)}
                  className="bg-[#5C0611] text-white px-12 py-3 rounded-full font-bold hover:bg-[#5C0611]/80 transition-colors shadow-xl"
                >
                  {t('और वीडियो लोड करें', 'Load More Videos')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Ads Section */}
        <section id="ads" className="py-8">
          <AdCarousel ads={ads} />
        </section>

        {/* Live TV Section */}
        <section id="live-tv" className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-[#5C0611] pb-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
              {t('लाइव टीवी', 'Live TV')}
            </h2>
          </div>
          <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 flex items-center justify-center">
            {liveTvUrl ? (
              <iframe 
                src={`https://www.youtube.com/embed/${liveTvUrl.split('v=')[1] || liveTvUrl.split('/').pop()}`}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="text-center space-y-4">
                <Tv size={64} className="mx-auto text-gray-400 animate-pulse" />
                <p className="text-gray-500 font-bold text-2xl">{t('जल्द ही आ रहा है...', 'Coming Soon...')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Adsense Placeholder */}
        <section className="py-8">
          <div className="border-4 border-dashed border-gray-300 dark:border-zinc-800 p-12 text-center text-gray-400 font-bold rounded-2xl">
            <AdsenseAd />
          </div>
        </section>
      </main>

      <Newsletter />
      <Footer />
    </div>
  );
}
