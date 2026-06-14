import { useState } from 'react';
import { Mail, Leaf, MapPin, Facebook, MessageCircle, Sparkles, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../components/SettingsContext';

export default function ContactUs() {
  const { settings } = useSettings();
  
  // 3D Instant Router Form States
  const [instantSubject, setInstantSubject] = useState('');
  const [instantMessage, setInstantMessage] = useState('');

  // Launch pre-filled WhatsApp Dispatcher
  const handleWhatsAppInstant = () => {
    if (!instantMessage.trim()) {
      alert("Please enter a message before dispatching to WhatsApp.");
      return;
    }
    const cleanPhone = settings.adminWhatsApp.replace(/[^\d]/g, '');
    const formattedText = `*Hello Professor Mahfujur Rahman,*\n\n*Subject:* ${instantSubject || 'General Inquiry'}\n\n*Message:* ${instantMessage}`;
    const encText = encodeURIComponent(formattedText);
    window.open(`https://wa.me/${cleanPhone}?text=${encText}`, '_blank');
  };

  // Launch pre-filled Gmail client
  const handleGmailInstant = () => {
    if (!instantMessage.trim()) {
      alert("Please enter a message before dispatching to Gmail.");
      return;
    }
    const encSubject = encodeURIComponent(instantSubject || 'Honors Support Query');
    const encBody = encodeURIComponent(instantMessage);
    window.open(`mailto:${settings.contactEmail}?subject=${encSubject}&body=${encBody}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020b09] text-[#e5e7eb] pb-24 relative overflow-hidden">
      {/* 3D Grid pattern background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [perspective:1000px] pointer-events-none"></div>
      <div className="absolute -top-40 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Visual Header */}
      <section className="py-16 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15),transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <Link 
            to="/" 
            className="group inline-flex items-center gap-2 text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-4 transition-all"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/20 rounded-full text-[10px] font-mono tracking-widest text-[#99f6e4] uppercase mb-1">
            <Sparkles className="h-3 w-3 animate-pulse text-[#99f6e4]" /> Smart Communicator
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight uppercase">Contact Department Hub</h1>
          <p className="text-emerald-100/50 text-sm mt-3 max-w-xl mx-auto leading-relaxed font-light whitespace-pre-wrap">
            {settings.contactText}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card left column info details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0b1d19]/80 rounded-3xl p-8 text-emerald-100 border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-emerald-400/40 hover:-translate-y-1 transition-all duration-300">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.03]">
                <Leaf className="h-44 w-44 text-emerald-400" />
              </div>
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-35 group-hover:opacity-80 transition-opacity"></div>

              <h2 className="font-serif text-2xl text-white mb-4 flex items-center gap-2">
                <span>Directory Desk</span>
              </h2>
              <p className="text-emerald-100/40 text-xs sm:text-sm leading-relaxed mb-8 font-light">
                Reach out to individual administrators. Your queries are routed safely to our curators or direct accounts.
              </p>

              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex gap-4 items-start group/line">
                  <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover/line:bg-emerald-500 group-hover/line:text-emerald-950 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">Head Curator Email</strong>
                    <a href={`mailto:${settings.contactEmail}`} className="text-emerald-300 hover:text-emerald-200 font-mono select-all transition-colors">{settings.contactEmail}</a>
                  </div>
                </div>

                <div className="flex gap-4 items-start group/line">
                  <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover/line:bg-emerald-500 group-hover/line:text-emerald-950 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">WhatsApp Support</strong>
                    <a 
                      href={`https://wa.me/${settings.adminWhatsApp.replace(/[^\d]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-300 hover:text-emerald-200 font-mono select-all transition-colors"
                    >
                      {settings.adminWhatsApp}
                    </a>
                  </div>
                </div>

                {settings.developerFacebook && (
                  <div className="flex gap-4 items-start group/line">
                    <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover/line:bg-emerald-500 group-hover/line:text-emerald-950 transition-colors">
                      <Facebook className="h-4 w-4" />
                    </div>
                    <div>
                      <strong className="block text-white font-serif text-sm font-medium">Official Facebook ID</strong>
                      <a href={settings.developerFacebook} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:text-emerald-100 font-mono transition-colors">
                        Visit Facebook Profile
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 items-start group/line">
                  <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-emerald-400 group-hover/line:bg-emerald-500 group-hover/line:text-emerald-950 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">Physical Reference Desk</strong>
                    <span className="text-emerald-100/60 leading-relaxed font-light">{settings.contactAddress}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Forms Column (Direct Messaging ONLY) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 3D Smart direct message dispatcher */}
            <div className="bg-gradient-to-br from-[#0c231e] to-[#041210] rounded-3xl p-8 border border-emerald-400/20 shadow-[0_20px_40px_rgba(16,185,129,0.06)] relative overflow-hidden hover:border-emerald-400/40 hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] transition-all duration-300 text-left">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Share2 className="h-12 w-12 text-[#99f6e4]" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#99f6e4] bg-[#020b09] border border-emerald-500/20 px-2.5 py-1 rounded-md">
                3D Smart Router
              </span>
              <h2 className="font-serif text-2xl text-white mt-3 font-normal">Direct Mobile Dispatch</h2>
              <p className="text-xs text-emerald-100/40 font-light mt-1 mb-6">Write your text and choose to dispatch instantly via desktop or mobile clients directly.</p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="instant-subj" className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">Inquiry Topic / Subject</label>
                  <input
                    id="instant-subj"
                    type="text"
                    value={instantSubject}
                    onChange={(e) => setInstantSubject(e.target.value)}
                    placeholder="e.g. Request 3rd Year Phytochemistry Key Book"
                    className="w-full bg-[#020b09]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-emerald-100/20 focus:outline-none focus:border-emerald-400 focus:bg-[#020b09]/80 text-xs sm:text-sm tracking-wide transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="instant-msg" className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">Your Message</label>
                  <textarea
                    id="instant-msg"
                    rows={4}
                    value={instantMessage}
                    onChange={(e) => setInstantMessage(e.target.value)}
                    placeholder="Write details of books to add or issue reporting..."
                    className="w-full bg-[#020b09]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-emerald-100/20 focus:outline-none focus:border-emerald-400 focus:bg-[#020b09]/80 text-xs sm:text-sm tracking-wide transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={handleWhatsAppInstant}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-emerald-500/10 text-xs uppercase tracking-widest relative overflow-hidden group/btn hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0 transition-transform group-hover/btn:scale-110" />
                    <span>Send on WhatsApp</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={handleGmailInstant}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#020b09] hover:bg-emerald-950/40 text-[#99f6e4] hover:text-white border border-emerald-500/25 py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md text-xs uppercase tracking-widest relative overflow-hidden group/btn hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Mail className="h-4 w-4 shrink-0 transition-transform group-hover/btn:scale-110" />
                    <span>Send on Gmail</span>
                    <ArrowRight className="h-3 w-3 shrink-0 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
