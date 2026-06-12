import { Leaf, GraduationCap, Globe, BookOpen, Compass, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] pb-24">
      {/* Intro Hero banner */}
      <section className="py-24 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.3),transparent_60%)]"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <Link 
            to="/" 
            className="text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-2 inline-block transition-colors"
          >
            ← Back to Portal Core
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">About Botany Honors</h1>
          <p className="text-emerald-100/50 mt-4 max-w-xl mx-auto leading-relaxed text-sm font-light">
            Pioneering digital curriculum organization, systematic plant mapping, and secure scholarly document archives.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-4 mt-10 leading-relaxed space-y-16">
        
        {/* Mission Statement */}
        <div className="p-8 sm:p-12 bg-[#102a23]/30 rounded-2xl border border-emerald-400/10 flex flex-col md:flex-row gap-8 items-center">
          <div className="p-4 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <GraduationCap className="h-10 w-10" />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-2xl text-white">Supporting Noble Botany Scholars</h2>
            <p className="text-emerald-100/60 text-sm leading-relaxed font-light">
              Botany Honors is a specialized digital academic resource portal curated specifically to consolidate high-level curricula and research references for Botany scholars. Botany honors study comprises advanced biological disciplines — ranging from microbiology, genetics, tissue cultivation, to cellular taxonomy — often requiring rare reference texts. This site bridges the availability gap.
            </p>
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#102a23]/20 p-6 rounded-xl border border-emerald-400/10 relative space-y-3">
            <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-lg w-fit">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-white">Curated Materials</h3>
            <p className="text-emerald-100/40 text-xs leading-relaxed font-light">
              Comprehensive assembly of academic syllabus-compliant books selected from departmental references.
            </p>
          </div>

          <div className="bg-[#102a23]/20 p-6 rounded-xl border border-emerald-400/10 relative space-y-3">
            <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 rounded-lg w-fit">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-white">OneDrive Mapping</h3>
            <p className="text-emerald-100/40 text-xs leading-relaxed font-light">
              Consolidated cloud storage organization linked securely via backend route masking to guard intellectual assets.
            </p>
          </div>

          <div className="bg-[#102a23]/20 p-6 rounded-xl border border-emerald-400/10 relative space-y-3">
            <div className="p-3 bg-emerald-950/40 text-[#99f6e4] border border-emerald-800/30 rounded-lg w-fit">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg text-white">Realtime Sync</h3>
            <p className="text-emerald-100/40 text-xs leading-relaxed font-light">
              Instant updates driven by Google Firestore, bringing new textbooks to students seamlessly as they are added.
            </p>
          </div>
        </div>

        {/* Academic Note */}
        <div className="border-l-2 border-emerald-500 pl-6 space-y-3">
          <h3 className="font-serif text-lg text-white">Curator's Scientific Note</h3>
          <p className="text-emerald-100/70 text-sm leading-relaxed italic font-light">
            "Plant biology dictates the core of earthly biosphere dynamics. Understanding the physiology, cellular structures, environmental behavior, and global systematics of flora is critical for modern agricultural resilience and climate management. This platform ensures that honors students have immediate, uninterrupted, and secure access to required literature."
          </p>
          <span className="text-[10px] font-bold font-mono tracking-widest text-[#99f6e4] block uppercase">— Professor mahfujar003, Lead Department Curator</span>
        </div>

      </section>
    </div>
  );
}
