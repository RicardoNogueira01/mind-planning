import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Clock,
  Zap,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SmartAssigner - AI-powered task assignment suggestions
 * Analyzes team workload, skills, and past performance to suggest
 * the best person for each unassigned task.
 */
export default function SmartAssigner({ 
  nodes = [], 
  collaborators = [],
  onAssignTask,
  onClose 
}) {
  const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState(new Set());
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Calculate team member stats and workload
  const teamStats = useMemo(() => {
    const stats = {};
    
    collaborators.forEach(collab => {
      const assignedTasks = nodes.filter(n => 
        Array.isArray(n.collaborators) && n.collaborators.includes(collab.id)
      );
      const completedTasks = assignedTasks.filter(n => n.completed);
      const activeTasks = assignedTasks.filter(n => !n.completed);
      
      const currentWorkload = activeTasks.reduce((sum, t) => sum + (t.estimatedHours || 2), 0);
      
      // Calculate skill keywords from completed tasks
      const skills = new Set();
      completedTasks.forEach(t => {
        const text = t.text.toLowerCase();
        if (text.includes('design') || text.includes('ui') || text.includes('ux')) skills.add('design');
        if (text.includes('develop') || text.includes('code') || text.includes('build')) skills.add('development');
        if (text.includes('test') || text.includes('qa')) skills.add('testing');
        if (text.includes('review') || text.includes('approve')) skills.add('review');
        if (text.includes('plan') || text.includes('strategy')) skills.add('planning');
        if (text.includes('research') || text.includes('analysis')) skills.add('research');
        if (text.includes('document') || text.includes('write')) skills.add('documentation');
      });
      
      stats[collab.id] = {
        ...collab,
        totalTasks: assignedTasks.length,
        completedTasks: completedTasks.length,
        activeTasks: activeTasks.length,
        currentWorkload,
        completionRate: assignedTasks.length > 0 
          ? Math.round((completedTasks.length / assignedTasks.length) * 100) 
          : 0,
        skills: Array.from(skills),
        availability: currentWorkload < 16 ? 'available' : currentWorkload < 32 ? 'busy' : 'overloaded'
      };
    });
    
    return stats;
  }, [nodes, collaborators]);

  // Find unassigned tasks and generate suggestions
  const suggestions = useMemo(() => {
    const unassignedTasks = nodes.filter(n => 
      !n.completed && 
      (!n.collaborators || n.collaborators.length === 0)
    );

    return unassignedTasks.map(task => {
      const taskText = task.text.toLowerCase();
      
      // Detect task type
      let taskType = 'general';
      if (taskText.includes('design') || taskText.includes('ui') || taskText.includes('ux')) taskType = 'design';
      else if (taskText.includes('develop') || taskText.includes('code') || taskText.includes('build')) taskType = 'development';
      else if (taskText.includes('test') || taskText.includes('qa')) taskType = 'testing';
      else if (taskText.includes('review') || taskText.includes('approve')) taskType = 'review';
      else if (taskText.includes('plan') || taskText.includes('strategy')) taskType = 'planning';
      else if (taskText.includes('research') || taskText.includes('analysis')) taskType = 'research';
      else if (taskText.includes('document') || taskText.includes('write')) taskType = 'documentation';

      // Score each collaborator
      const scoredCollabs = Object.values(teamStats).map(collab => {
        let score = 50;
        if (collab.skills.includes(taskType)) score += 30;
        if (collab.availability === 'available') score += 20;
        else if (collab.availability === 'busy') score += 10;
        else score -= 20;
        score += Math.round(collab.completionRate * 0.15);
        if (collab.currentWorkload < 8) score += 15;
        else if (collab.currentWorkload < 16) score += 10;
        else if (collab.currentWorkload < 24) score += 5;
        
        return { ...collab, score, taskType };
      });

      scoredCollabs.sort((a, b) => b.score - a.score);
      const recommended = scoredCollabs[0];
      const alternatives = scoredCollabs.slice(1, 3);

      return {
        task,
        taskType,
        recommended,
        alternatives,
        confidence: Math.min(Math.round(recommended?.score || 50), 100)
      };
    });
  }, [nodes, teamStats]);

  const handleAccept = (taskId, collabId) => {
    setAcceptedSuggestions(prev => new Set([...prev, taskId]));
    onAssignTask?.(taskId, collabId);
  };

  const handleReject = (taskId) => {
    setRejectedSuggestions(prev => new Set([...prev, taskId]));
  };

  const handleAutoAssignAll = async () => {
    setIsAutoAssigning(true);
    
    for (const suggestion of suggestions) {
      if (!acceptedSuggestions.has(suggestion.task.id) && 
          !rejectedSuggestions.has(suggestion.task.id) &&
          suggestion.recommended) {
        await new Promise(resolve => setTimeout(resolve, 300));
        handleAccept(suggestion.task.id, suggestion.recommended.id);
      }
    }
    
    setIsAutoAssigning(false);
  };

  const pendingSuggestions = suggestions.filter(s => 
    !acceptedSuggestions.has(s.task.id) && !rejectedSuggestions.has(s.task.id)
  );

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'busy': return 'bg-amber-100 text-amber-700';
      case 'overloaded': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTaskTypeIcon = (type) => {
    const icons = {
      design: '🎨',
      development: '💻',
      testing: '🧪',
      review: '👁️',
      planning: '📋',
      research: '🔍',
      documentation: '📝',
      general: '📌'
    };
    return icons[type] || '📌';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-lg md:w-[520px] max-h-[85vh] flex flex-col mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Smart Assigner</h3>
              <p className="text-sm text-violet-100">
                {pendingSuggestions.length} tasks need assignment
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

      {/* Quick stats bar */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-violet-50 border-b border-violet-100">
        {Object.values(teamStats).slice(0, 4).map(member => (
          <div key={member.id} className="text-center">
            <div 
              className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            <div className="text-xs text-gray-600 mt-1">{member.activeTasks} tasks</div>
            <div className={`text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 ${getAvailabilityColor(member.availability)}`}>
              {member.availability}
            </div>
          </div>
        ))}
      </div>

      {/* Auto-assign all button */}
      {pendingSuggestions.length > 1 && (
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={handleAutoAssignAll}
            disabled={isAutoAssigning}
            className="w-full py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAutoAssigning ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Assigning...</>
            ) : (
              <><Zap className="w-4 h-4" /> Auto-Assign All ({pendingSuggestions.length})</>
            )}
          </button>
        </div>
      )}

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {pendingSuggestions.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-900 font-medium">All tasks assigned!</p>
            <p className="text-sm text-gray-500 mt-1">{acceptedSuggestions.size} suggestions accepted</p>
          </div>
        ) : (
          pendingSuggestions.map(suggestion => suggestion.recommended && (
            <div key={suggestion.task.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              {/* Task info */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl">{getTaskTypeIcon(suggestion.taskType)}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{suggestion.task.text}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {suggestion.task.estimatedHours || 2}h estimated • {suggestion.taskType}
                  </p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-violet-200">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: suggestion.recommended.color }}
                >
                  {suggestion.recommended.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{suggestion.recommended.name}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded font-medium">
                      {suggestion.confidence}% match
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span>{suggestion.recommended.activeTasks} active</span>
                    <span>•</span>
                    <span>{suggestion.recommended.completionRate}% done</span>
                  </div>
                </div>
              </div>

              {/* Why */}
              <div className="mt-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">Why: </span>
                {suggestion.recommended.skills.includes(suggestion.taskType) && (
                  <span className="mr-2">✓ {suggestion.taskType} skills</span>
                )}
                {suggestion.recommended.availability === 'available' && (
                  <span>✓ Available</span>
                )}
              </div>

              {/* Alternatives */}
              {suggestion.alternatives.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>Also:</span>
                  {suggestion.alternatives.map(alt => (
                    <button
                      key={alt.id}
                      onClick={() => handleAccept(suggestion.task.id, alt.id)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      {alt.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleAccept(suggestion.task.id, suggestion.recommended.id)}
                  className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-1"
                >
                  <ThumbsUp className="w-4 h-4" /> Accept
                </button>
                <button
                  onClick={() => handleReject(suggestion.task.id)}
                  className="py-2 px-4 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <ThumbsDown className="w-4 h-4" /> Skip
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" /> {acceptedSuggestions.size} assigned
          </span>
          <span className="flex items-center gap-1">
            <X className="w-3 h-3 text-gray-400" /> {rejectedSuggestions.size} skipped
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-violet-500" /> {pendingSuggestions.length} pending
          </span>
        </div>
      </div>
    </div>
  );
}

SmartAssigner.propTypes = {
  nodes: PropTypes.array,
  collaborators: PropTypes.array,
  onAssignTask: PropTypes.func,
  onClose: PropTypes.func
};
