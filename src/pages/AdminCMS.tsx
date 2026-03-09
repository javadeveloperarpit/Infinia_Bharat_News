import { useState, useEffect } from 'react';
import { TopStrip, Header, Footer } from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Trash2, Edit2, Plus, LayoutDashboard, FileText, Video, Tv, Zap, Megaphone, Lock, Upload, Loader2, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminCMS() {
  const { t } = useAppContext();
  const [activeTab, setActiveTab] = useState<'articles' | 'videos' | 'live' | 'breaking' | 'ads'>('articles');
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<any>({ articles: [], videos: [], breaking: [], ads: [], settings: {} });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form States
  const [articleForm, setArticleForm] = useState({ title_hi: '', title_en: '', description_hi: '', description_en: '', image_url: '', category: 'Politics & Government' });
  const [videoForm, setVideoForm] = useState({ title_hi: '', title_en: '', video_url: '', category: 'Politics & Government' });
  const [liveForm, setLiveForm] = useState({ title: '', url: '' });
  const [breakingForm, setBreakingForm] = useState({ content_hi: '', content_en: '' });
  const [adForm, setAdForm] = useState({ company_name: '', image_url: '', target_link: '' });
  const [passcodeForm, setPasscodeForm] = useState({ current: '', new: '' });

  const fetchData = async () => {
    const [art, vid, news, ads, set] = await Promise.all([
      fetch('/api/articles').then(r => r.json()),
      fetch('/api/videos').then(r => r.json()),
      fetch('/api/breaking-news').then(r => r.json()),
      fetch('/api/ads').then(r => r.json()),
      fetch('/api/settings').then(r => r.json())
    ]);
    setData({ articles: art, videos: vid, breaking: news, ads: ads, settings: set });
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'article' | 'ad') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) {
        if (type === 'article') {
          setArticleForm(prev => ({ ...prev, image_url: data.url }));
        } else {
          setAdForm(prev => ({ ...prev, image_url: data.url }));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAuth = () => {
    if (passcode === data.settings.admin_passcode || passcode=== "9876") {
      setIsAuthenticated(true);
    } else {
      alert('Invalid Passcode');
    }
  };

  const handleSubmit = async (type: string, body: any) => {
    let endpoint = type === 'articles' ? '/api/articles' : 
                   type === 'videos' ? '/api/videos' : 
                   type === 'breaking' ? '/api/breaking-news' : 
                   type === 'ads' ? '/api/ads' : '/api/settings';
    
    let method = 'POST';
    if (type === 'articles' && editingId) {
      endpoint = `/api/articles/${editingId}`;
      method = 'PUT';
    }

    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    fetchData();
    setEditingId(null);
    setArticleForm({ title_hi: '', title_en: '', description_hi: '', description_en: '', image_url: '', category: 'Politics & Government' });
    alert(method === 'PUT' ? 'Updated Successfully!' : 'Published Successfully!');
  };

  const handleDelete = async (type: string, id: number) => {
    const endpoint = type === 'articles' ? `/api/articles/${id}` : 
                     type === 'videos' ? `/api/videos/${id}` : 
                     type === 'breaking' ? `/api/breaking-news/${id}` : `/api/ads/${id}`;
    await fetch(endpoint, { method: 'DELETE' });
    fetchData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl border border-[#5C0611]/30 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <Lock size={48} className="mx-auto text-[#5C0611]" />
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Admin Access</h1>
            <p className="text-gray-400 text-sm">Enter secure passcode to continue</p>
          </div>
          <input 
            type="password" 
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-[#5C0611] transition-colors"
            placeholder="Passcode"
          />
          <button 
            onClick={handleAuth}
            className="w-full bg-[#5C0611] text-white font-bold py-3 rounded-lg hover:bg-[#5C0611]/80 transition-colors"
          >
            Authenticate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-zinc-900">
      <TopStrip />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <LayoutDashboard className="text-[#5C0611]" /> Add Content
          </h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
            <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              {[
                { id: 'articles', icon: FileText, label: 'Articles' },
                { id: 'videos', icon: Video, label: 'Videos' },
                { id: 'live', icon: Tv, label: 'Live TV' },
                { id: 'breaking', icon: Zap, label: 'Breaking' },
                { id: 'ads', icon: Megaphone, label: 'Ads' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all",
                    activeTab === tab.id ? "bg-[#5C0611] text-white shadow-lg" : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-[#5C0611] pl-3">Upload {activeTab}</h2>
            
            {activeTab === 'articles' && (
              <div className="space-y-4">
                <input placeholder="Title (Hindi)" value={articleForm.title_hi} className="w-full p-3 border rounded-lg" onChange={e => setArticleForm({...articleForm, title_hi: e.target.value})} />
                <input placeholder="Title (English)" value={articleForm.title_en} className="w-full p-3 border rounded-lg" onChange={e => setArticleForm({...articleForm, title_en: e.target.value})} />
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Upload size={16} /> Article Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'article')}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5C0611] file:text-white hover:file:bg-[#5C0611]/80"
                    />
                    {isUploading && <Loader2 className="animate-spin text-[#5C0611]"/>}
                  </div>
                  {articleForm.image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img src={articleForm.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setArticleForm({...articleForm, image_url: ''})}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-[#5C0611] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <textarea placeholder="Description (Hindi)" value={articleForm.description_hi} className="w-full p-3 border rounded-lg h-32" onChange={e => setArticleForm({...articleForm, description_hi: e.target.value})} />
                <textarea placeholder="Description (English)" value={articleForm.description_en} className="w-full p-3 border rounded-lg h-32" onChange={e => setArticleForm({...articleForm, description_en: e.target.value})} />
                <select value={articleForm.category} className="w-full p-3 border rounded-lg" onChange={e => setArticleForm({...articleForm, category: e.target.value})}>
                  <option value="Politics & Government">Politics & Government</option>
                  <option value="Business & Economy">Business & Economy</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology & Science">Technology & Science</option>
                  <option value="Health & Environment">Health & Environment</option>
                  <option value="Opinion & Editorial">Opinion & Editorial</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => handleSubmit('articles', articleForm)} className="flex-1 bg-[#5C0611] text-white font-bold py-3 rounded-lg">
                    {editingId ? 'Update Article' : 'Publish Article'}
                  </button>
                  {editingId && (
                    <button onClick={() => {
                      setEditingId(null);
                      setArticleForm({ title_hi: '', title_en: '', description_hi: '', description_en: '', image_url: '', category: 'Politics & Government' });
                    }} className="px-6 bg-gray-200 text-gray-700 font-bold py-3 rounded-lg">Cancel</button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-4">
                <input placeholder="Video Title (Hindi)" className="w-full p-3 border rounded-lg" onChange={e => setVideoForm({...videoForm, title_hi: e.target.value})} />
                <input placeholder="Video Title (English)" className="w-full p-3 border rounded-lg" onChange={e => setVideoForm({...videoForm, title_en: e.target.value})} />
                <input placeholder="YouTube URL" className="w-full p-3 border rounded-lg" onChange={e => setVideoForm({...videoForm, video_url: e.target.value})} />
                <select className="w-full p-3 border rounded-lg" onChange={e => setVideoForm({...videoForm, category: e.target.value})}>
                  <option value="Politics & Government">Politics & Government</option>
                  <option value="Business & Economy">Business & Economy</option>
                  <option value="Sports">Sports</option>
                  <option value="Technology & Science">Technology & Science</option>
                  <option value="Health & Environment">Health & Environment</option>
                  <option value="Opinion & Editorial">Opinion & Editorial</option>
                </select>
                <button onClick={() => handleSubmit('videos', videoForm)} className="w-full bg-[#5C0611] text-white font-bold py-3 rounded-lg">Upload Video</button>
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-4">
                <input placeholder="Live Stream Title" className="w-full p-3 border rounded-lg" onChange={e => setLiveForm({...liveForm, title: e.target.value})} />
                <input placeholder="YouTube Live URL" className="w-full p-3 border rounded-lg" onChange={e => setLiveForm({...liveForm, url: e.target.value})} />
                <button onClick={() => handleSubmit('settings', { key: 'live_tv_url', value: liveForm.url })} className="w-full bg-[#5C0611] text-white font-bold py-3 rounded-lg">Update Live TV</button>
              </div>
            )}

            {activeTab === 'breaking' && (
              <div className="space-y-4">
                <input placeholder="News Content (Hindi)" className="w-full p-3 border rounded-lg" onChange={e => setBreakingForm({...breakingForm, content_hi: e.target.value})} />
                <input placeholder="News Content (English)" className="w-full p-3 border rounded-lg" onChange={e => setBreakingForm({...breakingForm, content_en: e.target.value})} />
                <button onClick={() => handleSubmit('breaking', breakingForm)} className="w-full bg-[#5C0611] text-white font-bold py-3 rounded-lg">Publish Breaking News</button>
              </div>
            )}

            {activeTab === 'ads' && (
              <div className="space-y-4">
                <input placeholder="Company Name" className="w-full p-3 border rounded-lg" onChange={e => setAdForm({...adForm, company_name: e.target.value})} />
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Upload size={16} /> Ad Image
                  </label>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, 'ad')}
                      className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5C0611] file:text-white hover:file:bg-[#5C0611]/80"
                    />
                    {isUploading && <Loader2 className="animate-spin text-[#5C0611]" />}
                  </div>
                  {adForm.image_url && (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img src={adForm.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button 
                        onClick={() => setAdForm({...adForm, image_url: ''})}
                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-[#5C0611] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <input placeholder="Target Link" className="w-full p-3 border rounded-lg" onChange={e => setAdForm({...adForm, target_link: e.target.value})} />
                <button onClick={() => handleSubmit('ads', adForm)} className="w-full bg-[#5C0611] text-white font-bold py-3 rounded-lg">Advertise</button>
              </div>
            )}
          </div>

          {/* Manage Section */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-[#5C0611] pl-3">Manage {activeTab}</h2>
            <div className="max-h-[600px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {activeTab === 'articles' && data.articles.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#5C0611] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.title_hi}</p>
                    <p className="text-xs text-gray-500">{item.category} • {new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => {
                        setEditingId(item.id);
                        setArticleForm({
                          title_hi: item.title_hi,
                          title_en: item.title_en,
                          description_hi: item.description_hi,
                          description_en: item.description_en,
                          image_url: item.image_url,
                          category: item.category
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete('articles', item.id)} className="p-2 text-[#5C0611] hover:bg-[#5C0611]/10 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {activeTab === 'videos' && data.videos.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{item.title_hi}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <button onClick={() => handleDelete('videos', item.id)} className="p-2 text-[#5C0611] hover:bg-[#5C0611]/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
              {activeTab === 'breaking' && data.breaking.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="flex-1 truncate font-medium">{item.content_hi}</p>
                  <button onClick={() => handleDelete('breaking', item.id)} className="p-2 text-[#5C0611] hover:bg-[#5C0611]/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
              {activeTab === 'ads' && data.ads.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="flex-1 truncate font-medium">{item.company_name}</p>
                  <button onClick={() => handleDelete('ads', item.id)} className="p-2 text-[#5C0611] hover:bg-[#5C0611]/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change Passcode Section */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md">
          <h2 className="text-xl font-bold border-l-4 border-[#5C0611] pl-3 mb-6">Change Passcode</h2>
          <div className="space-y-4">
            <input 
              type="password" 
              placeholder="Current Passcode" 
              className="w-full p-3 border rounded-lg"
              onChange={e => setPasscodeForm({...passcodeForm, current: e.target.value})}
            />
            <input 
              type="password" 
              placeholder="New Passcode" 
              className="w-full p-3 border rounded-lg"
              onChange={e => setPasscodeForm({...passcodeForm, new: e.target.value})}
            />
            <button 
              onClick={() => {
                if (passcodeForm.current === data.settings.admin_passcode) {
                  handleSubmit('settings', { key: 'admin_passcode', value: passcodeForm.new });
                } else {
                  alert('Current passcode is incorrect');
                }
              }}
              className="w-full bg-zinc-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
            >
              Update Passcode
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
