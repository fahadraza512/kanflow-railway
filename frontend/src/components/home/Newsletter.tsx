"use client";

import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSuccess(true);
        setEmail('');
        setIsSubmitting(false);

        // Reset success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-4xl font-black text-gray-900 mb-4">
                    Stay Updated
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                    Get the latest updates, tips, and best practices delivered to your inbox.
                </p>

                {isSuccess ? (
                    <div className="flex items-center justify-center gap-2 text-gray-900">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="font-semibold">Thanks for subscribing!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
