import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { BookOpen, ArrowLeft, Loader2, Sparkles, AlertCircle, FileText, Heart } from 'lucide-react';
import { useSettings } from '../components/SettingsContext';

export default function YearPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const yearsMetadata: { [key: string]: { title: string; desc: string; accent: string } } = {
    '1st-year': {
      title: '১ম বর্ষ (First Year)',
      desc: 'উদ্ভিদবিজ্ঞান ১ম বর্ষের সকল একাডেমিক টেক্সট বুক ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-emerald-500 bg-emerald-500/5',
    },
    '2nd-year': {
      title: '২য় বর্ষ (Second Year)',
      desc: 'উদ্ভিদবিজ্ঞান ২য় বর্ষের সকল একাডেমিক টেক্সট বুক ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-teal-500 bg-teal-500/5',
    },
    '3rd-year': {
      title: '৩য় বর্ষ (Third Year)',
      desc: 'উদ্ভিদবিজ্ঞান ৩য় বর্ষের সকল একাডেমিক টেক্সট বুক ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-cyan-500 bg-cyan-500/5',
    },
    '4th-year': {
      title: '৪র্থ বর্ষ (Fourth Year)',
      desc: 'উদ্ভিদবিজ্ঞান ৪র্থ বর্ষের সকল একাডেমিক টেক্সট বুক ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-green-500 bg-green-500/5',
    },
  };

  const currentYearInfo = yearsMetadata[id || ''] || {
    title: 'Honors Botanical Library',
    desc: 'Browse dynamic textbooks cataloged for premium undergraduate scholars.',
    accent: 'border-emerald-600 bg-[#102a23]/5',
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // Realtime listener for books matching this academic stage
    const q = query(collection(db, 'books'), where('year', '==', id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const yearBooks: Book[] = [];
      snapshot.forEach((doc) => {
        yearBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(yearBooks);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `books?year=${id}`);
    });

    return unsubscribe;
  }, [id]);

  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] pb-24">
      {/* Visual Header Grid Accent */}
      <div className="py-20 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.3),transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>হোম ড্যাশবোর্ড</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">{currentYearInfo.title}</h1>
          <p className="text-emerald-100/50 text-sm max-w-2xl mx-auto leading-relaxed font-light">{currentYearInfo.desc}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
            <p className="text-[10px] text-emerald-300 font-mono font-bold tracking-widest uppercase">Fetching Botanical Codices...</p>
          </div>
        ) : books.length > 0 ? (
          <div>
            <div className="flex items-center justify-between border-b border-emerald-950/40 pb-4 mb-8">
              <span className="text-xs text-emerald-100/40 font-light">Available Resources: <strong className="text-[#99f6e4] font-medium">{books.length} Textbooks</strong></span>
              <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 font-bold px-2.5 py-1 tracking-wider uppercase font-mono rounded-full">Live Sync Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => window.open(book.oneDriveLink, '_blank')}
                  className="bg-gradient-to-br from-[#0b211c] to-[#041210] rounded-3xl border border-emerald-500/10 hover:border-emerald-400/35 overflow-hidden shadow-2xl hover:shadow-[0_24px_55px_rgba(16,185,129,0.22)] hover:-translate-y-2 active:translate-y-0.5 transition-all duration-300 p-5 group cursor-pointer relative flex flex-col justify-between min-h-[290px]"
                >
                  {/* Neon dynamic spotlight sweeping effect */}
                  <div className="absolute top-2 right-1 w-full h-[150px] bg-gradient-to-bl from-emerald-400/25 via-emerald-500/5 to-transparent rounded-bl-full blur-[10px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300 animate-light-beam"></div>

                  <div className="flex items-stretch gap-5 w-full h-full select-none relative z-10">
                    
                    {/* Book Cover Left Side (Shifted left, larger, very elegant 3D book texture) */}
                    <div className="shrink-0">
                      {book.coverUrl ? (
                        <div className="relative group/cover transition-all duration-300 transform group-hover:scale-[1.06] group-hover:rotate-1 shadow-[8px_16px_30px_rgba(0,0,0,0.8)] rounded-l-[4px] rounded-r-[8px] overflow-hidden">
                          {/* Realistic outer spine and paper edge shadow */}
                          <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-black/50 z-20 rounded-l-md"></div>
                          <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-white/15 z-20"></div>
                          {/* Outer page side edge */}
                          <div className="absolute right-0 top-[2px] bottom-[2px] w-[3px] bg-white/20 z-10 rounded-r-md"></div>
                          
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            referrerPolicy="no-referrer"
                            className="h-48 sm:h-52 w-32 sm:w-36 object-cover rounded-l-[4px] rounded-r-[8px]"
                          />
                          {/* Soft front crease reflection */}
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-40 rounded-l-md pointer-events-none"></div>
                        </div>
                      ) : (
                        <div className="relative w-32 sm:w-36 h-48 sm:h-52 bg-gradient-to-b from-[#0c2e27] to-[#031512] border border-emerald-500/20 text-emerald-400 rounded-l-[4px] rounded-r-[8px] flex flex-col items-center justify-center p-3 relative shadow-inner group-hover:scale-[1.06] transition-transform duration-300">
                          {/* Fake cover features */}
                          <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-black/45 z-20 rounded-l-md"></div>
                          <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-white/15 z-20"></div>
                          
                          <FileText className="h-12 w-12 mb-2 text-emerald-400/80" />
                          <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#34d399] text-center leading-tight">DEPARTMENT</span>
                          <span className="text-[7.5px] font-sans text-emerald-100/40 text-center mt-1">BOTANY ARCHIVE</span>
                        </div>
                      )}
                    </div>

                    {/* Meta actions right side */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1 relative">
                      
                      {/* Active Heart/Like Spotlight Source at the top right corner */}
                      <div className="absolute -top-1 -right-1 flex items-center justify-center z-15">
                        <span className="absolute h-6 w-6 rounded-full bg-emerald-500/25 animate-ping"></span>
                        <div className="relative bg-[#06221d] border border-emerald-400/40 rounded-full p-2 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] group-hover:scale-110 group-hover:border-emerald-300 transition-all cursor-pointer">
                          <Heart className="h-3.5 w-3.5 fill-emerald-400/80 animate-heartbeat-pulse" />
                        </div>
                      </div>

                      {/* Title Segment directly above Open Book */}
                      <div className="relative group-hover:translate-x-0.5 transition-transform min-w-0 pr-2 pt-3">
                        {/* Dynamic Sweep overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#34d399]/10 to-transparent h-[40%] w-full blur-sm pointer-events-none animate-laser-scan opacity-0 group-hover:opacity-100"></div>
                        
                        <span className="block text-[8px] font-mono font-bold text-emerald-400/70 group-hover:text-emerald-300 tracking-wider uppercase mb-1">
                          Academic Resource
                        </span>
                        
                        <h3 className="font-serif text-teal-100 group-hover:text-[#a7f3d0] text-xs sm:text-sm font-semibold line-clamp-4 leading-relaxed tracking-wide transition-colors duration-200 border-l-2 border-emerald-500/40 group-hover:border-emerald-400 pl-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-emerald-950/20 py-2 rounded-r-lg">
                          {book.title}
                        </h3>
                      </div>

                      {/* Stylish 3D Open Book Launcher button */}
                      <div className="relative overflow-hidden w-full mt-4 transform transition-all duration-300 group-hover:translate-x-1">
                        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-950/90 to-[#041210]/95 border border-emerald-500/35 group-hover:border-emerald-400/60 py-2.5 px-3 rounded-xl shadow-lg text-emerald-300 group-hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider">
                          <BookOpen className="h-3.5 w-3.5 text-emerald-400 group-hover:text-emerald-300 group-hover:rotate-6 transition-transform" />
                          <span>বইটি পড়ুন</span>
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Interactive footer line indicator */}
                  <div className="w-full flex justify-end items-center gap-1.5 mt-2.5 pt-2 border-t border-emerald-950/40 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[8px] font-mono font-bold text-emerald-400/80 tracking-widest uppercase">
                      TAP TO LAUNCH PDF
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#102a23]/10 rounded-2xl p-16 text-center border border-emerald-400/10 max-w-xl mx-auto mt-12 space-y-6">
            <div className="p-4 bg-emerald-950/60 rounded-xl w-fit mx-auto border border-emerald-800/30 text-emerald-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-2xl text-white">Academic Bookshelf Empty</h2>
            <p className="text-emerald-100/40 text-sm max-w-sm mx-auto font-light leading-relaxed">
              Our department administrators have not yet cataloged books for <strong className="text-emerald-300 capitalize">{id?.replace('-', ' ')}</strong>. Please query the administrator on our Contact page if you need materials immediately.
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 pt-2">
              <Link 
                to="/" 
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest font-mono"
              >
                Back to Dashboard
              </Link>
              <Link 
                to="/contact" 
                className="bg-emerald-500 hover:bg-emerald-400 font-bold text-emerald-950 text-xs px-5 py-3 rounded-xl shadow-lg transition-all uppercase tracking-wider"
              >
                Submit Book Request
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
