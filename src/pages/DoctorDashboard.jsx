import React, { useState, useEffect } from 'react';
import { Calendar, User, FileEdit, Video, CheckCircle2, DollarSign, Home, Users, FileText, Apple, LogOut, Plus, Search, MessageCircle, Clock, X, Info, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ChatPanel from '../components/ChatPanel';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = "${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api";

// --- SUB-COMPONENTS ---

const Modal = ({ title, onClose, children }) => (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', position: 'relative' }}
        >
            <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', padding: '8px', borderRadius: '50%', border: 'none', background: 'var(--surface-high)', cursor: 'pointer' }}>
                <X size={20} />
            </button>
            <h2 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '32px' }}>{title}</h2>
            {children}
        </motion.div>
    </div>
);

const DietPlanForm = ({ patient, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        duration_days: 7,
        general_instructions: '',
        restrictions: '',
        days: []
    });

    useEffect(() => {
        // Initialize days
        const initialDays = Array.from({ length: formData.duration_days }, (_, i) => ({
            day_number: i + 1,
            morning_meal: '',
            afternoon_meal: '',
            evening_meal: ''
        }));
        setFormData(prev => ({ ...prev, days: initialDays }));
    }, [formData.duration_days]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const doctor_email = localStorage.getItem('userEmail');
        fetch(`${API_URL}/create-diet-plan/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, doctor_email, patient_id: patient.id || patient.patient_id })
        })
        .then(res => res.json())
        .then(() => {
            alert("Diet plan created and assigned!");
            onClose();
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-xl">
            <div className="grid grid-cols-2 gap-lg">
                <div className="flex flex-col gap-sm">
                    <label style={{ fontWeight: '700', fontSize: '13px' }}>Patient</label>
                    <input type="text" value={patient.name || patient.patient_name || ''} disabled style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-high)', color: 'var(--on-surface)', fontWeight: '800' }} />
                </div>
                <div className="flex flex-col gap-sm">
                    <label style={{ fontWeight: '700', fontSize: '13px' }}>Plan Title</label>
                    <input type="text" placeholder="e.g. Weight Loss Plan" required style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)' }} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
            </div>

            <div className="flex flex-col gap-sm">
                <label style={{ fontWeight: '700', fontSize: '13px' }}>Instructions & Restrictions</label>
                <textarea placeholder="General instructions..." style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', minHeight: '100px' }} value={formData.general_instructions} onChange={e => setFormData({...formData, general_instructions: e.target.value})} />
                <textarea placeholder="Restrictions (avoid sugar, oily food...)" style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', minHeight: '80px', marginTop: '8px' }} value={formData.restrictions} onChange={e => setFormData({...formData, restrictions: e.target.value})} />
            </div>

            <div className="flex flex-col gap-lg">
                <h3 style={{ fontSize: '20px' }}>Daily Schedule</h3>
                <div className="flex flex-col gap-md">
                    {formData.days.map((day, i) => (
                        <div key={i} className="card" style={{ background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '24px' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Day {day.day_number}</h4>
                            <div className="grid grid-cols-3 gap-md">
                                <input type="text" placeholder="Morning Meal" value={day.morning_meal} onChange={e => {
                                    const newDays = [...formData.days];
                                    newDays[i].morning_meal = e.target.value;
                                    setFormData({...formData, days: newDays});
                                }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }} />
                                <input type="text" placeholder="Afternoon Meal" value={day.afternoon_meal} onChange={e => {
                                    const newDays = [...formData.days];
                                    newDays[i].afternoon_meal = e.target.value;
                                    setFormData({...formData, days: newDays});
                                }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }} />
                                <input type="text" placeholder="Evening Meal" value={day.evening_meal} onChange={e => {
                                    const newDays = [...formData.days];
                                    newDays[i].evening_meal = e.target.value;
                                    setFormData({...formData, days: newDays});
                                }} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '16px', marginTop: '20px' }}>Assign Diet Plan</button>
        </form>
    );
};

// --- MAIN VIEWS ---

const DoctorOverview = ({ data, stats, setActiveTab, onAddDiet, onPrescribe }) => (
    <div className="flex flex-col gap-xl">
        <header className="flex justify-between items-end mb-lg" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '48px', marginBottom: '10px' }}>
            <div>
                <h1 style={{ fontSize: '48px', color: 'var(--primary)', fontWeight: '800', letterSpacing: '-0.03em' }}>{data?.doctor_name || 'Doctor'}</h1>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '20px', marginTop: '8px' }}>{data?.specialization || ''} | Ayurvedic Practitioner Hub</p>
            </div>
            <div className="flex gap-md">
                <button onClick={() => setActiveTab('prescriptions')} className="btn-primary" style={{ padding: '16px 32px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }}>Quick Prescription</button>
            </div>
        </header>

        <div className="grid grid-cols-4 gap-lg">
            {stats.map((s, i) => (
                <div key={i} onClick={() => setActiveTab(s.id)} className="card flex flex-col gap-sm" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', cursor: 'pointer', padding: '32px' }}>
                    <div className="flex justify-between items-center text-primary">
                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                        {s.icon}
                    </div>
                    <h3 style={{ fontSize: '42px', fontWeight: '800', marginTop: '4px' }}>{s.value}</h3>
                </div>
            ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '60px', marginTop: '20px' }}>
            <div className="flex flex-col" style={{ gap: '32px' }}>
                <h3 style={{ fontSize: '28px', fontWeight: '800' }}>Today's Consultations</h3>
                <div className="flex flex-col gap-md">
                    {data.consultations.map((c, i) => (
                        <div key={i} className="card flex justify-between items-center" style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '24px' }}>
                            <div className="flex gap-lg items-center">
                                <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User className="text-primary" size={28} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '20px', fontWeight: '800' }}>{c.patient_name}</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{c.time} â€¢ {c.type} â€¢ {c.reason}</p>
                                </div>
                            </div>
                            <div className="flex gap-md">
                                {c.type === 'ONLINE' && <Link to={`/room/${c.id}`} className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px', textDecoration: 'none', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Video size={16} /> Start Call</Link>}
                                <Link to={`/room/${c.id}`} className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px', border: '1px solid var(--outline)', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={16} /> Chat</Link>
                                <button onClick={() => onPrescribe(c)} className="btn-secondary" style={{ padding: '12px 20px', fontSize: '14px', border: '1px solid var(--outline)', borderRadius: '12px', fontWeight: '700' }}>Prescribe</button>
                            </div>
                        </div>
                    ))}
                    {data.consultations.length === 0 && (
                        <div className="card" style={{ textAlign: 'center', padding: '80px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)' }}>
                            <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px' }}>No consultations scheduled for today.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-lg">
                <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '40px', borderRadius: '28px' }}>
                    <h3 style={{ color: 'white', fontSize: '24px', fontWeight: '800' }}>Clinical Assistant</h3>
                    <p style={{ fontSize: '15px', opacity: 0.85, marginTop: '12px', lineHeight: '1.6' }}>Draft and send Ayurvedic medicine schedules directly to patient dashboards with real-time syncing.</p>
                    <div className="flex flex-col gap-sm mt-xl">
                        <button onClick={() => alert("Select a patient first")} className="btn-secondary" style={{ width: '100%', background: 'white', color: 'var(--primary)', padding: '16px', fontWeight: '800' }}>New Quick Prescription</button>
                        <button className="btn-secondary" style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '16px', fontWeight: '800', marginTop: '8px' }}>Panchakarma Library</button>
                    </div>
                </div>
                <div className="card" style={{ border: '1px solid var(--outline-variant)', padding: '32px', borderRadius: '24px' }}>
                    <h4 className="flex items-center gap-sm" style={{ fontSize: '18px', fontWeight: '800' }}><Info size={20} className="text-primary" /> System Updates</h4>
                    <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', marginTop: '12px', lineHeight: '1.5' }}>Updated Ayurvedic protocols for Dosha management are now live. Please review the new dietary guidelines.</p>
                </div>
            </div>
        </div>
    </div>
);

const PrescriptionForm = ({ patient, onClose }) => {
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch(`${API_URL}/create-prescription/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointment_id: patient.id,
                    medicines,
                    notes
                })
            });
            if (response.ok) {
                alert("Digital prescription has been synchronized with the patient dashboard.");
                onClose();
            } else {
                alert("Failed to save prescription. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Connection error while saving prescription.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-sm">
                <label style={{ fontWeight: '800', fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Patient Name</label>
                <input type="text" value={patient.patient_name} disabled style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--outline-variant)', background: 'var(--surface-high)', fontWeight: '700' }} />
            </div>
            <div className="flex flex-col gap-sm">
                <label style={{ fontWeight: '800', fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Ayurvedic Formulations & Dosage</label>
                <div className="flex flex-col gap-md">
                    {medicines.map((med, i) => (
                        <div key={i} className="flex gap-md">
                            <input placeholder="Medicine (e.g. Ashwagandha)" style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)' }} value={med.name} onChange={e => {
                                const nm = [...medicines]; nm[i].name = e.target.value; setMedicines(nm);
                            }} required />
                            <input placeholder="Dosage" style={{ width: '130px', padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)' }} value={med.dosage} onChange={e => {
                                const nm = [...medicines]; nm[i].dosage = e.target.value; setMedicines(nm);
                            }} />
                            <input placeholder="Days" style={{ width: '80px', padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)' }} value={med.duration} onChange={e => {
                                const nm = [...medicines]; nm[i].duration = e.target.value; setMedicines(nm);
                            }} />
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => setMedicines([...medicines, { name: '', dosage: '', duration: '' }])} className="btn-secondary" style={{ width: 'fit-content', fontSize: '13px', padding: '10px 20px', marginTop: '8px', borderRadius: '12px', border: '1px solid var(--outline)' }}>+ Add Formulation</button>
            </div>
            <div className="flex flex-col gap-sm">
                <label style={{ fontWeight: '800', fontSize: '12px', color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Clinical Notes & Pathya (Dietary Advice)</label>
                <textarea placeholder="Specific instructions for the patient..." style={{ padding: '18px', borderRadius: '16px', border: '1px solid var(--outline-variant)', minHeight: '120px', lineHeight: '1.6' }} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button type="submit" disabled={isSaving} className="btn-primary" style={{ padding: '20px', marginTop: '12px', borderRadius: '18px', fontSize: '16px' }}>
                {isSaving ? 'Processing...' : 'Authorize & Send Prescription'}
            </button>
        </form>
    );
};

const AppointmentsView = ({ appointments, onUpdateStatus, onPrescribe, onAddDiet, setActiveTab }) => (
    <div className="flex flex-col gap-huge">
        <header className="flex justify-between items-center">
            <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>Patient Appointments</h2>
            <div className="flex gap-md">
                <div style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '10px 20px', borderRadius: '14px', fontSize: '14px', fontWeight: '800' }}>
                    Total: {appointments.length}
                </div>
            </div>
        </header>

        <div className="flex flex-col gap-xl">
            {appointments.map((app, i) => (
                <motion.div 
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card"
                    style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', padding: '32px', borderRadius: '28px' }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-xl items-center">
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', backgroundColor: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User className="text-primary" size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-md">
                                    <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{app.patient_name}</h3>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '8px', 
                                        fontSize: '12px', 
                                        fontWeight: '800', 
                                        backgroundColor: app.status === 'PENDING' ? 'var(--warning-container)' : app.status === 'SCHEDULED' ? 'var(--primary-container)' : 'var(--surface-high)',
                                        color: app.status === 'PENDING' ? 'var(--on-warning-container)' : app.status === 'SCHEDULED' ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                                    }}>
                                        {app.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-xl gap-y-xs mt-sm">
                                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}><Clock size={14} style={{ inlineSize: '16px', verticalAlign: 'middle', marginRight: '6px' }} /> {app.date} â€¢ {app.time}</p>
                                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}><Info size={14} style={{ inlineSize: '16px', verticalAlign: 'middle', marginRight: '6px' }} /> {app.type} Consultation</p>
                                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}><Users size={14} style={{ inlineSize: '16px', verticalAlign: 'middle', marginRight: '6px' }} /> {app.patient_age} yrs â€¢ {app.patient_gender}</p>
                                    <p style={{ fontSize: '15px', color: 'var(--on-surface-variant)' }}><Search size={14} style={{ inlineSize: '16px', verticalAlign: 'middle', marginRight: '6px' }} /> {app.reason}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-md">
                            {app.status === 'PENDING' && (
                                <>
                                    <button onClick={() => onUpdateStatus(app.id, 'SCHEDULED')} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '14px' }}>Confirm</button>
                                    <button onClick={() => onUpdateStatus(app.id, 'CANCELLED')} className="btn-secondary" style={{ padding: '14px 28px', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '14px' }}>Reject</button>
                                </>
                            )}
                            {app.status === 'SCHEDULED' && (
                                <>
                                    {app.type === 'ONLINE' && <Link to={`/room/${app.id}`} className="btn-primary" style={{ padding: '14px 28px', textDecoration: 'none', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><Video size={18} /> Start Call</Link>}
                                    <button onClick={() => setActiveTab('chat')} className="btn-secondary" style={{ padding: '14px 28px', border: '1px solid var(--outline)', borderRadius: '14px', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'transparent' }}><MessageCircle size={18} /> Chat</button>
                                    <button onClick={() => onPrescribe(app)} className="btn-secondary" style={{ padding: '14px 28px', borderRadius: '14px', border: '1px solid var(--outline)' }}>Prescribe</button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
            {appointments.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)', borderRadius: '32px' }}>
                    <Calendar size={48} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>No appointments found in your schedule.</p>
                </div>
            )}
        </div>
    </div>
);

const PrescriptionsView = ({ prescriptions }) => {
    const handleDownloadPdf = async (prescriptionId) => {
        const element = document.getElementById(`doc-prescription-${prescriptionId}`);
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
    <div className="flex flex-col gap-huge">
        <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)' }}>Prescription History</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {prescriptions.map((p, i) => (
                <motion.div key={i} id={`doc-prescription-${p.id || i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ backgroundColor: '#ffffff', border: '1px solid #e6e2d6', padding: '32px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e6e2d6', paddingBottom: '20px', marginBottom: '24px' }}>
                        <div>
                            <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>{p.patient_name}</h4>
                            <p style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>Prescribed on {p.date}</p>
                        </div>
                        <button onClick={() => handleDownloadPdf(p.id || i)} data-html2canvas-ignore className="btn-secondary flex items-center gap-sm" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}><Download size={16} /> Export PDF</button>
                    </div>
                    <div style={{ backgroundColor: '#f4f1ea', padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
                        <h5 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#2d6a4f', letterSpacing: '0.05em', marginBottom: '16px' }}>Medicines</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {p.medicines.map((m, j) => (
                                <div key={j} style={{ padding: '10px 16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e6e2d6', fontSize: '14px' }}>
                                    <span style={{ fontWeight: '800', color: '#1a1a1a' }}>{m.name}</span> <span style={{ color: '#666' }}>â€¢ {m.dosage} ({m.duration} days)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {p.notes && (
                        <div>
                             <h5 style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>Clinical Advice</h5>
                             <p style={{ fontSize: '15px', color: '#4a4a4a', lineHeight: '1.6' }}>{p.notes}</p>
                        </div>
                    )}
                </motion.div>
            ))}
            {prescriptions.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)', borderRadius: '32px' }}>
                    <FileText size={48} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>No prescriptions authorized yet. Start by prescribing from today's consultations.</p>
                </div>
            )}
        </div>
    </div>
    );
};


const PatientsView = ({ doctorEmail }) => {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/doctor-patients/?email=${doctorEmail}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPatients(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [doctorEmail]);

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.gender?.toLowerCase().includes(search.toLowerCase())
    );

    const statusColor = (status) => {
        const map = {
            SCHEDULED: { bg: 'var(--primary-container)', color: 'var(--on-primary-container)' },
            PENDING: { bg: '#fff3e0', color: '#e65100' },
            COMPLETED: { bg: '#e8f5e9', color: '#1b5e20' },
            CANCELLED: { bg: '#fce4ec', color: '#880e4f' },
        };
        return map[status] || { bg: 'var(--surface-high)', color: 'var(--on-surface-variant)' };
    };

    if (isLoading) return <div className="p-huge text-center" style={{ color: 'var(--on-surface-variant)' }}>Loading patient records...</div>;

    return (
        <div className="flex flex-col gap-huge">
            <header style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '32px' }}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>My Patients</h2>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px', marginTop: '8px' }}>
                            {patients.length} unique patient{patients.length !== 1 ? 's' : ''} treated
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '16px', padding: '12px 20px', width: '300px' }}>
                        <Search size={18} style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '15px', width: '100%', color: 'var(--on-surface)' }}
                        />
                    </div>
                </div>
            </header>

            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)', borderRadius: '32px' }}>
                    <Users size={48} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>
                        {search ? 'No patients matched your search.' : 'No patients found. Patients appear here after their first appointment.'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-lg">
                    {filtered.map((patient) => (
                        <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '28px', overflow: 'hidden' }}
                        >
                            {/* Patient Card Header */}
                            <div className="flex justify-between items-center" style={{ padding: '28px 32px' }}>
                                <div className="flex gap-lg items-center">
                                    {/* Avatar */}
                                    <div style={{ width: '72px', height: '72px', borderRadius: '20px', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                                        {patient.image
                                            ? <img src={patient.image} alt={patient.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <User size={32} style={{ color: 'var(--primary)' }} />
                                        }
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{patient.name}</h3>
                                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px', marginTop: '4px' }}>
                                            {patient.gender && <span>{patient.gender} â€¢ </span>}
                                            {patient.age && <span>{patient.age} yrs â€¢ </span>}
                                            {patient.email}
                                        </p>
                                        <div className="flex gap-sm" style={{ marginTop: '10px', flexWrap: 'wrap' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: 'var(--surface-high)', color: 'var(--on-surface-variant)' }}>
                                                Dosha: {patient.dosha}
                                            </span>
                                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
                                                {patient.total_visits} Visit{patient.total_visits !== 1 ? 's' : ''}
                                            </span>
                                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: '#e8f5e9', color: '#1b5e20' }}>
                                                {patient.prescription_count} Rx
                                            </span>
                                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', backgroundColor: 'var(--surface-high)', color: 'var(--on-surface-variant)' }}>
                                                Last: {patient.last_visit_date}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-md items-center">
                                    <button
                                        onClick={() => setExpandedId(expandedId === patient.id ? null : patient.id)}
                                        className="btn-secondary"
                                        style={{ padding: '10px 20px', border: '1px solid var(--outline-variant)', borderRadius: '12px', fontSize: '14px', fontWeight: '700' }}
                                    >
                                        {expandedId === patient.id ? 'Hide History' : 'View History'}
                                    </button>
                                </div>
                            </div>

                            {/* Expandable Appointment History */}
                            <AnimatePresence>
                                {expandedId === patient.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderTop: '1px solid var(--outline-variant)' }}
                                    >
                                        <div style={{ padding: '24px 32px' }}>
                                            <h4 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em', marginBottom: '16px' }}>
                                                Appointment History
                                            </h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                                                {patient.appointments.map((app, idx) => {
                                                    const sc = statusColor(app.status);
                                                    return (
                                                        <div key={idx} style={{ padding: '16px 20px', backgroundColor: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div>
                                                                <p style={{ fontWeight: '700', fontSize: '15px' }}>{app.date}</p>
                                                                <p style={{ color: 'var(--on-surface-variant)', fontSize: '13px', marginTop: '3px' }}>{app.time} â€¢ {app.type}</p>
                                                            </div>
                                                            <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', backgroundColor: sc.bg, color: sc.color }}>
                                                                {app.status}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {patient.appointments.length === 0 && (
                                                <p style={{ color: 'var(--on-surface-variant)', fontSize: '14px' }}>No appointment records found.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DietPlansView = ({ doctorEmail, onAddDiet, patientsList }) => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null); // plan being edited
    const [deletingPlanId, setDeletingPlanId] = useState(null); // plan id being confirmed for deletion
    const [isSaving, setIsSaving] = useState(false);
    const [expandedPlanId, setExpandedPlanId] = useState(null);

    const fetchPlans = () => {
        setIsLoading(true);
        fetch(`${API_URL}/doctor-diet-plans/?email=${doctorEmail}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setPlans(data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    };

    useEffect(() => { fetchPlans(); }, [doctorEmail]);

    const handleDelete = async (planId) => {
        try {
            const res = await fetch(`${API_URL}/delete-diet-plan/${planId}/`, { method: 'DELETE' });
            if (res.ok) {
                setPlans(prev => prev.filter(p => p.id !== planId));
                setDeletingPlanId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingPlan) return;
        setIsSaving(true);
        try {
            const res = await fetch(`${API_URL}/update-diet-plan/${editingPlan.id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlan)
            });
            if (res.ok) {
                setPlans(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
                setEditingPlan(null);
                alert('Diet plan updated successfully!');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const updateEditDay = (dayIdx, field, value) => {
        setEditingPlan(prev => ({
            ...prev,
            days: prev.days.map((d, i) => i === dayIdx ? { ...d, [field]: value } : d)
        }));
    };

    if (isLoading) return <div className="p-huge text-center" style={{ color: 'var(--on-surface-variant)' }}>Loading diet plans...</div>;

    return (
        <div className="flex flex-col gap-huge">
            <header className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>Therapeutic Diet Plans</h2>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px', marginTop: '8px' }}>
                        {plans.length} plan{plans.length !== 1 ? 's' : ''} assigned to your patients
                    </p>
                </div>
                <div className="flex gap-md">
                    <div style={{ backgroundColor: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '12px 24px', borderRadius: '14px', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                        Total: {plans.length}
                    </div>
                    {patientsList && patientsList.length > 0 && (
                        <div style={{ position: 'relative' }}>
                            <select 
                                defaultValue=""
                                onChange={(e) => {
                                    if(e.target.value) {
                                        const p = patientsList.find(x => x.id == e.target.value);
                                        onAddDiet(p);
                                        e.target.value = "";
                                    }
                                }}
                                style={{
                                    padding: '12px 24px', borderRadius: '14px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '14px', border: 'none', cursor: 'pointer', appearance: 'none', paddingRight: '40px', outline: 'none'
                                }}
                            >
                                <option value="" disabled>+ Create New Plan</option>
                                {patientsList.map(p => (
                                    <option key={p.id} value={p.id}>{p.patient_name}</option>
                                ))}
                            </select>
                            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'white', fontSize: '12px' }}>â–¼</span>
                        </div>
                    )}
                </div>
            </header>

            {plans.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '100px', background: 'var(--surface-lowest)', border: '1px dashed var(--outline)', borderRadius: '32px' }}>
                    <Apple size={48} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>No diet plans created yet. Add one from a patient's appointment.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-xl">
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                            style={{ backgroundColor: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '28px', overflow: 'hidden' }}
                        >
                            {/* Plan Header */}
                            <div className="flex justify-between items-start" style={{ padding: '32px' }}>
                                <div className="flex gap-lg items-center">
                                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: plan.is_active ? 'var(--primary-container)' : 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Apple size={26} style={{ color: plan.is_active ? 'var(--primary)' : 'var(--on-surface-variant)' }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-md">
                                            <h3 style={{ fontSize: '22px', fontWeight: '800' }}>{plan.title}</h3>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800',
                                                backgroundColor: plan.is_active ? 'var(--primary-container)' : 'var(--surface-high)',
                                                color: plan.is_active ? 'var(--on-primary-container)' : 'var(--on-surface-variant)'
                                            }}>
                                                {plan.is_active ? 'ACTIVE' : 'PAST'}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '4px' }}>
                                            Patient: <strong>{plan.patient_name}</strong> &nbsp;â€¢&nbsp; {plan.duration_days} days &nbsp;â€¢&nbsp; Created {plan.created_at}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-md">
                                    <button
                                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                                        className="btn-secondary"
                                        style={{ padding: '10px 20px', border: '1px solid var(--outline-variant)', borderRadius: '12px', fontSize: '14px', fontWeight: '700' }}
                                    >
                                        {expandedPlanId === plan.id ? 'Hide Days' : `View ${plan.duration_days} Days`}
                                    </button>
                                    <button
                                        onClick={() => setEditingPlan(JSON.parse(JSON.stringify(plan)))}
                                        style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        <FileEdit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => setDeletingPlanId(plan.id)}
                                        style={{ padding: '10px 20px', background: '#ffdad6', color: 'var(--error)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Instructions Row */}
                            {(plan.general_instructions || plan.restrictions) && (
                                <div className="grid grid-cols-2 gap-lg" style={{ padding: '0 32px 24px', borderTop: '1px solid var(--outline-variant)', paddingTop: '24px' }}>
                                    {plan.general_instructions && (
                                        <div>
                                            <h5 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.06em', marginBottom: '8px' }}>General Guidelines</h5>
                                            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>{plan.general_instructions}</p>
                                        </div>
                                    )}
                                    {plan.restrictions && (
                                        <div>
                                            <h5 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#c62828', letterSpacing: '0.06em', marginBottom: '8px' }}>Restrictions</h5>
                                            <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', lineHeight: '1.6' }}>{plan.restrictions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Expanded Days */}
                            <AnimatePresence>
                                {expandedPlanId === plan.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', borderTop: '1px solid var(--outline-variant)' }}
                                    >
                                        <div style={{ padding: '24px 32px', maxHeight: '480px', overflowY: 'auto' }}>
                                            <div className="grid grid-cols-1 gap-md">
                                                {plan.days.map((day, idx) => (
                                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr', gap: '16px', alignItems: 'center', padding: '12px 16px', backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--surface-high)', borderRadius: '12px' }}>
                                                        <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '14px' }}>Day {day.day_number}</span>
                                                        <div>
                                                            <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Morning</p>
                                                            <p style={{ fontSize: '13px' }}>{day.morning_meal || 'â€”'}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Afternoon</p>
                                                            <p style={{ fontSize: '13px' }}>{day.afternoon_meal || 'â€”'}</p>
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '4px' }}>Evening</p>
                                                            <p style={{ fontSize: '13px' }}>{day.evening_meal || 'â€”'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingPlanId && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>ðŸ—‘ï¸</div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Delete Diet Plan?</h3>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px', lineHeight: '1.6' }}>This action is permanent. The patient will lose access to this diet plan immediately.</p>
                        <div className="flex gap-md justify-center">
                            <button onClick={() => handleDelete(deletingPlanId)} style={{ padding: '14px 36px', backgroundColor: 'var(--error)', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                                Yes, Delete
                            </button>
                            <button onClick={() => setDeletingPlanId(null)} className="btn-secondary" style={{ padding: '14px 36px', border: '1px solid var(--outline)', borderRadius: '14px', fontWeight: '800', fontSize: '15px' }}>
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingPlan && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}>
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ backgroundColor: 'var(--surface)', borderRadius: '28px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '48px', position: 'relative' }}>
                        <button onClick={() => setEditingPlan(null)} style={{ position: 'absolute', top: '24px', right: '24px', padding: '10px', borderRadius: '50%', border: 'none', background: 'var(--surface-high)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '32px', color: 'var(--primary)', marginBottom: '8px' }}>Edit Diet Plan</h2>
                        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '32px' }}>Patient: <strong>{editingPlan.patient_name}</strong></p>

                        <div className="grid grid-cols-2 gap-lg" style={{ marginBottom: '24px' }}>
                            <div className="flex flex-col gap-sm">
                                <label style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Plan Title</label>
                                <input
                                    value={editingPlan.title}
                                    onChange={e => setEditingPlan(p => ({ ...p, title: e.target.value }))}
                                    style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)', fontSize: '15px' }}
                                />
                            </div>
                            <div className="flex flex-col gap-sm">
                                <label style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Status</label>
                                <select
                                    value={editingPlan.is_active ? 'active' : 'past'}
                                    onChange={e => setEditingPlan(p => ({ ...p, is_active: e.target.value === 'active' }))}
                                    style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)', fontSize: '15px', backgroundColor: 'var(--surface)', width: '100%' }}
                                >
                                    <option value="active">Active</option>
                                    <option value="past">Past / Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-sm" style={{ marginBottom: '16px' }}>
                            <label style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>General Instructions</label>
                            <textarea
                                value={editingPlan.general_instructions}
                                onChange={e => setEditingPlan(p => ({ ...p, general_instructions: e.target.value }))}
                                style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)', minHeight: '80px', lineHeight: '1.6', fontSize: '14px' }}
                            />
                        </div>
                        <div className="flex flex-col gap-sm" style={{ marginBottom: '32px' }}>
                            <label style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Restrictions</label>
                            <textarea
                                value={editingPlan.restrictions}
                                onChange={e => setEditingPlan(p => ({ ...p, restrictions: e.target.value }))}
                                style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)', minHeight: '80px', lineHeight: '1.6', fontSize: '14px' }}
                            />
                        </div>

                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Daily Meal Schedule ({editingPlan.duration_days} Days)</h3>
                        <div className="flex flex-col gap-md" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                            {editingPlan.days.map((day, idx) => (
                                <div key={idx} style={{ padding: '20px', backgroundColor: 'var(--surface-lowest)', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
                                    <h4 style={{ color: 'var(--primary)', fontWeight: '800', marginBottom: '14px', fontSize: '15px' }}>Day {day.day_number}</h4>
                                    <div className="grid grid-cols-3 gap-md">
                                        {['morning_meal', 'afternoon_meal', 'evening_meal'].map(field => (
                                            <div key={field}>
                                                <label style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--on-surface-variant)', display: 'block', marginBottom: '6px' }}>
                                                    {field.replace('_meal', '').replace('_', ' ')}
                                                </label>
                                                <input
                                                    value={day[field]}
                                                    onChange={e => updateEditDay(idx, field, e.target.value)}
                                                    placeholder={`${field.replace('_meal','').replace('_',' ')} meal...`}
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '13px' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-md" style={{ marginTop: '32px' }}>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="btn-primary"
                                style={{ flex: 1, padding: '18px', borderRadius: '16px', fontSize: '16px', fontWeight: '800' }}
                            >
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </button>
                            <button
                                onClick={() => setEditingPlan(null)}
                                className="btn-secondary"
                                style={{ padding: '18px 36px', border: '1px solid var(--outline)', borderRadius: '16px', fontSize: '16px' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// â”€â”€â”€ Manage Slots View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DoctorSlotsView = ({ doctorEmail }) => {
    const [slots, setSlots] = useState([]);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchSlots = () => {
        setIsLoading(true);
        fetch(`${API_URL}/doctor-slots/?email=${doctorEmail}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setSlots(data);
                setIsLoading(false);
            });
    };

    useEffect(() => { fetchSlots(); }, [doctorEmail]);

    const handleAddSlot = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/add-doctor-slot/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: doctorEmail, date, start_time: time, end_time: endTime })
            });
            if (res.ok) {
                fetchSlots();
                setTime('');
                setEndTime('');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add slot');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        try {
            const res = await fetch(`${API_URL}/delete-doctor-slot/${slotId}/`, { method: 'DELETE' });
            if (res.ok) fetchSlots();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col gap-huge">
            <header className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '32px' }}>
                <div>
                    <h2 style={{ fontSize: '42px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>Manage Availability</h2>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px', marginTop: '8px' }}>Set your available time slots for patients to book</p>
                </div>
            </header>

            <form onSubmit={handleAddSlot} className="card" style={{ padding: '32px', backgroundColor: 'var(--surface-lowest)', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Add New Time Slot</h3>
                <div className="flex gap-md items-end">
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Date</label>
                        <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', width: '100%', fontSize: '15px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Start Time</label>
                        <input type="time" required value={time} onChange={e => setTime(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', width: '100%', fontSize: '15px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>End Time (Optional)</label>
                        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', width: '100%', fontSize: '15px' }} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '16px 32px', borderRadius: '12px', fontWeight: '800', height: '54px' }}>Add Slot</button>
                </div>
            </form>

            <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>Your Available Slots</h3>
                {isLoading ? <p>Loading slots...</p> : (
                    <div className="grid grid-cols-4 gap-md">
                        {slots.map(slot => (
                            <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', borderRadius: '16px', backgroundColor: slot.is_booked ? 'var(--surface-high)' : 'var(--primary-container)', border: '1px solid var(--outline-variant)' }}>
                                <div style={{ fontSize: '16px', fontWeight: '800', color: slot.is_booked ? 'var(--on-surface-variant)' : 'var(--on-primary-container)' }}>{slot.date}</div>
                                <div style={{ fontSize: '20px', fontWeight: '900', color: slot.is_booked ? 'var(--on-surface-variant)' : 'var(--primary)' }}>
                                    {slot.start_time.substring(0,5)} {slot.end_time ? `- ${slot.end_time.substring(0,5)}` : ''}
                                </div>
                                {slot.is_booked ? (
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--error)' }}>Booked</span>
                                ) : (
                                    <button onClick={() => handleDeleteSlot(slot.id)} style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: 'var(--error)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', padding: 0, marginTop: '8px' }}>Remove</button>
                                )}
                            </div>
                        ))}
                        {slots.length === 0 && <p style={{ color: 'var(--on-surface-variant)' }}>No time slots added yet.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

// â”€â”€â”€ Doctor Profile Edit View â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DoctorProfileView = () => {
    const email = localStorage.getItem('userEmail');
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/doctor-profile/?email=${email}`)
            .then(r => r.json())
            .then(data => { setProfile(data); setForm(data); })
            .catch(() => {});
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/doctor-profile/?email=${email}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, email })
            });
            const data = await res.json();
            if (res.ok) {
                setProfile(form);
                setEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Network error');
        }
        setSaving(false);
    };

    if (!profile) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--on-surface-variant)' }}>Loading profile...</div>;

    const inputStyle = { padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontSize: '15px', width: '100%', color: 'var(--on-surface)' };
    const labelStyle = { fontSize: '13px', fontWeight: '700', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'block' };

    return (
        <div className="flex flex-col gap-lg">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>My Profile</h2>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>Manage your professional details and consultation fee</p>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', background: 'var(--primary)', border: 'none', color: 'var(--on-primary)', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                        <FileEdit size={16} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Success toast */}
            <AnimatePresence>
                {saved && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', background: 'rgba(45,106,79,0.1)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                        <CheckCircle2 size={18} /> Profile updated successfully!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Card (view mode) */}
            {!editing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ backgroundColor: 'var(--surface-lowest)', borderRadius: '28px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
                    {/* Banner */}
                    <div style={{ height: '100px', background: 'linear-gradient(135deg, var(--primary), #52b788)' }} />
                    <div style={{ padding: '0 40px 40px' }}>
                        {/* Avatar */}
                        <div style={{ marginTop: '-50px', marginBottom: '20px' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--surface-lowest)', overflow: 'hidden', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {profile.image
                                    ? <img src={profile.image} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <User size={40} style={{ color: 'var(--primary)' }} />}
                            </div>
                        </div>
                        <h3 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em' }}>{profile.name}</h3>
                        <p style={{ color: 'var(--primary)', fontWeight: '700', marginTop: '2px' }}>{profile.specialization}</p>
                        <p style={{ color: 'var(--on-surface-variant)', marginTop: '12px', lineHeight: 1.7, maxWidth: '600px' }}>{profile.bio}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginTop: '32px' }}>
                            {[
                                { label: 'Experience', value: profile.experience },
                                { label: 'Rating', value: `â­ ${profile.rating}` },
                                { label: 'Consultation Fee', value: `â‚¹${profile.consultation_fee}`, highlight: true },
                            ].map(({ label, value, highlight }) => (
                                <div key={label} style={{ padding: '20px', borderRadius: '16px', background: highlight ? 'var(--primary-container)' : 'var(--surface-high)', textAlign: 'center' }}>
                                    <p style={{ fontSize: '22px', fontWeight: '900', color: highlight ? 'var(--primary)' : 'var(--on-surface)' }}>{value}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '700', marginTop: '4px' }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Edit Form */}
            {editing && (
                <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSave}
                    style={{ backgroundColor: 'var(--surface-lowest)', borderRadius: '28px', border: '1px solid var(--outline-variant)', padding: '40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* Photo Upload */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {form.image ? <img src={form.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} style={{ color: 'var(--primary)' }} />}
                        </div>
                        <div>
                            <label style={{ ...labelStyle, cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', display: 'inline-block' }}>
                                ðŸ“· Change Photo
                                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            </label>
                            <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '6px' }}>JPG, PNG â€” max 2MB</p>
                        </div>
                    </div>

                    {/* Fields grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {[
                            { label: 'Full Name', field: 'name', type: 'text' },
                            { label: 'Specialization', field: 'specialization', type: 'text' },
                            { label: 'Years of Experience', field: 'experience', type: 'text', placeholder: 'e.g. 8 years' },
                            { label: 'ðŸ’° Consultation Fee (â‚¹)', field: 'consultation_fee', type: 'number', min: '0', step: '50', highlight: true },
                        ].map(({ label, field, type, placeholder, min, step, highlight }) => (
                            <div key={field}>
                                <label style={labelStyle}>{label}</label>
                                <input type={type} value={form[field] || ''} placeholder={placeholder}
                                    min={min} step={step}
                                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                                    style={{ ...inputStyle, borderColor: highlight ? 'var(--primary)' : undefined, boxShadow: highlight ? '0 0 0 2px var(--primary-container)' : 'none' }} />
                            </div>
                        ))}
                    </div>

                    {/* Bio */}
                    <div>
                        <label style={labelStyle}>Bio / About</label>
                        <textarea rows={5} value={form.bio || ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                            placeholder="Write a short professional bio visible to patients..."
                            style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={() => { setEditing(false); setForm(profile); }}
                            style={{ flex: 1, padding: '16px', borderRadius: '14px', background: 'var(--surface-high)', border: '1px solid var(--outline-variant)', fontWeight: '700', cursor: 'pointer', fontSize: '15px' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            style={{ flex: 2, padding: '16px', borderRadius: '14px', background: 'var(--primary)', border: 'none', color: 'var(--on-primary)', fontWeight: '800', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {saving ? 'â³ Saving...' : 'âœ… Save Changes'}
                        </button>
                    </div>
                </motion.form>
            )}
        </div>
    );
};

const DoctorDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [prescribePatient, setPrescribePatient] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);

    const fetchDashboard = () => {
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('role');

        // Guard: redirect immediately if not a doctor â€” prevents the "Access Denied" flash on reload
        if (!email || !role) { navigate('/login'); return; }
        if (role !== 'doctor') { navigate('/dashboard'); return; }

        fetch(`${API_URL}/doctor-dashboard/?email=${email}`)
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.error || "Dashboard error") });
                }
                return res.json();
            })
            .then(data => {
                setDashboardData(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setErrorMessage(err.message || 'Failed to load dashboard.');
                setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchDashboard();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'prescriptions') {
             const email = localStorage.getItem('userEmail');
             fetch(`${API_URL}/doctor-prescriptions/?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setPrescriptions(data);
                });
        }
    }, [activeTab]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_URL}/update-appointment-status/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (res.ok) {
                fetchDashboard();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'slots', label: 'Manage Slots', icon: Clock },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'diet', label: 'Diet Plans', icon: Apple },
        { id: 'chat', label: 'Chat', icon: MessageCircle },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const stats = dashboardData?.stats ? [
        { label: 'Today\'s Appointments', value: dashboardData.stats.today_appointments, icon: <Calendar size={20} />, id: 'appointments' },
        { label: 'Pending Consultations', value: dashboardData.stats.pending_consultations, icon: <Clock size={20} />, id: 'appointments' },
        { label: 'Patients Treated', value: dashboardData.stats.patients_treated, icon: <Users size={20} />, id: 'patients' },
        { label: 'Daily Earnings', value: dashboardData.stats.daily_earnings, icon: <DollarSign size={20} />, id: 'earnings' },
    ] : [
        { label: 'Today\'s Appointments', value: 0, icon: <Calendar size={20} />, id: 'appointments' },
        { label: 'Pending Consultations', value: 0, icon: <Clock size={20} />, id: 'appointments' },
        { label: 'Patients Treated', value: 0, icon: <Users size={20} />, id: 'patients' },
        { label: 'Daily Earnings', value: 'â‚¹0', icon: <DollarSign size={20} />, id: 'earnings' },
    ];

    const renderContent = () => {
        if (isLoading) return <div className="p-huge text-center">Loading your clinical hub...</div>;
        if (errorMessage || !dashboardData) return (
            <div style={{ textAlign: 'center', padding: '120px 40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px' }}>âš ï¸</div>
                <h2 style={{ fontSize: '32px', color: 'var(--error)', marginBottom: '16px' }}>Access Denied</h2>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px', marginBottom: '32px' }}>
                    {errorMessage || 'Could not load dashboard.'}<br/>
                    <span style={{ fontSize: '14px', opacity: 0.7 }}>Please make sure you are logged in as a Doctor, not as a Patient.</span>
                </p>
                <button onClick={handleLogout} className="btn-primary" style={{ padding: '16px 48px', borderRadius: '16px', fontSize: '16px' }}>
                    Logout & Switch Account
                </button>
            </div>
        );
        
        switch(activeTab) {
            case 'dashboard': return <DoctorOverview data={dashboardData} stats={stats} setActiveTab={setActiveTab} onAddDiet={setSelectedPatient} onPrescribe={setPrescribePatient} />;
            case 'appointments': return <AppointmentsView appointments={dashboardData.appointments || []} onUpdateStatus={handleUpdateStatus} onPrescribe={setPrescribePatient} onAddDiet={setSelectedPatient} setActiveTab={setActiveTab} />;
            case 'prescriptions': return <PrescriptionsView prescriptions={prescriptions} />;
            case 'patients': return <PatientsView doctorEmail={localStorage.getItem('userEmail')} />;
            case 'diet': 
                const uniquePatientsMap = new Map();
                (dashboardData?.appointments || []).forEach(a => {
                    if (a.patient_id && !uniquePatientsMap.has(a.patient_id)) {
                        uniquePatientsMap.set(a.patient_id, { id: a.patient_id, patient_name: a.patient_name });
                    }
                });
                const pList = Array.from(uniquePatientsMap.values());
                return <DietPlansView doctorEmail={localStorage.getItem('userEmail')} onAddDiet={setSelectedPatient} patientsList={pList} />;
            case 'chat': return (
                <div className="flex flex-col gap-lg">
                    <div style={{ borderBottom: '1px solid var(--outline-variant)', paddingBottom: '24px' }}>
                        <h2 style={{ fontSize: '38px', fontWeight: '800', color: 'var(--primary)', letterSpacing: '-0.03em' }}>Patient Chat Portal</h2>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '15px', marginTop: '6px' }}>Real-time messaging with your confirmed patients</p>
                    </div>
                    <ChatPanel
                        role="doctor"
                        conversations={(dashboardData.appointments || []).filter(a => a.status === 'SCHEDULED').map(a => ({ id: String(a.id), label: a.patient_name, sublabel: `${a.type} â€¢ ${a.date}` }))}
                        emptyMessage="No confirmed appointments yet. Confirm a patient booking to start chatting."
                    />
                </div>
            );
            case 'slots': return <DoctorSlotsView doctorEmail={localStorage.getItem('userEmail')} />;
            case 'profile': return <DoctorProfileView />;
            case 'earnings': return <div className="flex flex-col gap-lg"><h2 style={{ fontSize: '32px', fontWeight: '800' }}>Finances</h2><p style={{ color: 'var(--on-surface-variant)', fontSize: '18px' }}>Current daily earnings: â‚¹{dashboardData?.stats?.daily_earnings ?? 0}</p></div>;
            default: return <DoctorOverview data={dashboardData} stats={stats} setActiveTab={setActiveTab} onAddDiet={setSelectedPatient} onPrescribe={setPrescribePatient} />;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--surface)', position: 'relative' }}>
            
            {/* Left Fixed Sidebar */}
            <aside style={{ width: '260px', backgroundColor: 'var(--surface-lowest)', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
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
                                display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer',
                                backgroundColor: activeTab === item.id ? 'var(--primary-container)' : 'transparent',
                                color: activeTab === item.id ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                                fontWeight: activeTab === item.id ? '800' : '600', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid var(--outline-variant)' }}>
                    <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', color: 'var(--error)', fontWeight: '800', backgroundColor: 'var(--surface-high)' }}>
                        <LogOut size={20} />
                        <span>Logout Doctor</span>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, marginLeft: '260px', padding: '60px', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                        style={{ maxWidth: '1200px', margin: '0 auto' }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Modals */}
            {selectedPatient && (
                <Modal title="Create Ayurvedic Diet Plan" onClose={() => setSelectedPatient(null)}>
                    <DietPlanForm patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
                </Modal>
            )}
            {prescribePatient && (
                <Modal title="Digital Prescription" onClose={() => setPrescribePatient(null)}>
                    <PrescriptionForm patient={prescribePatient} onClose={() => setPrescribePatient(null)} />
                </Modal>
            )}

        </div>
    );
};

// Internal icon not imported but used in logic
const Leaf = ({ className, size }) => (
    <div className={className} style={{ color: 'var(--primary)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C10.9 14.36 12 15 15 13"/><path d="M11 20c0-2.5 1.5-4.5 4-5"/></svg>
    </div>
);

export default DoctorDashboard;
