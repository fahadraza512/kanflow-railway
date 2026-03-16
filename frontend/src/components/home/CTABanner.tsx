"use client";

import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function CTABanner() {
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

    return (
        <section className="py-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
            {/* Soft decorative elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-semibold mb-6 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Start your free trial today</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                    Ready to Transform
                    <br />
                    Your Workflow?
                </h2>
                <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                    Join thousands of teams already shipping faster with KanbanFlow. No credit card required.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={handleGetStarted}
                        className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-2xl hover:shadow-xl hover:-translate-y-1 flex items-center gap-2"
                    >
                        Get Started Free
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => {
                            const section = document.getElementById('contact');
                            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="px-8 py-4 bg-transparent text-white font-bold rounded-2xl border-2 border-white hover:bg-white/10 transition-all"
                    >
                        Talk to Sales
                    </button>
                </div>

                <p className="text-blue-100 text-sm mt-6">
                    Free forever • No credit card required • Cancel anytime
                </p>
            </div>
        </section>
    );
}
