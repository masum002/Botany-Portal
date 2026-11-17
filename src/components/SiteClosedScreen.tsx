import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, Leaf } from 'lucide-react';
import { useSettings } from './SettingsContext';

export default function SiteClosedScreen() {
  const { settings } = useSettings();

  const message =
    settings.siteClosedMessage?.trim() || 'এডমিন এই ওয়েবসাইটটি আপাতত বন্ধ রেখেছে।';

  return (
    <div className="min-h-screen bg-[#020a08] text-[#e5e7eb] flex flex-col justify-between relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Notice Banner */}
      <div className="w-full bg-rose-950/60 border-b border-rose-500/30 py-4 px-4 text-center relative z-10 backdrop-blur-md shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-2.5 text-rose-200 font-medium text-sm sm:text-base">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 animate-pulse" />
          <span>{message}</span>
        </div>
      </div>

      {/* Main Centered Lock Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="max-w-lg w-full bg-[#071915]/80 border border-rose-500/20 rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6 backdrop-blur-md">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/20 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-widest">
              <span>Website Temporarily Closed</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-white font-semibold leading-snug pt-1">
              {message}
            </h1>

            <p className="text-emerald-100/50 text-xs sm:text-sm leading-relaxed font-light pt-1">
              {settings.appName} বর্তমানে সাময়িকভাবে বন্ধ রাখা হয়েছে। এডমিন পুনরায় ওয়েবসাইটটি চালু করলে আপনি আগের মতো সব বই, হ্যান্ডনোট ও রিসোর্স ব্যবহার করতে পারবেন।
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-emerald-400/50 font-mono">
            <Leaf className="h-3.5 w-3.5" />
            <span>{settings.appName}</span>
          </div>
        </div>
      </div>

      {/* Discreet Footer with Admin Portal Login Link so Admin can reopen the site anytime */}
      <footer className="py-6 px-4 text-center relative z-10 border-t border-emerald-950/30">
        <Link
          to="/admin-login"
          className="text-[10px] text-emerald-400/45 hover:text-emerald-300 font-mono uppercase tracking-[0.2em] transition-colors"
        >
          • Admin Portal Login •
        </Link>
      </footer>
    </div>
  );
}
