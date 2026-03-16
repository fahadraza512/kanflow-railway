import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'Product Manager at TechCorp',
            initials: 'SC',
            bgColor: 'bg-blue-500',
            content: 'KanbanFlow transformed how our team collaborates. We shipped 40% faster in the first month.',
            rating: 5,
        },
        {
            name: 'Michael Rodriguez',
            role: 'Engineering Lead at StartupXYZ',
            initials: 'MR',
            bgColor: 'bg-purple-500',
            content: 'The best project management tool we\'ve used. Clean interface, powerful features.',
            rating: 5,
        },
        {
            name: 'Emily Watson',
            role: 'Founder at DesignStudio',
            initials: 'EW',
            bgColor: 'bg-pink-500',
            content: 'Finally, a tool that doesn\'t get in the way. Our team loves the simplicity.',
            rating: 5,
        },
    ];

    return (
        <section className="py-32 bg-gray-50 relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        TESTIMONIALS
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Loved by teams.
                        <br />
                        <span className="text-blue-600">Trusted worldwide.</span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        See what our customers have to say
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                            <Quote className="w-10 h-10 text-blue-600 mb-4" />
                            <p className="text-gray-700 mb-6 leading-relaxed font-medium">&quot;{testimonial.content}&quot;</p>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full ${testimonial.bgColor} flex items-center justify-center text-white font-bold text-lg`}>
                                    {testimonial.initials}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                                </div>
                            </div>

                            <div className="flex gap-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
