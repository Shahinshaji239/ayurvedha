import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff, Send, Shield, X, Maximize2, Minimize2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// â”€â”€â”€ JaaS Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const JAAS_APP_ID = 'vpaas-magic-cookie-f62a2e094e674e9d84405cd6fb8ca1d4';
const JAAS_SCRIPT_URL = `https://8x8.vc/${JAAS_APP_ID}/external_api.js`;
const API_URL = 'https://doctor-ayurvedha-api.onrender.com/api';
const ConsultationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'patient';
  const userName = localStorage.getItem('userName') || (role === 'doctor' ? 'Doctor' : 'Patient');
  const userEmail = localStorage.getItem('userEmail') || '';

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connected, setConnected] = useState(false);
  // Video state
  const [jitsiReady, setJitsiReady] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // â”€â”€â”€ WebSocket Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    
    const socket = new WebSocket(`wss://doctor-ayurvedha-api.onrender.com/ws/chat/${id}/`);
    socketRef.current = socket;

    socket.onopen = () => { setConnected(true); setMessages([]); };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, {
        text: data.message,
        sender: data.sender,
        time: data.time,
        fromHistory: !!data.from_history,
      }]);
    };
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    return () => socket.close();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // â”€â”€â”€ JaaS Video (8x8.vc) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    // Step 1: Fetch a fresh JWT from the backend
    const params = new URLSearchParams({
      email: userEmail,
      name: userName,
      role,
    });
    fetch(`${API_URL}/jaas-jwt/?${params}`)
      .then(res => res.json())
      .then(data => {
        const freshJwt = data.jwt;
        // Step 2: Load the JaaS External API script
        let script = document.getElementById('jaas-external-api');
        if (!script) {
          script = document.createElement('script');
          script.id = 'jaas-external-api';
          script.src = JAAS_SCRIPT_URL;
          script.async = true;
          document.head.appendChild(script);
        }
        const tryInit = () => {
          if (window.JitsiMeetExternalAPI && jitsiContainerRef.current && !jitsiApiRef.current) {
            initJaaS(freshJwt);
          }
        };
        if (window.JitsiMeetExternalAPI) tryInit();
        else script.onload = tryInit;
      })
      .catch(() => {
        // Fallback: load script without JWT
        let script = document.getElementById('jaas-external-api');
        if (!script) {
          script = document.createElement('script');
          script.id = 'jaas-external-api';
          script.src = JAAS_SCRIPT_URL;
          script.async = true;
          document.head.appendChild(script);
        }
        script.onload = () => {
          if (jitsiContainerRef.current && !jitsiApiRef.current) initJaaS(null);
        };
      });

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [id]);

  const initJaaS = (jwt) => {
    if (!jitsiContainerRef.current || jitsiApiRef.current) return;

    const roomName = `${JAAS_APP_ID}/AyurSana_Consultation_${id}`;

    const api = new window.JitsiMeetExternalAPI('8x8.vc', {
      roomName,
      parentNode: jitsiContainerRef.current,
      lang: 'en',
      ...(jwt ? { jwt } : {}),
      userInfo: {
        displayName: userName,
        email: userEmail,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        disablePrejoinPage: true,
        defaultLanguage: 'en',
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        subject: `AyurSana Consultation #${id}`,
        disableDeepLinking: true,
        enableWelcomePage: false,
        toolbarButtons: [
          'camera', 'microphone', 'hangup',
          'desktop', 'fullscreen', 'settings',
          'videoquality', 'stats',
          'recording', 'livestreaming', 'transcribing',
          'shareaudio', 'sharedvideo',
        ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#0d1117',
        TOOLBAR_ALWAYS_VISIBLE: true,
        LANG_DETECTION: false,
      },
    });

    jitsiApiRef.current = api;

    api.on('videoConferenceJoined', () => setJitsiReady(true));
    api.on('readyToClose', () => handleLeave());
  };

  // â”€â”€â”€ Leave Room â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleLeave = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    if (socketRef.current) socketRef.current.close();
    navigate(role === 'doctor' ? '/doctor/dashboard' : '/dashboard');
  };

  // â”€â”€â”€ Send Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ message: newMessage.trim(), sender: role, time: nowTime() }));
    setNewMessage('');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d1117', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* â”€â”€â”€ VIDEO PANEL â”€â”€â”€ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>

        {/* Top bar overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          pointerEvents: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg, #2d6a4f, #52b788)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="white" />
            </div>
            <div>
              <p style={{ color: 'white', fontWeight: '800', fontSize: '14px', margin: 0 }}>AyurSana Secure Consultation</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', margin: 0 }}>Room #{id} · Powered by 8x8 JaaS · E2E Encrypted</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
            {/* Toggle Chat */}
            <button
              onClick={() => setIsChatCollapsed(c => !c)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white', fontWeight: '700', fontSize: '13px', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
            >
              <MessageCircle size={14} />
              {isChatCollapsed ? 'Show Chat' : 'Hide Chat'}
            </button>
            {/* Leave */}
            <button
              onClick={handleLeave}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              <PhoneOff size={14} /> Leave
            </button>
          </div>
        </div>

        {/* JaaS Container */}
        <div ref={jitsiContainerRef} style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
          {!jitsiReady && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', background: '#0d1117', zIndex: 10, gap: '20px'
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                border: '3px solid rgba(45,106,79,0.2)',
                borderTop: '3px solid #52b788',
                animation: 'spin 0.9s linear infinite'
              }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', fontWeight: '600' }}>
                Connecting to secure video session…
              </p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
                Powered by 8x8 JaaS · No time limits
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€â”€ CHAT SIDEBAR â”€â”€â”€ */}
      <AnimatePresence>
        {!isChatCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '360px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#111827', borderLeft: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden', flexShrink: 0 }}
          >

            {/* Chat Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '15px', fontWeight: '800', margin: 0 }}>Consultation Chat</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: connected ? '#22c55e' : '#ef4444', boxShadow: connected ? '0 0 6px #22c55e' : 'none' }} />
                  <span style={{ fontSize: '11px', color: connected ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                    {connected ? 'Live & Encrypted' : 'Reconnecting…'}
                  </span>
                </div>
              </div>
              <button onClick={() => setIsChatCollapsed(true)} style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                <X size={15} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 && connected && (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '40px' }}>
                  â€” Session started â€”
                </p>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.13 }}
                    style={{ alignSelf: msg.sender === role ? 'flex-end' : 'flex-start', maxWidth: '84%' }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.sender === role ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                      background: msg.sender === role ? 'linear-gradient(135deg, #1b4332, #2d6a4f)' : 'rgba(255,255,255,0.08)',
                      color: 'white', fontSize: '13px', lineHeight: '1.55', wordBreak: 'break-word',
                      border: msg.sender !== role ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    }}>
                      {msg.text}
                    </div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', marginTop: '4px', textAlign: msg.sender === role ? 'right' : 'left' }}>
                      {msg.sender === role ? 'You' : msg.sender === 'doctor' ? '🩺 Doctor' : 'ðŸ§‘ Patient'} · {msg.time}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '16px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '22px', padding: '7px 7px 7px 17px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={!connected}
                  placeholder={connected ? 'Type a message…' : 'Connecting…'}
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '13px' }}
                />
                <button
                  type="submit"
                  disabled={!connected || !newMessage.trim()}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, border: 'none', cursor: 'pointer',
                    background: connected && newMessage.trim() ? 'linear-gradient(135deg, #2d6a4f, #52b788)' : 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                  }}
                >
                  <Send size={14} color="white" style={{ marginLeft: '-1px' }} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultationRoom;



