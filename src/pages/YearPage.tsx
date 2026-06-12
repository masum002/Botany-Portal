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
      title: 'First Year Botanical Codices',
      desc: 'Elementary Botany foundation textbooks including Fungi, Algae, Archegoniatae, and Plant Pathology.',
      accent: 'border-emerald-500 bg-emerald-500/5',
    },
    '2nd-year': {
      title: 'Second Year Morphology & Anatomy',
      desc: 'Intermediate botanical studies on Vascular cryptogams, Microtechnique, Embryology, and Angiosperm Anatomy.',
      accent: 'border-teal-500 bg-teal-500/5',
    },
    '3rd-year': {
      title: 'Third Year Physiology & Genetics',
      desc: 'Advanced physiological botany covering bio-energetics, metabolic cycles, genetics, and molecular histology.',
      accent: 'border-cyan-500 bg-cyan-500/5',
    },
    '4th-year': {
      title: 'Fourth Year Phytogeography & Conservation',
      desc: 'Advanced research courses, botanical nomenclature taxonomy, agronomy, and environmental conservation.',
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  onClick={() => window.open(book.oneDriveLink, '_blank')}
                  className="bg-[#102a23]/20 rounded-2xl border border-emerald-400/10 hover:border-emerald-400/30 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group h-full cursor-pointer"
                >
                  <div className="p-6 flex-1 flex flex-col justify-start">
                    {/* Cover art/placeholder */}
                    <div className="bg-[#102a23]/30 border border-emerald-500/10 rounded-xl p-8 mb-5 flex items-center justify-center relative overflow-hidden group-hover:bg-[#102a23]/60 transition-colors">
                      <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                        <BookOpen className="h-24 w-24 text-emerald-400" />
                      </div>
                      <div className="text-center relative z-10">
                        {book.coverUrl ? (
                          <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            referrerPolicy="no-referrer"
                            className="h-32 w-24 object-cover mx-auto shadow-md rounded-lg transform group-hover:scale-[1.03] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-20 h-28 mx-auto bg-emerald-950 text-emerald-400 rounded-lg flex flex-col items-center justify-center shadow-md p-3">
                            <FileText className="h-10 w-10 mb-1" />
                            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-300">BOTANY</span>
                          </div>
                        )}
                        <span className="text-[9px] font-bold font-mono text-[#99f6e4] bg-[#041210]/95 border border-emerald-950 px-2.5 py-0.5 mt-4 inline-block uppercase tracking-wider rounded-full">
                          Academic Text
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-lg text-white line-clamp-2 leading-snug group-hover:text-[#99f6e4] transition-colors">
                      {book.title}
                    </h3>
                  </div>

                  <div className="px-6 pb-6 pt-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={book.oneDriveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10 text-xs uppercase tracking-widest"
                    >
                      <BookOpen className="h-4 w-4 text-emerald-950" />
                      <span>Review Textbook</span>
                    </a>
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
