import React, { useState, useMemo, MouseEvent } from 'react';
import {
    Gavel,
    X,
    Plus,
    Search,
    Calendar,
    MessageSquare,
    Link2,
    ChevronDown,
    ChevronRight,
    Trash2,
    Clock
} from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface Node {
    id: string;
    text: string;
    [key: string]: unknown;
}

interface Decision {
    id: number;
    title: string;
    description: string;
    decidedBy: string;
    date: string;
    category: string;
    linkedTasks: string[];
    status: 'final' | 'pending';
}

interface NewDecision {
    title: string;
    description: string;
    decidedBy: string;
    category: string;
    linkedTasks: string[];
    status: 'final' | 'pending';
}

interface Category {
    id: string;
    label: string;
    color: string;
}

interface DecisionLogProps {
    nodes?: Node[];
    collaborators?: Collaborator[];
    onClose?: () => void;
}

/**
 * DecisionLog - Track who decided what and when
 * Keeps a searchable history of all project decisions with:
 * - What was decided
 * - Who made the decision
 * - When it was made
 * - Why (context/reasoning)
 * - Linked tasks affected
 */
export default function DecisionLog({
    nodes = [],
    collaborators = [],
    onClose
}: DecisionLogProps) {
    const [decisions, setDecisions] = useState<Decision[]>([
        {
            id: 1,
            title: 'Use React for frontend framework',
            description: 'After evaluating Vue, Angular, and React, we decided to go with React due to team expertise and ecosystem.',
            decidedBy: 'jd',
            date: '2024-12-10',
            category: 'technical',
            linkedTasks: [],
            status: 'final'
        },
        {
            id: 2,
            title: 'Launch date moved to Q2',
            description: 'Due to additional feature requests from stakeholders, we are pushing the launch from March to April.',
            decidedBy: 'mr',
            date: '2024-12-08',
            category: 'timeline',
            linkedTasks: [],
            status: 'final'
        },
        {
            id: 3,
            title: 'Hire 2 additional developers',
            description: 'To meet the new timeline, approved budget for 2 senior developers starting January.',
            decidedBy: 'jd',
            date: '2024-12-05',
            category: 'resources',
            linkedTasks: [],
            status: 'pending'
        }
    ]);

    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [expandedDecision, setExpandedDecision] = useState<number | null>(null);

    const [newDecision, setNewDecision] = useState<NewDecision>({
        title: '',
        description: '',
        decidedBy: collaborators[0]?.id || '',
        category: 'general',
        linkedTasks: [],
        status: 'final'
    });

    const categories: Category[] = [
        { id: 'all', label: 'All', color: 'bg-gray-500' },
        { id: 'technical', label: 'Technical', color: 'bg-blue-500' },
        { id: 'timeline', label: 'Timeline', color: 'bg-purple-500' },
        { id: 'resources', label: 'Resources', color: 'bg-green-500' },
        { id: 'scope', label: 'Scope', color: 'bg-orange-500' },
        { id: 'design', label: 'Design', color: 'bg-pink-500' },
        { id: 'general', label: 'General', color: 'bg-gray-400' }
    ];

    // Filter decisions
    const filteredDecisions = useMemo<Decision[]>(() => {
        return decisions
            .filter(d => {
                if (filterCategory !== 'all' && d.category !== filterCategory) return false;
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    return d.title.toLowerCase().includes(query) ||
                        d.description.toLowerCase().includes(query);
                }
                return true;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [decisions, filterCategory, searchQuery]);

    const handleAddDecision = (): void => {
        if (!newDecision.title.trim()) return;

        const decision: Decision = {
            id: Date.now(),
            ...newDecision,
            date: new Date().toISOString().split('T')[0]
        };

        setDecisions(prev => [decision, ...prev]);
        setNewDecision({
            title: '',
            description: '',
            decidedBy: collaborators[0]?.id || '',
            category: 'general',
            linkedTasks: [],
            status: 'final'
        });
        setShowAddForm(false);
    };

    const handleDeleteDecision = (id: number): void => {
        setDecisions(prev => prev.filter(d => d.id !== id));
    };

    const getCollaborator = (id: string): Collaborator | undefined =>
        collaborators.find(c => c.id === id);

    const getCategoryColor = (catId: string): string =>
        categories.find(c => c.id === catId)?.color || 'bg-gray-400';

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-lg md:w-[520px] max-h-[85vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Gavel className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Decision Log</h3>
                            <p className="text-sm text-indigo-100">
                                {decisions.length} decisions recorded
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search and filter */}
            <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search decisions..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>

                {/* Category filter */}
                <div className="flex gap-1 overflow-x-auto pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilterCategory(cat.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterCategory === cat.id
                                    ? `${cat.color} text-white`
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Decisions list */}
            <div className="flex-1 overflow-y-auto">
                {filteredDecisions.length === 0 ? (
                    <div className="text-center py-8">
                        <Gavel className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No decisions found</p>
                        <p className="text-gray-400 text-xs mt-1">Record important decisions to keep everyone aligned</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredDecisions.map(decision => {
                            const decider = getCollaborator(decision.decidedBy);
                            const isExpanded = expandedDecision === decision.id;

                            return (
                                <div
                                    key={decision.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div
                                        className="flex items-start gap-3 cursor-pointer"
                                        onClick={() => setExpandedDecision(isExpanded ? null : decision.id)}
                                    >
                                        <div className={`w-1 h-full min-h-[40px] rounded-full ${getCategoryColor(decision.category)}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-medium text-sm text-gray-900">{decision.title}</h4>
                                                        {decision.status === 'pending' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        {decider && (
                                                            <span className="flex items-center gap-1">
                                                                <div
                                                                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                                                                    style={{ backgroundColor: decider.color }}
                                                                >
                                                                    {decider.initials}
                                                                </div>
                                                                {decider.name}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(decision.date)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                )}
                                            </div>

                                            {/* Expanded content */}
                                            {isExpanded && (
                                                <div className="mt-3 space-y-3">
                                                    <div className="p-3 bg-gray-100 rounded-lg">
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                            <MessageSquare className="w-3 h-3" />
                                                            Context & Reasoning
                                                        </div>
                                                        <p className="text-sm text-gray-700">{decision.description}</p>
                                                    </div>

                                                    {decision.linkedTasks.length > 0 && (
                                                        <div>
                                                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                                                <Link2 className="w-3 h-3" />
                                                                Linked Tasks
                                                            </div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {decision.linkedTasks.map(taskId => {
                                                                    const task = nodes.find(n => n.id === taskId);
                                                                    return task ? (
                                                                        <span key={taskId} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                                                                            {task.text}
                                                                        </span>
                                                                    ) : null;
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={(e: MouseEvent<HTMLButtonElement>) => {
                                                                e.stopPropagation();
                                                                handleDeleteDecision(decision.id);
                                                            }}
                                                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Decision Modal */}
            {showAddForm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Record Decision</h3>
                            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">What was decided?</label>
                                <input
                                    type="text"
                                    value={newDecision.title}
                                    onChange={(e) => setNewDecision(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g., Use PostgreSQL for database"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Context & Reasoning (Why?)</label>
                                <textarea
                                    value={newDecision.description}
                                    onChange={(e) => setNewDecision(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Explain the reasoning behind this decision..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Decided By</label>
                                    <select
                                        value={newDecision.decidedBy}
                                        onChange={(e) => setNewDecision(prev => ({ ...prev, decidedBy: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {collaborators.map(collab => (
                                            <option key={collab.id} value={collab.id}>{collab.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Category</label>
                                    <select
                                        value={newDecision.category}
                                        onChange={(e) => setNewDecision(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {categories.filter(c => c.id !== 'all').map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewDecision(prev => ({ ...prev, status: 'final' }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newDecision.status === 'final'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}
                                    >
                                        ✓ Final Decision
                                    </button>
                                    <button
                                        onClick={() => setNewDecision(prev => ({ ...prev, status: 'pending' }))}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newDecision.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}
                                    >
                                        ⏳ Pending Review
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddDecision}
                                disabled={!newDecision.title.trim()}
                                className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                Record Decision
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Never ask "didn't we decide this already?"</span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {filteredDecisions.length} decisions
                    </span>
                </div>
            </div>
        </div>
    );
}
