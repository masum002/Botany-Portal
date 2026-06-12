import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { ArrowLeft, Loader2, Leaf, Shield, RotateCw, Monitor, Fullscreen, ExternalLink } from 'lucide-react';

export default function BookViewPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    async function loadBookData() {
      try {
        const bookRef = doc(db, 'books', bookId!);
        const docSnap = await getDoc(bookRef);
        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book);
        } else {
          setErrorMessage("This textbook catalog entry does not exist or was deleted.");
        }
      } catch (error) {
        setErrorMessage("Unable to fetch textbook details due to network constraints.");
        handleFirestoreError(error, OperationType.GET, `books/${bookId}`);
      } finally {
        setLoading(false);
      }
    }

    loadBookData();
  }, [bookId]);

  const pdfProxyUrl = `/api/pdf/${bookId}`;

  return (
    <div className="min-h-screen bg-[#020908] text-[#e5e7eb] flex flex-col">
      {/* Control bar / header */}
      <div className="bg-[#041210] border-b border-emerald-500/10 px-4 py-4 flex items-center justify-between shadow-2xl relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (book) {
                navigate(`/year/${book.year}`);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-1 bg-[#102a23]/40 hover:bg-[#102a23]/80 border border-emerald-500/15 px-3.5 py-2 rounded-xl text-emerald-300 hover:text-emerald-100 font-bold transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Return to Catalog</span>
          </button>
          
          {book && (
            <div className="max-w-md sm:max-w-xl truncate">
              <h1 className="font-serif font-normal text-white text-base sm:text-lg tracking-tight truncate" title={book.title}>
                {book.title}
              </h1>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mt-0.5">
                SECURE PDF VIEW • {book.year.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#041210] border border-emerald-900/30 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Encrypted Stream Pipeline</span>
          </div>
        </div>
      </div>

      {/* Main viewer workspace */}
      <div className="flex-1 relative flex items-center justify-center bg-[#020908]">
        {loading ? (
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
            <p className="text-[10px] font-mono tracking-widest text-[#99f6e4] uppercase font-bold">Resolving Book Metadata...</p>
          </div>
        ) : errorMessage ? (
          <div className="max-w-md text-center p-8 bg-[#102a23]/10 border border-emerald-400/10 rounded-2xl mx-4 space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl w-fit mx-auto">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="font-serif text-xl font-normal text-white">Security / Loading Fault</h2>
            <p className="text-emerald-100/40 text-sm leading-relaxed font-light">{errorMessage}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-emerald-500 text-slate-950 font-bold py-2.5 px-5 rounded-full text-xs uppercase tracking-wider"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="w-full h-full absolute inset-0 flex flex-col justify-between">
            {/* Embedded masked stream */}
            <div className="relative flex-1 w-full h-full bg-[#020908]">
              
              {!pdfReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020908] p-6 text-center">
                  <div className="p-4 bg-[#102a23]/30 border border-emerald-500/10 rounded-2xl mb-6 relative">
                    <Leaf className="h-12 w-12 text-emerald-400 animate-pulse" />
                    <RotateCw className="h-16 w-16 text-emerald-500 border border-transparent absolute inset-0 rounded-full animate-spin border-t-emerald-400" />
                  </div>
                  
                  <h3 className="font-serif text-2xl text-white font-normal mb-2">Streaming Textbook Safely</h3>
                  <p className="text-emerald-100/40 text-sm max-w-sm leading-relaxed mb-1 font-light">
                    The department server is fetching and caching file packets from OneDrive storage...
                  </p>
                  <p className="text-emerald-400 text-[9px] uppercase font-mono font-bold tracking-widest animate-pulse">
                    Routing pipeline masked inside host wrapper
                  </p>
                  
                  <button
                    onClick={() => setPdfReady(true)}
                    className="mt-8 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 border border-emerald-500/15 bg-emerald-950/40 px-4 py-2 rounded-lg"
                  >
                    Bypass and force load frame
                  </button>
                </div>
              )}

              <iframe
                src={`${pdfProxyUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={book?.title}
                onLoad={() => {
                  // Wait brief buffer to allow streaming chunks to parse
                  setTimeout(() => setPdfReady(true), 2100);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
