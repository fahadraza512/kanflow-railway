import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                    <p className="text-gray-500 mb-8">Last updated: March 15, 2026</p>

                    <div className="prose prose-blue max-w-none">
                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            By accessing and using KanbanFlow, you accept and agree to be bound by the terms and 
                            provisions of this agreement. If you do not agree to these terms, please do not use our service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Use of Service</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You agree to use KanbanFlow only for lawful purposes and in accordance with these Terms. 
                            You are responsible for maintaining the confidentiality of your account credentials.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. User Content</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            You retain all rights to the content you create and share on KanbanFlow. By using our service, 
                            you grant us a license to host, store, and share your content as necessary to provide the service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Subscription and Billing</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            Some features of KanbanFlow require a paid subscription. You agree to pay all fees associated 
                            with your subscription plan. Subscriptions automatically renew unless cancelled.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Termination</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We reserve the right to suspend or terminate your account if you violate these Terms or 
                            engage in conduct that we determine to be harmful to other users or our service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Limitation of Liability</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            KanbanFlow is provided "as is" without warranties of any kind. We shall not be liable for 
                            any indirect, incidental, special, consequential, or punitive damages resulting from your 
                            use of the service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Changes to Terms</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We reserve the right to modify these Terms at any time. We will notify users of any 
                            material changes via email or through the service.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            If you have any questions about these Terms, please contact us at{' '}
                            <a href="mailto:legal@kanbanflow.com" className="text-blue-600 hover:text-blue-700">
                                legal@kanbanflow.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
