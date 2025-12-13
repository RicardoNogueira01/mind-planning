import React, { useMemo, useState } from 'react';
import { Link2, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Zap, ArrowRight, X } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * DependencyAnalyzer - Smart dependency detection component
 * Automatically analyzes task names and suggests dependencies
 * based on common workflow patterns and industry best practices.
 */
export default function DependencyAnalyzer({ nodes, connections, onCreateConnection, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set());

  // Dependency patterns based on common workflows
  const dependencyPatterns = [
    // Design -> Development flow
    { before: /design|wireframe|mockup|prototype|ui|ux/i, after: /develop|implement|build|code|frontend|backend/i, confidence: 0.9 },
    
    // Research -> Planning/Design flow
    { before: /research|analyze|study|investigate|discover/i, after: /design|plan|strategy|spec|requirements/i, confidence: 0.85 },
    
    // Development -> Testing flow
    { before: /develop|implement|build|code|create|feature/i, after: /test|qa|quality|verify|validate/i, confidence: 0.95 },
    
    // Testing -> Deployment flow
    { before: /test|qa|quality|verify|validate/i, after: /deploy|launch|release|ship|publish/i, confidence: 0.9 },
    
    // Planning -> Execution flow
    { before: /plan|spec|requirements|define|scope/i, after: /design|develop|implement|execute/i, confidence: 0.85 },
    
    // Approval -> Launch flow
    { before: /approve|sign-off|review|validate|confirm/i, after: /launch|publish|release|deploy|go-live/i, confidence: 0.9 },
    
    // Setup -> Main work flow
    { before: /setup|configure|install|prepare|initialize/i, after: /develop|implement|build|create|execute/i, confidence: 0.85 },
    
    // Draft -> Review flow
    { before: /draft|write|create|compose/i, after: /review|edit|revise|feedback/i, confidence: 0.8 },
    
    // Review -> Finalize flow
    { before: /review|edit|revise|feedback/i, after: /finalize|complete|publish|deliver/i, confidence: 0.85 },
    
    // Data gathering -> Analysis flow
    { before: /gather|collect|fetch|retrieve|import/i, after: /analyze|process|transform|visualize/i, confidence: 0.85 },
    
    // Backend -> Frontend integration
    { before: /api|backend|server|database|endpoint/i, after: /frontend|ui|interface|integration|connect/i, confidence: 0.8 },
    
    // Documentation -> Training/Handoff
    { before: /document|documentation|guide|manual/i, after: /train|handoff|onboard|present/i, confidence: 0.75 }
  ];

  const suggestions = useMemo(() => {
    // Create a set of existing connections for quick lookup
    const existingPairs = new Set(
      connections.map(c => `${c.from}-${c.to}`)
    );

    const potentialDeps = [];
    const processedPairs = new Set();

    // Analyze each pair of nodes
    for (const nodeA of nodes) {
      for (const nodeB of nodes) {
        // Skip same node
        if (nodeA.id === nodeB.id) continue;
        
        // Skip if connection already exists (in either direction)
        if (existingPairs.has(`${nodeA.id}-${nodeB.id}`)) continue;
        if (existingPairs.has(`${nodeB.id}-${nodeA.id}`)) continue;
        
        // Skip if already processed this pair
        const pairKey = `${nodeA.id}-${nodeB.id}`;
        if (processedPairs.has(pairKey)) continue;
        
        // Skip completed tasks
        if (nodeA.completed || nodeB.completed) continue;

        // Check against each pattern
        for (const pattern of dependencyPatterns) {
          const nodeAText = nodeA.text || '';
          const nodeBText = nodeB.text || '';
          
          if (pattern.before.test(nodeAText) && pattern.after.test(nodeBText)) {
            processedPairs.add(pairKey);
            
            potentialDeps.push({
              id: pairKey,
              from: nodeA,
              to: nodeB,
              confidence: pattern.confidence,
              reason: getReasonText(pattern, nodeA.text, nodeB.text)
            });
            break;
          }
        }
      }
    }

    // Sort by confidence and filter dismissed
    return potentialDeps
      .filter(dep => !dismissedSuggestions.has(dep.id))
      .sort((a, b) => b.confidence - a.confidence);
  }, [nodes, connections, dismissedSuggestions]);

  const getReasonText = (pattern, fromText, toText) => {
    // Generate human-readable reason
    const reasons = {
      'design': 'Design work typically precedes development',
      'research': 'Research informs design and planning decisions',
      'develop': 'Development must complete before testing',
      'test': 'Testing validates work before deployment',
      'plan': 'Planning establishes requirements for execution',
      'approve': 'Approval is required before going live',
      'setup': 'Setup prepares the environment for main work',
      'draft': 'Drafts require review before finalizing',
      'review': 'Review precedes final delivery',
      'gather': 'Data must be gathered before analysis',
      'api': 'Backend services enable frontend features',
      'document': 'Documentation enables training and handoff'
    };

    for (const [key, reason] of Object.entries(reasons)) {
      if (pattern.before.source.toLowerCase().includes(key)) {
        return reason;
      }
    }
    
    return 'Common workflow pattern detected';
  };

  const handleCreateConnection = (fromId, toId) => {
    onCreateConnection(fromId, toId);
    // Dismiss this suggestion after creating
    setDismissedSuggestions(prev => new Set([...prev, `${fromId}-${toId}`]));
  };

  const handleDismiss = (suggestionId) => {
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.8) return 'text-amber-600 bg-amber-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Medium';
    return 'Low';
  };

  const displayedSuggestions = showAll ? suggestions : suggestions.slice(0, 5);

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6">
        <div className="flex items-center gap-3 text-green-600">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">All Dependencies Set</h3>
            <p className="text-sm text-green-600">No additional dependencies detected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-sm sm:max-w-md md:w-96 max-h-[80vh] overflow-hidden flex flex-col mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Smart Dependencies</h3>
              <p className="text-sm text-amber-100">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} found
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

      {/* Alert banner */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-700">
          These are AI-suggested dependencies based on task analysis
        </p>
      </div>

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayedSuggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group border border-gray-200 rounded-xl p-3 hover:border-amber-300 hover:shadow-sm transition-all"
          >
            {/* Confidence badge */}
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                <Zap className="w-3 h-3 inline mr-1" />
                {getConfidenceLabel(suggestion.confidence)} confidence
              </span>
              <button
                onClick={() => handleDismiss(suggestion.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
                title="Dismiss suggestion"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Connection visualization */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: suggestion.from.color || '#6366F1' }}
                  />
                  <span className="text-sm text-gray-700 truncate font-medium">
                    {suggestion.from.text}
                  </span>
                </div>
              </div>
              
              <ArrowRight className="w-5 h-5 text-amber-500 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: suggestion.to.color || '#6366F1' }}
                  />
                  <span className="text-sm text-gray-700 truncate font-medium">
                    {suggestion.to.text}
                  </span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <p className="text-xs text-gray-500 mb-3 italic">
              "{suggestion.reason}"
            </p>

            {/* Action button */}
            <button
              onClick={() => handleCreateConnection(suggestion.from.id, suggestion.to.id)}
              className="w-full py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
            >
              <Link2 className="w-4 h-4" />
              Create Dependency
            </button>
          </div>
        ))}

        {/* Show more button */}
        {suggestions.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center justify-center gap-1 transition-colors"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {suggestions.length - 5} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => {
            displayedSuggestions.forEach(s => {
              handleCreateConnection(s.from.id, s.to.id);
            });
          }}
          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Accept All ({displayedSuggestions.length})
        </button>
      </div>
    </div>
  );
}

DependencyAnalyzer.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    color: PropTypes.string,
    completed: PropTypes.bool
  })).isRequired,
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
  })).isRequired,
  onCreateConnection: PropTypes.func.isRequired,
  onClose: PropTypes.func
};
