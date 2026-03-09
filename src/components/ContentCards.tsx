import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Share2, ChevronRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// --- Article Card ---
export function ArticleCard({ article }: { article: any }) {
  const { t, language } = useAppContext();
  const title = language === 'hi' ? article.title_hi : article.title_en;
  const description = language === 'hi' ? article.description_hi : article.description_en;

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: description,
      url: `${window.location.origin}/article/${article.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert(t('लिंक कॉपी किया गया!', 'Link copied to clipboard!'));
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-black text-zinc-900 dark:text-white rounded-xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5 group transition-colors"
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={article.image_url || `https://picsum.photos/seed/${article.id}/800/450`} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
          {article.category}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
          {title}
        </h3>
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          <span>{new Date(article.created_at).toLocaleDateString()}</span>
          <button onClick={handleShare} className="hover:text-green-500 transition-colors">
            <Share2 size={16} />
          </button>
        </div>
        <Link 
          to={`/article/${article.id}`}
          className="inline-flex items-center gap-1 text-yellow-400 font-bold text-sm hover:underline"
        >
          {t('और पढ़ें', 'Read More')} <ChevronRight size={16} />
        </Link>
      </div>
    </motion.div>
  );
}

// --- Video Card ---
export function VideoCard({ video }: { video: any }) {
  const { t, language } = useAppContext();
  const title = language === 'hi' ? video.title_hi : video.title_en;
  
  // Extract YouTube ID
  const getEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="bg-zinc-900 rounded-xl overflow-hidden shadow-xl border border-white/5"
    >
      <div className="aspect-video relative group">
        <iframe 
          src={getEmbedUrl(video.video_url) || ''}
          className="w-full h-full"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-sm line-clamp-2">{title}</h3>
        <div className="mt-2 text-[10px] text-red-500 font-bold uppercase">{video.category}</div>
      </div>
    </motion.div>
  );
}

// --- Ad Carousel ---
export function AdCarousel({ ads }: { ads: any[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (ads.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) {
    return (
      <div className="bg-yellow-400 h-48 flex items-center justify-center text-black text-center p-6 rounded-xl border-4 border-dashed border-black">
        <div className="space-y-2">
          <h3 className="text-2xl font-black uppercase italic">Advertise with us</h3>
          <p className="font-bold">Contact:+91 99199 30320</p>
        </div>
      </div>
    );
  }

  const ad = ads[current];

  return (
    <div className="relative h-48 rounded-xl overflow-hidden group">
      <a href={ad.target_link} target="_blank" rel="noopener noreferrer">
        <img 
          src={ad.image_url} 
          alt={ad.company_name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <span className="text-white font-bold text-sm bg-red-600 px-2 py-1 rounded">AD: {ad.company_name}</span>
        </div>
      </a>
      <div className="absolute bottom-2 right-2 flex gap-1">
        {ads.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${i === current ? 'bg-red-600' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}
