import { MoreHorizontal } from 'lucide-react';

interface KanbanCard {
    id: number;
    title: string;
    tags?: string[];
    progress?: number;
    status?: string;
}

interface KanbanColumn {
    title: string;
    count: number;
    cards: KanbanCard[];
}

export default function KanbanVisual() {
    const columns: KanbanColumn[] = [
        {
            title: 'TO DO',
            count: 3,
            cards: [
                { id: 1, title: 'Design system update', tags: ['#E0E7FF', '#F3E8FF'] },
                { id: 2, title: 'Competitor research', tags: ['#DBEAFE'] },
            ],
        },
        {
            title: 'IN PROGRESS',
            count: 2,
            cards: [
                { id: 3, title: 'Landing page mockup', progress: 65 },
            ],
        },
        {
            title: 'DONE',
            count: 12,
            cards: [
                { id: 4, title: 'Setup CI/CD pipeline', status: 'COMPLETED' },
            ],
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-12 mb-8 sm:mb-12 overflow-hidden">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 p-4 md:p-8 flex flex-col md:flex-row gap-4 md:gap-8 min-h-[400px]">
                {columns.map((column, idx) => (
                    <div key={idx} className="flex-1 md:min-w-0 md:max-w-[320px]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-500">{column.title}</span>
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{column.count}</span>
                            </div>
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>

                        <div className="space-y-4">
                            {column.cards.map((card) => (
                                <div key={card.id} className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-md hover:shadow-lg hover:border-gray-900 transition-all">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">{card.title}</h4>
                                    {card.tags && (
                                        <div className="flex gap-2">
                                            {card.tags.map((tag: string, i: number) => (
                                                <div key={i} className="w-6 h-2 rounded-full" style={{ backgroundColor: tag }} />
                                            ))}
                                        </div>
                                    )}
                                    {card.progress !== undefined && (
                                        <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${card.progress}%` }} />
                                        </div>
                                    )}
                                    {card.status && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">{card.status}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
