"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: 'How does the free plan work?',
            answer: 'The free plan includes up to 3 boards and 5 members per board. Perfect for small teams and side projects. No credit card required.',
        },
        {
            question: 'Can I upgrade or downgrade anytime?',
            answer: 'Yes! You can upgrade to Pro or downgrade to Free at any time. Changes take effect immediately, and we prorate any charges.',
        },
        {
            question: 'Is my data secure?',
            answer: 'Absolutely. We use industry-standard encryption, regular backups, and comply with GDPR and SOC 2 standards.',
        },
        {
            question: 'Do you offer team training?',
            answer: 'Pro plan customers get access to onboarding sessions, documentation, and priority support to help your team get started.',
        },
        {
            question: 'What integrations do you support?',
            answer: 'We integrate with Slack, GitHub, GitLab, Google Drive, and more. Pro users get access to all integrations.',
        },
    ];

    return (
        <section id="faq" className="py-32 bg-white relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        FAQ
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Questions?
                        <br />
                        <span className="text-blue-600">We've got answers.</span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about KanbanFlow
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-900 shadow-lg hover:shadow-xl overflow-hidden transition-all"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-bold text-gray-900 text-lg pr-4">{faq.question}</span>
                                <ChevronDown
                                    className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${
                                        openIndex === idx ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                            {openIndex === idx && (
                                <div className="px-8 pb-6 border-t-2 border-gray-100 pt-6">
                                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
