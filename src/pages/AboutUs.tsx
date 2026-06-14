import { Leaf, GraduationCap, BookOpen, Compass, Award, Facebook, Mail, MessageCircle, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../components/SettingsContext';

export default function AboutUs() {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-[#020b09] text-[#e5e7eb] pb-24 relative overflow-hidden">
      {/* 3D Grid background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [perspective:1000px] pointer-events-none"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-[#99f6e4]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Intro Hero banner */}
      <section className="py-16 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.15),transparent_70%)]"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <Link 
            to="/" 
            className="group inline-flex items-center gap-2 text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-4 transition-all"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/20 rounded-full text-[10px] font-mono tracking-widest text-[#99f6e4] uppercase mb-1">
            <Sparkles className="h-3 w-3 animate-pulse text-[#99f6e4]" /> Dynamic Curriculum Hub
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight uppercase drop-shadow-lg">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#99f6e4] font-medium">{settings.appName}</span>
          </h1>
          <p className="text-emerald-100/50 max-w-xl mx-auto leading-relaxed text-sm font-light">
            An advanced digital library system designed for honors botanical research, featuring persistent cloud text indexes and streamlined OneDrive gateways.
          </p>
        </div>
      </section>

      {/* Main Content Grid with 3D Vibe */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Developer Profile - 3D Card Vibe */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b1d19]/80 rounded-3xl p-8 border border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
              {/* Outer Glow Line decoration */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Profile Image with 3D Border Shape */}
              <div className="relative w-44 h-44 mx-auto rounded-2xl overflow-hidden mb-6 border-2 border-emerald-400/30 shadow-[0_15px_30px_rgba(0,0,0,0.4)] group-hover:border-emerald-400/80 group-hover:shadow-[0_15px_30px_rgba(16,185,129,0.2)] transition-all duration-300 [transform-style:preserve-3d]">
                <img 
                  src={settings.developerPhotoUrl} 
                  alt={settings.developerName} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d19] via-transparent to-transparent opacity-40"></div>
              </div>

              {/* Developer Info */}
              <div className="text-center space-y-2">
                <span className="text-[9px] font-mono tracking-widest text-[#99f6e4] bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-md uppercase font-bold">
                  {settings.developerTitle}
                </span>
                <h2 className="font-serif text-2xl text-white font-normal mt-3 tracking-tight group-hover:text-[#99f6e4] transition-colors">
                  {settings.developerName}
                </h2>
                
                {/* Developer Stylish Intro */}
                <div className="py-4 px-4 bg-[#102a23]/30 rounded-xl border border-emerald-500/10 mt-4 relative">
                  <span className="absolute -top-3 left-4 text-emerald-400 text-2xl font-serif leading-none">“</span>
                  <p className="text-emerald-100/70 text-xs sm:text-sm italic font-light leading-relaxed">
                    {settings.developerDescription}
                  </p>
                  <span className="absolute -bottom-5 right-4 text-emerald-400 text-2xl font-serif leading-none">”</span>
                </div>
              </div>

              {/* Direct Links section */}
              <div className="pt-8 border-t border-emerald-500/10 mt-6 flex justify-center gap-4">
                {settings.developerFacebook && (
                  <a 
                    href={settings.developerFacebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-emerald-950/40 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 rounded-xl transition-all duration-200 text-emerald-400"
                    title="Connect on Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {settings.adminWhatsApp && (
                  <a 
                    href={`https://wa.me/${settings.adminWhatsApp.replace(/[^\d+]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="p-3 bg-emerald-950/40 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 rounded-xl transition-all duration-200 text-emerald-400"
                    title="Chat on WhatsApp"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                )}
                {settings.contactEmail && (
                  <a 
                    href={`mailto:${settings.contactEmail}`} 
                    className="p-3 bg-emerald-950/40 hover:bg-emerald-500 hover:text-emerald-950 border border-emerald-500/20 rounded-xl transition-all duration-200 text-emerald-400"
                    title="Send Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bistarito (Detailed Research Bio) & Academy Pillars */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Detailed Description Panel - Glassmorphic 3D vibe */}
            <div className="bg-[#0b1d19]/40 rounded-3xl p-8 sm:p-10 border border-emerald-500/10 relative overflow-hidden shadow-xl">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-[0.03]">
                <Leaf className="h-56 w-56 text-emerald-400 rotate-45" />
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-[#99f6e4]">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl text-white font-normal tracking-tight">Curation Framework & Detailed Review</h3>
              </div>

              {/* Bistarito Details */}
              <div className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed font-light space-y-4 whitespace-pre-wrap select-text pl-1 border-l border-emerald-500/20">
                {settings.aboutDetailed}
              </div>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0b1d19]/20 hover:bg-[#0b1d19]/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 relative group text-left">
                <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-900/30 transition-colors">
                  <BookOpen className="h-4 w-4" />
                </div>
                <h4 className="font-serif text-md text-white font-medium mb-1.5">Acclaimed Guides</h4>
                <p className="text-emerald-100/40 text-[11px] leading-relaxed font-light">
                  Direct mapping of botany references directly corresponding to Honors syllabi modules.
                </p>
              </div>

              <div className="bg-[#0b1d19]/20 hover:bg-[#0b1d19]/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 relative group text-left">
                <div className="p-2.5 bg-emerald-950/40 text-emerald-400 border border-emerald-500/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-900/30 transition-colors">
                  <Compass className="h-4 w-4" />
                </div>
                <h4 className="font-serif text-md text-white font-medium mb-1.5">OneDrive Vault</h4>
                <p className="text-emerald-100/40 text-[11px] leading-relaxed font-light">
                  Files are curated in resilient Cloud OneDrive accounts with direct sharing codes.
                </p>
              </div>

              <div className="bg-[#0b1d19]/20 hover:bg-[#0b1d19]/50 p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-200 relative group text-left">
                <div className="p-2.5 bg-emerald-950/40 text-[#99f6e4] border border-emerald-500/10 rounded-lg w-fit mb-4 group-hover:bg-emerald-900/30 transition-colors">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h4 className="font-serif text-md text-white font-medium mb-1.5">Zero-Trust Logs</h4>
                <p className="text-emerald-100/40 text-[11px] leading-relaxed font-light">
                  Secured with real-time Firestore database architectures, safeguarding academic registries.
                </p>
              </div>
            </div>

            {/* Systematic Botany Note */}
            <div className="p-6 bg-emerald-950/10 border-l-2 border-emerald-500 pl-6 rounded-r-2xl">
              <h4 className="font-serif text-white font-normal text-md mb-2">Academic Protocol Statement</h4>
              <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed italic font-light">
                "Botanical education is a structural gateway to modern environmental science. Aligning digitized archives with honors curricula establishes an optimized environment for high-altitude research studies and systematic plant study."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[#99f6e4]" />
                <span className="text-[10px] font-bold font-mono tracking-widest text-[#99f6e4] uppercase">{settings.developerName}</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    </div>
  );
}
