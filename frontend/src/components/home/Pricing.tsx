"use client";

import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Pricing() {
    const router = useRouter();
    const { token } = useAuthStore();
    const isLoggedIn = !!token;

    const handlePlanClick = () => {
        if (isLoggedIn) {
            router.push('/dashboard');
        } else {
            router.push('/signup');
        }
    };

    const plans = [
        {
            name: 'Free',
            price: '0',
            description: 'Perfect for trying out KanbanFlow',
            features: ['3 boards', '5 members per board', 'Basic integrations', 'Community support'],
            cta: 'Start Free',
            popular: false,
            color: 'from-gray-700 to-gray-900',
        },
        {
            name: 'Pro',
            price: '12',
            description: 'For teams that mean business',
            features: ['Unlimited boards', 'Unlimited members', 'All integrations', 'Priority support', 'Advanced analytics', 'Custom workflows'],
            cta: 'Start 14-day Trial',
            popular: true,
            color: 'from-blue-600 to-purple-600',
        },
    ];

    return (
        <section id="pricing" className="py-32 bg-gray-50 relative overflow-hidden">
            {/* Unique background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Unique header */}
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        PRICING
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Simple pricing.
                        <br />
                        <span className="text-blue-600">Serious value.</span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        Start free. Upgrade when you're ready. Cancel anytime.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "relative p-10 bg-white border-4 border-gray-900 rounded-3xl transition-all duration-300",
                                plan.popular ? "shadow-2xl scale-105 lg:-rotate-1" : "lg:rotate-1 hover:shadow-xl"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-sm font-black rounded-full border-2 border-gray-900 flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-current" />
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-gray-900 mb-2">{plan.name}</h3>
                                <p className="text-gray-600 mb-6">{plan.description}</p>
                                
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-6xl font-black text-gray-900">${plan.price}</span>
                                    <span className="text-gray-600 text-lg">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-4 h-4 text-white stroke-[3]" />
                                        </div>
                                        <span className="text-gray-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={handlePlanClick}
                                className={cn(
                                    "w-full py-4 px-6 rounded-2xl font-black text-lg transition-all border-2 border-gray-900",
                                    plan.popular
                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-1"
                                        : "bg-white text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                <p className="text-center text-gray-500 mt-12">
                    All plans include 14-day free trial • No credit card required
                </p>
            </div>
        </section>
    );
}
