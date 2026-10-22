import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Book, HandNote } from '../types';
import { 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Heart, 
  Download, 
  Upload, 
  Search, 
  Eye, 
  User, 
  Calendar, 
  Filter, 
  Trash2, 
  Share2,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useSettings } from '../components/SettingsContext';
import UploadHandNoteModal from '../components/UploadHandNoteModal';
import { resolveDownloadUrl, triggerDownload } from '../utils/downloadHelper';

export default function YearPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Active section tab: 'books' or 'notes'
  const [activeTab, setActiveTab] = useState<'books' | 'notes'>(id === '3rd-year' ? 'notes' : 'books');

  // Books State
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Hand Notes State
  const [handNotes, setHandNotes] = useState<HandNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  // Search & Filter for Hand Notes
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');

  // Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Admin status check
  const [isAdmin, setIsAdmin] = useState(false);

  // Downloading feedback state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === 'mahfujar003@gmail.com');
    });
    return unsub;
  }, []);

  const yearsMetadata: { [key: string]: { title: string; desc: string; accent: string } } = {
    '1st-year': {
      title: '১ম বর্ষ (First Year)',
      desc: 'উদ্ভিদবিজ্ঞান ১ম বর্ষের সকল একাডেমিক টেক্সট বুক, হ্যান্ডনোট ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-emerald-500 bg-emerald-500/5',
    },
    '2nd-year': {
      title: '২য় বর্ষ (Second Year)',
      desc: 'উদ্ভিদবিজ্ঞান ২য় বর্ষের সকল একাডেমিক টেক্সট বুক, হ্যান্ডনোট ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-teal-500 bg-teal-500/5',
    },
    '3rd-year': {
      title: '৩য় বর্ষ (Third Year)',
      desc: 'উদ্ভিদবিজ্ঞান অনার্স ৩য় বর্ষের স্পেশাল হ্যান্ডনোট, লেকচার শিট, সাজেশন ও রেফারেন্স পাঠ্যবই সংগ্রহশালা।',
      accent: 'border-cyan-500 bg-cyan-500/5',
    },
    '4th-year': {
      title: '৪র্থ বর্ষ (Fourth Year)',
      desc: 'উদ্ভিদবিজ্ঞান ৪র্থ বর্ষের সকল একাডেমিক টেক্সট বুক, গবেষণা নোট ও স্টাডি রিসোর্স আর্কাইভ।',
      accent: 'border-green-500 bg-green-500/5',
    },
  };

  const currentYearInfo = yearsMetadata[id || ''] || {
    title: 'Honors Botanical Library',
    desc: 'Browse dynamic textbooks & hand notes cataloged for undergraduate scholars.',
    accent: 'border-emerald-600 bg-[#102a23]/5',
  };

  // Real-time listener for books
  useEffect(() => {
    if (!id) return;
    setLoadingBooks(true);

    const q = query(collection(db, 'books'), where('year', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const yearBooks: Book[] = [];
      snapshot.forEach((doc) => {
        yearBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(yearBooks);
      setLoadingBooks(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `books?year=${id}`);
      setLoadingBooks(false);
    });

    return unsubscribe;
  }, [id]);

  // Real-time listener for hand notes
  useEffect(() => {
    if (!id) return;
    setLoadingNotes(true);

    const q = query(collection(db, 'handnotes'), where('year', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes: HandNote[] = [];
      snapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as HandNote);
      });
      // Sort in memory by createdAt descending or downloads
      notes.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setHandNotes(notes);
      setLoadingNotes(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `handnotes?year=${id}`);
      setLoadingNotes(false);
    });

    return unsubscribe;
  }, [id]);

  // Download Handler with counter increment
  const handleDownloadNote = async (note: HandNote, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(note.id);

    try {
      // Increment downloadsCount in Firestore
      const noteRef = doc(db, 'handnotes', note.id);
      await updateDoc(noteRef, {
        downloadsCount: increment(1),
      });
    } catch (err) {
      console.warn('Could not increment download counter:', err);
    }

    // Trigger download / open link
    triggerDownload(note.fileUrl, `${note.title}.pdf`);

    setTimeout(() => {
      setDownloadingId(null);
    }, 1200);
  };

  // Delete note (Admin action)
  const handleDeleteNote = async (noteId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('আপনি কি নিশ্চিত যে এই হ্যান্ড নোটটি মুছে ফেলতে চান?')) return;

    try {
      await deleteDoc(doc(db, 'handnotes', noteId));
    } catch (err) {
      alert('নোট মুছে ফেলতে সমস্যা হয়েছে।');
      handleFirestoreError(err, OperationType.DELETE, `handnotes/${noteId}`);
    }
  };

  // Filtered Hand Notes
  const filteredNotes = handNotes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      (note.subject && note.subject.toLowerCase().includes(noteSearch.toLowerCase())) ||
      (note.authorName && note.authorName.toLowerCase().includes(noteSearch.toLowerCase())) ||
      (note.description && note.description.toLowerCase().includes(noteSearch.toLowerCase()));

    const matchesSubject = 
      selectedSubjectFilter === 'ALL' || note.subject === selectedSubjectFilter;

    return matchesSearch && matchesSubject;
  });

  // Extract unique subjects for filter pills
  const availableSubjects = Array.from(
    new Set(handNotes.map((n) => n.subject).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] pb-24">
      {/* Visual Header Grid Accent */}
      <div className="pt-16 pb-12 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.3),transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>হোম ড্যাশবোর্ড</span>
          </Link>
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
              {currentYearInfo.title}
            </h1>
            {id === '3rd-year' && (
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-[#02130e] text-[9px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/20">
                হ্যান্ড নোট স্পেশাল
              </span>
            )}
          </div>
          <p className="text-emerald-100/60 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed font-light">
            {currentYearInfo.desc}
          </p>
        </div>

        {/* PRIMARY TAB SWITCHER: TEXTBOOKS vs HAND NOTES */}
        <div className="mt-8 flex items-center justify-center p-1.5 bg-[#031310] border border-emerald-500/20 rounded-2xl shadow-xl max-w-md w-full relative z-10">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#02130e] shadow-lg shadow-emerald-500/25 font-extrabold'
                : 'text-emerald-200/60 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>📝 হ্যান্ড নোট ({handNotes.length})</span>
            {id === '3rd-year' && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'books'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-[#02130e] shadow-lg shadow-emerald-500/25 font-extrabold'
                : 'text-emerald-200/60 hover:text-white hover:bg-emerald-950/40'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>📚 পাঠ্যবই ({books.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        
        {/* ==================== TAB 1: HAND NOTES (হ্যান্ড নোট) ==================== */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            
            {/* Top Toolbar: Search + Upload Action */}
            <div className="bg-[#071b17]/80 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-400/60" />
                <input
                  type="text"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="টপিক, বিষয় বা লেখকের নাম দিয়ে হ্যান্ডনোট খুঁজুন..."
                  className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-emerald-100/30 focus:outline-none"
                />
                {noteSearch && (
                  <button
                    onClick={() => setNoteSearch('')}
                    className="absolute right-3 top-2.5 text-xs text-emerald-400 hover:text-white"
                  >
                    মুছুন
                  </button>
                )}
              </div>

              {/* Upload New Hand Note Button */}
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#02130e] font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
              >
                <Upload className="h-4 w-4 stroke-[2.5]" />
                <span>+ হ্যান্ড নোট আপলোড করুন</span>
              </button>
            </div>

            {/* Subject Filter Pills */}
            {availableSubjects.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400/70 tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Filter className="h-3 w-3" /> বিষয় ফিল্টার:
                </span>
                <button
                  onClick={() => setSelectedSubjectFilter('ALL')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedSubjectFilter === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-200/70 hover:text-white'
                  }`}
                >
                  সব বিষয় ({handNotes.length})
                </button>
                {availableSubjects.map((sub, idx) => {
                  const count = handNotes.filter((n) => n.subject === sub).length;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSubjectFilter(sub)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedSubjectFilter === sub
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                          : 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-200/70 hover:text-white'
                      }`}
                    >
                      {sub} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {/* Hand Notes Grid or Loader */}
            {loadingNotes ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                <p className="text-[10px] text-emerald-300 font-mono font-bold tracking-widest uppercase">
                  হ্যান্ড নোট আর্কাইভ লোড হচ্ছে...
                </p>
              </div>
            ) : filteredNotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => {
                  const { previewUrl } = resolveDownloadUrl(note.fileUrl);
                  const isDownloading = downloadingId === note.id;

                  return (
                    <div
                      key={note.id}
                      className="bg-gradient-to-br from-[#0c241e] to-[#041310] border border-emerald-500/20 hover:border-emerald-400/40 rounded-3xl p-5 shadow-2xl hover:shadow-[0_20px_45px_rgba(16,185,129,0.18)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* Ambient green corner glow */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full blur-2xl pointer-events-none group-hover:bg-emerald-400/20 transition-all"></div>

                      <div className="space-y-3 relative z-10">
                        {/* Top Meta: Subject Badge + Downloads Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full line-clamp-1 max-w-[200px]">
                            {note.subject || 'উদ্ভিদবিজ্ঞান স্পেশাল'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-emerald-400/80 bg-emerald-950/60 border border-emerald-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Download className="h-2.5 w-2.5" />
                              <span>{note.downloadsCount || 0}</span>
                            </span>

                            {isAdmin && (
                              <button
                                onClick={(e) => handleDeleteNote(note.id, e)}
                                title="হ্যান্ড নোট মুছুন (Admin)"
                                className="p-1 rounded-md text-rose-400/70 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-white group-hover:text-emerald-200 text-sm sm:text-base font-semibold leading-relaxed line-clamp-2 transition-colors">
                          {note.title}
                        </h3>

                        {/* Description (if provided) */}
                        {note.description && (
                          <p className="text-emerald-100/50 text-xs line-clamp-2 font-light leading-relaxed">
                            {note.description}
                          </p>
                        )}

                        {/* Contributor / Author Info */}
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-200/60 font-light">
                          <User className="h-3 w-3 text-emerald-400/70 shrink-0" />
                          <span className="truncate">
                            {note.authorName || 'বিভাগীয় শিক্ষার্থী'}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons (Direct Download + Read/Preview) */}
                      <div className="mt-5 pt-4 border-t border-emerald-950/60 flex items-center gap-2.5 relative z-10">
                        {/* Primary Download Button */}
                        <button
                          onClick={(e) => handleDownloadNote(note, e)}
                          disabled={isDownloading}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#02130e] font-extrabold text-[11px] uppercase tracking-wider py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>ডাউনলোড...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>ডাউনলোড করুন</span>
                            </>
                          )}
                        </button>

                        {/* Secondary View Button */}
                        <button
                          onClick={() => window.open(previewUrl, '_blank')}
                          className="inline-flex items-center justify-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/25 hover:border-emerald-400/50 text-emerald-200 hover:text-white font-bold text-[11px] py-2.5 px-3.5 rounded-xl transition-all cursor-pointer"
                          title="অনলাইনে পড়ুন"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>পড়ুন</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Hand Notes State */
              <div className="bg-[#081f1a]/50 border border-dashed border-emerald-500/20 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white font-normal">
                    {noteSearch ? 'কোনো হ্যান্ড নোট পাওয়া যায়নি' : 'এখনও কোনো হ্যান্ড নোট আপলোড করা হয়নি'}
                  </h3>
                  <p className="text-xs text-emerald-100/50 mt-1.5 leading-relaxed font-light max-w-sm mx-auto">
                    {noteSearch
                      ? `"${noteSearch}" দিয়ে কোনো নোট মিলছে না। ফিল্টার পরিবর্তন করে দেখুন।`
                      : 'আপনি অনার্স ৩য় বর্ষের জন্য প্রথম হ্যান্ড নোট বা লেকচার শিট আপলোড করে সহপাঠীদের সহযোগিতা করতে পারেন!'}
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#02130e] font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <Upload className="h-4 w-4 stroke-[2.5]" />
                  <span>+ প্রথম হ্যান্ড নোটটি আপলোড করুন</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: TEXTBOOKS (পাঠ্যবই) ==================== */}
        {activeTab === 'books' && (
          <div>
            {loadingBooks ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
                <p className="text-[10px] text-emerald-300 font-mono font-bold tracking-widest uppercase">
                  পাঠ্যবই আর্কাইভ লোড হচ্ছে...
                </p>
              </div>
            ) : books.length > 0 ? (
              <div>
                <div className="flex items-center justify-between border-b border-emerald-950/40 pb-4 mb-8">
                  <span className="text-xs text-emerald-100/40 font-light">
                    Available Resources: <strong className="text-[#99f6e4] font-medium">{books.length} Textbooks</strong>
                  </span>
                  <span className="text-[9px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 font-bold px-2.5 py-1 tracking-wider uppercase font-mono rounded-full">
                    Live Sync Active
                  </span>
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
                        {/* Book Cover Left Side */}
                        <div className="shrink-0">
                          {book.coverUrl ? (
                            <div className="relative group/cover transition-all duration-300 transform group-hover:scale-[1.06] group-hover:rotate-1 shadow-[8px_16px_30px_rgba(0,0,0,0.8)] rounded-l-[4px] rounded-r-[8px] overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-black/50 z-20 rounded-l-md"></div>
                              <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-white/15 z-20"></div>
                              <div className="absolute right-0 top-[2px] bottom-[2px] w-[3px] bg-white/20 z-10 rounded-r-md"></div>
                              
                              <img 
                                src={book.coverUrl} 
                                alt={book.title} 
                                referrerPolicy="no-referrer"
                                className="h-48 sm:h-52 w-32 sm:w-36 object-cover rounded-l-[4px] rounded-r-[8px]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-40 rounded-l-md pointer-events-none"></div>
                            </div>
                          ) : (
                            <div className="relative w-32 sm:w-36 h-48 sm:h-52 bg-gradient-to-b from-[#0c2e27] to-[#031512] border border-emerald-500/20 text-emerald-400 rounded-l-[4px] rounded-r-[8px] flex flex-col items-center justify-center p-3 relative shadow-inner group-hover:scale-[1.06] transition-transform duration-300">
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
                          <div className="absolute -top-1 -right-1 flex items-center justify-center z-15">
                            <span className="absolute h-6 w-6 rounded-full bg-emerald-500/25 animate-ping"></span>
                            <div className="relative bg-[#06221d] border border-emerald-400/40 rounded-full p-2 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] group-hover:scale-110 group-hover:border-emerald-300 transition-all cursor-pointer">
                              <Heart className="h-3.5 w-3.5 fill-emerald-400/80 animate-heartbeat-pulse" />
                            </div>
                          </div>

                          <div className="relative group-hover:translate-x-0.5 transition-transform min-w-0 pr-2 pt-3">
                            <span className="block text-[8px] font-mono font-bold text-emerald-400/70 group-hover:text-emerald-300 tracking-wider uppercase mb-1">
                              Academic Resource
                            </span>
                            
                            <h3 className="font-serif text-teal-100 group-hover:text-[#a7f3d0] text-xs sm:text-sm font-semibold line-clamp-4 leading-relaxed tracking-wide transition-colors duration-200 border-l-2 border-emerald-500/40 group-hover:border-emerald-400 pl-2.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] bg-emerald-950/20 py-2 rounded-r-lg">
                              {book.title}
                            </h3>
                          </div>

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
                  Our department administrators have not yet cataloged books for <strong className="text-emerald-300 capitalize">{id?.replace('-', ' ')}</strong>.
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
        )}

      </div>

      {/* Upload Hand Note Modal */}
      <UploadHandNoteModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        defaultYear={(id as any) || '3rd-year'}
      />
    </div>
  );
}
