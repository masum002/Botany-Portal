import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { ShieldAlert, LogIn, Loader2, Sparkles, AlertTriangle, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [authErrorText, setAuthErrorText] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setSessionUser(user);
    });
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthErrorText(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Strict role verification based on email
      if (user.email === 'mahfujar003@gmail.com') {
        navigate('/admin-dashboard');
      } else {
        // Successful login but unauthorized guest role
        setAuthErrorText(`Access Denied. Account "${user.email}" is not authorized as the Chemistry/Botany department curator. Please sign out and login as mahfujar003@gmail.com.`);
      }
    } catch (err: any) {
      console.error("Popup Authentication Error:", err);
      setAuthErrorText(`Popup Auth failed: ${err.message || 'Check connection or setup.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setSessionUser(null);
      setAuthErrorText(null);
    } catch (e) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] flex flex-col justify-center items-center px-4 py-16 relative overflow-hidden">
      
      {/* Visual styling */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#102a23]/20 rounded-2xl border border-emerald-400/10 p-8 sm:p-10 shadow-2xl relative z-10 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="mx-auto bg-emerald-950/60 border border-emerald-500/20 p-4 rounded-xl w-fit">
            <ShieldAlert className="h-8 w-8 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl text-white font-normal mt-4">Curator Session</h1>
          <p className="text-xs text-emerald-100/40 max-w-xs mx-auto font-light leading-relaxed">
            Authorized portal login for administrative botany updates and student query reviews.
          </p>
        </div>

        {authErrorText && (
          <div className="bg-rose-950/40 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed font-light">{authErrorText}</p>
          </div>
        )}

        {sessionUser ? (
          <div className="bg-[#102a23]/30 border border-emerald-400/10 p-5 rounded-xl space-y-4">
            <div className="flex gap-3 items-center">
              {sessionUser.photoURL ? (
                <img src={sessionUser.photoURL} alt="user" className="h-10 w-10 rounded-full border border-emerald-500/30" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-850 flex items-center justify-center font-bold">
                  {sessionUser.email?.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-emerald-400">Current Login</span>
                <p className="text-xs text-white truncate font-medium">{sessionUser.email}</p>
              </div>
            </div>

            {sessionUser.email === 'mahfujar003@gmail.com' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-wider">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Curator Identity Verified</span>
                </div>
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
                >
                  Enter Admin Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/20 text-rose-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Sign Out / Switch Account
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg disabled:bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                  <span className="text-sm font-medium">Initiating Auth popup...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-medium">Sign in with Google</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-center text-emerald-100/30 leading-relaxed font-light">
              Note: This panel uses Firebase Authentication popup routines. Please ensure popups are permitted in your browser settings.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-emerald-950/40 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-100/30 hover:text-emerald-400 transition-colors cursor-pointer uppercase tracking-widest font-mono text-[9px] font-bold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Portal Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
