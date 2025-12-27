import React, { useState, useMemo } from 'react';
import {
    DollarSign,
    Plus,
    Trash2,
    X,
    TrendingUp,
    TrendingDown,
    Plane,
    PartyPopper,
    UtensilsCrossed,
    Laptop,
    GraduationCap,
    Gift,
    Receipt,
    Calendar,
    User,
    PieChart,
    LucideIcon
} from 'lucide-react';

interface Collaborator {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface Expense {
    id: number;
    description: string;
    amount: number;
    category: string;
    date: string;
    paidBy: string;
    participants: string[];
}

interface NewExpense {
    description: string;
    amount: string;
    category: string;
    date: string;
    paidBy: string;
    participants: string[];
}

interface ExpenseCategory {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
}

interface Analytics {
    totalSpent: number;
    remaining: number;
    percentUsed: number;
    byCategory: Record<string, number>;
    byMember: Record<string, number>;
    thisMonth: number;
    lastMonth: number;
    trend: 'up' | 'down';
    trendPercent: number;
}

interface ExpenseTrackerProps {
    collaborators?: Collaborator[];
    onClose?: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    { id: 'events', name: 'Team Events', icon: PartyPopper, color: 'bg-pink-500' },
    { id: 'travel', name: 'Travel', icon: Plane, color: 'bg-blue-500' },
    { id: 'meals', name: 'Meals & Entertainment', icon: UtensilsCrossed, color: 'bg-orange-500' },
    { id: 'equipment', name: 'Equipment & Supplies', icon: Laptop, color: 'bg-purple-500' },
    { id: 'training', name: 'Training & Education', icon: GraduationCap, color: 'bg-green-500' },
    { id: 'gifts', name: 'Gifts & Rewards', icon: Gift, color: 'bg-yellow-500' },
    { id: 'other', name: 'Other', icon: Receipt, color: 'bg-gray-500' }
];

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export default function ExpenseTracker({
    collaborators = [],
    onClose
}: ExpenseTrackerProps) {
    const [budget, setBudget] = useState<number>(10000);
    const [expenses, setExpenses] = useState<Expense[]>([
        // Sample expenses
        { id: 1, description: 'Team Christmas Party', amount: 850, category: 'events', date: '2024-12-20', paidBy: 'jd', participants: ['jd', 'ak', 'mr', 'ts'] },
        { id: 2, description: 'Conference Travel - Alex', amount: 1200, category: 'travel', date: '2024-12-15', paidBy: 'ak', participants: ['ak'] },
        { id: 3, description: 'Team Lunch', amount: 180, category: 'meals', date: '2024-12-10', paidBy: 'mr', participants: ['jd', 'ak', 'mr'] },
        { id: 4, description: 'New Monitors x2', amount: 600, category: 'equipment', date: '2024-12-05', paidBy: 'jd', participants: ['ts', 'ak'] },
        { id: 5, description: 'Online Course Subscription', amount: 299, category: 'training', date: '2024-12-01', paidBy: 'ts', participants: ['jd', 'ak', 'mr', 'ts'] },
        { id: 6, description: 'Birthday Gift - Maria', amount: 75, category: 'gifts', date: '2024-11-28', paidBy: 'ak', participants: ['jd', 'ak', 'ts'] }
    ]);

    const [showAddForm, setShowAddForm] = useState<boolean>(false);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterMember, setFilterMember] = useState<string>('all');
    const [view, setView] = useState<'list' | 'summary'>('list');

    // New expense form state
    const [newExpense, setNewExpense] = useState<NewExpense>({
        description: '',
        amount: '',
        category: 'events',
        date: new Date().toISOString().split('T')[0],
        paidBy: collaborators[0]?.id || '',
        participants: []
    });

    // Calculate analytics
    const analytics = useMemo<Analytics>(() => {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = budget - totalSpent;
        const percentUsed = (totalSpent / budget) * 100;

        // Category breakdown
        const byCategory: Record<string, number> = {};
        EXPENSE_CATEGORIES.forEach(cat => {
            byCategory[cat.id] = expenses
                .filter(e => e.category === cat.id)
                .reduce((sum, e) => sum + e.amount, 0);
        });

        // Member breakdown (who paid)
        const byMember: Record<string, number> = {};
        collaborators.forEach(collab => {
            byMember[collab.id] = expenses
                .filter(e => e.paidBy === collab.id)
                .reduce((sum, e) => sum + e.amount, 0);
        });

        // Monthly trend
        const thisMonth = expenses
            .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
            .reduce((sum, e) => sum + e.amount, 0);

        const lastMonth = expenses
            .filter(e => new Date(e.date).getMonth() === new Date().getMonth() - 1)
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            totalSpent,
            remaining,
            percentUsed,
            byCategory,
            byMember,
            thisMonth,
            lastMonth,
            trend: thisMonth > lastMonth ? 'up' : 'down',
            trendPercent: lastMonth > 0 ? Math.abs(((thisMonth - lastMonth) / lastMonth) * 100) : 0
        };
    }, [expenses, budget, collaborators]);

    // Filter expenses
    const filteredExpenses = useMemo<Expense[]>(() => {
        return expenses.filter(e => {
            if (filterCategory !== 'all' && e.category !== filterCategory) return false;
            if (filterMember !== 'all' && e.paidBy !== filterMember && !e.participants.includes(filterMember)) return false;
            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [expenses, filterCategory, filterMember]);

    const handleAddExpense = (): void => {
        if (!newExpense.description || !newExpense.amount) return;

        const expense: Expense = {
            id: Date.now(),
            ...newExpense,
            amount: parseFloat(newExpense.amount)
        };

        setExpenses(prev => [...prev, expense]);
        setNewExpense({
            description: '',
            amount: '',
            category: 'events',
            date: new Date().toISOString().split('T')[0],
            paidBy: collaborators[0]?.id || '',
            participants: []
        });
        setShowAddForm(false);
    };

    const handleDeleteExpense = (id: number): void => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const getCategoryInfo = (categoryId: string): ExpenseCategory => {
        return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[6];
    };

    const getCollaborator = (id: string): Collaborator | undefined => {
        return collaborators.find(c => c.id === id);
    };

    const getStatusColor = (): string => {
        if (analytics.percentUsed > 100) return 'from-red-500 to-rose-600';
        if (analytics.percentUsed > 80) return 'from-amber-500 to-orange-600';
        return 'from-emerald-500 to-green-600';
    };

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-lg md:w-[550px] max-h-[90vh] flex flex-col mx-4">
            {/* Header */}
            <div className={`bg-gradient-to-r ${getStatusColor()} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Team Expense Tracker</h3>
                            <p className="text-sm text-white/80">
                                {formatCurrency(analytics.totalSpent)} of {formatCurrency(budget)} used
                            </p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Budget Progress Bar */}
                <div className="mt-3">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-500"
                            style={{ width: `${Math.min(analytics.percentUsed, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-white/70 mt-1">
                        <span>Remaining: {formatCurrency(analytics.remaining)}</span>
                        <span>{analytics.percentUsed.toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-b border-gray-200">
                <div className="text-center p-2">
                    <div className="text-lg font-bold text-gray-900">{expenses.length}</div>
                    <div className="text-xs text-gray-500">Expenses</div>
                </div>
                <div className="text-center p-2 border-x border-gray-200">
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(analytics.thisMonth)}</div>
                    <div className="text-xs text-gray-500">This Month</div>
                </div>
                <div className="text-center p-2">
                    <div className={`text-lg font-bold flex items-center justify-center gap-1 ${analytics.trend === 'up' ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {analytics.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {analytics.trendPercent.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">vs Last Month</div>
                </div>
            </div>

            {/* View Toggle & Filters */}
            <div className="p-3 border-b border-gray-200 space-y-2">
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-0.5 flex-1">
                        <button
                            onClick={() => setView('list')}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                                }`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setView('summary')}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'summary' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                                }`}
                        >
                            Summary
                        </button>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {view === 'list' && (
                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="flex-1 text-xs text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Categories</option>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <select
                            value={filterMember}
                            onChange={(e) => setFilterMember(e.target.value)}
                            className="flex-1 text-xs text-gray-900 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Members</option>
                            {collaborators.map(collab => (
                                <option key={collab.id} value={collab.id}>{collab.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-3">
                {view === 'list' ? (
                    /* Expense List */
                    <div className="space-y-2">
                        {filteredExpenses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No expenses found</p>
                            </div>
                        ) : (
                            filteredExpenses.map(expense => {
                                const category = getCategoryInfo(expense.category);
                                const paidByCollab = getCollaborator(expense.paidBy);
                                const CategoryIcon = category.icon;

                                return (
                                    <div
                                        key={expense.id}
                                        className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 ${category.color} rounded-lg text-white flex-shrink-0`}>
                                                <CategoryIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-sm truncate">
                                                            {expense.description}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDate(expense.date)}
                                                            </span>
                                                            {paidByCollab && (
                                                                <span className="flex items-center gap-1">
                                                                    <User className="w-3 h-3" />
                                                                    {paidByCollab.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="font-bold text-gray-900">
                                                            {formatCurrency(expense.amount)}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense.id)}
                                                            className="text-red-500 hover:text-red-700 p-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {expense.participants.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-2">
                                                        <span className="text-xs text-gray-400">For:</span>
                                                        <div className="flex -space-x-1">
                                                            {expense.participants.slice(0, 4).map(pId => {
                                                                const collab = getCollaborator(pId);
                                                                return collab ? (
                                                                    <div
                                                                        key={pId}
                                                                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white"
                                                                        style={{ backgroundColor: collab.color }}
                                                                        title={collab.name}
                                                                    >
                                                                        {collab.initials}
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                            {expense.participants.length > 4 && (
                                                                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[8px] font-bold text-gray-600 border border-white">
                                                                    +{expense.participants.length - 4}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                ) : (
                    /* Summary View */
                    <div className="space-y-4">
                        {/* Category Breakdown */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <PieChart className="w-4 h-4" />
                                By Category
                            </h4>
                            <div className="space-y-2">
                                {EXPENSE_CATEGORIES.map(cat => {
                                    const amount = analytics.byCategory[cat.id] || 0;
                                    const percent = analytics.totalSpent > 0 ? (amount / analytics.totalSpent) * 100 : 0;
                                    if (amount === 0) return null;

                                    const CategoryIcon = cat.icon;

                                    return (
                                        <div key={cat.id} className="flex items-center gap-3">
                                            <div className={`p-1.5 ${cat.color} rounded-lg text-white`}>
                                                <CategoryIcon className="w-3 h-3" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-700">{cat.name}</span>
                                                    <span className="font-medium">{formatCurrency(amount)}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${cat.color} transition-all`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 w-10 text-right">
                                                {percent.toFixed(0)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Member Breakdown */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                By Team Member (Paid By)
                            </h4>
                            <div className="space-y-2">
                                {collaborators.map(collab => {
                                    const amount = analytics.byMember[collab.id] || 0;
                                    const percent = analytics.totalSpent > 0 ? (amount / analytics.totalSpent) * 100 : 0;

                                    return (
                                        <div key={collab.id} className="flex items-center gap-3">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: collab.color }}
                                            >
                                                {collab.initials}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-700">{collab.name}</span>
                                                    <span className="font-medium">{formatCurrency(amount)}</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 transition-all"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 w-10 text-right">
                                                {percent.toFixed(0)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Budget Settings */}
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Budget Settings</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Total Budget:</span>
                                <input
                                    type="number"
                                    value={budget}
                                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                                    className="flex-1 text-sm text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            {showAddForm && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Add Expense</h3>
                            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Description</label>
                                <input
                                    type="text"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="e.g., Team dinner at..."
                                    className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Amount ($)</label>
                                    <input
                                        type="number"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                        placeholder="0"
                                        className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 mb-1 block">Date</label>
                                    <input
                                        type="date"
                                        value={newExpense.date}
                                        onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Category</label>
                                <select
                                    value={newExpense.category}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Paid By</label>
                                <select
                                    value={newExpense.paidBy}
                                    onChange={(e) => setNewExpense(prev => ({ ...prev, paidBy: e.target.value }))}
                                    className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {collaborators.map(collab => (
                                        <option key={collab.id} value={collab.id}>{collab.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-600 mb-1 block">Participants</label>
                                <div className="flex flex-wrap gap-2">
                                    {collaborators.map(collab => (
                                        <button
                                            key={collab.id}
                                            onClick={() => {
                                                setNewExpense(prev => ({
                                                    ...prev,
                                                    participants: prev.participants.includes(collab.id)
                                                        ? prev.participants.filter(id => id !== collab.id)
                                                        : [...prev.participants, collab.id]
                                                }));
                                            }}
                                            className={`px-2 py-1 text-xs rounded-full border transition-colors ${newExpense.participants.includes(collab.id)
                                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            {collab.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddExpense}
                                className="flex-1 px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Add Expense
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
