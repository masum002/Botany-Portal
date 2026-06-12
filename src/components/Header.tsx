import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, ChevronDown, Menu, BookOpen, User, LogOut, Home, Compass, MessageSquare, Award, Clock } from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useSettings } from './SettingsContext';

export default function Header() {
  const { settings } = useSettings();
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [timeStr, setTimeStr] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'mahfujar003@gmail.com') {
        setAdminUser(user);
      } else {
        setAdminUser(null);
      }
    });
    return unsubscribe;
  }, []);

  // Set real time clock display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const years = [
    { id: '1st-year', label: 'Honors 1st Year' },
    { id: '2nd-year', label: 'Honors 2nd Year' },
    { id: '3rd-year', label: 'Honors 3rd Year' },
    { id: '4th-year', label: 'Honors 4th Year' },
  ];

  return (
    <>
      <header id="app-header" className="sticky top-0 z-50 bg-[#020b08]/90 backdrop-blur-md border-b border-emerald-950/40 text-emerald-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.01]">
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                  <Leaf className="h-4.5 w-4.5 text-emerald-400 rotate-12" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase block">
                  {settings.appName.split(' ')[0]} <span className="text-emerald-400 font-light italic font-serif">{settings.appName.split(' ').slice(1).join(' ')}</span>
                </span>
                <span className="text-[7px] sm:text-[8px] tracking-[0.22em] text-[#99f6e4] uppercase font-mono block">Premium Academic Brand</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-7 text-[10px] font-bold uppercase tracking-widest text-emerald-100/60">
              <Link 
                to="/" 
                className={`hover:text-[#99f6e4] transition-colors py-1.5 px-3 rounded-lg hover:bg-emerald-950/30 ${location.pathname === '/' ? 'text-emerald-300 bg-emerald-950/25 border-b-2 border-emerald-500' : ''}`}
                id="link-home"
              >
                Home
              </Link>

              {/* Years Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsYearDropdownOpen(false), 200)}
                  className="flex items-center gap-1 hover:text-[#99f6e4] transition-colors focus:outline-none cursor-pointer uppercase font-bold text-[10px] tracking-widest"
                >
                  <span>Curriculum</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isYearDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#041210] border border-emerald-900/40 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-155">
                    {years.map((year) => (
                      <Link
                        key={year.id}
                        to={`/year/${year.id}`}
                        className="block px-4 py-2.5 text-[9px] uppercase tracking-wider hover:bg-emerald-900/50 hover:text-emerald-300 transition-colors text-emerald-100/70 font-semibold"
                      >
                        {year.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to="/about" 
                className={`hover:text-[#99f6e4] transition-colors py-1.5 px-3 rounded-lg hover:bg-emerald-950/30 ${location.pathname === '/about' ? 'text-emerald-300 bg-emerald-950/25 border-b-2 border-emerald-500' : ''}`}
                id="link-about"
              >
                About
              </Link>

              <Link 
                to="/contact" 
                className={`hover:text-[#99f6e4] transition-colors py-1.5 px-3 rounded-lg hover:bg-emerald-950/30 ${location.pathname === '/contact' ? 'text-emerald-300 bg-[#102a23]/30 border-b-2 border-emerald-500' : ''}`}
                id="link-contact"
              >
                Contact
              </Link>
            </nav>

            {/* Right clock and admin controls */}
            <div className="flex items-center gap-4">
              {/* Dynamic live clock */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-950/25 rounded-full border border-emerald-900/20 text-emerald-400 font-mono text-[9px] font-bold">
                <Clock className="h-3 w-3 animate-pulse" />
                <span>{timeStr || 'LIVE'}</span>
              </div>

              {/* Curator Portal button */}
              <div className="hidden md:flex items-center gap-2">
                {adminUser && (
                  <div className="flex items-center gap-2.5">
                    <Link 
                      to="/admin-dashboard" 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 text-emerald-300 hover:bg-emerald-900 rounded-xl border border-emerald-800/40 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md"
                    >
                      <User className="h-3 w-3 text-emerald-400" />
                      <span>Admin Panel</span>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="p-1.5 bg-[#020b08] hover:bg-emerald-950 text-emerald-400 font-bold hover:text-emerald-100 rounded-xl border border-emerald-950 transition-all cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 
        Sleek, Persistent, Floating Mobile Bottom Navigation Dock 
        This establishes the actual visual design of a high-class, stylish "Web App"
      */}
      <div className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#041612]/90 backdrop-blur-lg border border-emerald-500/15 p-2 rounded-2xl flex items-center justify-around shadow-[0_15px_45px_rgba(2,10,8,0.75)] z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname === '/' ? 'text-[#a7f3d0] bg-emerald-950/45 scale-105' : 'text-emerald-100/50'}`}
        >
          <Home className="h-4.5 w-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-1">হোম</span>
        </Link>

        {/* Dynamic drop trigger button for year selection directly inside dock */}
        <Link 
          to="/year/1st-year"
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname.startsWith('/year/') ? 'text-[#a7f3d0] bg-emerald-950/45 scale-105' : 'text-emerald-100/50'}`}
        >
          <Compass className="h-4.5 w-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-1">কারিকুলাম</span>
        </Link>

        <Link 
          to="/about" 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname === '/about' ? 'text-[#a7f3d0] bg-emerald-950/45 scale-105' : 'text-emerald-100/50'}`}
        >
          <Award className="h-4.5 w-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-1">সম্পর্কে</span>
        </Link>

        <Link 
          to="/contact" 
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname === '/contact' ? 'text-[#a7f3d0] bg-emerald-950/45 scale-105' : 'text-emerald-100/50'}`}
        >
          <MessageSquare className="h-4.5 w-4.5" />
          <span className="text-[8px] font-bold uppercase tracking-wider mt-1">যোগাযোগ</span>
        </Link>

        {adminUser && (
          <Link 
            to="/admin-dashboard" 
            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${location.pathname.startsWith('/admin') ? 'text-[#a7f3d0] bg-emerald-950/45 scale-105' : 'text-emerald-100/50'}`}
          >
            <User className="h-4.5 w-4.5" />
            <span className="text-[8px] font-bold uppercase tracking-wider mt-1">অ্যাডমিন</span>
          </Link>
        )}
      </div>
    </>
  );
}
