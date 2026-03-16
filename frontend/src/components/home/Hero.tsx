"use client";

import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Download } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { triggerInstallPrompt } from '@/components/pwa/InstallPrompt';
import { useState, useEffect } from 'react';

export default function Hero() {
    const router = useRouter();
    const { token } = useAuthStore();
    const isLoggedIn = !!token;

    const handleGetStarted = () => {
        if (isLoggedIn) {
            router.push('/dashboard');
        } else {
            router.push('/signup');
        }
    };

    const handleInstallClick = () => {
        console.log('Hero: Install App button clicked');
        triggerInstallPrompt();
    };

    return (
        <div className="relative pt-20 pb-12 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Unique asymmetric background pattern */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-40" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-50 rounded-full blur-3xl opacity-40" />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-pink-50 rounded-full blur-3xl opacity-30" />
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div className="space-y-8">
                        {/* Unique badge design */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white text-sm font-medium shadow-lg">
                            <Sparkles className="w-4 h-4" />
                            <span>Join 2,000+ productive teams</span>
                        </div>

                        {/* Bold, unique headline */}
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight">
                            Work flows
                            <br />
                            <span className="relative inline-block">
                                <span className="relative z-10">better</span>
                                <span className="absolute bottom-2 left-0 w-full h-4 bg-yellow-300 -rotate-1" />
                            </span>
                            {' '}with
                            <br />
                            <span className="text-blue-600">KanbanFlow</span>
                        </h1>
                        
                        <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                            Stop juggling tools. Start shipping faster. 
                            The project management tool that actually makes sense.
                        </p>

                        {/* Unique CTA layout */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGetStarted}
                                className="group px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Start for free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={handleInstallClick}
                                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                <Download className="w-5 h-5" />
                                Install App
                            </button>
                            <button 
                                onClick={() => {
                                    const featuresSection = document.getElementById('features');
                                    featuresSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-900 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                            >
                                See it in action
                            </button>
                        </div>

                        {/* Trust indicators with unique style */}
                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600">No credit card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600">Free forever</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm text-gray-600">2-min setup</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Visual element with unique design */}
                    <div className="relative lg:block hidden">
                        <div className="relative">
                            {/* Unique card stack design */}
                            <div className="absolute top-0 right-0 w-80 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl rotate-6 opacity-20" />
                            <div className="absolute top-4 right-4 w-80 h-96 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl rotate-3 opacity-30" />
                            <div className="relative w-80 h-96 bg-white rounded-3xl shadow-2xl p-8 border-4 border-gray-900">
                                <div className="space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mt-6" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
