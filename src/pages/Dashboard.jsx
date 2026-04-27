import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, FileText, Activity, MessageCircle, ChevronRight, Download, Plus, MapPin, Video, User, Home, Users, Apple, LogOut, Menu, X, Search, Leaf, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = "${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api";

// --- SUB-VIEWS ---

const DashboardOverview = ({ setActiveTab, data }) => {
  const userName = data?.name || localStorage.getItem('name') || 'Patient';
  const appointments = Array.isArray(data?.appointments) ? data.appointments : [];
  const prescriptions = Array.isArray(data?.prescriptions) ? data.prescriptions : [];
  const dosha = data?.dosha || 'Vata-Pitta (Estimate)';
  
  const healthMetrics = [
    { label: 'Weight', value: '72 kg', status: 'Stable' }, 
    { label: 'Sleep', value: '6.5 hrs', status: 'Needs Improvement', color: 'var(--error)' }, 
    { label: 'Water', value: '2.5 L', status: 'On Track' }
  ];

  return (
    <div className="flex flex-col" style={{ gap: '60px' }}>
      <header className="flex justify-between items-end" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '48px', marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: '48px', color: 'var(--primary)', letterSpacing: '-0.03em', fontWeight: '800' }}>Hello, {userName}</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '20px', marginTop: '8px' }}>Your central hub for consultations, chats, and health tracking.</p>
        </div>
        <Link to="/doctors" className="btn-primary flex items-center gap-sm" style={{ padding: '18px 36px', textDecoration: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: '800' }}>
          <Plus size={22} /> Book Appointment
        </Link>
      </header>

      <div className="grid" style={{ gridTemplateColumns: '1.8fr 1fr', gap: '60px' }}>
        <div className="flex flex-col" style={{ gap: '50px' }}>
          <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center">
              <h3 style={{ fontSize: '26px', fontWeight: '800' }}>Upcoming Appointment</h3>
              <span onClick={() => setActiveTab('appointments')} className="text-primary" style={{ fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>View All</span>
            </div>
            {appointments.length > 0 ? (
              appointments.slice(0, 1).map((a, i) => (
                <div key={i} className="card flex flex-col gap-lg" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '32px' }}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-lg">
                      <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: 'var(--surface-high)', overflow: 'hidden' }}>
                        {a.doctor_image && <img src={a.doctor_image} alt="Doctor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div className="flex flex-col">
                        <h4 style={{ fontSize: '22px', fontWeight: '800' }}>{a.doctor}</h4>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '16px', marginTop: '2px' }}>{a.specialty}</span>
                        <div className="flex items-center gap-sm mt-md" style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}>
                          <Calendar size={16} /> {a.date} <Clock size={16} style={{ marginLeft: '12px' }} /> {a.time}
                        </div>
                      </div>
                    </div>
                    {a.status === 'SCHEDULED' && (
                        <div style={{ padding: '8px 16px', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: '900' }}>
                          <span className="flex items-center gap-xs"><Video size={14}/> LIVE JOIN</span>
                        </div>
                    )}
                  </div>
                  <div className="flex gap-lg mt-md">
                    <Link to={`/room/${a.id}`} className="btn-primary flex-1 flex items-center justify-center gap-sm" style={{ textDecoration: 'none', padding: '16px', borderRadius: '14px' }}>
                      <Video size={20} /> Join Video Call
                    </Link>
                    <button onClick={() => setActiveTab('chat')} className="btn-secondary flex items-center justify-center gap-sm" style={{ flex: 0.5, border: '1px solid var(--outline-variant)', padding: '16px', borderRadius: '14px', cursor: 'pointer', color: 'var(--on-surface)' }}>
                      <MessageCircle size={20} /> Chat
                    </button>
                  </div>
                </div>
              ))
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)', borderRadius: '24px' }}>
                     <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px' }}>No upcoming appointments. Book your first session today!</p>
                </div>
            )}
          </div>

          <div className="flex flex-col gap-lg">
            <h3 style={{ fontSize: '26px', fontWeight: '800' }}>Health Tracking</h3>
            <div className="grid grid-cols-3" style={{ gap: '24px' }}>
              {healthMetrics.map((m, i) => (
                <div key={i} className="card" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '24px' }}>
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginBottom: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--primary)' }}>{m.value}</div>
                  <div style={{ fontSize: '13px', color: m.color || 'var(--primary)', marginTop: '12px', fontWeight: '700' }}>{m.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col" style={{ gap: '40px' }}>


          <div className="card" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '40px', borderRadius: '24px', minHeight: '300px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800' }}>Recent Prescriptions</h3>
              <span onClick={() => setActiveTab('prescriptions')} className="text-primary" style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>See All</span>
            </div>
            <div className="flex flex-col" style={{ gap: '24px' }}>
                {prescriptions.slice(0, 3).map((p, i) => (
                    <div key={i} className="flex justify-between items-center" style={{ padding: '20px', backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
                      <div className="flex items-center" style={{ gap: '24px' }}>
                        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--surface-high)', marginRight: '16px' }}><FileText size={24} className="text-primary" /></div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: '800' }}>Dr. {p.doctor_name}</h4>
                          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{p.date}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} style={{ color: 'var(--outline)' }} />
                    </div>
                ))}
                {prescriptions.length === 0 && (
                    <div className="flex items-center" style={{ gap: '20px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--surface-high)' }}><FileText size={20} className="text-primary" /></div>
                        <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>No recent prescriptions</h4>
                        <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Complete a session first</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentsView = ({ appointments = [], setActiveTab }) => (
  <div className="flex flex-col gap-lg">
    <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>My Appointments</h2>
    <div className="card" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-lowest)' }}>
      <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>All Sessions</h3>
      <div className="flex flex-col gap-md">
        {appointments.map((a, i) => (
            <div key={i} className="flex justify-between items-center" style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                <div>
                <h4 style={{ fontSize: '20px', fontWeight: '700' }}>{a.doctor}</h4>
                <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{a.date} â€¢ {a.time} â€¢ {a.type} Call</p>
                </div>
                <div className="flex items-center" style={{ gap: '16px' }}>
                <Link to={`/room/${a.id}`} className="btn-primary" style={{ padding: '10px 24px', textDecoration: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700' }}>Join Call</Link>
                <button onClick={() => setActiveTab('chat')} className="btn-secondary" style={{ padding: '10px 24px', border: '1px solid var(--outline-variant)', borderRadius: '12px', fontSize: '14px', cursor: 'pointer', color: 'var(--on-surface)', background: 'transparent', fontWeight: '700' }}>Chat</button>
                <div style={{ padding: '10px 20px', border: '1px solid var(--outline-variant)', borderRadius: '12px', fontSize: '13px', fontWeight: '800', backgroundColor: 'var(--surface-highest)' }}>{a.status}</div>
                </div>
            </div>
        ))}
        {appointments.length === 0 && <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', padding: '20px' }}>No appointments found.</p>}
      </div>
    </div>
  </div>
);

const PrescriptionsView = ({ prescriptions = [] }) => {
    const handleDownloadPdf = async (prescriptionId) => {
        const element = document.getElementById(`prescription-${prescriptionId}`);
        if (!element) return;
        
        const originalBorderStyle = element.style.border;
        element.style.border = 'none';

        const canvas = await html2canvas(element, { scale: 2 });
        const data = canvas.toDataURL('image/png');
        
        element.style.border = originalBorderStyle;

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`AyurSana_Prescription_${prescriptionId}.pdf`);
    };

    return (
    <div className="flex flex-col gap-lg">
        <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>Prescriptions & Medicines</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {prescriptions.map((p, i) => (
                <div key={i} id={`prescription-${p.id || i}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e6e2d6', padding: '32px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e6e2d6', paddingBottom: '20px', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Consultation with Dr. {p.doctor_name}</h3>
                            <p style={{ color: '#666', marginTop: '4px', fontSize: '14px' }}>Prescribed on {p.date}</p>
                        </div>
                        <button onClick={() => handleDownloadPdf(p.id || i)} data-html2canvas-ignore className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '1px solid var(--outline)' }}>
                            <Download size={18} /> Download PDF
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <h4 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#2d6a4f' }}>
                                <Leaf size={20} /> Prescribed Medicines
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {p.medicines.map((m, idx) => (
                                    <div key={idx} style={{ padding: '12px 16px', backgroundColor: '#f4f1ea', borderRadius: '12px', fontSize: '14px', border: '1px solid #e6e2d6' }}>
                                        <strong>{m.name}</strong> - {m.dosage} {m.timing ? `(${m.timing})` : ''}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <h4 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#2d6a4f' }}>
                                <FileText size={20} /> Doctor's Notes
                            </h4>
                            <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6' }}>{p.notes || 'No specific notes provided.'}</p>
                            
                            {p.lifestyle_tips && p.lifestyle_tips.length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h5 style={{ fontWeight: '800', fontSize: '14px', marginBottom: '8px', color: '#2d6a4f' }}>Lifestyle Recommendations:</h5>
                                    <ul style={{ fontSize: '14px', color: '#4a4a4a', paddingLeft: '20px' }}>
                                        {p.lifestyle_tips.map((tip, idx) => <li key={idx} style={{ marginBottom: '4px' }}>{tip}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {prescriptions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)' }}>
                    <FileText size={48} style={{ color: 'var(--on-surface-variant)', opacity: 0.2, marginBottom: '20px' }} />
                    <p style={{ color: 'var(--on-surface-variant)' }}>No prescriptions assigned yet.</p>
                </div>
            )}
        </div>
    </div>
    );
};

const DoctorsView = () => {
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/doctors/`)
            .then(res => res.json())
            .then(data => {
                setDoctors(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, []);

    const filtered = doctors.filter(d => 
        (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-lg">
            <div className="flex justify-between items-center">
                <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>Expert Practitioners</h2>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                    <input 
                        type="text" 
                        placeholder="Search specialty..." 
                        style={{ padding: '12px 12px 12px 48px', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', width: '100%' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? <p>Loading practitioners...</p> : (
                <div className="grid grid-cols-2 gap-lg">
                    {filtered.map((d, i) => (
                        <div key={d.id} className="card flex flex-col gap-md" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)' }}>
                            <div className="flex gap-lg items-center">
                                <img src={d.image || `https://i.pravatar.cc/150?u=${d.id}`} alt={d.name} style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                                <div className="flex flex-col">
                                    <h3 style={{ fontSize: '20px' }}>{d.name}</h3>
                                    <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '14px' }}>{d.specialization}</p>
                                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{d.experience} Experience</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-md pt-md" style={{ borderTop: '1px solid var(--outline-variant)' }}>
                                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '18px' }}>
                                    {d.consultation_fee > 0 ? `â‚¹${d.consultation_fee}` : 'Consultation'}
                                </span>
                                <Link to={`/booking/${d.id}`} className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px', textDecoration: 'none' }}>Book Now</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DietPlanView = () => {
    const [plan, setPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        fetch(`${API_URL}/patient-diet-plan/?email=${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.id) setPlan(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    if (isLoading) return <p>Loading your treatment plan...</p>;
    if (!plan) return (
        <div className="card" style={{ padding: '60px', textAlign: 'center', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)' }}>
            <Apple size={48} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: '20px' }} />
            <h3 style={{ fontSize: '24px', color: 'var(--primary)' }}>No Active Diet Plan</h3>
            <p style={{ color: 'var(--on-surface-variant)', marginTop: '8px' }}>Your practitioner will assign a personalized diet plan soon.</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-lg">
            <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>{plan.title}</h2>
            <div className="grid grid-cols-2 gap-lg">
                <div className="card flex flex-col gap-md" style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--primary)', padding: '40px' }}>
                    <h3 className="flex items-center gap-sm" style={{ fontWeight: '800' }}><Apple size={24} /> General Protocol</h3>
                    <p style={{ fontSize: '15px', opacity: 0.8 }}>{plan.general_instructions}</p>
                </div>
                <div className="card flex flex-col gap-md" style={{ border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', padding: '40px' }}>
                    <h3 className="flex items-center gap-sm" style={{ fontWeight: '800' }}><Activity size={24} /> Restrictions</h3>
                    <p style={{ fontSize: '15px', opacity: 0.8 }}>{plan.restrictions}</p>
                </div>
            </div>

            <h3 style={{ fontSize: '24px', marginTop: '20px' }}>Daily Breakdown ({plan.duration_days} Days)</h3>
            <div className="grid grid-cols-1 gap-md">
                {plan.days.map((day, idx) => (
                    <div key={idx} className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '32px' }}>
                        <h4 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '16px' }}>Day {day.day_number}</h4>
                        <div className="grid grid-cols-3 gap-lg">
                            <div>
                                <h5 style={{ fontWeight: '800', fontSize: '13px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Morning</h5>
                                <p style={{ marginTop: '8px' }}>{day.morning_meal}</p>
                            </div>
                            <div>
                                <h5 style={{ fontWeight: '800', fontSize: '13px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Afternoon</h5>
                                <p style={{ marginTop: '8px' }}>{day.afternoon_meal}</p>
                            </div>
                            <div>
                                <h5 style={{ fontWeight: '800', fontSize: '13px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Evening</h5>
                                <p style={{ marginTop: '8px' }}>{day.evening_meal}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChatView = ({ appointments = [] }) => {
    const scheduled = appointments.filter(a => a.status === 'SCHEDULED');
    // Map appointments to ChatPanel conversation format.
    // Note: patient dashboard appointments have 'id' field from backend.
    const conversations = scheduled.map(a => ({
        id: String(a.id),
        label: `Dr. ${a.doctor}`,
        sublabel: `${a.type || 'ONLINE'} â€¢ ${a.time || a.date}`
    }));

    return (
        <div className="flex flex-col gap-lg">
            <div style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '24px' }}>
                <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>My Consultations Chat</h2>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '6px' }}>Real-time messaging with your assigned doctor</p>
            </div>
            <ChatPanel
                role="patient"
                conversations={conversations}
                emptyMessage="No confirmed appointments yet. Once a doctor confirms your booking, you can chat here."
            />
        </div>
    );
};


const ProfileView = () => {
    const fileInputRef = useRef(null);
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = () => {
        const email = localStorage.getItem('userEmail');
        fetch(`${API_URL}/patient-profile/?email=${email}`)
            .then(res => {
                if(!res.ok) throw new Error("Backend error");
                return res.json();
            })
            .then(data => {
                setProfile(data);
                setFormData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Profile Fetch Error:", err);
                setIsLoading(false);
            });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/patient-profile/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, email: localStorage.getItem('userEmail') })
        });
        if (response.ok) {
            alert("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        }
    };

    if (isLoading) return <p>Loading your profile...</p>;

    return (
        <div className="flex flex-col gap-lg">
            <h2 style={{ fontSize: '32px', color: 'var(--primary)' }}>My Profile</h2>
            <div className="card" style={{ border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-lowest)', padding: '40px' }}>
                <div className="flex justify-between items-start mb-huge">
                    <div className="flex gap-lg items-center">
                        <div style={{ position: 'relative' }}>
                            <div style={{ 
                                width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', 
                                fontSize: '42px', fontWeight: 'bold', overflow: 'hidden', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                            }}>
                                {formData.image ? (
                                    <img src={formData.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    profile.name ? profile.name.charAt(0) : 'U'
                                )}
                            </div>
                            {isEditing && (
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ position: 'absolute', bottom: 0, right: 0, padding: '10px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', border: '4px solid white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Camera size={18} />
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '32px', color: 'var(--primary)', fontWeight: '800' }}>{profile.name}</h3>
                            <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>{profile.email}</p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button 
                            type="button" 
                            onClick={() => setIsEditing(true)} 
                            className="btn-secondary" 
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--outline)', borderRadius: '12px' }}
                        >
                            <FileText size={18} /> Edit Profile
                        </button>
                    )}
                </div>

                <form onSubmit={handleUpdate} className="grid grid-cols-2" style={{ gap: '42px', rowGap: '48px', marginTop: '40px' }}>
                    <div className="flex flex-col gap-sm">
                        <label style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isEditing ? 'var(--primary)' : 'var(--on-surface-variant)', marginBottom: '4px' }}>Full Name</label>
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            style={{ 
                                padding: '20px', borderRadius: '14px', border: isEditing ? '2px solid var(--primary)' : '1px solid var(--outline-variant)', 
                                background: isEditing ? 'white' : 'transparent', fontSize: '16px', color: 'var(--on-surface)',
                                transition: 'all 0.3s ease', boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                            value={formData.name || ''}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-sm">
                        <label style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isEditing ? 'var(--primary)' : 'var(--on-surface-variant)', marginBottom: '4px' }}>Phone Number</label>
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            placeholder="Enter phone number"
                            style={{ 
                                padding: '20px', borderRadius: '14px', border: isEditing ? '2px solid var(--primary)' : '1px solid var(--outline-variant)', 
                                background: isEditing ? 'white' : 'transparent', fontSize: '16px', color: 'var(--on-surface)',
                                transition: 'all 0.3s ease', boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                            value={formData.phone || ''}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-sm">
                        <label style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isEditing ? 'var(--primary)' : 'var(--on-surface-variant)', marginBottom: '4px' }}>Age</label>
                        <input 
                            type="number" 
                            disabled={!isEditing}
                            placeholder="Add your age"
                            style={{ 
                                padding: '20px', borderRadius: '14px', border: isEditing ? '2px solid var(--primary)' : '1px solid var(--outline-variant)', 
                                background: isEditing ? 'white' : 'transparent', fontSize: '16px', color: 'var(--on-surface)',
                                transition: 'all 0.3s ease', boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                            }}
                            value={formData.age || ''}
                            onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                    </div>
                    <div className="flex flex-col gap-sm">
                        <label style={{ fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: isEditing ? 'var(--primary)' : 'var(--on-surface-variant)', marginBottom: '4px' }}>Gender</label>
                        <div style={{ position: 'relative' }}>
                            <select 
                                disabled={!isEditing}
                                style={{ 
                                    padding: '20px', borderRadius: '14px', border: isEditing ? '2px solid var(--primary)' : '1px solid var(--outline-variant)', 
                                    background: isEditing ? 'white' : 'transparent', fontSize: '16px', color: 'var(--on-surface)',
                                    transition: 'all 0.3s ease', appearance: 'none', width: '100%', boxShadow: isEditing ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                }}
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {isEditing && <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>â–¼</div>}
                        </div>
                    </div>
                    
                    {isEditing && (
                        <div className="col-span-2 flex gap-md mt-xl">
                            <button type="submit" className="btn-primary" style={{ padding: '20px 60px', fontSize: '16px', fontWeight: '800', borderRadius: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>Save Changes</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '20px 60px', border: '1px solid var(--outline)', borderRadius: '14px', fontSize: '16px' }}>Cancel</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

// --- MAIN LAYOUT COMPONENT ---

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState({ name: '', appointments: [], prescriptions: [], dosha: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const email = localStorage.getItem('userEmail');
        if (!email) {
            navigate('/login');
            return;
        }

        fetch(`${API_URL}/patient-dashboard/?email=${email}`)
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => {
                        throw new Error(errData.error || "Failed to load dashboard");
                    });
                }
                return res.json();
            })
            .then(data => {
                setDashboardData(data);
                setIsLoading(false);
                setErrorMessage('');
            })
            .catch(err => {
                console.error(err);
                setErrorMessage(err.message);
                setIsLoading(false);
            });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'doctors', label: 'Doctors', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'diet', label: 'Diet & Treatment', icon: Apple },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const renderContent = () => {
        if (isLoading) return <div className="p-huge">Loading your sanctuary...</div>;
        if (errorMessage) return (
            <div className="p-huge" style={{ textAlign: 'center' }}>
                <h2 style={{ color: 'var(--error)', marginBottom: '20px' }}>Authentication Error</h2>
                <p>{errorMessage}</p>
                <button onClick={handleLogout} className="btn-primary mt-lg" style={{ padding: '12px 24px' }}>Switch to Correct Account</button>
            </div>
        );
        
        switch(activeTab) {
            case 'dashboard': return <DashboardOverview setActiveTab={setActiveTab} data={dashboardData} />;
            case 'appointments': return <AppointmentsView appointments={dashboardData.appointments || []} setActiveTab={setActiveTab} />;
            case 'doctors': return <DoctorsView />;
            case 'prescriptions': return <PrescriptionsView prescriptions={dashboardData.prescriptions || []} />;
            case 'diet': return <DietPlanView />;
            case 'chat': return <ChatView appointments={dashboardData.appointments || []} />;
            case 'profile': return <ProfileView />;
            default: return <DashboardOverview setActiveTab={setActiveTab} data={dashboardData} />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)', position: 'relative' }}>
            
            {/* Left Fixed Sidebar */}
            <aside 
                style={{ 
                    width: '260px', 
                    backgroundColor: 'var(--surface-lowest)', 
                    borderRight: '1px solid var(--outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    zIndex: 50
                }}
            >
                <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Leaf className="text-primary" size={28} />
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>AyurSana</span>
                </div>

                <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => (
                        <div 
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                backgroundColor: activeTab === item.id ? 'var(--primary-container)' : 'transparent',
                                color: activeTab === item.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                                fontWeight: activeTab === item.id ? '800' : '600',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid var(--outline-variant)' }}>
                    <div 
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            color: 'var(--error)',
                            fontWeight: '800',
                            backgroundColor: 'var(--surface-high)'
                        }}
                    >
                        <LogOut size={20} />
                        <span>Logout Account</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, marginLeft: '260px', padding: '60px', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
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

export default Dashboard;
