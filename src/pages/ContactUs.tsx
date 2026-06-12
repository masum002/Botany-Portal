import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Mail, Send, Loader2, Sparkles, CheckCircle2, Leaf, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorText("All text fields are required.");
      return;
    }

    if (name.length > 150) {
      setErrorText("Name cannot exceed 150 characters.");
      return;
    }

    if (email.length > 300) {
      setErrorText("Email address is too long.");
      return;
    }

    if (message.length > 2000) {
      setErrorText("Message details cannot exceed 2000 characters.");
      return;
    }

    setSending(true);
    setErrorText(null);

    const targetCollection = 'queries';
    try {
      await addDoc(collection(db, targetCollection), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });
      setSent(true);
      // Clean inputs
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setErrorText("Unable to submit query. High security server-side block. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, targetCollection);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#041210] text-[#e5e7eb] pb-24">
      {/* Visual Header */}
      <section className="py-20 text-center px-4 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.3),transparent_60%)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <Link 
            to="/" 
            className="text-[#99f6e4] hover:text-emerald-300 font-bold text-[10px] uppercase tracking-widest font-mono mb-2 inline-block transition-colors"
          >
            ← Back to Portal Core
          </Link>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">Contact Portal Support</h1>
          <p className="text-emerald-100/50 text-sm mt-3 max-w-xl mx-auto leading-relaxed font-light">
            Submit a direct curriculum request, request a rare botanical taxonomy key, or file bug reports with the department curators.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Card left column info details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#102a23]/30 rounded-2xl p-8 text-emerald-100 border border-emerald-400/10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5">
                <Leaf className="h-44 w-44 text-emerald-400" />
              </div>

              <h2 className="font-serif text-2xl text-white mb-4">Department Directory</h2>
              <p className="text-emerald-100/40 text-xs sm:text-sm leading-relaxed mb-8 font-light">
                Your queries are routed directly to the secure database and can be reviewed immediately by our honors curators.
              </p>

              <div className="space-y-6 text-xs sm:text-sm">
                <div className="flex gap-4 items-start">
                  <Mail className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">Head Curator Email</strong>
                    <span className="text-emerald-300 font-mono">mahfujar003@gmail.com</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Phone className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">Lab Support Desk</strong>
                    <span className="text-emerald-300 font-mono">+880 1700-000000</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <MapPin className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-white font-serif text-sm font-medium">Anatomy Labs</strong>
                    <span className="text-emerald-100/60 leading-relaxed font-light">Section B, Dept. of Botany, National University</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form right column */}
          <div className="lg:col-span-7">
            {sent ? (
              <div className="bg-[#102a23]/20 p-12 rounded-2xl text-center border border-emerald-400/10 space-y-6">
                <div className="p-3 bg-emerald-950/60 rounded-xl w-fit mx-auto border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="font-serif text-2xl text-white font-normal">Message Saved Successfully</h2>
                <p className="text-emerald-100/50 text-sm leading-relaxed max-w-sm mx-auto font-light">
                  Thank you! Your syllabus textbook request or inquiry has been securely stored in our Firestore logs. The administrator will review your message shortly.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSent(false)}
                    className="px-6 py-3 rounded-full border border-emerald-400 text-emerald-400 text-xs font-bold uppercase tracking-widest hover:bg-emerald-400 hover:text-emerald-950 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-[#102a23]/20 p-8 sm:p-10 rounded-2xl border border-emerald-400/10 space-y-6">
                <h2 className="font-serif text-2xl text-white">Inquiry Dispatch Form</h2>
                <p className="text-xs text-emerald-100/40 font-light">Provide accurate details so the administrative team can contact you back if necessary.</p>
                
                {errorText && (
                  <div className="p-4 bg-rose-950/40 border border-rose-500/20 rounded-xl text-rose-300 text-xs sm:text-sm font-medium">
                    {errorText}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="student-name" className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">Scholarly Name</label>
                  <input
                    id="student-name"
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mahfujur Rahman"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-emerald-100/25 focus:outline-none focus:border-emerald-400 focus:bg-white/10 text-sm tracking-wide transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="student-email" className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">Email Address</label>
                  <input
                    id="student-email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. scholar@botany-honors.edu"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-emerald-100/25 focus:outline-none focus:border-emerald-400 focus:bg-white/10 text-sm tracking-wide transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="student-message" className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block">Query details / Textbook requests</label>
                  <textarea
                    id="student-message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. I request the taxonomy key handbook for Honors 1st year..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-emerald-100/25 focus:outline-none focus:border-emerald-400 focus:bg-white/10 text-sm tracking-wide transition-all"
                  />
                  <span className="text-[10px] text-emerald-100/30 font-mono block text-right">Max 2000 characters</span>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-[#102a23] disabled:text-emerald-100/20 text-emerald-950 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 text-xs uppercase tracking-widest"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-950" />
                      <span>Saving to Firebase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-emerald-950" />
                      <span>Dispatch Query</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
