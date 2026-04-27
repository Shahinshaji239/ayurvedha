import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Circle, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatPanel â€” a fully self-contained real-time chat component.
 *
 * Props:
 *   conversations : Array of { id, label, sublabel, status }
 *                   e.g. appointments with doctor/patient name
 *   role          : 'doctor' | 'patient'
 *   emptyMessage  : string shown when conversations is empty
 */
const ChatPanel = ({ conversations = [], role = 'patient', emptyMessage = 'No active chats yet.' }) => {
    const [activeId, setActiveId] = useState(null);
    const [messagesByRoom, setMessagesByRoom] = useState({}); // { [appointmentId]: [{text,sender,time}] }
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-select first conversation
    useEffect(() => {
        if (conversations.length > 0 && !activeId) {
            setActiveId(conversations[0].id);
        }
    }, [conversations]);

    // Connect/reconnect WebSocket whenever active room changes
    useEffect(() => {
        if (!activeId) return;

        // Close existing socket
        if (socketRef.current) {
            socketRef.current.close();
        }

        setConnected(false);

        
        const wsHost = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace(/\/$/, '') : `://:8000`;
        const url = `/ws/chat//`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
            setConnected(true);
            // Clear messages for this room â€” history will arrive via from_history frames
            setMessagesByRoom(prev => ({ ...prev, [activeId]: [] }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.from_history) {
                // History replay: append without duplicating
                setMessagesByRoom(prev => ({
                    ...prev,
                    [activeId]: [...(prev[activeId] || []), {
                        text: data.message,
                        sender: data.sender,
                        time: data.time,
                        fromHistory: true,
                    }]
                }));
            } else {
                setMessagesByRoom(prev => ({
                    ...prev,
                    [activeId]: [...(prev[activeId] || []), {
                        text: data.message,
                        sender: data.sender,
                        time: data.time,
                    }]
                }));
            }
        };

        socket.onclose = () => setConnected(false);
        socket.onerror = () => setConnected(false);

        return () => socket.close();
    }, [activeId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messagesByRoom, activeId]);

    const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

        const msg = { message: input.trim(), sender: role, time: now() };
        socketRef.current.send(JSON.stringify(msg));
        setInput('');
    };

    const activeMessages = activeId ? (messagesByRoom[activeId] || []) : [];
    const activeConv = conversations.find(c => c.id === activeId);

    if (conversations.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
                <MessageCircle size={56} style={{ opacity: 0.1 }} />
                <p style={{ color: 'var(--on-surface-variant)', fontSize: '18px', textAlign: 'center' }}>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: '78vh', border: '1px solid var(--outline-variant)', borderRadius: '28px', overflow: 'hidden', backgroundColor: 'var(--surface-lowest)' }}>

            {/* â”€â”€â”€ LEFT SIDEBAR: Conversation List â”€â”€â”€ */}
            <div style={{ width: '280px', borderRight: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-low)', flexShrink: 0 }}>
                <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--on-surface)' }}>Consultations</h3>
                    <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '4px' }}>{conversations.length} active session{conversations.length !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(conv => {
                        const isActive = conv.id === activeId;
                        const roomMessages = messagesByRoom[conv.id] || [];
                        const lastMsg = roomMessages.filter(m => m.sender !== 'system').slice(-1)[0];
                        return (
                            <div
                                key={conv.id}
                                onClick={() => setActiveId(conv.id)}
                                style={{
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                                    backgroundColor: isActive ? 'var(--surface-highest)' : 'transparent',
                                    transition: 'all 0.15s',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isActive ? 'var(--primary)' : 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MessageCircle size={18} style={{ color: isActive ? 'white' : 'var(--on-surface-variant)' }} />
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <p style={{ fontSize: '14px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.label}</p>
                                        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {lastMsg ? lastMsg.text : conv.sublabel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* â”€â”€â”€ RIGHT: Chat Window â”€â”€â”€ */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Chat Header */}
                <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface)' }}>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{activeConv?.label || 'Select a chat'}</h3>
                        <p style={{ fontSize: '12px', color: 'var(--on-surface-variant)', marginTop: '2px' }}>{activeConv?.sublabel}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Circle
                            size={10}
                            fill={connected ? '#22c55e' : '#ef4444'}
                            style={{ color: connected ? '#22c55e' : '#ef4444' }}
                        />
                        <span style={{ fontSize: '12px', color: connected ? '#22c55e' : '#ef4444', fontWeight: '700' }}>
                            {connected ? 'Live' : 'Connecting...'}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence initial={false}>
                        {activeMessages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    alignSelf: msg.sender === 'system' ? 'center' : msg.sender === role ? 'flex-end' : 'flex-start',
                                    maxWidth: msg.sender === 'system' ? '100%' : '75%',
                                    width: msg.sender === 'system' ? '100%' : 'auto',
                                }}
                            >
                                {msg.sender === 'system' ? (
                                    <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--on-surface-variant)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 0' }}>
                                        â€” {msg.text} â€”
                                    </p>
                                ) : (
                                    <>
                                        <div style={{
                                            padding: '12px 16px',
                                            borderRadius: msg.sender === role ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                            backgroundColor: msg.sender === role ? 'var(--primary)' : 'var(--surface-high)',
                                            color: msg.sender === role ? 'white' : 'var(--on-surface)',
                                            fontSize: '14px',
                                            lineHeight: '1.55',
                                            wordBreak: 'break-word',
                                        }}>
                                            {msg.text}
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--on-surface-variant)', marginTop: '4px', textAlign: msg.sender === role ? 'right' : 'left' }}>
                                            {msg.time}
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div style={{ padding: '20px 28px', borderTop: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface)' }}>
                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'var(--surface-highest)', border: '1px solid var(--outline-variant)', borderRadius: '24px', padding: '8px 8px 8px 20px' }}>
                        <input
                            type="text"
                            placeholder={connected ? 'Type your message...' : 'Connecting to server...'}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            disabled={!connected}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--on-surface)' }}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || !connected}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                background: input.trim() && connected ? 'var(--primary)' : 'var(--surface-high)',
                                color: input.trim() && connected ? 'white' : 'var(--on-surface-variant)',
                                border: 'none', cursor: input.trim() && connected ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', flexShrink: 0
                            }}
                        >
                            <Send size={16} style={{ marginLeft: '-1px' }} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;

