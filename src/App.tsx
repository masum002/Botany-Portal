import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

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
  
  // Hide standard public header/footer in full focus book viewing mode,
  // or inside the admin panels to increase focus and workspace real-estate.
  const isReaderView = location.pathname.startsWith('/view');
  const isAdminZone = location.pathname.startsWith('/admin-dashboard') || location.pathname.startsWith('/admin-login');

  return (
    <div className="flex flex-col min-h-screen bg-[#041210] text-[#e5e7eb] font-sans antialiased">
      {!isReaderView && !isAdminZone && <Header />}
      
      <main className="flex-grow">
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
      <LayoutWrapper />
    </Router>
  );
}
