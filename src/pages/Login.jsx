import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Globe, Eye, EyeOff, Calendar, Users as GenderIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const API_URL = "${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api";

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', age: '', gender: 'Male'
    });

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const endpoint = isLogin ? 'login/' : 'register/';
        
        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', formData.email);
                localStorage.setItem('role', data.role || 'patient');
                localStorage.setItem('userName', data.name || formData.name || formData.email);

                if (data.role === 'doctor') navigate('/doctor/dashboard');
                else if (formData.email === 'admin@ayursana.com') navigate('/admin-dashboard');
                else navigate('/dashboard');
            } else {
                alert(data.error || "Authentication failed");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: 'var(--background)', overflow: 'hidden' }}>
            
            {/* Left Side: Premium Illustration */}
            <div style={{ 
                flex: 1.1, 
                backgroundColor: 'var(--primary)', 
                position: 'relative', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '100px',
                color: 'white'
            }}>
                <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1 }}
                    style={{ position: 'relative', zIndex: 10 }}
                >
                    <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                        <Globe size={28} />
                    </div>
                    <h1 style={{ fontSize: '72px', marginBottom: '32px', lineHeight: 1, fontWeight: '800', fontFamily: 'var(--font-serif)', letterSpacing: '-0.03em' }}>
                        Authentic <br/>Healing.
                    </h1>
                    <p style={{ fontSize: '22px', maxWidth: '420px', opacity: 0.8, fontWeight: '400', lineHeight: 1.5 }}>
                        Enter the digital sanctuary of Ayurveda. Tailored wellness protocols for the modern world.
                    </p>
                </motion.div>

                {/* Hero Image - Blended nicely */}
                <img 
                    src="/ayurveda_login_hero_1776420051934.png" 
                    alt="Ayurveda Wellness" 
                    style={{ 
                        position: 'absolute', 
                        bottom: '-10%', 
                        right: '-10%', 
                        width: '100%', 
                        opacity: 0.4,
                        mixBlendMode: 'plus-lighter',
                        filter: 'grayscale(0.5)'
                    }} 
                />
            </div>

            {/* Right Side: Form Container */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '40px',
                backgroundColor: 'var(--surface-lowest)',
                overflowY: 'auto'
            }} className="no-scrollbar">
                
                <motion.div 
                    key={isLogin ? 'login' : 'register'}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ width: '100%', maxWidth: '480px' }}
                >
                    <div className="mb-huge" style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>{isLogin ? 'Sign In' : 'Join AyurSana'}</h2>
                        <p style={{ color: 'var(--on-surface-variant)', fontSize: '16px' }}>
                            {isLogin ? 'Access your wellness dashboard and records.' : 'Start your health transformation today.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {!isLogin && (
                            <div className="flex flex-col gap-sm">
                                <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                    <input type="text" placeholder="John Doe" style={{ padding: '18px 18px 18px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '16px' }} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-sm">
                            <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input type="email" placeholder="name@example.com" style={{ padding: '18px 18px 18px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '16px' }} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-md">
                                <div className="flex flex-col gap-sm">
                                    <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <input type="number" placeholder="24" style={{ padding: '18px 18px 18px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '16px' }} value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-sm">
                                    <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
                                    <div style={{ position: 'relative' }}>
                                        <GenderIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                        <select style={{ padding: '18px 18px 18px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '16px', appearance: 'none' }} value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} required>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-sm">
                            <label style={{ fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                                <input type={showPassword ? "text" : "password"} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style={{ padding: '18px 48px', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'var(--surface)', width: '100%', fontSize: '16px' }} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                                <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
                                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                                </div>
                            </div>
                        </div>

                        {isLogin && <p style={{ textAlign: 'right', fontSize: '14px', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Trouble signing in?</p>}

                        <button className="btn-primary" style={{ padding: '20px', fontSize: '18px', marginTop: '8px', borderRadius: '16px' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create My Account')}
                        </button>
                    </form>

                    <div className="flex flex-col gap-lg mt-xl" style={{ marginTop: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--on-surface-variant)' }}>
                            <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--outline-variant)' }} />
                            <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em' }}>QUICK SOCIAL ACCESS</span>
                            <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--outline-variant)' }} />
                        </div>
                        
                        <div className="flex gap-md">
                            <button style={{ flex: 1, backgroundColor: 'white', border: '1px solid var(--outline-variant)', padding: '16px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: '700', fontSize: '14px' }}>
                                <Globe size={20} /> Google
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: '16px', color: 'var(--on-surface-variant)', marginTop: '8px' }}>
                            {isLogin ? "New to AyurSana? " : "Already registered? "}
                            <span 
                                onClick={() => setIsLogin(!isLogin)} 
                                style={{ color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', borderBottom: '2px solid var(--primary)' }}
                            >
                                {isLogin ? 'Register Here' : 'Log In Instead'}
                            </span>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
