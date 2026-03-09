import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, Instagram, Phone, Moon, Sun, Languages, Search, Tv, Mail, Lock, X, Share2, ChevronRight, ChevronLeft, Award, MapPin, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Layout Components ---

export function TopStrip() {
  const { theme, setTheme, language, setLanguage, t } = useAppContext();

  return (
    <div className="bg-zinc-100 dark:bg-black text-zinc-900 dark:text-white py-2 px-4 flex flex-wrap justify-between items-center text-xs md:text-sm border-b border-gray-200 dark:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <a href="https://www.facebook.com/" className="hover:text-[#5C0611] transition-colors flex items-center gap-1">
          <Facebook size={14} /> <span className="hidden sm:inline">Facebook</span>
        </a>
        <a href="https://www.instagram.com/" className="hover:text-[#5C0611] transition-colors flex items-center gap-1">
          <Instagram size={14} /> <span className="hidden sm:inline">Instagram</span>
        </a>
        <a href="tel:7355308358" className="hover:text-[#5C0611] transition-colors flex items-center gap-1">
          <Phone size={14} /> <span className="hidden sm:inline">Contact</span>
        </a>
      </div>
      
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="font-bold tracking-wider text-center flex-1 mx-4"
      >
        {t('इनफिनिया भारत न्यूज़ में आपका स्वागत है', 'Welcome to Infinia Bharat News')}
      </motion.div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button 
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className="flex items-center gap-1 hover:bg-white/10 px-2 py-1 rounded transition-colors"
        >
          <Languages size={18} />
          <span className="font-bold">{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
        </button>
      </div>
    </div>
  );
}

export function Header() {
  const { t } = useAppContext();
  const [clickCount, setClickCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount + 1 >= 5) {
      setShowLogin(true);
      setClickCount(0);
    }
  };

  return (
    <header className="py-4 px-6 flex justify-between items-center bg-white dark:bg-black text-black dark:text-white border-b border-gray-100 dark:border-white/5 transition-colors">
      <div onClick={handleLogoClick} className="cursor-pointer">
        <Logo />
      </div>

      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 p-2 rounded-lg shadow-xl border border-[#5C0611]"
          >
            <input type="email" placeholder="Email" className="bg-transparent border-b border-gray-400 px-2 py-1 text-sm outline-none" />
            <input type="password" placeholder="Pass" className="bg-transparent border-b border-gray-400 px-2 py-1 text-sm outline-none w-24" />
            <button 
              onClick={() => navigate('/admin')}
              className="bg-[#5C0611] text-white px-3 py-1 rounded text-sm font-bold hover:bg-[#5C0611]/80 transition-colors"
            >
              Login
            </button>
            <button onClick={() => setShowLogin(false)} className="text-gray-500 hover:text-[#5C0611]">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Navbar() {
  const { t, searchQuery, setSearchQuery } = useAppContext();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const categories = [
    { hi: 'राजनीति और सरकार', en: 'Politics & Government' },
    { hi: 'व्यापार और अर्थव्यवस्था', en: 'Business & Economy' },
    { hi: 'खेल', en: 'Sports' },
    { hi: 'प्रौद्योगिकी और विज्ञान', en: 'Technology & Science' },
    { hi: 'स्वास्थ्य और पर्यावरण', en: 'Health & Environment' },
    { hi: 'विचार और संपादकीय', en: 'Opinion & Editorial' },
  ];

  return (
    <nav className="bg-white/95 dark:bg-black/95 backdrop-blur-md sticky top-0 z-50 border-y border-gray-100 dark:border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-zinc-900 dark:text-white hover:text-[#5C0611] transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center h-full">
          <Link to="/" className="px-4 h-full flex items-center text-zinc-900 dark:text-white hover:text-[#5C0611] transition-colors gap-2 font-bold whitespace-nowrap border-r border-gray-100 dark:border-white/5">
            <Tv size={18} /> {t('होम', 'Home')}
          </Link>
          {categories.map((cat, i) => (
            <Link 
              key={i} 
              to={`/category/${cat.en.toLowerCase().replace(/ /g, '-')}`}
              className="px-4 h-full flex items-center text-zinc-900 dark:text-white hover:text-[#5C0611] transition-colors whitespace-nowrap text-sm font-medium border-r border-gray-100 dark:border-white/5"
            >
              {t(cat.hi, cat.en)}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('खोजें...', 'Search...')}
                  className="bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-3 py-1 rounded-full text-sm outline-none border border-gray-200 dark:border-white/10 w-full"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={cn("p-2 transition-colors", isSearchOpen ? "text-[#5C0611]" : "text-zinc-900 dark:text-white hover:text-[#5C0611]")}
          >
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          <button 
            onClick={() => {
              const el = document.getElementById('live-tv');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/#live-tv');
              }
            }}
            className="bg-[#5C0611] text-white px-4 py-1.5 rounded-full font-bold text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-105 transition-transform"
          >
            <Tv size={16} className="animate-pulse" /> {t('लाइव टीवी', 'Live TV')}
          </button>
        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-zinc-900 border-t border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-4 space-y-2">
              <Link 
                to="/" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 text-white hover:bg-[#5C0611] rounded-lg transition-colors font-bold"
              >
                <Tv size={18} /> {t('होम', 'Home')}
              </Link>
              {categories.map((cat, i) => (
                <Link 
                  key={i} 
                  to={`/category/${cat.en.toLowerCase().replace(/ /g, '-')}`}
                  onClick={() => setIsOpen(false)}
                  className="p-3 text-white hover:bg-[#5C0611] rounded-lg transition-colors text-sm font-medium"
                >
                  {t(cat.hi, cat.en)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function BreakingNews({ news }: { news: string[] }) {
  const { t } = useAppContext();
  return (
    <div className="bg-white dark:bg-zinc-900 flex items-center overflow-hidden h-10 border-b border-gray-200 dark:border-white/5 transition-colors">
      <div className="bg-yellow-400 text-black px-4 h-full flex items-center font-bold text-sm whitespace-nowrap z-10 shadow-lg">
        {t('ताज़ा खबर', 'Breaking News')}
      </div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-12 text-black dark:text-white font-medium"
        >
          {news.length > 0 ? [...news, ...news, ...news].map((n, i) => (
            <span key={i}>{n}</span>
          )) : (
            <span>{t('इनफिनिया भारत न्यूज़ के साथ अपडेट रहें...', 'Stay updated with Infinia Bharat News...')}</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useAppContext();
  return (
    <footer className="bg-white text-black pt-12 pb-6 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-6">
          <Logo />
          <p className="text-black text-sm leading-relaxed">
            {t(
              'इनफिनिया भारत न्यूज़ भारत का अग्रणी समाचार चैनल है जो आपको राजनीति, खेल, मनोरंजन और बहुत कुछ पर सबसे सटीक और तेज़ समाचार प्रदान करता है।',
              'Infinia Bharat News is India\'s leading news channel providing you with the most accurate and fastest news on politics, sports, entertainment and more.'
            )}
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/profile.php?id=61565375480511" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#5C0611] transition-colors"><Facebook size={20} /></a>
            <a href="https://www.instagram.com/Infiniabharatnews/" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#5C0611] transition-colors"><Instagram size={20} /></a>
            <a href="tel:+919919930320" className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-[#5C0611] transition-colors"><Phone size={20} /></a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/50">
            <Award size={48} className="text-yellow-500" />
          </div>
          <div className="overflow-hidden w-full h-8 relative">
            <motion.div 
              animate={{ x: [200, -200] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="whitespace-nowrap text-xs font-bold text-yellow-500 uppercase tracking-widest"
            >
              ISO 9001:2015 CERTIFIED NEWS CHANNEL • TRUSTED BY MILLIONS • 24/7 LIVE COVERAGE
            </motion.div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold border-l-4 border-[#5C0611] pl-3">{t('संपर्क करें', 'Contact Us')}</h3>
          <div className="space-y-3 text-sm text-black/80">
            <div className="flex items-center gap-3"><Mail size={16} className="text-[#5C0611]" /> Infiniabharatnews1@gmail.com</div>
            <div className="flex items-center gap-3"><Phone size={16} className="text-[#5C0611]" />+91 7355308358 </div>
            <div className="flex items-center gap-3"><MapPin size={16} className="text-[#5C0611]" />Sitapur Road , Lucknow </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Infinia Bharat News. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export function Newsletter() {
  const { t } = useAppContext();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = async () => {

  if (!email) return;

  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();

  if (data.success) {
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  }

};

  return (
    <section className="bg-gradient-to-r from-yellow-500 to-amber-600 py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-black text-black uppercase italic tracking-tighter">
          {t('हमारे न्यूज़लेटर की सदस्यता लें', 'Subscribe to our Newsletter')}
        </h2>
        <p className="text-black/80 font-medium">
          {t('नवीनतम समाचार सीधे अपने इनबॉक्स में प्राप्त करें', 'Get the latest news directly in your inbox')}
        </p>
        <AnimatePresence mode="wait">
          {subscribed ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black text-white px-8 py-4 rounded-2xl font-bold inline-block"
            >
              {t('धन्यवाद! आप सफलतापूर्वक सब्सक्राइब हो गए हैं।', 'Thank you! You have successfully subscribed.')}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
            >
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('अपना ईमेल दर्ज करें', 'Enter your email')}
                className="flex-1 px-6 py-3 rounded-full bg-white text-black outline-none shadow-inner"
              />
              <button 
                onClick={handleSubscribe}
                className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform active:scale-95"
              >
                {t('सब्सक्राइब', 'Subscribe')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
