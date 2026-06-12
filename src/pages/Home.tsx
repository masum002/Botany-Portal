import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { Search, Compass, Award, Library, BookOpen, ChevronRight, Leaf } from 'lucide-react';
import { useSettings } from '../components/SettingsContext';

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'books'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksList: Book[] = [];
      snapshot.forEach((doc) => {
        booksList.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(booksList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });
    return unsubscribe;
  }, []);

  const filteredBooks = searchQuery.trim() === '' 
    ? [] 
    : books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const honorYears = [
    {
      id: '1st-year',
      title: '১ম বর্ষ',
      subTitle: 'First Year',
      description: 'Microbiology, Phycology, Mycology, Plant Pathology.',
      badge: 'Volume I',
      decor: 'Border-emerald-500/25',
    },
    {
      id: '2nd-year',
      title: '২য় বর্ষ',
      subTitle: 'Second Year',
      description: 'Bryophytes, Pteridophytes, Gymnosperms, Anatomy.',
      badge: 'Volume II',
      decor: 'border-teal-500/25',
    },
    {
      id: '3rd-year',
      title: '৩য় বর্ষ',
      subTitle: 'Third Year',
      description: 'Plant Physiology, Biochemistry, Genetics, Ecology.',
      badge: 'Volume III',
      decor: 'border-cyan-500/25',
    },
    {
      id: '4th-year',
      title: '৪র্থ বর্ষ',
      subTitle: 'Fourth Year',
      description: 'Angiosperm Taxonomy, Phytogeography, Conservation.',
      badge: 'Volume IV',
      decor: 'border-[#34d399]/25',
    },
  ];

  return (
    <div id="home-container" className="min-h-screen bg-[#020a08] text-[#e5e7eb] pb-28 relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main App Hero Banner */}
      <section className="relative pt-16 pb-8 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
            <Leaf className="h-3 w-3 text-emerald-400 animate-bounce" />
            <span>লাইভ অনার্স আর্কাইভ</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-5xl text-white tracking-tight font-black uppercase">
            {settings.appName}
          </h1>
          
          <p className="text-emerald-100/50 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
            জাতীয় বিশ্ববিদ্যালয়ের উদ্ভিদবিজ্ঞান অনার্স শিক্ষার্থীদের সিলেবাস-ভিত্তিক রেফারেন্স বই ও লেকচার নোটস সহজে ভিউ ও স্টাডি করার ড্যাশবোর্ড।
          </p>

          {/* Clean Rounded Search Engine */}
          <div className="max-w-md mx-auto w-full relative pt-4">
            <div className="relative">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="বইয়ের নাম, লেখক অথবা কন্টেন্ট সার্চ করুন..."
                className="w-full pl-11 pr-5 py-2.5 bg-emerald-950/20 border border-emerald-900/35 rounded-2xl text-white placeholder-emerald-100/30 focus:bg-emerald-950/45 focus:border-emerald-400 focus:outline-none text-xs transition-all h-[44px]"
              />
            </div>

            {/* In-app Search Result Drawer */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#041210] rounded-2xl border border-emerald-500/20 shadow-[0_15px_40px_rgba(2,10,8,0.9)] overflow-hidden text-left z-30 max-h-72 overflow-y-auto">
                <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/30 text-[8px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  অনুসন্ধান ফলাফল ({filteredBooks.length})
                </div>
                {filteredBooks.length > 0 ? (
                  <div className="divide-y divide-emerald-950/40">
                    {filteredBooks.map((book) => (
                      <a
                        key={book.id}
                        href={book.oneDriveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full px-4 py-3 hover:bg-emerald-900/30 flex items-start gap-2.5 text-left transition-colors cursor-pointer group"
                      >
                        <BookOpen className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-100 group-hover:text-emerald-300 text-xs">{book.title}</p>
                          <span className="text-[8px] font-mono font-bold text-[#34d399] uppercase bg-emerald-950 border border-emerald-900/40 px-2 py-0.5 rounded-full inline-block mt-1">
                            {book.year.replace('-', ' ')}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-emerald-100/40 text-xs">
                    কোন কন্টেন্ট খুঁজে পাওয়া যায়নি!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid: 4 Core Honors Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {honorYears.map((year) => {
            return (
              <div
                key={year.id}
                onClick={() => navigate(`/year/${year.id}`)}
                className={`group flex flex-col justify-between bg-emerald-950/15 hover:bg-emerald-950/30 border ${year.decor} rounded-2xl p-5 sm:p-6 transition-all duration-300 cursor-pointer h-40 relative`}
              >
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono font-bold text-[#a7f3d0] bg-emerald-900/45 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {year.badge}
                  </span>
                  <h3 className="text-lg sm:text-xl font-serif text-white font-medium group-hover:text-emerald-300 transition-colors">
                    {year.title}
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-emerald-100/40 leading-snug line-clamp-2">
                    {year.description}
                  </p>
                  <div className="flex items-center justify-between text-[8px] text-emerald-400 font-mono font-bold uppercase tracking-wider group-hover:text-emerald-300">
                    <span>স্টাডি করুন</span>
                    <ChevronRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
