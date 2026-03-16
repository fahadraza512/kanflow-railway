"use client";

import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <footer className="bg-gray-50 border-t border-gray-200 pt-8 sm:pt-16 pb-4 sm:pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-8 mb-6 sm:mb-12">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-2">
                        <div className="flex items-center gap-2 mb-2 sm:mb-4">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                                K
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-gray-900">KanbanFlow</span>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-6 max-w-sm">
                            Making project management visible, automatic, and beautiful since 2026.
                        </p>
                        <div className="flex gap-2 sm:gap-3">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all"
                                aria-label="GitHub"
                            >
                                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </a>
                            <button
                                onClick={() => scrollToSection('contact')}
                                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all"
                                aria-label="Contact"
                            >
                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-4 text-xs sm:text-sm">Product</h4>
                        <ul className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                            <li>
                                <button 
                                    onClick={() => scrollToSection('features')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => scrollToSection('pricing')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Pricing
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => scrollToSection('integrations')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Integrations
                                </button>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-4 text-xs sm:text-sm">Resources</h4>
                        <ul className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                            <li>
                                <button 
                                    onClick={() => scrollToSection('who-its-for')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Who It's For
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => scrollToSection('faq')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    FAQ
                                </button>
                            </li>
                            <li>
                                <button 
                                    onClick={() => scrollToSection('contact')}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Contact
                                </button>
                            </li>
                            <li>
                                <Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Get Started
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-2 sm:mb-4 text-xs sm:text-sm">Legal</h4>
                        <ul className="space-y-1.5 sm:space-y-3 text-xs sm:text-sm">
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Privacy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@kanbanflow.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 sm:pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <p className="text-center sm:text-left">© 2026 KanbanFlow Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
