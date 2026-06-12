import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, ChevronDown, Menu, X, BookOpen, User, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Check if logged in is the designated Botany Admin
      if (user && user.email === 'mahfujar003@gmail.com') {
        setAdminUser(user);
      } else {
        setAdminUser(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    setIsMenuOpen(false);
  };

  const years = [
    { id: '1st-year', label: 'Honors 1st Year' },
    { id: '2nd-year', label: 'Honors 2nd Year' },
    { id: '3rd-year', label: 'Honors 3rd Year' },
    { id: '4th-year', label: 'Honors 4th Year' },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-[#041210] backdrop-blur-md border-b border-emerald-900/30 text-emerald-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.01]">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">PHYTO<span className="text-emerald-400 font-light italic font-serif">LOGICA</span></span>
              <span className="text-[9px] tracking-widest text-[#99f6e4] uppercase font-mono block">Honors Division</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
            <Link 
              to="/" 
              className={`hover:text-[#99f6e4] transition-colors ${location.pathname === '/' ? 'text-emerald-400' : 'text-emerald-100/60'}`}
            >
              Home
            </Link>

            {/* Years Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                onBlur={() => setTimeout(() => setIsYearDropdownOpen(false), 200)}
                className="flex items-center gap-1 hover:text-[#99f6e4] text-emerald-100/60 transition-colors focus:outline-none cursor-pointer uppercase font-bold text-xs"
              >
                <span>Curriculum</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isYearDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl bg-[#09221d] border border-emerald-800/40 shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {years.map((year) => (
                    <Link
                      key={year.id}
                      to={`/year/${year.id}`}
                      className="block px-4 py-3 text-xs uppercase tracking-wider hover:bg-emerald-900 hover:text-white transition-colors text-emerald-100/70 font-semibold"
                    >
                      {year.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/about" 
              className={`hover:text-[#99f6e4] transition-colors ${location.pathname === '/about' ? 'text-emerald-400' : 'text-emerald-100/60'}`}
            >
              About
            </Link>

            <Link 
              to="/contact" 
              className={`hover:text-[#99f6e4] transition-colors ${location.pathname === '/contact' ? 'text-emerald-400' : 'text-emerald-100/60'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Admin Tools Area */}
          <div className="hidden md:flex items-center gap-4">
            {adminUser ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/admin-dashboard" 
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-900/40 hover:bg-emerald-900/80 rounded-full border border-emerald-500/30 text-xs font-bold uppercase tracking-wider text-emerald-300 transition-all cursor-pointer shadow-lg"
                >
                  <User className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Admin Panel</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 bg-[#041210] hover:bg-emerald-950 text-emerald-400 hover:text-emerald-100 rounded-full border border-emerald-900/40 transition-all cursor-pointer"
                  title="Sign Out Admin"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/admin-login" 
                className="px-5 py-2 rounded-full border border-emerald-400 text-emerald-400 text-xs font-bold uppercase tracking-tighter hover:bg-emerald-400 hover:text-emerald-950 transition-all"
              >
                Admin Portal
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {adminUser && (
              <Link to="/admin-dashboard" className="p-2 bg-emerald-800 border border-emerald-700 rounded-lg text-emerald-100">
                <User className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 bg-emerald-900/50 border border-emerald-800 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#09221d] border-b border-emerald-900/30 px-4 pt-2 pb-6 space-y-3 shadow-inner">
          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block py-3 px-4 hover:bg-emerald-950 text-emerald-100 rounded-xl font-medium text-sm"
          >
            Home
          </Link>

          <div className="border-t border-emerald-900/30 my-1"></div>
          
          <div className="px-4 py-2 text-[10px] font-bold font-mono tracking-wider text-emerald-400 uppercase">Curriculum</div>
          {years.map((year) => (
            <Link
              key={year.id}
              to={`/year/${year.id}`}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2.5 px-6 hover:bg-emerald-950 text-emerald-200 text-xs font-semibold uppercase tracking-wider rounded-xl"
            >
              {year.label}
            </Link>
          ))}

          <div className="border-t border-emerald-900/30 my-1"></div>

          <Link
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="block py-3 px-4 hover:bg-emerald-950 text-emerald-100 rounded-xl font-medium text-sm"
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="block py-3 px-4 hover:bg-emerald-950 text-emerald-100 rounded-xl font-medium text-sm"
          >
            Contact
          </Link>

          {!adminUser ? (
            <Link
              to="/admin-login"
              onClick={() => setIsMenuOpen(false)}
              className="block py-3 px-4 bg-[#041210] text-[#99f6e4] border border-emerald-400/30 hover:bg-emerald-950 rounded-xl text-center font-bold text-xs uppercase tracking-wider"
            >
              Admin Portal
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-center py-3 px-4 bg-rose-950/40 text-rose-300 border border-rose-900/40 hover:bg-rose-900/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Logout Admin
            </button>
          )}
        </div>
      )}
    </header>
  );
}
