import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Video, Home as ClinicIcon, User, Phone, FileText, CheckCircle, CreditCard, Edit2, Shield, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://doctor-ayurvedha-api.onrender.com/api';
// Dynamically load Razorpay checkout script
const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) { resolve(true); return; }
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Booking = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctor, setDoctor] = useState(null);
  const [isPayingLoading, setIsPayingLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: '', time: '', type: 'online', name: '', phone: '', reason: ''
  });

  // Auth check
  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    if (!isAuth) navigate('/login', { state: { from: `/booking/${doctorId}` } });
  }, [navigate, doctorId]);

  // Fetch doctor details for confirmation page
  useEffect(() => {
    if (doctorId) {
      fetch(`${API_URL}/doctors/${doctorId}/`)
        .then(r => r.json())
        .then(data => setDoctor(data))
        .catch(() => {});
    }
  }, [doctorId]);

  // Pre-fill name from localStorage
  useEffect(() => {
    const name = localStorage.getItem('userName') || '';
    setBookingData(b => ({ ...b, name }));
  }, []);

  const steps = [
    { title: 'Select Slot',        icon: <CalendarIcon size={18} /> },
    { title: 'Consultation Type',  icon: <Video size={18} /> },
    { title: 'Your Details',       icon: <User size={18} /> },
    { title: 'Confirm',            icon: <CheckCircle size={18} /> },
    { title: 'Payment',            icon: <CreditCard size={18} /> },
  ];

  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  useEffect(() => {
    if (doctorId && bookingData.date) {
      setLoadingTimes(true);
      fetch(`${API_URL}/doctor-slots/?doctor_id=${doctorId}&date=${bookingData.date}`)
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) {
                // Filter out booked slots and map to formatted time string
                const times = data.filter(s => !s.is_booked).map(s => {
                    const [h, m] = s.start_time.split(':');
                    const hr = parseInt(h);
                    const ampm = hr >= 12 ? 'PM' : 'AM';
                    const formattedHr = hr % 12 || 12;
                    let timeStr = `${formattedHr.toString().padStart(2, '0')}:${m} ${ampm}`;
                    
                    if (s.end_time) {
                        const [eh, em] = s.end_time.split(':');
                        const ehr = parseInt(eh);
                        const eampm = ehr >= 12 ? 'PM' : 'AM';
                        const formattedEhr = ehr % 12 || 12;
                        timeStr += ` - ${formattedEhr.toString().padStart(2, '0')}:${em} ${eampm}`;
                    }
                    return timeStr;
                });
                setAvailableTimes(times);
            }
            setLoadingTimes(false);
        })
        .catch(() => setLoadingTimes(false));
    }
  }, [doctorId, bookingData.date]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  // Format date nicely
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Razorpay payment flow
  const handlePayment = async () => {
    setIsPayingLoading(true);
    const email = localStorage.getItem('userEmail');
    try {
      // Load Razorpay SDK first
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

      // Step 1: Create Razorpay order
      const res = await fetch(`${API_URL}/create-razorpay-order/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bookingData, email, doctor_id: doctorId })
      });
      const orderData = await res.json();
      if (!res.ok || orderData.error) throw new Error(orderData.error || 'Order creation failed');

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AyurSana',
        description: `Consultation with Dr. ${orderData.doctor_name}`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.patient_name,
          email: orderData.patient_email,
          contact: bookingData.phone,
        },
        theme: { color: '#2d6a4f' },
        handler: async (response) => {
          // Step 3: Verify on backend
          const verifyRes = await fetch(`${API_URL}/verify-razorpay-payment/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointment_id: orderData.appointment_id,
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setPaymentDone(true);
            setStep(5); // Go to success screen
          } else {
            alert('Payment verification failed: ' + verifyData.error);
          }
          setIsPayingLoading(false);
        },
        modal: { ondismiss: () => setIsPayingLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      alert('Payment error: ' + err.message);
      setIsPayingLoading(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -30 }
  };

  const DetailRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid var(--outline-variant)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon, { size: 18, style: { color: 'var(--primary)' } })}
      </div>
      <div>
        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--on-surface)' }}>{value}</p>
      </div>
    </div>
  );

  return (
    <>
      <div className="section-padding" style={{ minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '760px' }}>

          {/* â”€â”€â”€ Progress Stepper â”€â”€â”€ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: '56px' }}>
            <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '2px', background: 'var(--surface-high)', zIndex: 0 }} />
            <div style={{
              position: 'absolute', top: '20px', left: '10%',
              width: `${((Math.min(step, 5) - 1) / 4) * 80}%`,
              height: '2px', background: 'var(--primary)', zIndex: 1,
              transition: 'width 0.4s ease'
            }} />
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: step > i + 1 ? 'var(--primary)' : step === i + 1 ? 'var(--primary)' : 'var(--surface-lowest)',
                  color: step >= i + 1 ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: step < i + 1 ? '2px solid var(--outline-variant)' : 'none',
                  transition: 'all 0.3s',
                  boxShadow: step === i + 1 ? '0 0 0 4px var(--primary-container)' : 'none'
                }}>
                  {step > i + 1 ? <CheckCircle size={18} /> : s.icon}
                </div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: step === i + 1 ? 'var(--primary)' : 'var(--on-surface-variant)', textAlign: 'center', whiteSpace: 'nowrap' }}>{s.title}</span>
              </div>
            ))}
          </div>

          {/* â”€â”€â”€ Card â”€â”€â”€ */}
          <div className="card" style={{ padding: '48px', borderRadius: '28px' }}>
            <AnimatePresence mode="wait">

              {/* STEP 1: Select Slot */}
              {step === 1 && (
                <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-lg">
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>Choose Your Slot</h2>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>Pick a date and time that works best for you</p>
                  </div>
                  <div className="flex flex-col gap-md">
                    <label style={{ fontWeight: '700', fontSize: '14px' }}>Select Date</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]}
                      style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontSize: '16px' }}
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-md">
                    <label style={{ fontWeight: '700', fontSize: '14px' }}>Available Times</label>
                    {loadingTimes ? <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>Loading slots...</p> : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {availableTimes.length > 0 ? availableTimes.map(t => (
                          <button key={t} onClick={() => setBookingData({ ...bookingData, time: t })}
                            style={{ padding: '14px', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: bookingData.time === t ? 'var(--primary)' : 'var(--surface-lowest)',
                              color: bookingData.time === t ? 'var(--on-primary)' : 'var(--on-surface)',
                              border: bookingData.time === t ? 'none' : '1px solid var(--outline-variant)',
                              boxShadow: bookingData.time === t ? '0 4px 12px rgba(45,106,79,0.25)' : 'none'
                            }}>
                            <Clock size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />{t}
                          </button>
                        )) : (
                          <p style={{ gridColumn: '1 / -1', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                            {bookingData.date ? 'No available slots for this date.' : 'Please select a date first.'}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <button className="btn-primary" style={{ padding: '18px', fontSize: '16px', borderRadius: '14px', marginTop: '8px' }}
                    onClick={handleNext} disabled={!bookingData.date || !bookingData.time}>
                    Continue â†’
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Consultation Type */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-lg">
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>Consultation Type</h2>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>How would you like to connect with your doctor?</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {[
                      { value: 'online', Icon: Video, title: 'Online Video', desc: 'Consult from anywhere via our secure encrypted video platform.' },
                      { value: 'offline', Icon: ClinicIcon, title: 'In-Clinic Visit', desc: 'Visit our physical clinic for a traditional hands-on Ayurvedic checkup.' }
                    ].map(({ value, Icon, title, desc }) => (
                      <div key={value} onClick={() => setBookingData({ ...bookingData, type: value })}
                        style={{ padding: '28px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                          backgroundColor: bookingData.type === value ? 'var(--primary)' : 'var(--surface-lowest)',
                          color: bookingData.type === value ? 'var(--on-primary)' : 'var(--on-surface)',
                          border: bookingData.type === value ? 'none' : '2px solid var(--outline-variant)',
                          boxShadow: bookingData.type === value ? '0 8px 24px rgba(45,106,79,0.25)' : 'none',
                          transform: bookingData.type === value ? 'scale(1.02)' : 'scale(1)'
                        }}>
                        <Icon size={36} style={{ marginBottom: '12px' }} />
                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'inherit', marginBottom: '8px' }}>{title}</h4>
                        <p style={{ fontSize: '13px', opacity: 0.8, color: 'inherit', lineHeight: 1.5 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '18px', borderRadius: '14px' }} onClick={handleBack}>â† Back</button>
                    <button className="btn-primary" style={{ flex: 2, padding: '18px', borderRadius: '14px' }} onClick={handleNext}>Continue â†’</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Your Details */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-lg">
                  <div>
                    <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>Your Details</h2>
                    <p style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>Help us personalise your consultation</p>
                  </div>
                  {[
                    { label: 'Full Name', icon: <User size={18} />, type: 'text', placeholder: 'Enter your full name', field: 'name', required: true },
                    { label: 'Phone Number (for SMS reminders)', icon: <Phone size={18} />, type: 'tel', placeholder: '+91 XXXXX XXXXX', field: 'phone', required: true }
                  ].map(({ label, icon, type, placeholder, field, required }) => (
                    <div key={field} className="flex flex-col gap-md">
                      <label style={{ fontWeight: '700', fontSize: '14px' }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }}>{icon}</span>
                        <input type={type} placeholder={placeholder}
                          style={{ padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontSize: '16px', width: '100%' }}
                          value={bookingData[field]}
                          onChange={(e) => setBookingData({ ...bookingData, [field]: e.target.value })}
                          required={required} />
                      </div>
                    </div>
                  ))}
                  <div className="flex flex-col gap-md">
                    <label style={{ fontWeight: '700', fontSize: '14px' }}>Reason for Consultation <span style={{ fontWeight: '400', color: 'var(--on-surface-variant)' }}>(Optional)</span></label>
                    <div style={{ position: 'relative' }}>
                      <FileText size={18} style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--primary)' }} />
                      <textarea placeholder="E.g., Stress, Digestive issues, Skin care, Joint pain..." rows={4}
                        style={{ padding: '16px 16px 16px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontSize: '15px', width: '100%', resize: 'none' }}
                        value={bookingData.reason}
                        onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '18px', borderRadius: '14px' }} onClick={handleBack}>â† Back</button>
                    <button className="btn-primary" style={{ flex: 2, padding: '18px', borderRadius: '14px' }}
                      onClick={handleNext} disabled={!bookingData.name || !bookingData.phone}>
                      Review Booking â†’
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Confirm Details */}
              {step === 4 && (
                <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-lg">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em' }}>Confirm Booking</h2>
                      <p style={{ color: 'var(--on-surface-variant)', marginTop: '6px' }}>Review your details before payment</p>
                    </div>
                    <button onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '12px', background: 'var(--surface-high)', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                      <Edit2 size={14} /> Edit
                    </button>
                  </div>

                  {/* Doctor Card */}
                  {doctor && (
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px', borderRadius: '18px', backgroundColor: 'var(--primary-container)', marginBottom: '4px' }}>
                      <img src={doctor.image || 'https://via.placeholder.com/60'} alt={doctor.name}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} />
                      <div>
                        <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--on-primary-container)' }}>{doctor.name}</p>
                        <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', marginTop: '2px' }}>{doctor.specialization}</p>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>₹{doctor.consultation_fee}</p>
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>Consultation fee</p>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div style={{ backgroundColor: 'var(--surface-lowest)', borderRadius: '18px', padding: '8px 24px' }}>
                    <DetailRow icon={<CalendarIcon />} label="Date" value={formatDate(bookingData.date)} />
                    <DetailRow icon={<Clock />} label="Time" value={bookingData.time} />
                    <DetailRow icon={bookingData.type === 'online' ? <Video /> : <ClinicIcon />} label="Type"
                      value={bookingData.type === 'online' ? '🎥 Online Video Consultation' : 'ðŸ¥ In-Clinic Visit'} />
                    <DetailRow icon={<User />} label="Patient Name" value={bookingData.name} />
                    <DetailRow icon={<Phone />} label="Phone" value={bookingData.phone} />
                    {bookingData.reason && <DetailRow icon={<FileText />} label="Reason" value={bookingData.reason} />}
                  </div>

                  {/* Security Note */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '14px 18px', borderRadius: '12px', backgroundColor: 'rgba(45,106,79,0.06)', border: '1px solid rgba(45,106,79,0.15)' }}>
                    <Shield size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Your payment is secured by Razorpay. We accept UPI, cards, net banking & wallets.</p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '18px', borderRadius: '14px' }} onClick={handleBack}>â† Back</button>
                    <button onClick={handlePayment} disabled={isPayingLoading}
                      style={{ flex: 2, padding: '18px', borderRadius: '14px', background: 'linear-gradient(135deg, #2d6a4f, #40916c)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      {isPayingLoading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <><CreditCard size={18} /> Pay ₹{doctor?.consultation_fee} Now</>}
                    </button>
                  </div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </motion.div>
              )}

              {/* STEP 5: Payment Success */}
              {step === 5 && paymentDone && (
                <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-lg" style={{ textAlign: 'center', padding: '20px 0' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={40} color="white" />
                  </motion.div>
                  <div>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--primary)' }}>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px', marginTop: '8px', lineHeight: 1.6 }}>
                      Your payment was successful. Your appointment is now awaiting doctor confirmation.
                      You'll receive a confirmation once the doctor approves.
                    </p>
                  </div>
                  <div style={{ width: '100%', backgroundColor: 'var(--surface-lowest)', borderRadius: '18px', padding: '16px 24px' }}>
                    <DetailRow icon={<CalendarIcon />} label="Date" value={formatDate(bookingData.date)} />
                    <DetailRow icon={<Clock />} label="Time" value={bookingData.time} />
                    <DetailRow icon={bookingData.type === 'online' ? <Video /> : <ClinicIcon />} label="Type"
                      value={bookingData.type === 'online' ? '🎥 Online Video' : 'ðŸ¥ In-Clinic'} />
                  </div>
                  <button className="btn-primary" style={{ padding: '18px 48px', borderRadius: '14px', fontSize: '16px' }} onClick={() => navigate('/dashboard')}>
                    Go to My Dashboard â†’
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;


