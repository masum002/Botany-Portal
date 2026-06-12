import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Book } from '../types';
import { Search, Compass, Award, Library, BookOpen, ChevronRight, Leaf } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Read all books in real-time to allow dynamic portal-wide search
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

  // Filter books matching search query
  const filteredBooks = searchQuery.trim() === '' 
    ? [] 
    : books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const honorYears = [
    {
      id: '1st-year',
      title: 'Honors 1st Year',
      description: 'Introductory Microbiology, Phycology, Mycology, and Plant Pathology.',
      papers: 'Core Papers 101, 102 & General Practical Labs',
      color: 'from-emerald-950 to-emerald-900',
      badge: 'Level 1',
      icon: Leaf,
    },
    {
      id: '2nd-year',
      title: 'Honors 2nd Year',
      description: 'Bryophytes, Pteridophytes, Gymnosperms, and Plant Anatomy.',
      papers: 'Core Papers 201, 202, 203 & Molecular Cytology',
      color: 'from-teal-950 to-teal-900',
      badge: 'Level 2',
      icon: Compass,
    },
    {
      id: '3rd-year',
      title: 'Honors 3rd Year',
      description: 'Plant Physiology, Biochemistry, genetics, and Cell Biology.',
      papers: 'Core Papers 301 - 305 & Ecological Habitats',
      color: 'from-cyan-950 to-cyan-900',
      badge: 'Level 3',
      icon: Award,
    },
    {
      id: '4th-year',
      title: 'Honors 4th Year',
      description: 'Taxonomy of Angiosperms, Phytogeography, and Environmental Botany.',
      papers: 'Research Paper, Viva Voce & Advanced Plant Pathology',
      color: 'from-green-950 to-emerald-950',
      badge: 'Graduate',
      icon: Library,
    },
  ];

  return (
    <div id="home-container" className="min-h-screen bg-[#041210] text-[#e5e7eb]">
      
      {/* Search & Hero Banner */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center justify-center animate-fade-in">
        {/* Ambient emerald glowing gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            <Leaf className="h-3 w-3 text-emerald-400" />
            <span>Honors Botanical Archive</span>
          </div>
          
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white font-normal leading-tight tracking-tight">
            The Digital Herbarium
          </h1>
          
          <p className="text-emerald-100/65 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            A premium scholarly repository designed specifically for Botany Honors undergraduate students. Access peer-reviewed literature, taxonomical guides, and exclusive lecture notes.
          </p>

          {/* Search Bar Block */}
          <div className="max-w-xl mx-auto relative pt-4">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400/70 group-focus-within:text-emerald-300 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for titles, authors, or plant families..."
                className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-full text-white placeholder-emerald-100/35 focus:bg-white/10 focus:border-emerald-400 focus:outline-none text-sm tracking-wide transition-all duration-300 h-[50px]"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs">🔍</div>
            </div>

            {/* Live Search Results Drops */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-[#09221d] rounded-2xl border border-emerald-500/20 shadow-[0_10px_40px_rgba(4,18,16,0.9)] overflow-hidden text-left z-30 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-900/30 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Matching Archives ({filteredBooks.length})
                </div>
                {filteredBooks.length > 0 ? (
                  <div className="divide-y divide-emerald-950/40">
                    {filteredBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => navigate(`/view/${book.id}`)}
                        className="w-full px-5 py-4 hover:bg-emerald-950/60 flex items-start gap-3.5 text-left transition-colors cursor-pointer group"
                      >
                        <BookOpen className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-emerald-50 group-hover:text-[#99f6e4] text-sm tracking-wide">{book.title}</p>
                          <span className="text-[9px] font-mono font-semibold text-[#99f6e4] uppercase bg-emerald-950/90 border border-emerald-900/40 px-2 py-0.5 rounded-full inline-block mt-1">
                            {book.year.replace('-', ' ')}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-emerald-100/40 text-xs">
                    No publications match "<span className="font-semibold text-emerald-300">{searchQuery}</span>"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid: 4 Core Honors Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#99f6e4] uppercase font-mono">Academic Volumes</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white">Botany Honors Curriculum</h2>
          <div className="w-12 h-0.5 bg-emerald-800/60 mx-auto mt-4"></div>
        </div>

        {/* Botanical grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {honorYears.map((year, idx) => {
            return (
              <div
                key={year.id}
                onClick={() => navigate(`/year/${year.id}`)}
                className="group flex flex-col items-start gap-5 bg-[#102a23]/30 hover:bg-[#102a23]/70 border border-emerald-400/10 hover:border-emerald-400/40 rounded-xl p-8 transition-all duration-300 cursor-pointer relative"
              >
                <span className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">
                  Volume 0{idx + 1}
                </span>

                <h3 className="font-serif text-2xl text-white group-hover:text-[#99f6e4] leading-tight transition-colors">
                  {year.title.replace('Honors ', '')}
                </h3>

                <div className="w-12 h-px bg-emerald-800/60 group-hover:bg-[#34d399] transition-all duration-300"></div>

                <p className="text-xs text-emerald-100/40 leading-relaxed font-light grow">
                  {year.description}
                </p>

                <div className="w-full pt-4 border-t border-emerald-950/30 flex items-center justify-between text-[10px] text-emerald-100/30 uppercase tracking-widest font-mono group-hover:text-emerald-300 transition-colors">
                  <span>{year.badge}</span>
                  <ChevronRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* High-Class Feature Banner */}
      <section className="max-w-4xl mx-auto px-6 py-20 animate-fade-in">
        <div className="bg-[#102a23]/20 border border-emerald-400/10 rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#99f6e4] uppercase font-mono font-bold">Literature Request</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-white">Need a specific classification key or lab guide?</h2>
          <p className="text-emerald-100/50 text-sm max-w-lg mx-auto leading-relaxed font-light">
            Submit a direct query or book request via our secure feedback channel, and our Botanical Curators will index it into the catalog.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-full border border-emerald-400 text-emerald-400 text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 hover:text-emerald-950 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10 animate-pulse"
            >
              Request Publication
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
