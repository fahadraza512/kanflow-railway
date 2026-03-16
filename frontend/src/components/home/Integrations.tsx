import { Github, Slack, Mail, Calendar, FileText, Zap } from 'lucide-react';

export default function Integrations() {
    const integrations = [
        { name: 'GitHub', icon: <Github className="w-8 h-8" />, color: 'bg-gray-900' },
        { name: 'Slack', icon: <Slack className="w-8 h-8" />, color: 'bg-purple-600' },
        { name: 'Gmail', icon: <Mail className="w-8 h-8" />, color: 'bg-red-500' },
        { name: 'Google Calendar', icon: <Calendar className="w-8 h-8" />, color: 'bg-blue-500' },
        { name: 'Notion', icon: <FileText className="w-8 h-8" />, color: 'bg-gray-800' },
        { name: 'Zapier', icon: <Zap className="w-8 h-8" />, color: 'bg-orange-500' },
    ];

    return (
        <section id="integrations" className="py-32 bg-white relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        INTEGRATIONS
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Integrates with
                        <br />
                        <span className="text-blue-600">your favorite tools.</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Connect KanbanFlow with the tools you already use
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {integrations.map((integration, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-white rounded-3xl p-8 border-2 border-gray-200 hover:border-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
                        >
                            <div className={`${integration.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                                {integration.icon}
                            </div>
                            <p className="text-center text-sm font-bold text-gray-900">
                                {integration.name}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <p className="text-gray-600 mb-4 font-medium">And 50+ more integrations</p>
                    <button className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                        View All Integrations
                    </button>
                </div>
            </div>
        </section>
    );
}
