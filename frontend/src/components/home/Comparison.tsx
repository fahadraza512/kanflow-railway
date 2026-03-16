import { Check, X } from 'lucide-react';

export default function Comparison() {
    const features = [
        { name: 'Boards', free: '3 boards', pro: 'Unlimited' },
        { name: 'Team members', free: '5 per board', pro: 'Unlimited' },
        { name: 'Real-time collaboration', free: true, pro: true },
        { name: 'Task management', free: true, pro: true },
        { name: 'File attachments', free: '10MB per file', pro: '100MB per file' },
        { name: 'Advanced analytics', free: false, pro: true },
        { name: 'Custom workflows', free: false, pro: true },
        { name: 'Priority support', free: false, pro: true },
        { name: 'API access', free: false, pro: true },
        { name: 'Integrations', free: 'Basic', pro: 'All integrations' },
        { name: 'Monthly price', free: '$0', pro: '$12' },
    ];

    return (
        <section className="py-32 bg-gray-50 relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        PRICING COMPARISON
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Why Choose
                        <br />
                        <span className="text-blue-600">KanbanFlow?</span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        Compare our Free and Pro plans to find what works for you
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-3 sm:px-8 py-4 sm:py-6 text-left text-xs sm:text-sm font-bold text-white">
                                        Feature
                                    </th>
                                    <th className="px-3 sm:px-8 py-4 sm:py-6 text-center border-l-2 border-gray-700">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-black mb-1 sm:mb-3 text-sm sm:text-xl">
                                                F
                                            </div>
                                            <span className="text-xs sm:text-base font-bold text-white">Free</span>
                                            <span className="text-[10px] sm:text-sm text-gray-300 mt-0.5 sm:mt-1">Forever</span>
                                        </div>
                                    </th>
                                    <th className="px-3 sm:px-8 py-4 sm:py-6 text-center bg-gradient-to-br from-blue-600 to-blue-700 border-l-2 border-blue-800">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-black mb-1 sm:mb-3 text-sm sm:text-xl">
                                                P
                                            </div>
                                            <span className="text-xs sm:text-base font-bold text-white">Pro</span>
                                            <span className="text-[10px] sm:text-sm text-blue-200 mt-0.5 sm:mt-1">$12/mo</span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map((feature, idx) => (
                                    <tr key={idx} className={`border-b-2 border-gray-100 ${
                                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}>
                                        <td className="px-3 sm:px-8 py-3 sm:py-5 text-xs sm:text-sm text-gray-900 font-semibold">
                                            {feature.name}
                                        </td>
                                        <td className="px-3 sm:px-8 py-3 sm:py-5 text-center border-l-2 border-gray-100">
                                            {typeof feature.free === 'boolean' ? (
                                                feature.free ? (
                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                                                        <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                                                    {feature.free}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-8 py-3 sm:py-5 text-center border-l-2 border-gray-100 bg-blue-50/50">
                                            {typeof feature.pro === 'boolean' ? (
                                                feature.pro ? (
                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                                                        <X className="w-4 h-4 text-gray-400" strokeWidth={3} />
                                                    </div>
                                                )
                                            ) : (
                                                <span className="text-xs sm:text-sm font-bold text-blue-600">
                                                    {feature.pro}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="text-center text-gray-500 mt-8">
                    All plans include 14-day free trial • No credit card required
                </p>
            </div>
        </section>
    );
}
