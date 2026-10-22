import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2, Link2, Sparkles, User, BookOpen } from 'lucide-react';

interface UploadHandNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear?: '1st-year' | '2nd-year' | '3rd-year' | '4th-year';
  onSuccess?: () => void;
}

const BOTANY_SUBJECTS_BY_YEAR: Record<string, string[]> = {
  '3rd-year': [
    'উদ্ভিদ শারীরতত্ত্ব ও প্রাণরসায়ন (Plant Physiology & Biochemistry)',
    'কোষবিদ্যা ও কোষবংশগতিবিদ্যা (Cytology & Cytogenetics)',
    'বংশগতিবিদ্যা ও আণবিক জীববিজ্ঞান (Genetics & Molecular Biology)',
    'উদ্ভিদ শারীরস্থান ও ভ্রূণতত্ত্ব (Plant Anatomy & Embryology)',
    'উদ্ভিদ বাস্তুবিদ্যা ও পরিবেশ (Ecology & Environmental Biology)',
    'উদ্ভিদ প্রজনন ও জীবপরিসংখ্যান (Plant Breeding & Biostatistics)',
    'কৃষিতত্ত্ব ও উদ্যানবিদ্যা (Agronomy & Horticulture)',
    'ব্যবহারিক ও ল্যাব শিট (Practical / Lab Notes)',
    'অন্যান্য / স্পেশাল সাজেশন (General / Exam Suggestions)',
  ],
  '1st-year': [
    'অণুজীববিজ্ঞান ও ছত্রাকবিজ্ঞান (Microbiology & Mycology)',
    'শৈবালবিজ্ঞান ও ব্রায়োফাইটা (Phycology & Bryophyta)',
    'উদ্ভিদ শারীরস্থান ও অঙ্গসংস্থান (Anatomy & Morphology)',
    'ব্যবহারিক নোট (Practical Notes)',
  ],
  '2nd-year': [
    'টেরিডোফাইটা ও ব্যক্তবীজী (Pteridophytes & Gymnosperms)',
    'উদ্ভিদ শ্রেণীবিন্যাসবিদ্যা (Plant Taxonomy)',
    'উদ্ভিদ রোগতত্ত্ব (Plant Pathology)',
    'ব্যবহারিক নোট (Practical Notes)',
  ],
  '4th-year': [
    'জীবপ্রযুক্তি ও টিস্যু কালচার (Biotechnology & Tissue Culture)',
    'ফলিত উদ্ভিদবিজ্ঞান ও মাইক্রোবায়োলজি (Applied Botany)',
    'বনবিদ্যা ও অর্থনৈতিক উদ্ভিদবিজ্ঞান (Forestry & Economic Botany)',
    'গবেষণা ও মনোগ্রাফ (Research & Monograph)',
  ],
};

export default function UploadHandNoteModal({
  isOpen,
  onClose,
  defaultYear = '3rd-year',
  onSuccess,
}: UploadHandNoteModalProps) {
  const [title, setTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState<'1st-year' | '2nd-year' | '3rd-year' | '4th-year'>(defaultYear);
  const [subject, setSubject] = useState(
    BOTANY_SUBJECTS_BY_YEAR[defaultYear]?.[0] || 'উদ্ভিদ শারীরতত্ত্ব ও প্রাণরসায়ন (Plant Physiology)'
  );
  const [customSubject, setCustomSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentSubjects = BOTANY_SUBJECTS_BY_YEAR[selectedYear] || BOTANY_SUBJECTS_BY_YEAR['3rd-year'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      setErrorMessage('দয়া করে নোটের শিরোনাম ও ফাইল লিংক প্রদান করুন।');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const finalSubject = customSubject.trim() ? customSubject.trim() : subject;

    try {
      await addDoc(collection(db, 'handnotes'), {
        title: title.trim(),
        subject: finalSubject,
        year: selectedYear,
        fileUrl: fileUrl.trim(),
        authorName: authorName.trim() || 'অনার্স শিক্ষার্থী / ডিপার্টমেন্ট নোট',
        description: description.trim() || '',
        downloadsCount: 0,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setFileUrl('');
        setAuthorName('');
        setDescription('');
        setCustomSubject('');
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'নোট আপলোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      handleFirestoreError(err, OperationType.WRITE, 'handnotes');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#051915] border border-emerald-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative overflow-hidden text-left max-h-[90vh] overflow-y-auto">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-serif text-white font-semibold">হ্যান্ড নোট সফলভাবে আপলোড হয়েছে!</h3>
            <p className="text-xs text-emerald-100/60 max-w-sm">
              আপনার শেয়ার করা নোটটি লাইভ যুক্ত হয়েছে। এখন যেকেউ এটি পড়তে ও ডাউনলোড করতে পারবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-white font-normal">
                  হ্যান্ড নোট / লেকচার শিট আপলোড
                </h3>
                <p className="text-[11px] text-emerald-100/50 mt-0.5 font-light">
                  অনার্স শিক্ষার্থীদের সাথে আপনার স্টাডি নোট বা লেকচার শিট শেয়ার করুন
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Year Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  অনার্স বর্ষ (Honors Year)
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const y = e.target.value as any;
                    setSelectedYear(y);
                    setSubject(BOTANY_SUBJECTS_BY_YEAR[y]?.[0] || '');
                  }}
                  className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="3rd-year">৩য় বর্ষ (3rd Year - স্পেশাল)</option>
                  <option value="1st-year">১ম বর্ষ (1st Year)</option>
                  <option value="2nd-year">২য় বর্ষ (2nd Year)</option>
                  <option value="4th-year">৪র্থ বর্ষ (4th Year)</option>
                </select>
              </div>

              {/* Contributor Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  নোট প্রস্তুতকারক / আপনার নাম
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="যেমন: মো: রফিকুল ইসলাম / ডিপার্টমেন্ট নোট"
                  className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-100/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Subject Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                বিষয় / কোর্স নির্বাচন করুন
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                {currentSubjects.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="custom">-- কাস্টম অন্য কোনো বিষয় লিখুন --</option>
              </select>
            </div>

            {subject === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  কাস্টম বিষয়ের নাম
                </label>
                <input
                  type="text"
                  required
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="যেমন: প্লান্ট বায়োটেকনোলজি ও বায়োস্ট্যাটিস্টিক্স"
                  className="w-full bg-[#03110e] border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-100/20 focus:outline-none"
                />
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                নোটের শিরোনাম (Title) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: ফটোসিন্থেসিস C3 ও C4 চক্র - সহজ হ্যান্ডনোট ও চিত্র"
                className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-emerald-100/20 focus:outline-none"
              />
            </div>

            {/* File URL (Drive / OneDrive / PDF) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  ফাইল ডাউনলোড লিংক (Google Drive / OneDrive / PDF) <span className="text-rose-400">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/.../view বা OneDrive লিংক"
                  className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-emerald-100/20 focus:outline-none font-mono"
                />
                <Link2 className="absolute left-3 top-3 h-4 w-4 text-emerald-400/60" />
              </div>
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-200/60 space-y-1 leading-relaxed">
                <p className="flex items-center gap-1 font-semibold text-emerald-400">
                  <Sparkles className="h-3 w-3" /> কিভাবে ফাইল আপলোড করে লিংক পাবেন:
                </p>
                <p>
                  ১. আপনার গুগল ড্রাইভ (Google Drive) বা মাইক্রোসফট ওয়ানড্রাইভে হ্যান্ড নোটের PDF বা ইমেজ আপলোড করুন।
                </p>
                <p>
                  ২. ফাইলটিতে রাইট ক্লিক করে <span className="text-white font-medium">'Share' &gt; 'Anyone with the link can view'</span> সিলেক্ট করে কপি লিংকটি এখানে পেস্ট করুন।
                </p>
                <p>
                  ৩. শিক্ষার্থীরা স্বয়ংক্রিয়ভাবে সরাসরি ডাউনলোড ও পড়ার সুযোগ পাবে!
                </p>
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                সংক্ষিপ্ত বিবরণ / প্রয়োজনীয় অধ্যায় (ঐচ্ছিক)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="যেমন: ৩য় বর্ষের ফাইনাল পরীক্ষার জন্য গুরুত্বপূর্ণ ১০টি টপিকের বিস্তারিত হাতে লেখা নোট..."
                className="w-full bg-[#03110e] border border-emerald-500/20 focus:border-emerald-400/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-emerald-100/20 focus:outline-none resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-emerald-500/20 hover:bg-emerald-950/40 text-emerald-100/70 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-[#02130e] text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-950" />
                    <span>আপলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 stroke-[2.5]" />
                    <span>নোট প্রকাশ করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
