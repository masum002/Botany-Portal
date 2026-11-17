import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FallingLeaves from './components/FallingLeaves';
import { SettingsProvider, useSettings } from './components/SettingsContext';
import SiteClosedScreen from './components/SiteClosedScreen';
import { Loader2 } from 'lucide-react';

// Pages import
import Home from './pages/Home';
import YearPage from './pages/YearPage';
import BookViewPage from './pages/BookViewPage';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function LayoutWrapper() {
  const location = useLocation();
  const { settings, loading } = useSettings();
  
  // Hide standard public header/footer in full focus book viewing mode,
  // or inside the admin panels to increase focus and workspace real-estate.
  const isReaderView = location.pathname.startsWith('/view');
  const isAdminZone = location.pathname.startsWith('/admin-dashboard') || location.pathname.startsWith('/admin-login');

  if (!isAdminZone && loading) {
    return (
      <div className="min-h-screen bg-[#020a08] text-[#e5e7eb] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!isAdminZone && settings.isSiteClosed) {
    return <SiteClosedScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#020a08] text-[#e5e7eb] font-sans antialiased relative overflow-hidden">
      {/* Dynamic Falling Botanical Leaves Backdrop */}
      <FallingLeaves />
      
      {!isReaderView && !isAdminZone && <Header />}
      
      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/year/:id" element={<YearPage />} />
          <Route path="/view/:bookId" element={<BookViewPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>

      {!isReaderView && !isAdminZone && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SettingsProvider>
        <LayoutWrapper />
      </SettingsProvider>
    </Router>
  );
}
