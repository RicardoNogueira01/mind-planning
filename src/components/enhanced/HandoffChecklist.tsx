import React, { useState, useMemo } from 'react';
import {
    ArrowRightLeft,
    X,
    Check,
    Circle,
    User,
    FileText,
    MessageSquare,
    Clock,
    AlertCircle,
    CheckCircle2,
    ChevronRight,
    LucideIcon
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
    completed?: boolean;
    collaborators?: string[];
    [key: string]: unknown;
}

interface ChecklistItem {
    id: string;
    label: string;
    description: string;
    icon: LucideIcon;
}

interface Handoff {
    id: number;
    taskId: string;
    taskName: string;
    fromUser?: string;
    toUser: string;
    notes: string;
    checklist: string[];
    timestamp: string;
}

interface HandoffChecklistProps {
    nodes?: Node[];
    collaborators?: Collaborator[];
    onHandoffComplete?: (taskId: string, newOwner: string, handoff: Handoff) => void;
    onClose?: () => void;
}

/**
 * HandoffChecklist - Ensures clean task transitions
 * When passing a task to another team member, this checklist ensures:
 * - Context is shared
 * - Files are linked
 * - Questions are answered
 * - No information is lost
 */

const DEFAULT_CHECKLIST: ChecklistItem[] = [
    { id: 'context', label: 'Context shared', description: 'Brief explanation of what this task is about', icon: MessageSquare },
    { id: 'status', label: 'Current status explained', description: 'Where you left off and what\'s been done', icon: Clock },
    { id: 'files', label: 'Files/links attached', description: 'All relevant documents, designs, or references', icon: FileText },
    { id: 'blockers', label: 'Known blockers noted', description: 'Any issues or dependencies they should know about', icon: AlertCircle },
    { id: 'questions', label: 'Open questions listed', description: 'Things that still need to be figured out', icon: Circle },
    { id: 'contacts', label: 'Key contacts identified', description: 'Who to reach out to for help or approvals', icon: User }
];

export default function HandoffChecklist({
    nodes = [],
    collaborators = [],
    onHandoffComplete,
    onClose
}: HandoffChecklistProps) {
    const [selectedTask, setSelectedTask] = useState<Node | null>(null);
    const [selectedNewOwner, setSelectedNewOwner] = useState<string>('');
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
    const [handoffNotes, setHandoffNotes] = useState<string>('');
    const [recentHandoffs, setRecentHandoffs] = useState<Handoff[]>([]);
    const [step, setStep] = useState<number>(1); // 1: Select task, 2: Select person, 3: Checklist

    // Get tasks that can be handed off (assigned to current user)
    const handoffableTasks = useMemo<Node[]>(() => {
        return nodes.filter(n =>
            !n.completed &&
            n.collaborators &&
            n.collaborators.length > 0
        );
    }, [nodes]);

    const toggleCheckItem = (itemId: string): void => {
        setCheckedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const completionPercent = Math.round((checkedItems.size / DEFAULT_CHECKLIST.length) * 100);
    const isComplete = checkedItems.size === DEFAULT_CHECKLIST.length;

    const handleCompleteHandoff = (): void => {
        if (!selectedTask || !selectedNewOwner) return;

        const handoff: Handoff = {
            id: Date.now(),
            taskId: selectedTask.id,
            taskName: selectedTask.text,
            fromUser: selectedTask.collaborators?.[0],
            toUser: selectedNewOwner,
            notes: handoffNotes,
            checklist: Array.from(checkedItems),
            timestamp: new Date().toISOString()
        };

        setRecentHandoffs(prev => [handoff, ...prev.slice(0, 4)]);
        onHandoffComplete?.(selectedTask.id, selectedNewOwner, handoff);

        // Reset
        setSelectedTask(null);
        setSelectedNewOwner('');
        setCheckedItems(new Set());
        setHandoffNotes('');
        setStep(1);
    };

    const getCollaborator = (id: string | undefined): Collaborator | undefined =>
        id ? collaborators.find(c => c.id === id) : undefined;

    const currentOwner = selectedTask ? getCollaborator(selectedTask.collaborators?.[0]) : undefined;
    const newOwner = getCollaborator(selectedNewOwner);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-lg md:w-[500px] max-h-[85vh] flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <ArrowRightLeft className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Handoff Checklist</h3>
                            <p className="text-sm text-rose-100">
                                Ensure smooth task transitions
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

            {/* Progress indicator */}
            <div className="px-4 py-3 bg-rose-50 border-b border-rose-100">
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > s ? 'bg-rose-500 text-white' :
                                    step === s ? 'bg-rose-500 text-white' :
                                        'bg-white text-gray-400 border border-gray-200'
                                }`}>
                                {step > s ? <Check className="w-4 h-4" /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-8 h-0.5 ${step > s ? 'bg-rose-500' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                        {step === 1 ? 'Select task' : step === 2 ? 'Choose recipient' : 'Complete checklist'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Step 1: Select task */}
                {step === 1 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Select a task to hand off:</h4>
                        {handoffableTasks.length === 0 ? (
                            <div className="text-center py-8">
                                <ArrowRightLeft className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No tasks available for handoff</p>
                                <p className="text-gray-400 text-xs mt-1">Assign tasks to team members first</p>
                            </div>
                        ) : (
                            handoffableTasks.map(task => {
                                const owner = getCollaborator(task.collaborators?.[0]);
                                return (
                                    <button
                                        key={task.id}
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setStep(2);
                                        }}
                                        className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-left transition-colors flex items-center gap-3"
                                    >
                                        {owner && (
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: owner.color }}
                                            >
                                                {owner.initials}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-900 truncate">{task.text}</div>
                                            <div className="text-xs text-gray-500">
                                                {owner ? `Currently with ${owner.name}` : 'Unassigned'}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Step 2: Select new owner */}
                {step === 2 && selectedTask && (
                    <div className="space-y-3">
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 mb-4">
                            <div className="text-xs text-rose-600 font-medium mb-1">Handing off:</div>
                            <div className="text-sm text-gray-900">{selectedTask.text}</div>
                        </div>

                        <h4 className="text-sm font-medium text-gray-700">Who should take over?</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {collaborators
                                .filter(c => !selectedTask.collaborators?.includes(c.id))
                                .map(collab => (
                                    <button
                                        key={collab.id}
                                        onClick={() => {
                                            setSelectedNewOwner(collab.id);
                                            setStep(3);
                                        }}
                                        className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center gap-3"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: collab.color }}
                                        >
                                            {collab.initials}
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-medium text-gray-900">{collab.name}</div>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full mt-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            ← Back to task selection
                        </button>
                    </div>
                )}

                {/* Step 3: Checklist */}
                {step === 3 && selectedTask && selectedNewOwner && (
                    <div className="space-y-4">
                        {/* Transfer visualization */}
                        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
                            {currentOwner && (
                                <div className="text-center">
                                    <div
                                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: currentOwner.color }}
                                    >
                                        {currentOwner.initials}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{currentOwner.name.split(' ')[0]}</div>
                                </div>
                            )}
                            <ArrowRightLeft className="w-6 h-6 text-rose-500" />
                            {newOwner && (
                                <div className="text-center">
                                    <div
                                        className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: newOwner.color }}
                                    >
                                        {newOwner.initials}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{newOwner.name.split(' ')[0]}</div>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-center">
                            <div className="text-sm text-gray-900 font-medium">{selectedTask.text}</div>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Handoff checklist</span>
                                <span>{completionPercent}% complete</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-rose-500'}`}
                                    style={{ width: `${completionPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-2">
                            {DEFAULT_CHECKLIST.map(item => {
                                const isChecked = checkedItems.has(item.id);
                                const ItemIcon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleCheckItem(item.id)}
                                        className={`w-full p-3 rounded-xl border transition-all flex items-start gap-3 text-left ${isChecked
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                            }`}>
                                            {isChecked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isChecked ? 'text-green-700' : 'text-gray-900'}`}>
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-gray-500">{item.description}</div>
                                        </div>
                                        <ItemIcon className={`w-4 h-4 flex-shrink-0 ${isChecked ? 'text-green-500' : 'text-gray-400'}`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Additional notes for {newOwner?.name.split(' ')[0]}</label>
                            <textarea
                                value={handoffNotes}
                                onChange={(e) => setHandoffNotes(e.target.value)}
                                placeholder="Any specific instructions or context..."
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleCompleteHandoff}
                                disabled={!isComplete}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isComplete
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isComplete ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Complete Handoff</>
                                ) : (
                                    <>Complete all items first</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent handoffs */}
            {recentHandoffs.length > 0 && step === 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2">Recent handoffs</div>
                    <div className="space-y-1">
                        {recentHandoffs.slice(0, 2).map(handoff => {
                            const from = getCollaborator(handoff.fromUser);
                            const to = getCollaborator(handoff.toUser);
                            return (
                                <div key={handoff.id} className="flex items-center gap-2 text-xs text-gray-600">
                                    <span className="truncate flex-1">{handoff.taskName}</span>
                                    <span className="text-gray-400">
                                        {from?.initials} → {to?.initials}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
