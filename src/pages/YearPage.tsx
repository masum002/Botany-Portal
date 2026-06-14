import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { BookOpen, ArrowLeft, Loader2, Sparkles, AlertCircle, FileText } from 'lucide-react';
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => window.open(book.oneDriveLink, '_blank')}
                  className="bg-gradient-to-br from-[#0c231e] to-[#041210] rounded-3xl border border-emerald-500/10 hover:border-emerald-400/30 overflow-hidden shadow-2xl hover:shadow-[0_20px_45px_rgba(16,185,129,0.15)] hover:-translate-y-1.5 active:translate-y-0.5 transition-all duration-300 flex flex-col justify-between group h-full cursor-pointer relative"
                >
                  <div className="p-6 flex-1 flex flex-col justify-start">
                    {/* Visual 3D Book Display Case */}
                    <div className="bg-[#030d0b] border border-emerald-950/60 rounded-2xl p-6 mb-6 flex items-center justify-center relative overflow-hidden h-60 group-hover:bg-[#030d0b]/80 transition-colors">
                      {/* Interactive background vector */}
                      <div className="absolute right-0 bottom-0 translate-x-5 translate-y-5 opacity-5">
                        <BookOpen className="h-32 w-32 text-emerald-400" />
                      </div>
                      
                      {/* 3D Flex row container */}
                      <div className="flex items-center justify-center gap-5 sm:gap-6 w-full h-full relative z-10 select-none">
                        {/* Book Cover Left Side */}
                        <div className="shrink-0">
                          {book.coverUrl ? (
                            <div className="relative group/cover transition-transform duration-300 transform group-hover:scale-110 group-hover:rotate-2 group-hover:-translate-x-1 shadow-[5px_10px_20px_rgba(0,0,0,0.6)] group-hover:shadow-emerald-500/10 rounded-l-[4px] rounded-r-[6px]">
                              {/* Realistic outer spine and paper edge shadow */}
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/45 z-20 rounded-l-md"></div>
                              <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-white/10 z-20"></div>
                              {/* Outer page side edge */}
                              <div className="absolute right-0 top-[2px] bottom-[2px] w-[3px] bg-white/20 z-10 rounded-r-md"></div>
                              
                              <img 
                                src={book.coverUrl} 
                                alt={book.title} 
                                referrerPolicy="no-referrer"
                                className="h-36 w-24 object-cover rounded-l-[4px] rounded-r-[6px]"
                              />
                              {/* Soft front crease reflection */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-40 rounded-l-md pointer-events-none"></div>
                            </div>
                          ) : (
                            <div className="relative w-24 h-36 bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-500/20 text-emerald-400 rounded-l-[4px] rounded-r-[6px] flex flex-col items-center justify-center shadow-[6px_8px_18px_rgba(0,0,0,0.7)] p-3 group-hover:scale-105 group-hover:rotate-2 group-hover:-translate-x-1 transition-transform duration-300">
                              {/* Fake cover features */}
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-black/40 rounded-l-md"></div>
                              <FileText className="h-10 w-10 mb-1 text-emerald-400/80" />
                              <span className="text-[8px] font-mono font-black uppercase tracking-widest text-emerald-300 text-center leading-tight">BOTANY CODE</span>
                            </div>
                          )}
                        </div>

                        {/* Open Book modern Glass-badge Right Side */}
                        <div className="flex flex-col items-start gap-2">
                          <div className="relative transform transition-all duration-300 group-hover:translate-x-1 group-hover:scale-105">
                            {/* Inner ambient glow background */}
                            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur-md opacity-20 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                            
                            {/* 3D Styled Action Container */}
                            <div className="relative flex items-center gap-2 bg-[#051a15]/95 border border-emerald-500/30 px-3 py-2.5 rounded-xl shadow-lg group-hover:border-emerald-300/60 transition-all">
                              <BookOpen className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 animate-bounce" />
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-wider text-white font-mono leading-none">
                                  Open Book
                                </span>
                                <span className="text-[7px] text-[#34d399] tracking-widest uppercase font-bold mt-0.5 font-mono">
                                  পড়ুন
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Subtle active category badge below */}
                          <span className="text-[7px] font-mono font-bold text-emerald-400/50 uppercase tracking-widest pl-1 mt-1 bg-emerald-950/40 border border-emerald-500/10 px-2 py-0.5 rounded">
                            PDF SOURCE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Book Name Title embedded into a beautiful interactive Button block (centered) */}
                    <div className="w-full mt-auto block text-center">
                      <div className="w-full relative py-4 px-3 bg-[#020b09] border border-emerald-500/15 rounded-2xl group-hover:border-emerald-400/40 group-hover:bg-[#051713] transition-all duration-300 overflow-hidden shadow-inner group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)] flex flex-col items-center justify-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent group-hover:w-24 transition-all duration-300"></div>
                        
                        <span className="block font-serif text-teal-100 group-hover:text-emerald-300 text-xs sm:text-sm font-semibold line-clamp-3 leading-relaxed tracking-wide transition-colors duration-300 transform group-hover:scale-[1.02]">
                          {book.title}
                        </span>

                        {/* Interactive floating indicator dots at the bottom */}
                        <div className="flex justify-center items-center gap-1.5 mt-3 opacity-45 group-hover:opacity-100 transition-opacity duration-305">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-ping"></span>
                          <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                            TAP TO LAUNCH
                          </span>
                        </div>
                      </div>
                    </div>
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
