"use client";

import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';

export default function ContactSection() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSuccess(true);
        setEmail('');
        setMessage('');
        setIsSubmitting(false);

        // Reset success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
    };

    return (
        <section id="contact" className="py-32 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-40" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        CONTACT US
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">Get in Touch</h2>
                    <p className="text-xl text-gray-600">
                        Have questions? Want to see a demo? We'd love to hear from you.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-gray-200">
                    {isSuccess ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                            <p className="text-gray-600">We'll get back to you as soon as possible.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@company.com"
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={5}
                                    placeholder="Tell us about your project or ask us anything..."
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-6 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
