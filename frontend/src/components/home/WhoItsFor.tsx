import { ClipboardList, Code2, ShieldCheck, Eye, Check } from 'lucide-react';

export default function WhoItsFor() {
    const roles = [
        {
            icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
            title: 'Project Manager',
            description: 'Oversee timelines, resources, and project delivery across multiple teams.',
            bullets: ['Gantt-style timeline view', 'Team workload tracking', 'Project status reporting'],
        },
        {
            icon: <Code2 className="w-6 h-6 text-purple-600" />,
            title: 'Developer',
            description: 'Manage sprints, track bugs, and ship features on schedule.',
            bullets: ['Sprints synced with task priorities', 'GitHub or GitLab integration', 'Bug and issue tracking'],
        },
        {
            icon: <Eye className="w-6 h-6 text-green-600" />,
            title: 'Viewer',
            description: 'Monitor project progress and stay informed without editing access.',
            bullets: ['Read-only access to boards', 'Real-time progress tracking', 'Export reports and analytics'],
        },
        {
            icon: <ShieldCheck className="w-6 h-6 text-orange-600" />,
            title: 'Admin',
            description: 'Control user access, permissions, and organization-wide settings.',
            bullets: ['Role-based access control', 'User management dashboard', 'Audit logs and activity history'],
        },
    ];

    return (
        <section id="who-its-for" className="py-32 bg-white relative overflow-hidden">
            {/* Soft background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-20">
                    <div className="inline-block px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full mb-6">
                        WHO IT&apos;S FOR
                    </div>
                    <h2 className="text-5xl font-black text-gray-900 mb-6">
                        Built for every role.
                        <br />
                        <span className="text-blue-600">Loved by all.</span>
                    </h2>
                    <p className="text-xl text-gray-600">
                        From managers to developers, everyone gets what they need
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {roles.map((role, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl border-2 border-gray-200 hover:border-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                                {role.icon}
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-3">{role.title}</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">{role.description}</p>

                            <ul className="space-y-4">
                                {role.bullets.map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                        <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                                            <Check className="w-3 h-3 text-white stroke-[3]" />
                                        </div>
                                        <span className="font-medium">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
