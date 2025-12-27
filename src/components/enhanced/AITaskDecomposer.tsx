import React, { useState, KeyboardEvent } from 'react';
import { Sparkles, Loader2, Plus, CheckCircle, ChevronDown, ChevronUp, Zap, Clock, Flag, X } from 'lucide-react';

interface Node {
    id?: string;
    text?: string;
}

interface Subtask {
    text: string;
    hours: number;
    priority: 'high' | 'medium' | 'low';
}

interface TaskPattern {
    keywords: string[];
    subtasks: Subtask[];
}

interface Suggestion {
    id: string;
    text: string;
    estimatedHours: number;
    priority: 'high' | 'medium' | 'low';
    order: number;
}

interface AITaskDecomposerProps {
    node?: Node;
    onDecompose: (suggestions: Suggestion[]) => void;
    onClose?: () => void;
}

/**
 * AITaskDecomposer - AI-powered task breakdown component
 * Analyzes task text and suggests intelligent subtask decomposition
 * based on industry best practices and common workflow patterns.
 */
export default function AITaskDecomposer({ node, onDecompose, onClose }: AITaskDecomposerProps) {
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
    const [customSubtask, setCustomSubtask] = useState<string>('');

    // Task decomposition patterns based on common project types
    const taskPatterns: Record<string, TaskPattern> = {
        design: {
            keywords: ['design', 'wireframe', 'mockup', 'ui', 'ux', 'prototype', 'layout', 'visual'],
            subtasks: [
                { text: 'Research & inspiration gathering', hours: 2, priority: 'high' },
                { text: 'Create wireframes', hours: 3, priority: 'high' },
                { text: 'Design high-fidelity mockups', hours: 4, priority: 'medium' },
                { text: 'Create interactive prototype', hours: 3, priority: 'medium' },
                { text: 'Design review & feedback', hours: 1, priority: 'high' },
                { text: 'Final revisions', hours: 2, priority: 'low' },
                { text: 'Handoff to development', hours: 1, priority: 'low' }
            ]
        },
        develop: {
            keywords: ['develop', 'implement', 'build', 'code', 'create', 'program', 'feature', 'api', 'backend', 'frontend'],
            subtasks: [
                { text: 'Technical specification', hours: 2, priority: 'high' },
                { text: 'Setup development environment', hours: 1, priority: 'high' },
                { text: 'Core implementation', hours: 6, priority: 'high' },
                { text: 'Write unit tests', hours: 2, priority: 'medium' },
                { text: 'Integration testing', hours: 2, priority: 'medium' },
                { text: 'Code review', hours: 1, priority: 'high' },
                { text: 'Bug fixes & refinements', hours: 2, priority: 'medium' },
                { text: 'Documentation', hours: 1, priority: 'low' },
                { text: 'Deploy to staging', hours: 1, priority: 'low' }
            ]
        },
        launch: {
            keywords: ['launch', 'release', 'deploy', 'publish', 'go-live', 'ship'],
            subtasks: [
                { text: 'Pre-launch checklist review', hours: 1, priority: 'high' },
                { text: 'Stakeholder sign-off', hours: 1, priority: 'high' },
                { text: 'Prepare marketing assets', hours: 3, priority: 'medium' },
                { text: 'Configure production environment', hours: 2, priority: 'high' },
                { text: 'Execute deployment', hours: 1, priority: 'high' },
                { text: 'Smoke testing', hours: 1, priority: 'high' },
                { text: 'Monitor & respond to issues', hours: 2, priority: 'high' },
                { text: 'Post-launch review', hours: 1, priority: 'low' }
            ]
        },
        research: {
            keywords: ['research', 'analyze', 'study', 'investigate', 'explore', 'evaluate', 'assess'],
            subtasks: [
                { text: 'Define research objectives', hours: 1, priority: 'high' },
                { text: 'Identify data sources', hours: 1, priority: 'high' },
                { text: 'Gather data & information', hours: 4, priority: 'medium' },
                { text: 'Analyze findings', hours: 3, priority: 'high' },
                { text: 'Synthesize insights', hours: 2, priority: 'medium' },
                { text: 'Create report/presentation', hours: 2, priority: 'medium' },
                { text: 'Present to stakeholders', hours: 1, priority: 'low' }
            ]
        },
        marketing: {
            keywords: ['marketing', 'campaign', 'social', 'content', 'promote', 'advertise', 'brand'],
            subtasks: [
                { text: 'Define target audience', hours: 1, priority: 'high' },
                { text: 'Create content strategy', hours: 2, priority: 'high' },
                { text: 'Design creative assets', hours: 4, priority: 'medium' },
                { text: 'Write copy & messaging', hours: 2, priority: 'medium' },
                { text: 'Setup campaign tracking', hours: 1, priority: 'medium' },
                { text: 'Launch campaign', hours: 1, priority: 'high' },
                { text: 'Monitor performance', hours: 2, priority: 'medium' },
                { text: 'Optimize based on data', hours: 2, priority: 'low' }
            ]
        },
        testing: {
            keywords: ['test', 'qa', 'quality', 'verify', 'validate', 'check', 'audit'],
            subtasks: [
                { text: 'Create test plan', hours: 2, priority: 'high' },
                { text: 'Setup test environment', hours: 1, priority: 'high' },
                { text: 'Execute test cases', hours: 4, priority: 'high' },
                { text: 'Document bugs & issues', hours: 1, priority: 'medium' },
                { text: 'Regression testing', hours: 2, priority: 'medium' },
                { text: 'Performance testing', hours: 2, priority: 'medium' },
                { text: 'Create test report', hours: 1, priority: 'low' }
            ]
        },
        meeting: {
            keywords: ['meeting', 'call', 'discuss', 'review', 'sync', 'standup', 'presentation'],
            subtasks: [
                { text: 'Prepare agenda', hours: 0.5, priority: 'high' },
                { text: 'Gather relevant materials', hours: 1, priority: 'medium' },
                { text: 'Send calendar invites', hours: 0.25, priority: 'high' },
                { text: 'Conduct meeting', hours: 1, priority: 'high' },
                { text: 'Document action items', hours: 0.5, priority: 'high' },
                { text: 'Follow up on decisions', hours: 0.5, priority: 'medium' }
            ]
        },
        documentation: {
            keywords: ['document', 'write', 'documentation', 'guide', 'manual', 'wiki', 'readme'],
            subtasks: [
                { text: 'Outline document structure', hours: 1, priority: 'high' },
                { text: 'Gather technical details', hours: 2, priority: 'high' },
                { text: 'Write first draft', hours: 3, priority: 'high' },
                { text: 'Add examples & screenshots', hours: 2, priority: 'medium' },
                { text: 'Review & edit', hours: 1, priority: 'medium' },
                { text: 'Publish & share', hours: 0.5, priority: 'low' }
            ]
        }
    };

    // Default subtasks when no pattern matches
    const defaultSubtasks: Subtask[] = [
        { text: 'Define requirements & scope', hours: 1, priority: 'high' },
        { text: 'Plan approach & timeline', hours: 1, priority: 'high' },
        { text: 'Execute main work', hours: 4, priority: 'high' },
        { text: 'Review progress', hours: 0.5, priority: 'medium' },
        { text: 'Make adjustments', hours: 1, priority: 'medium' },
        { text: 'Finalize & deliver', hours: 1, priority: 'low' }
    ];

    const analyzeTask = async (): Promise<void> => {
        setIsAnalyzing(true);

        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1200));

        const taskText = node?.text?.toLowerCase() || '';

        // Find matching pattern
        let matchedSubtasks: Subtask[] | null = null;
        let matchConfidence = 0;

        for (const pattern of Object.values(taskPatterns)) {
            const matchCount = pattern.keywords.filter(keyword =>
                taskText.includes(keyword)
            ).length;

            if (matchCount > matchConfidence) {
                matchConfidence = matchCount;
                matchedSubtasks = pattern.subtasks;
            }
        }

        // Use default if no strong match
        const subtasks = matchedSubtasks || defaultSubtasks;

        // Add unique IDs and additional metadata
        const formattedSuggestions: Suggestion[] = subtasks.map((subtask, index) => ({
            id: `suggestion-${Date.now()}-${index}`,
            text: subtask.text,
            estimatedHours: subtask.hours,
            priority: subtask.priority,
            order: index + 1
        }));

        setSuggestions(formattedSuggestions);
        setSelectedSuggestions(new Set(formattedSuggestions.map(s => s.id)));
        setIsAnalyzing(false);
    };

    const toggleSuggestion = (id: string): void => {
        const newSelected = new Set(selectedSuggestions);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedSuggestions(newSelected);
    };

    const handleAddAll = (): void => {
        const selectedItems = suggestions.filter(s => selectedSuggestions.has(s.id));
        onDecompose(selectedItems);
        onClose?.();
    };

    const handleAddSingle = (suggestion: Suggestion): void => {
        onDecompose([suggestion]);
    };

    const handleAddCustom = (): void => {
        if (!customSubtask.trim()) return;

        const custom: Suggestion = {
            id: `custom-${Date.now()}`,
            text: customSubtask.trim(),
            estimatedHours: 2,
            priority: 'medium',
            order: suggestions.length + 1
        };

        onDecompose([custom]);
        setCustomSubtask('');
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50';
            case 'medium': return 'text-amber-500 bg-amber-50';
            case 'low': return 'text-green-500 bg-green-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const totalHours = suggestions
        .filter(s => selectedSuggestions.has(s.id))
        .reduce((sum, s) => sum + s.estimatedHours, 0);

    return (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm sm:max-w-md md:w-96 max-h-[80vh] overflow-hidden flex flex-col mx-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold">AI Task Breakdown</h3>
                            <p className="text-sm text-purple-100 truncate max-w-[250px]">
                                {node?.text || 'Select a task'}
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
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {suggestions.length === 0 ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Our AI will analyze your task and suggest a smart breakdown into manageable subtasks.
                        </p>

                        <button
                            onClick={analyzeTask}
                            disabled={isAnalyzing || !node}
                            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing task...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Generate Subtasks
                                </>
                            )}
                        </button>

                        <div className="text-xs text-gray-400 text-center">
                            Powered by intelligent pattern recognition
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Summary */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                                {selectedSuggestions.size} of {suggestions.length} selected
                            </span>
                            <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                <Clock className="w-4 h-4" />
                                {totalHours}h total
                            </span>
                        </div>

                        {/* Suggestions list */}
                        <div className="space-y-2">
                            {suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className={`group flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedSuggestions.has(suggestion.id)
                                            ? 'border-indigo-300 bg-indigo-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    onClick={() => toggleSuggestion(suggestion.id)}
                                >
                                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selectedSuggestions.has(suggestion.id)
                                            ? 'border-indigo-500 bg-indigo-500'
                                            : 'border-gray-300'
                                        }`}>
                                        {selectedSuggestions.has(suggestion.id) && (
                                            <CheckCircle className="w-3 h-3 text-white" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className={`text-sm font-medium ${selectedSuggestions.has(suggestion.id) ? 'text-indigo-900' : 'text-gray-700'
                                                }`}>
                                                {suggestion.text}
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddSingle(suggestion);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-200 rounded transition-all"
                                                title="Add only this subtask"
                                            >
                                                <Plus className="w-4 h-4 text-indigo-600" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(suggestion.priority)}`}>
                                                <Flag className="w-3 h-3 inline mr-1" />
                                                {suggestion.priority}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ~{suggestion.estimatedHours}h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Advanced section */}
                        <div className="border-t border-gray-100 pt-3 mt-3">
                            <button
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                Add custom subtask
                            </button>

                            {showAdvanced && (
                                <div className="mt-3 flex gap-2">
                                    <input
                                        type="text"
                                        value={customSubtask}
                                        onChange={(e) => setCustomSubtask(e.target.value)}
                                        placeholder="Enter custom subtask..."
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddCustom()}
                                    />
                                    <button
                                        onClick={handleAddCustom}
                                        disabled={!customSubtask.trim()}
                                        className="px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {suggestions.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                        <button
                            onClick={analyzeTask}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            Regenerate
                        </button>
                        <button
                            onClick={handleAddAll}
                            disabled={selectedSuggestions.size === 0}
                            className="flex-1 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add {selectedSuggestions.size} Subtasks
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
