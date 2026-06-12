import { useSettings } from './SettingsContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  return (
    <footer id="app-footer" className="bg-[#030e0c] border-t border-emerald-950/40 text-emerald-100/30 py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] uppercase tracking-[0.2em] space-y-1">
        <p className="font-medium text-emerald-100/40">
          © {currentYear} {settings.appName} • All Rights Reserved
        </p>
        <p className="text-[8px] text-emerald-100/20 uppercase tracking-widest font-mono">
          Curated for Botany Honours Scholars • Academic Resource Database
        </p>
      </div>
    </footer>
  );
}
