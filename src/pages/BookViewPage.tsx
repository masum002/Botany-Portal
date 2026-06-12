import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { ArrowLeft, Loader2, Leaf, Shield, RotateCw, Monitor, Fullscreen, ExternalLink, Download, AlertCircle } from 'lucide-react';

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
  } catch {
    // ignore
  }
  return null;
}

function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("drive.google.com")) {
    try {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export default function BookViewPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfReady, setPdfReady] = useState(false);
  const [pdfEngine, setPdfEngine] = useState<'google-direct' | 'google-server' | 'native'>('google-direct');
  const [mediaType, setMediaType] = useState<'pdf' | 'video' | 'youtube' | 'gdrive' | 'unknown'>('pdf');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    async function loadBookData() {
      try {
        const bookRef = doc(db, 'books', bookId!);
        const docSnap = await getDoc(bookRef);
        if (docSnap.exists()) {
          const bookData = { id: docSnap.id, ...docSnap.data() } as Book;
          setBook(bookData);
          
          const rawLink = bookData.oneDriveLink || '';
          
          // 1. Detect YouTube Video Links
          const ytUrl = getYouTubeEmbedUrl(rawLink);
          if (ytUrl) {
            setMediaType('youtube');
            setMediaUrl(ytUrl);
            setPdfReady(true);
            setLoading(false);
            return;
          }
          
          // 2. Detect Google Drive Docs/Videos Links
          const gdUrl = getGoogleDriveEmbedUrl(rawLink);
          if (gdUrl) {
            setMediaType('gdrive');
            setMediaUrl(gdUrl);
            setPdfReady(true);
            setLoading(false);
            return;
          }
          
          // 3. Query Media Info API on Node proxy server to check true type of OneDrive resource
          try {
            const infoRes = await fetch(`/api/media-info/${bookId}`);
            if (infoRes.ok) {
              const info = await infoRes.json();
              if (info.contentType && info.contentType.startsWith('video/')) {
                setMediaType('video');
                setMediaUrl(`/api/pdf/${bookId}`);
              } else {
                setMediaType('pdf');
                setMediaUrl(`/api/pdf/${bookId}`);
              }
            } else {
              // Guess from extension if API check route fails
              const isVideo = rawLink.toLowerCase().includes('.mp4') || 
                              rawLink.toLowerCase().includes('.mkv') || 
                              rawLink.toLowerCase().includes('.mov') || 
                              rawLink.toLowerCase().includes('.webm');
              setMediaType(isVideo ? 'video' : 'pdf');
              setMediaUrl(`/api/pdf/${bookId}`);
            }
          } catch {
            setMediaType('pdf');
            setMediaUrl(`/api/pdf/${bookId}`);
          }
        } else {
          setErrorMessage("This publication or catalog entry does not exist or was deleted.");
        }
      } catch (error) {
        setErrorMessage("Unable to fetch publication details due to network constraints.");
        handleFirestoreError(error, OperationType.GET, `books/${bookId}`);
      } finally {
        setLoading(false);
      }
    }

    loadBookData();
  }, [bookId]);

  return (
    <div className="min-h-screen bg-[#020908] text-[#e5e7eb] flex flex-col">
      {/* Control bar / header */}
      <div className="bg-[#041210] border-b border-emerald-500/10 px-4 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-2xl relative z-10 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button
            onClick={() => {
              if (book) {
                navigate(`/year/${book.year}`);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center gap-1.5 bg-[#102a23]/40 hover:bg-[#102a23]/80 border border-emerald-500/15 px-3.5 py-2 rounded-xl text-emerald-300 hover:text-emerald-100 font-bold transition-all text-xs uppercase tracking-wider cursor-pointer h-10 shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>ফিরে যান</span>
          </button>
          
          {book && (
            <div className="max-w-md truncate">
              <h1 className="font-serif font-normal text-white text-sm sm:text-base tracking-tight truncate" title={book.title}>
                {book.title}
              </h1>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mt-0.5">
                {mediaType === 'video' || mediaType === 'youtube' ? 'SECURE VIDEO PLAYER' : 'SECURE REPOSITORY STREAM'} • {book.year.replace('-', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Action group: Download and new tab solutions */}
        {book && !loading && !errorMessage && (
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Download button */}
            <a
              href={`/api/pdf/${book.id}?download=true`}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 border border-transparent px-3.5 py-2 rounded-xl text-slate-950 text-xs font-extrabold transition-all shadow-md shadow-emerald-500/15 cursor-pointer h-10"
              title="Download file directly to device"
              download
            >
              <Download className="h-3.5 w-3.5" />
              <span>ডাউনলোড (Download)</span>
            </a>

            {/* View in New tab button (Works 100% on iPhones and Android browsers) */}
            <a
              href={mediaType === 'youtube' || mediaType === 'gdrive' ? book.oneDriveLink : `/api/pdf/${book.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#102a23]/50 hover:bg-[#102a23]/80 border border-emerald-500/20 px-3.5 py-2 rounded-xl text-emerald-300 hover:text-emerald-50 text-xs font-bold transition-all cursor-pointer h-10"
            >
              <Fullscreen className="h-3.5 w-3.5" />
              <span>নতুন ট্যাবে দেখুন (Full Screen)</span>
            </a>
          </div>
        )}
      </div>

      {/* Main viewer workspace */}
      <div className="flex-1 relative flex flex-col bg-[#020807] overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
            <p className="text-[10px] font-mono tracking-widest text-[#99f6e4] uppercase font-bold">Resolving Media Catalog...</p>
          </div>
        ) : errorMessage ? (
          <div className="flex-1 flex items-center justify-center">
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
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
            
            {/* Elegant Engine Toggle Bar for PDF Files only */}
            {mediaType === 'pdf' && (
              <div className="bg-[#03130f] border-b border-emerald-950/60 p-2.5 flex flex-wrap gap-2 items-center justify-between z-20 shrink-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-500 px-2 tracking-wide">ভিউয়ার মোড পরিবর্তন:</span>
                  
                  <button
                    onClick={() => {
                      setPdfEngine('google-direct');
                      setPdfReady(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${pdfEngine === 'google-direct' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 hover:bg-emerald-900/45'}`}
                  >
                    গুগল ভিউয়ার ১
                  </button>

                  <button
                    onClick={() => {
                      setPdfEngine('google-server');
                      setPdfReady(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${pdfEngine === 'google-server' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 hover:bg-emerald-900/45'}`}
                  >
                    গুগল ভিউয়ার ২
                  </button>

                  <button
                    onClick={() => {
                      setPdfEngine('native');
                      setPdfReady(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${pdfEngine === 'native' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/30 hover:bg-emerald-900/45'}`}
                  >
                    ব্রাউজার ফ্রেম
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={book?.oneDriveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-emerald-950 border border-emerald-800/40 px-3 py-1.5 rounded-lg text-[#99f6e4] text-[10px] font-bold uppercase hover:bg-emerald-900 transition-all"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>সরাসরি OneDrive-এ ফাইলটি দেখুন</span>
                  </a>
                </div>
              </div>
            )}

            {/* Embed layout depending on media type */}
            <div className="relative flex-1 w-full bg-[#020807] flex flex-col overflow-hidden">
              
              {/* Media Info Alert banner at the bottom of header if PDF */}
              {mediaType === 'pdf' && (
                <div className="bg-[#020e0a] border-b border-emerald-950/45 px-4 py-1.5 flex items-center justify-center gap-2 text-center text-[10px] sm:text-xs text-emerald-400/90 tracking-wide font-light">
                  <AlertCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>উপরে <b>গুগল ভিউয়ার ১ বা ২</b> সিলেক্ট করলে ফাইলটি খুব দ্রুত ও সুন্দরভাবে মোবাইল স্ক্রিনে লোড হবে।</span>
                </div>
              )}

              {/* Loader overlay for proxy */}
              {!pdfReady && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020807] p-6 text-center">
                  <div className="p-4 bg-[#102a23]/30 border border-emerald-500/10 rounded-2xl mb-4 relative">
                    <Leaf className="h-8 w-8 text-emerald-400 animate-pulse" />
                    <RotateCw className="h-12 w-12 text-emerald-500 border border-transparent absolute inset-0 rounded-full animate-spin border-t-emerald-400" />
                  </div>
                  
                  <h3 className="font-serif text-lg text-white font-normal mb-1">
                    {mediaType === 'video' ? 'Streaming Digital Video Lecture...' : 'পিডিএফ ভিউয়ার লোড হচ্ছে...'}
                  </h3>
                  <p className="text-emerald-100/35 text-[11px] max-w-sm leading-relaxed mb-4 font-light">
                    সার্ভার থেকে ফাইল কানেকশন তৈরি হচ্ছে, অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-2.5">
                    <button
                      onClick={() => setPdfReady(true)}
                      className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 border border-emerald-500/15 bg-emerald-950/40 px-3.5 py-1.5 rounded-lg"
                    >
                      Bypass Loader (লোড বাইপাস)
                    </button>
                    <a
                      href={book?.oneDriveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3.5 py-1.5 rounded-lg"
                    >
                      OneDrive সরাসরি ওপেন
                    </a>
                  </div>
                </div>
              )}

              {/* Layout for 1: NATIVE VIDEO STREAM */}
              {mediaType === 'video' && (
                <div className="w-full h-full flex items-center justify-center bg-black p-2 sm:p-6">
                  <div className="relative w-full max-w-5xl aspect-video rounded-2xl border border-emerald-500/20 bg-black shadow-[0_0_80px_rgba(16,185,129,0.12)] overflow-hidden">
                    <video
                      src={mediaUrl}
                      controls
                      className="w-full h-full object-contain"
                      preload="auto"
                      onCanPlay={() => setPdfReady(true)}
                      onLoadStart={() => setPdfReady(false)}
                      referrerPolicy="no-referrer"
                      autoPlay
                    >
                      Your browser does not support the video playback pipeline. Please try the download links.
                    </video>
                  </div>
                </div>
              )}

              {/* Layout for 2: YOUTUBE VIDEO EMBED */}
              {mediaType === 'youtube' && (
                <div className="w-full h-full flex items-center justify-center bg-black p-2 sm:p-6">
                  <div className="relative w-full max-w-5xl aspect-video rounded-2xl border border-emerald-500/20 bg-black shadow-[0_0_80px_rgba(16,185,129,0.12)] overflow-hidden">
                    <iframe
                      src={mediaUrl}
                      title={book?.title}
                      className="absolute top-0 left-0 w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      onLoad={() => setPdfReady(true)}
                    />
                  </div>
                </div>
              )}

              {/* Layout for 3: GOOGLE DRIVE EMBED */}
              {mediaType === 'gdrive' && (
                <div className="w-full h-full bg-black">
                  <iframe
                    src={mediaUrl}
                    title={book?.title}
                    className="w-full h-full border-none"
                    allow="autoplay"
                    onLoad={() => setPdfReady(true)}
                  />
                </div>
              )}

              {/* Layout for 4: PDF VIEWER IFRAME with dynamic engine support */}
              {mediaType === 'pdf' && (
                <div className="w-full h-full relative">
                  <iframe
                    key={pdfEngine}
                    src={
                      pdfEngine === 'google-direct'
                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(book?.oneDriveLink || '')}&embedded=true`
                        : pdfEngine === 'google-server'
                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + mediaUrl)}&embedded=true`
                        : `${mediaUrl}#toolbar=0&navpanes=0`
                    }
                    className="w-full h-full border-none absolute inset-0"
                    title={book?.title}
                    onLoad={() => {
                      setTimeout(() => setPdfReady(true), 1500);
                    }}
                  />
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
