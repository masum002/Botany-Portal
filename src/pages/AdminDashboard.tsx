import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, setDoc, query, orderBy } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Book, ContactQuery } from '../types';
import { Shield, LayoutGrid, CheckSquare, PlusCircle, Trash, Loader2, LogOut, ArrowLeft, ShieldAlert, Library, MessageSquareCode, Sparkles, Plus, AlertCircle, Trash2, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // States for books
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // States for contact queries
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(true);

  // Form inputs for Cataloging Books
  const [newTitle, setNewTitle] = useState('');
  const [newYear, setNewYear] = useState<'1st-year' | '2nd-year' | '3rd-year' | '4th-year'>('1st-year');
  const [newOneDriveLink, setNewOneDriveLink] = useState('');
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [formPosting, setFormPosting] = useState(false);
  const [formMsgText, setFormMsgText] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab switching state
  const [activeTab, setActiveTab] = useState<'books' | 'queries' | 'settings'>('books');

  // Configuration Settings States
  const [appName, setAppName] = useState('Botany Web Portal');
  const [aboutText, setAboutText] = useState('');
  const [contactText, setContactText] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [developerPhotoUrl, setDeveloperPhotoUrl] = useState('');
  const [developerName, setDeveloperName] = useState('');
  const [developerTitle, setDeveloperTitle] = useState('');
  const [developerDescription, setDeveloperDescription] = useState('');
  const [aboutDetailed, setAboutDetailed] = useState('');
  const [adminWhatsApp, setAdminWhatsApp] = useState('');
  const [developerFacebook, setDeveloperFacebook] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verify Admin Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'mahfujar003@gmail.com') {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoadingSession(false);
    });
    return unsubscribe;
  }, []);

  // Fetch all books in real time
  useEffect(() => {
    if (!currentUser) return;
    
    setLoadingBooks(true);
    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allBooks: Book[] = [];
      snapshot.forEach((doc) => {
        allBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(allBooks);
      setLoadingBooks(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch all contact queries in real time
  useEffect(() => {
    if (!currentUser) return;

    setLoadingQueries(true);
    const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allQueries: ContactQuery[] = [];
      snapshot.forEach((doc) => {
        allQueries.push({ id: doc.id, ...doc.data() } as ContactQuery);
      });
      setQueries(allQueries);
      setLoadingQueries(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'queries');
    });

    return unsubscribe;
  }, [currentUser]);

  // Fetch existing portal settings
  useEffect(() => {
    if (!currentUser) return;
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAppName(data.appName || 'Botany Web Portal');
        setAboutText(data.aboutText || '');
        setContactText(data.contactText || '');
        setContactEmail(data.contactEmail || 'mahfujar003@gmail.com');
        setContactPhone(data.contactPhone || '+880 1700-000000');
        setContactAddress(data.contactAddress || 'Department of Botany, Honors Division');
        setDeveloperPhotoUrl(data.developerPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=3&w=400&h=400&q=80');
        setDeveloperName(data.developerName || 'Professor Mahfujur Rahman');
        setDeveloperTitle(data.developerTitle || 'Lead Department Curator & Chief Developer');
        setDeveloperDescription(data.developerDescription || 'Empowering honors research scholars by modernizing access to botany literature and botanical mapping databases.');
        setAboutDetailed(data.aboutDetailed || 'Prof. Mahfujur Rahman is a visionary botany academician and systems engineer. Combining rigorous academic botanical standards with modern cloud-enabled architectures, this portal eliminates barriers to literature. Key plant phylum classifications, cytogenetic manuals, plant tissue culture logs, and environmental research are cataloged in real-time for immediate download.');
        setAdminWhatsApp(data.adminWhatsApp || '+880 1700-000000');
        setDeveloperFacebook(data.developerFacebook || 'https://facebook.com');
      }
    });
    return unsubscribe;
  }, [currentUser]);

  // Handle adding a book
  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newOneDriveLink.trim()) {
      setFormMsgText({ type: 'error', text: 'Please fill in vital textbook variables.' });
      return;
    }

    setFormPosting(true);
    setFormMsgText(null);

    const targetCollection = 'books';
    try {
      await addDoc(collection(db, targetCollection), {
        title: newTitle.trim(),
        year: newYear,
        oneDriveLink: newOneDriveLink.trim(),
        coverUrl: newCoverUrl.trim() ? newCoverUrl.trim() : null,
        createdAt: serverTimestamp(),
      });
      
      setFormMsgText({ type: 'success', text: 'Textbook successfully cataloged in Firestore!' });
      // Clear inputs
      setNewTitle('');
      setNewOneDriveLink('');
      setNewCoverUrl('');
    } catch (err: any) {
      setFormMsgText({ type: 'error', text: `Failed to catalog textbook: ${err.message}` });
      handleFirestoreError(err, OperationType.WRITE, targetCollection);
    } finally {
      setFormPosting(false);
    }
  };

  // Handle deleting a book
  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you absolutely sure you want to remove this catalog entry?')) return;
    
    const targetCollection = 'books';
    try {
      await deleteDoc(doc(db, targetCollection, bookId));
    } catch (err) {
      alert("Unauthorized key operation or network leak faulted action.");
      handleFirestoreError(err, OperationType.DELETE, `${targetCollection}/${bookId}`);
    }
  };

  // Save Settings back to Firestore
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsMsg(null);

    try {
      await setDoc(doc(db, 'settings', 'general'), {
        appName: appName.trim(),
        aboutText: aboutText.trim(),
        contactText: contactText.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        contactAddress: contactAddress.trim(),
        developerPhotoUrl: developerPhotoUrl.trim(),
        developerName: developerName.trim(),
        developerTitle: developerTitle.trim(),
        developerDescription: developerDescription.trim(),
        aboutDetailed: aboutDetailed.trim(),
        adminWhatsApp: adminWhatsApp.trim(),
        developerFacebook: developerFacebook.trim(),
        updatedAt: serverTimestamp(),
      });
      setSettingsMsg({ type: 'success', text: 'Portal settings synchronized successfully!' });
    } catch (err: any) {
      console.error(err);
      setSettingsMsg({ type: 'error', text: `Failed to save dynamic configuration: ${err.message}` });
    } finally {
      setSettingsLoading(false);
    }
  };

  // Logout routine
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-[#041210] text-[#e5e7eb] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-300">Locking secure session...</p>
      </div>
    );
  }

  // Not verified admin view
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#041210] text-[#e5e7eb] flex flex-col justify-center items-center px-4">
        <div className="max-w-md text-center p-10 bg-[#102a23]/20 border border-emerald-400/10 rounded-2xl shadow-2xl space-y-6">
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl w-fit mx-auto animate-pulse">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-normal text-white tracking-tight">Security Access Required</h2>
            <p className="text-emerald-100/40 text-sm leading-relaxed mt-2 font-light">
              Unauthorized access has been terminated. You must be authenticated as the designated Curator Account (<strong className="text-emerald-400 font-mono text-xs">mahfujar003@gmail.com</strong>) to utilize database mutation panels.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-[#102a23]/40 border border-emerald-500/15 hover:bg-[#102a23]/80 text-white font-bold py-3 rounded-full text-xs uppercase tracking-wider cursor-pointer"
            >
              Portal Home
            </button>
            <button
              onClick={() => navigate('/admin-login')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] pb-24">
      {/* Dashboard Top bar details */}
      <section className="bg-[#102a23]/20 border-b border-emerald-500/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#102a23]/40 rounded-xl border border-emerald-500/15">
              <Shield className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white flex items-center gap-3">
                <span>Curator Desk</span>
                <span className="text-[9px] font-mono font-bold bg-emerald-950/80 px-2 tracking-wider py-0.5 rounded-full border border-emerald-500/10">ROOT AUTHOR</span>
              </h1>
              <p className="text-[10px] text-emerald-300 font-mono tracking-wide mt-0.5">Primary Session: mahfujar003@gmail.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-[#102a23]/40 hover:bg-[#102a23]/80 border border-emerald-500/15 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-slate-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Public Portal</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/15 px-4 py-2.5 rounded-xl text-[10px] uppercase tracking-widest font-bold text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Conclude Session</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total books block */}
        <div className="bg-[#102a23]/20 border border-emerald-400/10 rounded-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-mono tracking-widest font-bold text-emerald-400 uppercase">Textbook Catalogue Size</span>
            <p className="text-4xl sm:text-5xl font-light text-white font-serif">{books.length}</p>
            <p className="text-xs text-emerald-100/40 font-light">Total verified books mapped across honours curricula</p>
          </div>
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/10 rounded-xl">
            <Library className="h-8 w-8 text-emerald-400" />
          </div>
        </div>

        {/* Total queries block */}
        <div className="bg-[#102a23]/20 border border-emerald-400/10 rounded-2xl p-6 sm:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-mono tracking-widest font-bold text-emerald-400 uppercase">Incoming Support logs</span>
            <p className="text-4xl sm:text-5xl font-light text-white font-serif">{queries.length}</p>
            <p className="text-xs text-emerald-100/40 font-light">Curricula query logs or book requests active</p>
          </div>
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/10 rounded-xl">
            <MessageSquareCode className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </section>

      {/* Main Grid workspace split */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: cataloger input form */}
        <div className="lg:col-span-5 h-fit text-left">
          <form onSubmit={handleAddBookSubmit} className="bg-[#102a23]/20 border rounded-2xl border-emerald-400/10 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-xl font-normal text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                <span>Catalog Textbook</span>
              </h2>
              <p className="text-xs text-emerald-100/30 mt-1 font-light leading-relaxed">Submit OneDrive links which open straight for honors students.</p>
            </div>

            {formMsgText && (
              <div className={`p-4 rounded-xl text-xs font-light border ${
                formMsgText.type === 'success' 
                  ? 'border-emerald-500/20 bg-emerald-950/30 text-emerald-400' 
                  : 'border-rose-500/20 bg-rose-950/30 text-rose-300'
              }`}>
                {formMsgText.text}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="book-title" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Textbook Title</label>
              <input
                id="book-title"
                required
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Introductory Plant Taxonomy and Mycology Manual"
                className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-emerald-100/10 focus:bg-slate-950 text-white"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="book-year" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Curriculum Honor stage</label>
              <select
                id="book-year"
                required
                value={newYear}
                onChange={(e) => setNewYear(e.target.value as any)}
                className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none text-white cursor-pointer"
              >
                <option className="bg-[#041210]" value="1st-year">Honors 1st Year (Microbiology / Phycology)</option>
                <option className="bg-[#041210]" value="2nd-year">Honors 2nd Year (Cryptogams / Gymnosperms)</option>
                <option className="bg-[#041210]" value="3rd-year">Honors 3rd Year (Physiology / Genetics)</option>
                <option className="bg-[#041210]" value="4th-year">Honors 4th Year (Taxonomy / Environmental)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="book-onedrive" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">OneDrive sharing URL</label>
              <input
                id="book-onedrive"
                required
                type="url"
                value={newOneDriveLink}
                onChange={(e) => setNewOneDriveLink(e.target.value)}
                placeholder="e.g. https://1drv.ms/b/s!AnH_f_08D8"
                className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-emerald-100/10 focus:bg-slate-950 text-white"
              />
              <span className="text-[9px] text-emerald-100/20 block font-light leading-relaxed">Provide standard OneDrive sharing links. Students are redirected directly to this link.</span>
            </div>

            <div className="space-y-2">
              <label htmlFor="book-cover" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Book Cover URL (Optional)</label>
              <input
                id="book-cover"
                type="url"
                value={newCoverUrl}
                onChange={(e) => setNewCoverUrl(e.target.value)}
                placeholder="e.g. https://domain.com/path-to-cover-art.jpg"
                className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none placeholder-emerald-100/10 focus:bg-slate-950 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={formPosting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#102a23]/30 disabled:text-emerald-300 font-bold text-emerald-950 py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/10"
            >
              {formPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-950" />
                  <span>Configuring Schema Pipeline...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-[3px]" />
                  <span>Publish Textbook</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col: catalog display, support logs, or settings fields */}
        <div className="lg:col-span-7 text-left">
          
          {/* Tabs header view */}
          <div className="flex border-b border-emerald-950/40 mb-6 gap-6 flex-wrap">
            <button
              onClick={() => setActiveTab('books')}
              className={`pb-4 px-1 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'books' 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-emerald-100/30 hover:text-white'
              }`}
            >
              Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('queries')}
              className={`pb-4 px-1 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'queries' 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-emerald-100/30 hover:text-white'
              }`}
            >
              Queries ({queries.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-1 text-xs uppercase tracking-widest font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'settings' 
                  ? 'border-emerald-400 text-emerald-400' 
                  : 'border-transparent text-emerald-100/30 hover:text-white'
              }`}
            >
              Portal Settings
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'books' && (
            <div className="space-y-4 text-left">
              {loadingBooks ? (
                <div className="py-20 flex flex-col items-center justify-center text-emerald-100/30 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">Syncing Catalog...</span>
                </div>
              ) : books.length > 0 ? (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 scrollbar-none">
                  {books.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#102a23]/10 border border-emerald-400/10 p-4 rounded-xl flex items-center justify-between gap-4 group hover:border-emerald-400/20 transition-all text-left"
                    >
                      <div className="truncate flex-1 min-w-0">
                        <strong className="text-white text-sm font-serif font-normal tracking-tight truncate block group-hover:text-[#99f6e4] transition-colors">{b.title}</strong>
                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] font-mono font-bold bg-[#041210] border border-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {b.year.replace('-', ' ')}
                          </span>
                          <span className="text-[9px] text-[#99f6e4]/40 font-mono truncate max-w-[160px] sm:max-w-xs">{b.oneDriveLink}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteBook(b.id)}
                        className="p-3 bg-rose-950/20 hover:bg-rose-950 border border-rose-500/10 rounded-lg text-rose-400 hover:text-rose-200 transition-all cursor-pointer shrink-0"
                        title="Delete this book"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#102a23]/10 border border-dashed border-emerald-400/10 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-emerald-100/20 mx-auto mb-3" />
                  <p className="text-sm font-light text-emerald-100/30">No books cataloged in this network.</p>
                  <p className="text-xs text-emerald-100/20 mt-1 font-light">Use the left cataloger form to add books.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'queries' && (
            <div className="space-y-4 text-left">
              {loadingQueries ? (
                <div className="py-20 flex flex-col items-center justify-center text-emerald-100/30 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                  <span className="text-[10px] font-mono tracking-widest uppercase">Syncing queries list...</span>
                </div>
              ) : queries.length > 0 ? (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
                  {queries.map((q) => (
                    <div
                      key={q.id}
                      className="bg-[#102a23]/10 border border-emerald-400/10 p-5 rounded-xl space-y-3 hover:border-emerald-400/25 transition-all text-left"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2 pb-2.5 border-b border-emerald-500/10 text-left">
                        <div>
                          <strong className="text-sm text-white block">{q.name}</strong>
                          <span className="text-xs text-emerald-400 font-mono select-all">{q.email}</span>
                        </div>
                        {q.createdAt?.seconds && (
                          <span className="text-[9px] font-mono text-emerald-100/30 bg-[#041210] px-2 py-1 border border-emerald-950 rounded uppercase tracking-wider">
                            {new Date(q.createdAt.seconds * 1000).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-100/50 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-light select-text">
                        {q.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#102a23]/10 border border-dashed border-emerald-400/10 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-emerald-100/20 mx-auto mb-3" />
                  <p className="text-sm font-light text-emerald-100/30">Request buffer empty.</p>
                  <p className="text-xs text-[#99f6e4]/10 mt-1 font-light">Direct inquiries from students will list here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="bg-[#102a23]/20 border rounded-2xl border-emerald-400/10 p-6 sm:p-8 space-y-6 text-left">
              <div>
                <h2 className="font-serif text-xl font-normal text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-400" />
                  <span>Portal Configuration</span>
                </h2>
                <p className="text-xs text-emerald-100/30 mt-1 font-light leading-relaxed">Customize app identity, about details, and support directory lines instantly.</p>
              </div>

              {settingsMsg && (
                <div className={`p-4 rounded-xl text-xs font-light border ${
                  settingsMsg.type === 'success' 
                    ? 'border-emerald-500/20 bg-emerald-950/30 text-emerald-400' 
                    : 'border-rose-500/20 bg-rose-950/30 text-rose-300'
                }`}>
                  {settingsMsg.text}
                </div>
              )}

              {/* SECTION A: General Portal Info */}
              <div className="space-y-4 bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/10">
                <h3 className="text-xs uppercase font-mono font-bold text-emerald-400 tracking-widest border-b border-emerald-500/10 pb-2">Part I: Academy Brand Details</h3>
                
                <div className="space-y-2">
                  <label htmlFor="portal-appname" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Website Brand Name</label>
                  <input
                    id="portal-appname"
                    required
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Botany Web Portal"
                    className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="portal-about" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">General Framework Intro</label>
                  <textarea
                    id="portal-about"
                    required
                    rows={3}
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Describe your portal mission and program details..."
                    className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="portal-contact-text" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Contact Form Header Tip</label>
                  <textarea
                    id="portal-contact-text"
                    required
                    rows={2}
                    value={contactText}
                    onChange={(e) => setContactText(e.target.value)}
                    placeholder="e.g. Submit a direct textbook request if you experience download or view issues..."
                    className="w-full bg-[#041210]/60 border border-[#103a2c] focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION B: Developer Photo & Stylish Texts */}
              <div className="space-y-4 bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/10">
                <h3 className="text-xs uppercase font-mono font-bold text-[#99f6e4] tracking-widest border-b border-emerald-500/10 pb-2">Part II: Developer Profile & Aesthetic Texts</h3>
                
                <div className="space-y-2">
                  <label htmlFor="portal-dev-image" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Developer Photo URL (Stylish Square image)</label>
                  <input
                    id="portal-dev-image"
                    required
                    type="url"
                    value={developerPhotoUrl}
                    onChange={(e) => setDeveloperPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-emerald-100/30">Preview:</span>
                    {developerPhotoUrl && (
                      <img src={developerPhotoUrl} alt="Preview" className="h-6 w-6 rounded-md object-cover border border-emerald-500/20" referrerPolicy="no-referrer" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="portal-dev-name" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Developer Header Name</label>
                    <input
                      id="portal-dev-name"
                      required
                      type="text"
                      value={developerName}
                      onChange={(e) => setDeveloperName(e.target.value)}
                      placeholder="e.g. Professor Mahfujur Rahman"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portal-dev-title" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Developer Work Title</label>
                    <input
                      id="portal-dev-title"
                      required
                      type="text"
                      value={developerTitle}
                      onChange={(e) => setDeveloperTitle(e.target.value)}
                      placeholder="e.g. Lead Department Curator & Developer"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="portal-dev-desc" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Developer Quote (Ultra Stylish Intro)</label>
                  <textarea
                    id="portal-dev-desc"
                    required
                    rows={2}
                    value={developerDescription}
                    onChange={(e) => setDeveloperDescription(e.target.value)}
                    placeholder="Enter an ultra-stylish quote about your curriculum goal..."
                    className="w-full bg-[#041210]/60 border border-[#103a2c] focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="portal-about-detailed" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Academic Bio Review (Detailed - Bistarito)</label>
                  <textarea
                    id="portal-about-detailed"
                    required
                    rows={5}
                    value={aboutDetailed}
                    onChange={(e) => setAboutDetailed(e.target.value)}
                    placeholder="Enter detailed review text..."
                    className="w-full bg-[#041210]/60 border border-[#103a2c] focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION C: Support Line & Direct Instant Messaging Coordinates */}
              <div className="space-y-4 bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/10">
                <h3 className="text-xs uppercase font-mono font-bold text-emerald-400 tracking-widest border-b border-emerald-500/10 pb-2">Part III: Social Support Directory</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="portal-email" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Support Directory Email (Gmail)</label>
                    <input
                      id="portal-email"
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. mahfujar003@gmail.com"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portal-phone" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Coordinator Phone Line</label>
                    <input
                      id="portal-phone"
                      required
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +880 1700-000000"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="portal-whatsapp" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Admin WhatsApp Number (Include +countrycode)</label>
                    <input
                      id="portal-whatsapp"
                      required
                      type="text"
                      value={adminWhatsApp}
                      onChange={(e) => setAdminWhatsApp(e.target.value)}
                      placeholder="e.g. +8801700000000"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portal-facebook-url" className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-widest block text-left">Admin Facebook Profile URL</label>
                    <input
                      id="portal-facebook-url"
                      required
                      type="url"
                      value={developerFacebook}
                      onChange={(e) => setDeveloperFacebook(e.target.value)}
                      placeholder="e.g. https://facebook.com/username"
                      className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="portal-address" className="text-[9px] font-bold font-mono text-[#99f6e4] uppercase tracking-widest block text-left">Physical Reference Address Location</label>
                  <input
                    id="portal-address"
                    required
                    type="text"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    placeholder="e.g. Department of Botany, Honors Division, National University"
                    className="w-full bg-[#041210]/60 border border-emerald-400/10 focus:border-emerald-400/30 rounded-xl px-4 py-3 text-xs focus:outline-none focus:bg-slate-950 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#102a23]/30 disabled:text-emerald-300 font-bold text-emerald-950 py-3.5 px-4 rounded-xl text-xs uppercase tracking-widest transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {settingsLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-950" />
                    <span>Synchronizing Server Configuration...</span>
                  </>
                ) : (
                  <span>Save Portal Settings</span>
                )}
              </button>
            </form>
          )}

        </div>

      </section>
    </div>
  );
}
