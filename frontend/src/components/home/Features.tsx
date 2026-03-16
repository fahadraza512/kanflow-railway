import { Layout, Clock, Users, BarChart3, Zap, Shield } from 'lucide-react';

export default function Features() {
    const features = [
        {
            icon: <Layout className="w-7 h-7" />,
            title: 'Drag & Drop Boards',
            description: 'Move tasks around like sticky notes. No learning curve, just pure productivity.',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: <Zap className="w-7 h-7" />,
            title: 'Lightning Fast',
            description: 'Real-time updates. No lag. No waiting. Your team stays in perfect sync.',
            color: 'from-yellow-500 to-orange-500',
        },
        {
            icon: <Users className="w-7 h-7" />,
            title: 'Team Collaboration',
            description: 'Comments, mentions, and notifications that actually work. Stay connected.',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: <BarChart3 className="w-7 h-7" />,
            title: 'Smart Analytics',
            description: 'See what\'s working, what\'s not. Make data-driven decisions effortlessly.',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: <Clock className="w-7 h-7" />,
            title: 'Time Tracking',
            description: 'Know where time goes. Optimize workflows. Ship faster than ever.',
            color: 'from-red-500 to-rose-500',
        },
        {
            icon: <Shield className="w-7 h-7" />,
            title: 'Enterprise Security',
            description: 'Bank-level encryption. SOC 2 compliant. Your data is Fort Knox safe.',
            color: 'from-indigo-500 to-blue-500',
        },
    ];

    return (
        <section id="features" className="py-32 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        FEATURES
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6 leading-tight">
                        Everything you need.
                        <br />
                        Nothing you don't.
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Built for real teams doing real work. No bloat, no complexity, just results.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-blue-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            {/* Icon */}
                            <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} text-white rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                {feature.icon}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-2xl font-black text-gray-900 mb-4">{feature.title}</h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
