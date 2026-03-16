import { Users, Building2, CheckCircle, TrendingUp } from 'lucide-react';

export default function Stats() {
    const stats = [
        {
            icon: <Users className="w-10 h-10" />,
            value: '50K+',
            label: 'Active Users',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: <Building2 className="w-10 h-10" />,
            value: '2K+',
            label: 'Companies',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: <CheckCircle className="w-10 h-10" />,
            value: '1M+',
            label: 'Tasks Completed',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: <TrendingUp className="w-10 h-10" />,
            value: '40%',
            label: 'Faster Delivery',
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <section className="py-12 sm:py-32 bg-gray-50 relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="relative bg-white p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border-2 border-gray-200 hover:border-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
                        >
                            {/* Gradient icon background */}
                            <div className={`inline-flex p-3 sm:p-4 bg-gradient-to-br ${stat.color} text-white rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg`}>
                                {stat.icon}
                            </div>
                            
                            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-1 sm:mb-2">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
