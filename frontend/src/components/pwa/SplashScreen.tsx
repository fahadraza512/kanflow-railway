"use client";

import { useEffect, useState } from 'react';

export default function SplashScreen() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 2200);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                transition: 'opacity 0.4s ease-out',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 112,
                    height: 112,
                    background: '#1d4ed8',
                    borderRadius: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                }}>
                    <span style={{ fontSize: 64, fontWeight: 900, color: 'white', fontFamily: 'Arial Black, Arial, sans-serif', lineHeight: 1 }}>K</span>
                </div>
                <h1 style={{ fontSize: 40, fontWeight: 900, color: 'white', margin: '0 0 8px', fontFamily: 'Arial Black, Arial, sans-serif', letterSpacing: -1 }}>KanbanFlow</h1>
                <p style={{ color: 'rgba(219,234,254,0.9)', fontSize: 16, margin: 0, fontFamily: 'Arial, sans-serif' }}>Visual Project Management</p>
            </div>
        </div>
    );
}
