"use client";

import { useEffect, useState } from 'react';

export default function SplashScreen() {
    // Start visible immediately — avoids gap between OS splash and custom splash
    const [show, setShow] = useState(true);

    useEffect(() => {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;

        if (!isPWA) {
            // Not a PWA — hide immediately without showing
            setShow(false);
            return;
        }

        // PWA — hide after 2s
        const timer = setTimeout(() => setShow(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center splash-screen">
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-40 w-72 h-72 bg-indigo-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
                {/* Logo */}
                <div className="mb-8 animate-scale-bounce">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-white/40 rounded-3xl blur-2xl animate-pulse-glow"></div>
                        <div className="relative w-28 h-28 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                            <span className="text-6xl font-black text-white">K</span>
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="animate-fade-in-up">
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
                        KanbanFlow
                    </h1>
                    <p className="text-blue-100 text-base font-medium">
                        Visual Project Management
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-12 animate-fade-in-up animation-delay-300">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth animation-delay-150"></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce-smooth animation-delay-300"></div>
                </div>
            </div>
        </div>
    );
}
