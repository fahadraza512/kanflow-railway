import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Last updated: March 15, 2026</p>

                    <div className="prose prose-blue max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We collect information you provide directly to us, such as when you create an account, 
                            use our services, or communicate with us. This includes your name, email address, and 
                            any other information you choose to provide.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We use the information we collect to provide, maintain, and improve our services, 
                            to communicate with you, and to protect KanbanFlow and our users.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We do not share your personal information with third parties except as described in 
                            this policy or with your consent.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Security</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We implement appropriate technical and organizational measures to protect your 
                            personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You have the right to access, update, or delete your personal information at any time. 
                            You can do this through your account settings or by contacting us directly.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            If you have any questions about this Privacy Policy, please contact us at{' '}
                            <a href="mailto:privacy@kanbanflow.com" className="text-blue-600 hover:text-blue-700">
                                privacy@kanbanflow.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
