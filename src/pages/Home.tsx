import { useNavigate } from 'react-router-dom';
import { Compass, Award, Library, ChevronRight, Leaf, GraduationCap } from 'lucide-react';
import { useSettings } from '../components/SettingsContext';

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const honorYears = [
    {
      id: '1st-year',
      title: '১ম বর্ষ (First Year)',
      badge: 'Volume I',
      accentColor: 'hover:border-emerald-400',
      activeShadow: 'active:shadow-[0_2px_0_0_#047857] shadow-[0_8px_0_0_#059669]',
      glow: 'group-hover:bg-emerald-500/10',
    },
    {
      id: '2nd-year',
      title: '২য় বর্ষ (Second Year)',
      badge: 'Volume II',
      accentColor: 'hover:border-teal-400',
      activeShadow: 'active:shadow-[0_2px_0_0_#0d9488] shadow-[0_8px_0_0_#0f766e]',
      glow: 'group-hover:bg-teal-500/10',
    },
    {
      id: '3rd-year',
      title: '৩য় বর্ষ (Third Year)',
      badge: 'Volume III',
      accentColor: 'hover:border-cyan-400',
      activeShadow: 'active:shadow-[0_2px_0_0_#0891b2] shadow-[0_8px_0_0_#0e7490]',
      glow: 'group-hover:bg-cyan-500/10',
    },
    {
      id: '4th-year',
      title: '৪র্থ বর্ষ (Fourth Year)',
      badge: 'Volume IV',
      accentColor: 'hover:border-[#34d399]',
      activeShadow: 'active:shadow-[0_2px_0_0_#059669] shadow-[0_8px_0_0_#047857]',
      glow: 'group-hover:bg-[#34d399]/10',
    },
  ];

  return (
    <div id="home-container" className="min-h-screen bg-[#020a08] text-[#e5e7eb] pb-28 relative overflow-hidden">
      {/* 3D Grid background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(16,185,129,0.015)_1px,transparent_1px),linear-gradient(to_right,rgba(16,185,129,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [perspective:1000px] pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main App Hero Banner */}
      <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-900/10">
            <Leaf className="h-3 w-3 text-[#34d399] animate-spin" />
            <span>লাইভ অনার্স আর্কাইভ</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl text-white tracking-tight font-extrabold uppercase drop-shadow-[0_5px_15px_rgba(0,0,0,0.6)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#99f6e4]">{settings.appName}</span>
          </h1>
          
          <p className="text-emerald-100/50 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            জাতীয় বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান অনার্স শিক্ষার্থীদের সিলেবাস-ভিত্তিক রেফারেন্স বই ও লেকচার নোটস সহজে ভিউ ও স্টাডি করার ড্যাশবোর্ড।
          </p>
        </div>
      </section>

      {/* Structured stacked vertically list */}
      <section className="max-w-md mx-auto px-4 py-2 relative z-10">
        <div className="flex flex-col gap-6">
          {honorYears.map((year) => {
            return (
              <div
                key={year.id}
                onClick={() => navigate(`/year/${year.id}`)}
                className={`group relative flex items-center justify-between bg-gradient-to-r from-[#0b1d19]/90 to-[#041210]/95 border border-emerald-500/20 rounded-2xl p-5 cursor-pointer transform transition-all duration-150 ease-out ${year.accentColor} ${year.activeShadow} hover:-translate-y-1 active:translate-y-[4px] select-none hover:rotate-1`}
              >
                {/* Embedded Glow Ring */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${year.glow} pointer-events-none`}></div>

                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/20 rounded-xl text-emerald-400 group-hover:text-emerald-300 group-hover:scale-110 transition-all duration-150">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono font-bold text-[#a7f3d0] tracking-wider block mb-0.5 opacity-60">
                      {year.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif text-white font-semibold transition-colors duration-200 group-hover:text-emerald-300 select-text">
                      {year.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-[#99f6e4] font-mono font-semibold uppercase tracking-wider group-hover:text-white transition-colors duration-150 relative z-10 bg-emerald-950/40 border border-emerald-500/15 py-1.5 px-3 rounded-lg">
                  <span>স্টাডি করুন</span>
                  <ChevronRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
