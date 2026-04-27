import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, BarChart2, LogOut, ChevronRight, CheckCircle2, ShieldAlert, Eye, EyeOff, Image as ImageIcon, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

// --- API CONSTANTS ---
const API_URL = 'http://localhost:8000/api';

// --- SUB-VIEWS ---

const OverviewAnalytics = () => {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '...', color: 'var(--primary)' },
    { label: 'Active Doctors', value: '...', color: 'var(--on-primary-container)' },
    { label: 'Total Appointments', value: '...', color: 'var(--error)' },
    { label: 'Projected Revenue', value: '...', color: '#B9A15F' },
  ]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/admin-stats/`)
      .then(res => res.json())
      .then(data => {
        setStats([
          { label: 'Total Users', value: data.total_users, color: 'var(--primary)' },
          { label: 'Active Doctors', value: data.active_doctors, color: 'var(--on-primary-container)' },
          { label: 'Total Appointments', value: data.total_appointments, color: 'var(--error)' },
          { label: 'Projected Revenue', value: data.revenue, color: '#B9A15F' },
        ]);
        setChartData(data.chart_data || []);
      });
  }, []);

  return (
    <div className="flex flex-col gap-lg">
      <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>Platform Performance</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-lg">
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-lowest)', padding: '32px' }}>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1" style={{ marginTop: '20px' }}>
        <div className="card" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '40px' }}>
            <div className="flex justify-between items-center mb-xl">
                <div>
                    <h3 style={{ fontSize: '24px' }}>Appointment Trends</h3>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>Daily consultation bookings over the last 7 days</p>
                </div>
                <div style={{ padding: '8px 16px', backgroundColor: 'var(--secondary-container)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>LIVE DATA</div>
            </div>
            
            <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-ambient)', backgroundColor: 'white' }} />
                        <Area type="monotone" dataKey="appointments" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

const AddDoctorForm = ({ setView, refreshDoctors }) => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialization: '', experience: '1 Year', qualification: '', bio: '', image: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/create-doctor/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        alert("Doctor created successfully!");
        refreshDoctors();
        setView('list');
      } else {
        alert(data.error || "Failed to create doctor");
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const experienceOptions = Array.from({ length: 40 }, (_, i) => `${i + 1} Year${i + 1 > 1 ? 's' : ''}`);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-lg" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex items-center gap-md cursor-pointer" onClick={() => setView('list')} style={{ color: 'var(--on-surface-variant)', fontWeight: '600', width: 'fit-content' }}>
        <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Doctors
      </div>
      <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>Add New Doctor</h2>
      <form onSubmit={handleSubmit} className="card flex flex-col gap-huge" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '60px' }}>
        <div className="grid grid-cols-2" style={{ gap: '48px 60px' }}>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Full Name</label>
            <input type="text" placeholder="Dr. First Last" style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }} required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Address</label>
            <input type="email" placeholder="doctor@ayursana.com" style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }} required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Login Password</label>
            <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" style={{ padding: '16px', paddingRight: '45px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%' }} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </div>
            </div>
          </div>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Specialization</label>
            <input type="text" placeholder="e.g. Panchakarma Expert" style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }} required value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
          </div>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Years of Experience</label>
            <select style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }} value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}>
                {experienceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-sm">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Qualification</label>
            <input type="text" placeholder="e.g. BAMS, MD (Ayurveda)" style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)' }} required value={formData.qualification} onChange={(e) => setFormData({...formData, qualification: e.target.value})} />
          </div>
          <div className="flex flex-col gap-md">
            <label style={{ fontWeight: '600', fontSize: '14px' }}>Doctor Image (Upload)</label>
            <input 
              type="file" 
              accept="image/*"
              style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '14px' }} 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData({...formData, image: reader.result});
                    reader.readAsDataURL(file);
                }
              }} 
            />
            {formData.image && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={formData.image} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Image selected successfully</span>
                </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-sm" style={{ marginTop: '24px' }}>
          <label style={{ fontWeight: '600', fontSize: '14px' }}>Doctor Bio</label>
          <textarea rows={5} placeholder="Brief background about the doctor..." style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface)', resize: 'none' }} required value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} />
        </div>
        <button type="submit" className="btn-primary flex justify-center items-center gap-sm" style={{ width: '100%', padding: '22px', fontSize: '18px', marginTop: '48px' }} disabled={isLoading}>
          {isLoading ? 'Creating...' : <><CheckCircle2 size={20} /> Create Doctor</>}
        </button>
      </form>
    </motion.div>
  );
};

const DoctorsManagement = () => {
  const [view, setView] = useState('list'); // 'list' | 'add'
  const [doctors, setDoctors] = useState([]);

  const fetchDoctors = () => {
    fetch(`${API_URL}/doctors/`)
      .then(res => res.json())
      .then(data => setDoctors(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  if (view === 'add') return <AddDoctorForm setView={setView} refreshDoctors={fetchDoctors} />;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex justify-between items-center">
        <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>Platform Doctors</h2>
        <button className="btn-primary flex items-center gap-sm" onClick={() => setView('add')} style={{ padding: '12px 24px' }}>
          <UserPlus size={18} /> Add New Doctor
        </button>
      </div>
      <div className="card" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-lowest)', padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-high)', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Doctor Details</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Specialization</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Experience</th>
              <th style={{ padding: '16px 24px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doc, i) => (
              <tr key={doc.id || i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                <td style={{ padding: '16px 24px' }}>
                    <div className="flex items-center gap-md">
                        {doc.image ? (
                            <img src={doc.image} alt={doc.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldAlert size={20} className="text-primary" />
                            </div>
                        )}
                        <span style={{ fontWeight: '600' }}>{doc.name}</span>
                    </div>
                </td>
                <td style={{ padding: '16px 24px', color: 'var(--on-surface-variant)' }}>{doc.specialization}</td>
                <td style={{ padding: '16px 24px', color: 'var(--on-surface-variant)' }}>{doc.experience}</td>
                <td style={{ padding: '16px 24px' }}>
                  <button style={{ color: 'var(--error)', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Revoke</button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
                <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>No doctors found. Add your first doctor!</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GenericList = ({ title, url }) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetch(`${API_URL}/${url}/`)
            .then(res => res.json())
            .then(d => setData(d))
            .catch(e => console.error(e));
    }, [url]);

    return (
        <div className="flex flex-col gap-lg">
            <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>{title}</h2>
            <div className="card" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-lowest)', padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--surface-high)', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>ID</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Details</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, i) => (
                            <tr key={i} style={{ borderTop: '1px solid var(--outline-variant)' }}>
                                <td style={{ padding: '20px 24px' }}>#{item.id}</td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontWeight: '700' }}>{item.patient_name || item.username || item.doctor_name || 'N/A'}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>{item.email || 'No email'}</div>
                                </td>
                                <td style={{ padding: '20px 24px', color: 'var(--on-surface-variant)' }}>
                                    {item.phone || item.date || 'Active'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- MAIN LAYOUT ---

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  const navItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: ShieldAlert },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'analytics': return <OverviewAnalytics />;
      case 'doctors': return <DoctorsManagement />;
      case 'users': return <GenericList title="Registered Patients" url="patients" />;
      case 'appointments': return <GenericList title="All Appointments" url="appointments" />;
      default: return <OverviewAnalytics />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)', position: 'relative' }}>
      
      {/* Left Sidebar */}
      <aside style={{ width: '260px', backgroundColor: 'var(--surface-lowest)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '32px 24px' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>AyurSana Admin</h1>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <div 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: activeTab === item.id ? 'var(--primary-container)' : 'transparent',
                color: activeTab === item.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                fontWeight: activeTab === item.id ? '700' : '500',
                transition: 'all 0.2s ease'
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '24px 16px', borderTop: '1px solid var(--outline-variant)' }}>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer', color: 'var(--error)', fontWeight: '600' }}>
            <LogOut size={20} />
            <span>Secure Logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, marginLeft: '260px', padding: '40px', overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{ maxWidth: '1200px', margin: '0 auto' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
};

export default AdminDashboard;
