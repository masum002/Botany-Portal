import { Leaf, GraduationCap, ShieldAlert, Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="app-footer" className="bg-[#041210] border-t border-emerald-900/30 text-emerald-100/40 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border border-white rounded-xs rotate-45"></div>
              </div>
              <span className="text-base font-bold text-white tracking-wide">PHYTO<span className="text-emerald-400 font-light italic font-serif">LOGICA</span></span>
            </div>
            <p className="text-xs text-emerald-100/50 leading-relaxed">
              A premium, scholarly archive designed specifically for Botany Honors students. Access peer-reviewed literature, taxonomical guides, and safe lecture notes.
            </p>
          </div>

          {/* Column 2: Years */}
          <div>
            <h3 className="text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-emerald-900/30 pb-2">Academic Volumes</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/year/1st-year" className="hover:text-emerald-400 transition-colors">Volume I: Honors 1st Year</Link>
              </li>
              <li>
                <Link to="/year/2nd-year" className="hover:text-emerald-400 transition-colors">Volume II: Honors 2nd Year</Link>
              </li>
              <li>
                <Link to="/year/3rd-year" className="hover:text-emerald-400 transition-colors">Volume III: Honors 3rd Year</Link>
              </li>
              <li>
                <Link to="/year/4th-year" className="hover:text-emerald-400 transition-colors">Volume IV: Honors 4th Year</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div>
            <h3 className="text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-emerald-900/30 pb-2">Research Portal</h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home Archive</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact Division</Link>
              </li>
              <li>
                <Link to="/admin-login" className="hover:text-emerald-400 transition-colors">Curator Gateway</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Minimal */}
          <div className="space-y-3 text-xs text-emerald-100/50">
            <h3 className="text-white font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border-b border-emerald-900/30 pb-2">Institutional Access</h3>
            <div className="flex gap-2.5">
              <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>mahfujar003@gmail.com</span>
            </div>
            <div className="flex gap-2.5">
              <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
              <span>+880 1700-000000</span>
            </div>
            <div className="flex gap-2.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Department of Botany, Honors Division</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-emerald-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-emerald-100/30">
          <div className="flex items-center gap-1.5">
            <span>© {currentYear} Phytologica Botanical Archive • Honors Division</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-emerald-400">Privacy Protocol</a>
            <a href="#" className="hover:text-emerald-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
