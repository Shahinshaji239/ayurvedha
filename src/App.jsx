import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Leaf, MapPin, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import Doctors from './pages/Doctors';
import Booking from './pages/Booking';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ConsultationRoom from './pages/ConsultationRoom';
import AdminDashboard from './pages/AdminDashboard';

// Common Components
const Navbar = () => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true';
  const name = localStorage.getItem('name') || 'Patient';
  const role = localStorage.getItem('role') || 'patient';
  const dashboardPath = role === 'doctor' ? '/doctor/dashboard' : '/dashboard';

  return (
    <nav className="glass-nav" style={{ padding: '16px 0', borderBottom: '1px solid var(--outline-variant)' }}>
      <div className="container flex justify-between items-center">
        <Link to="/" className="flex items-center gap-md">
          <Leaf className="text-primary" size={32} />
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.02em' }}>AyurSana</span>
        </Link>
        <div className="flex gap-lg items-center">
          <Link to="/doctors" style={{ fontWeight: '500' }}>Doctors</Link>
          <Link to="/treatments" style={{ fontWeight: '500' }}>Treatments</Link>
          <Link to="/blog" style={{ fontWeight: '500' }}>Wellness Blog</Link>
          {isAuth ? (
            <Link to={dashboardPath} className="flex items-center gap-md" style={{ cursor: 'pointer' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{name.charAt(0)}</div>
              <span style={{ fontWeight: '600' }}>{name}</span>
            </Link>
          ) : (
            <Link to="/login" className="btn-primary">Get Started</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="section-padding" style={{ backgroundColor: 'var(--surface-high)', marginTop: '80px' }}>
    <div className="container grid grid-cols-3 gap-lg">
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-md">
          <Leaf className="text-primary" size={24} />
          <h3 style={{ fontSize: '20px' }}>AyurSana</h3>
        </div>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Revolution Ayurveda – Heal Naturally. Connecting you with authentic Ayurvedic wisdom and modern expertise for a balanced life.</p>
        <div className="flex gap-md mt-md">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageCircle size={20} /></div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-lowest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={20} /></div>
        </div>
      </div>
      <div className="flex flex-col gap-md">
        <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Platform</h4>
        <Link to="/doctors" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Find a Doctor</Link>
        <Link to="/treatments" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Treatments</Link>
        <Link to="/blog" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Health Blog</Link>
        <Link to="/privacy" style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Privacy Policy</Link>
      </div>
      <div className="flex flex-col gap-md">
        <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>Reach Out</h4>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><MapPin size={16} /> Kochi, Kerala, India</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}><MessageCircle size={16} /> +91 98765 43210 (WhatsApp)</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>support@ayursana.com</p>
      </div>
    </div>
    <div className="container" style={{ marginTop: 'var(--spacing-xxl)', borderTop: '1px solid var(--outline-variant)', paddingTop: 'var(--spacing-md)' }}>
      <p style={{ fontSize: '12px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>&copy; 2026 AyurSana. All rights reserved. Medical consultations are for wellness purposes.</p>
    </div>
  </footer>
);

const Home = () => {
  const services = [
    { 
      title: 'Online Consultation', 
      desc: 'Expert video consulting from the comfort of your home. Get digital prescriptions instantly.',
      img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      title: 'Detox Programs', 
      desc: 'Personalized Panchakarma and detox plans to rejuvenate your body and mind.',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' 
    }
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="section-padding">
        <div className="container grid grid-cols-2 items-center gap-huge">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-lg"
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--secondary-container)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontWeight: '700', fontSize: '12px', width: 'fit-content', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Leaf size={14} /> The Future of Ayurveda
            </div>
            <h1 style={{ fontSize: '84px', lineHeight: '0.95', color: 'var(--primary)', letterSpacing: '-0.04em' }}>Heal Naturally, Live Fully</h1>
            <p style={{ fontSize: '22px', color: 'var(--on-surface-variant)', maxWidth: '540px' }}>Experience personalized Ayurvedic healthcare that bridges ancient wisdom with modern medical precision.</p>
            <div className="flex gap-md" style={{ marginTop: '16px' }}>
              <Link to="/doctors" className="btn-primary" style={{ padding: '16px 40px', fontSize: '18px' }}>Book Consultation</Link>
              <Link to="/treatments" className="btn-secondary" style={{ padding: '16px 40px', fontSize: '18px', border: '1px solid var(--outline-variant)', backgroundColor: 'transparent' }}>Explore Treatments</Link>
            </div>
            <div className="flex gap-lg items-center mt-xl">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/40?u=${i}`} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }} />
                ))}
              </div>
              <p style={{ fontSize: '14px', fontWeight: '500' }}>Trusted by 10,000+ satisfied patients</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '700px', backgroundColor: 'var(--surface-high)', position: 'relative' }}
          >
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80" alt="Ayurveda Wellness" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: '32px', right: '32px', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>98%</div>
              <p style={{ fontSize: '14px', fontWeight: '600', maxWidth: '100px' }}>Positive Recovery Rate</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding" style={{ backgroundColor: 'var(--surface-low)', borderRadius: 'var(--radius-xl)' }}>
        <div className="container">
          <div className="flex flex-col items-center gap-md mb-huge text-center">
            <h2 style={{ fontSize: '56px', letterSpacing: '-0.02em' }}>Holistic Wellness Path</h2>
            <p style={{ maxWidth: '600px', fontSize: '18px', color: 'var(--on-surface-variant)' }}>Each step of your journey is carefully curated by our senior Vaidyas to ensure lasting results.</p>
          </div>
          <div className="grid grid-cols-2 gap-lg" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {services.map((s, i) => (
              <div key={i} className="card flex flex-col gap-md" style={{ backgroundColor: 'var(--surface-lowest)' }}>
                <img src={s.img} style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '16px' }} alt={s.title} />
                <h3 style={{ fontSize: '24px' }}>{s.title}</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px' }}>{s.desc}</p>
                <Link to="/login" className="flex items-center gap-sm mt-md" style={{ fontWeight: '700', color: 'var(--primary)' }}>Learn more <MessageCircle size={18} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container">
          <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '80px', textAlign: 'center', borderRadius: '4rem', backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")' }}>
             <h2 style={{ color: 'white', fontSize: '64px', marginBottom: '24px' }}>Ready to transform your health?</h2>
             <p style={{ fontSize: '22px', opacity: 0.9, maxWidth: '700px', margin: '0 auto 48px' }}>Join the thousands who have already started their natural healing journey with AyurSana.</p>
             <Link to="/login" className="btn-secondary" style={{ padding: '20px 60px', fontSize: '20px', backgroundColor: 'var(--surface-lowest)', color: 'var(--primary)' }}>Start Your Consultation</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

const App = () => {
  const location = useLocation();
  const hideShell = location.pathname.includes('/dashboard') || 
                    location.pathname.includes('/admin-dashboard') || 
                    location.pathname.includes('/doctor/dashboard') ||
                    location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen relative" style={{ backgroundColor: 'var(--surface)' }}>
      {!hideShell && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/booking/:doctorId" element={<Booking />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/room/:id" element={<ConsultationRoom />} />
          <Route path="/treatments" element={<Doctors />} /> {/* Fallback for MVP */}
          <Route path="/blog" element={<Home />} /> {/* Fallback for MVP */}
        </Routes>
      </AnimatePresence>

      {!hideShell && <Footer />}
    </div>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
