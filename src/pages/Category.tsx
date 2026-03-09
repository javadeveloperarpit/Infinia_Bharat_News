import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TopStrip, Header, Navbar, BreakingNews, Footer } from '../components/Layout';
import { ArticleCard, VideoCard, AdCarousel } from '../components/ContentCards';
import { useAppContext } from '../context/AppContext';

export default function Category() {
  const { category } = useParams();
  const { t, language, searchQuery } = useAppContext();
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [articlePage, setArticlePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artRes, vidRes, newsRes, adsRes] = await Promise.all([
          fetch('/api/articles'),
          fetch('/api/videos'),
          fetch('/api/breaking-news'),
          fetch('/api/ads')
        ]);
        
        setArticles(await artRes.json());
        setVideos(await vidRes.json());
        setBreakingNews(await newsRes.json());
        setAds(await adsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [category]);

  const categoryMap: Record<string, { hi: string, en: string }> = {
    'politics-&-government': { hi: 'राजनीति और सरकार', en: 'Politics & Government' },
    'business-&-economy': { hi: 'व्यापार और अर्थव्यवस्था', en: 'Business & Economy' },
    'sports': { hi: 'खेल', en: 'Sports' },
    'technology-&-science': { hi: 'प्रौद्योगिकी और विज्ञान', en: 'Technology & Science' },
    'health-&-environment': { hi: 'स्वास्थ्य और पर्यावरण', en: 'Health & Environment' },
    'opinion-&-editorial': { hi: 'विचार और संपादकीय', en: 'Opinion & Editorial' },
  };

  const currentCategory = categoryMap[category || ''] || { hi: category?.replace(/-/g, ' '), en: category?.replace(/-/g, ' ') };
  const categoryName = language === 'hi' ? currentCategory.hi : currentCategory.en;

  const filteredArticles = articles.filter(art => {
    const matchesSearch = (language === 'hi' ? art.title_hi : art.title_en).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = art.category.toLowerCase() === category?.replace(/-/g, ' ').toLowerCase() || 
                            art.category.toLowerCase().replace(/ /g, '-') === category?.toLowerCase() ||
                            art.category.toLowerCase().replace(/ & /g, '-&-') === category?.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(vid => {
    const matchesSearch = (language === 'hi' ? vid.title_hi : vid.title_en).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = vid.category.toLowerCase() === category?.replace(/-/g, ' ').toLowerCase() || 
                            vid.category.toLowerCase().replace(/ /g, '-') === category?.toLowerCase() ||
                            vid.category.toLowerCase().replace(/ & /g, '-&-') === category?.toLowerCase();
    return matchesSearch && matchesCategory;
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
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter dark:text-white border-b-4 border-red-600 inline-block pb-2">
            {categoryName}
          </h1>
        </div>

        {/* Articles Section */}
        <section id="articles" className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
              {t('लेख', 'Articles')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[200px]">
            {displayedArticles.length > 0 ? (
              displayedArticles.map(art => <ArticleCard key={art.id} article={art} />)
            ) : (
              <div className="col-span-full flex items-center justify-center text-gray-400 font-bold text-xl h-64 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                {t('इस श्रेणी में कोई लेख नहीं है', 'No Article in this category')}
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
                {t('वीडियो', 'Videos')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[200px]">
              {displayedVideos.length > 0 ? (
                displayedVideos.map(vid => <VideoCard key={vid.id} video={vid} />)
              ) : (
                <div className="col-span-full flex items-center justify-center text-white font-bold text-xl h-64 border-2 border-dashed border-zinc-800 rounded-xl">
                  {t('इस श्रेणी में कोई वीडियो नहीं है', 'No videos in this category')}
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
      </main>

      <Footer />
    </div>
  );
}
