"use client";

import { Play } from 'lucide-react';
import { useState } from 'react';

export default function DemoVideo() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <section className="py-32 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        DEMO
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        See KanbanFlow in Action
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-xl">
                        Watch how teams use KanbanFlow to streamline their workflow and ship faster
                    </p>
                </div>

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 group bg-white">
                    {/* Video placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                        {!isPlaying ? (
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 hover:scale-110 transition-all shadow-2xl"
                            >
                                <Play className="w-10 h-10 ml-2" fill="currentColor" />
                            </button>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-2xl font-bold text-white">Demo Video Playing...</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 text-center shadow-lg">
                        <div className="text-4xl font-black text-gray-900 mb-2">2 min</div>
                        <div className="text-gray-600 font-medium">Quick overview</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 text-center shadow-lg">
                        <div className="text-4xl font-black text-gray-900 mb-2">10K+</div>
                        <div className="text-gray-600 font-medium">Views</div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 text-center shadow-lg">
                        <div className="text-4xl font-black text-gray-900 mb-2">4.9/5</div>
                        <div className="text-gray-600 font-medium">Rating</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
