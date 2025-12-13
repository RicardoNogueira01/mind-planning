import React, { useMemo, useState } from 'react';
import { AlertTriangle, Shield, TrendingDown, ChevronDown, ChevronUp, AlertCircle, Clock, Users, Link2, Target, X, Zap } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * RiskMatrix - Project risk assessment component
 * Automatically identifies and visualizes project risks based on
 * task status, dependencies, and team workload patterns.
 */
export default function RiskMatrix({ nodes, connections, collaborators, onClose }) {
  const [expandedRisk, setExpandedRisk] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all'); // 'all' | 'critical' | 'high' | 'medium'

  const risks = useMemo(() => {
    const riskItems = [];
    const now = new Date();

    nodes.forEach(node => {
      if (node.completed) return; // Skip completed tasks

      let riskScore = 0;
      const riskFactors = [];
      const recommendations = [];

      // 1. Check for overdue tasks (High impact)
      if (node.dueDate) {
        const dueDate = new Date(node.dueDate);
        const daysOverdue = Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
        
        if (daysOverdue > 0) {
          riskScore += Math.min(daysOverdue * 12, 50); // Cap at 50
          riskFactors.push({
            type: 'overdue',
            icon: 'clock',
            text: `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`,
            severity: daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'high' : 'medium'
          });
          recommendations.push('Prioritize this task immediately or reschedule');
        } else if (daysOverdue > -3 && daysOverdue <= 0) {
          riskScore += 20;
          riskFactors.push({
            type: 'deadline',
            icon: 'clock',
            text: daysOverdue === 0 ? 'Due today' : `Due in ${Math.abs(daysOverdue)} day${Math.abs(daysOverdue) > 1 ? 's' : ''}`,
            severity: 'high'
          });
          recommendations.push('Ensure resources are allocated for timely completion');
        }
      }

      // 2. Check for blocking dependencies (tasks that block many others)
      const blockedTasks = connections.filter(c => c.from === node.id);
      if (blockedTasks.length > 2) {
        riskScore += blockedTasks.length * 10;
        riskFactors.push({
          type: 'blocking',
          icon: 'link',
          text: `Blocks ${blockedTasks.length} other task${blockedTasks.length > 1 ? 's' : ''}`,
          severity: blockedTasks.length > 4 ? 'critical' : 'high'
        });
        recommendations.push('This is a critical path task - prioritize to unblock others');
      }

      // 3. Check for unassigned high-priority tasks
      const hasAssignee = node.collaborators?.length > 0 || node.assignedTo;
      const isHighPriority = node.priority === 'high' || node.priority === 'critical';
      if (isHighPriority && !hasAssignee) {
        riskScore += 25;
        riskFactors.push({
          type: 'unassigned',
          icon: 'users',
          text: 'High priority without assignee',
          severity: 'high'
        });
        recommendations.push('Assign a team member with appropriate skills');
      }

      // 4. Check for tasks without due dates
      if (!node.dueDate && isHighPriority) {
        riskScore += 15;
        riskFactors.push({
          type: 'no-deadline',
          icon: 'clock',
          text: 'No deadline set',
          severity: 'medium'
        });
        recommendations.push('Set a realistic deadline to track progress');
      }

      // 5. Check for tasks in progress too long (potential blockers)
      if (node.status === 'in-progress' && node.startDate) {
        const startDate = new Date(node.startDate);
        const daysInProgress = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
        const estimatedDays = node.estimatedHours ? Math.ceil(node.estimatedHours / 8) : 5;
        
        if (daysInProgress > estimatedDays * 2) {
          riskScore += 25;
          riskFactors.push({
            type: 'stalled',
            icon: 'target',
            text: `In progress for ${daysInProgress} days (expected ${estimatedDays})`,
            severity: 'high'
          });
          recommendations.push('Review for blockers or scope creep');
        }
      }

      // 6. Check for blocked tasks (dependencies not complete)
      const dependsOn = connections.filter(c => c.to === node.id);
      const blockedByIncomplete = dependsOn.filter(dep => {
        const parentNode = nodes.find(n => n.id === dep.from);
        return parentNode && !parentNode.completed;
      });
      
      if (blockedByIncomplete.length > 0) {
        riskScore += blockedByIncomplete.length * 8;
        riskFactors.push({
          type: 'blocked',
          icon: 'link',
          text: `Blocked by ${blockedByIncomplete.length} incomplete task${blockedByIncomplete.length > 1 ? 's' : ''}`,
          severity: blockedByIncomplete.length > 2 ? 'high' : 'medium'
        });
        recommendations.push('Complete blocking tasks first');
      }

      // 7. Check for low progress with approaching deadline
      if (node.dueDate && node.progress !== undefined) {
        const dueDate = new Date(node.dueDate);
        const daysUntilDue = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
        const expectedProgress = daysUntilDue <= 0 ? 100 : Math.max(0, 100 - (daysUntilDue * 10));
        
        if (node.progress < expectedProgress - 30 && daysUntilDue <= 7 && daysUntilDue > 0) {
          riskScore += 20;
          riskFactors.push({
            type: 'low-progress',
            icon: 'target',
            text: `Only ${node.progress}% complete, due in ${daysUntilDue} days`,
            severity: 'high'
          });
          recommendations.push('Increase effort or adjust timeline');
        }
      }

      // Add to risk items if score is significant
      if (riskScore > 0) {
        const severity = riskScore > 50 ? 'critical' : riskScore > 30 ? 'high' : 'medium';
        
        riskItems.push({
          id: node.id,
          node,
          riskScore,
          riskFactors,
          recommendations,
          severity
        });
      }
    });

    // Sort by risk score (highest first)
    return riskItems.sort((a, b) => b.riskScore - a.riskScore);
  }, [nodes, connections]);

  const filteredRisks = useMemo(() => {
    if (filterSeverity === 'all') return risks;
    return risks.filter(r => r.severity === filterSeverity);
  }, [risks, filterSeverity]);

  const riskSummary = useMemo(() => {
    return {
      critical: risks.filter(r => r.severity === 'critical').length,
      high: risks.filter(r => r.severity === 'high').length,
      medium: risks.filter(r => r.severity === 'medium').length,
      total: risks.length,
      avgScore: risks.length > 0 
        ? Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length) 
        : 0
    };
  }, [risks]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-amber-500 bg-amber-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-amber-500 text-white';
      case 'medium': return 'bg-yellow-500 text-gray-900';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getFactorIcon = (iconType) => {
    switch (iconType) {
      case 'clock': return Clock;
      case 'link': return Link2;
      case 'users': return Users;
      case 'target': return Target;
      default: return AlertCircle;
    }
  };

  // No risks state
  if (risks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-6 w-96">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 text-lg">All Clear!</h3>
            <p className="text-sm text-green-600">No project risks detected</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
          Your project appears to be on track. Continue monitoring for changes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-md md:w-96 max-h-[80vh] flex flex-col mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Risk Assessment</h3>
              <p className="text-sm text-red-100">
                {riskSummary.total} risk{riskSummary.total !== 1 ? 's' : ''} identified
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

      {/* Risk summary cards */}
      <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'critical' ? 'all' : 'critical')}
          className={`p-2 rounded-lg text-center transition-colors ${
            filterSeverity === 'critical' ? 'bg-red-100 ring-2 ring-red-400' : 'bg-white hover:bg-red-50'
          }`}
        >
          <p className="text-xl font-bold text-red-600">{riskSummary.critical}</p>
          <p className="text-xs text-gray-500">Critical</p>
        </button>
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'high' ? 'all' : 'high')}
          className={`p-2 rounded-lg text-center transition-colors ${
            filterSeverity === 'high' ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-white hover:bg-amber-50'
          }`}
        >
          <p className="text-xl font-bold text-amber-600">{riskSummary.high}</p>
          <p className="text-xs text-gray-500">High</p>
        </button>
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'medium' ? 'all' : 'medium')}
          className={`p-2 rounded-lg text-center transition-colors ${
            filterSeverity === 'medium' ? 'bg-yellow-100 ring-2 ring-yellow-400' : 'bg-white hover:bg-yellow-50'
          }`}
        >
          <p className="text-xl font-bold text-yellow-600">{riskSummary.medium}</p>
          <p className="text-xs text-gray-500">Medium</p>
        </button>
      </div>

      {/* Filter indicator */}
      {filterSeverity !== 'all' && (
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xs text-gray-600">
            Showing {filterSeverity} risks only
          </span>
          <button
            onClick={() => setFilterSeverity('all')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* Risk list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filteredRisks.map((risk) => (
          <div
            key={risk.id}
            className={`border-l-4 ${getSeverityColor(risk.severity)}`}
          >
            {/* Risk header */}
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadge(risk.severity)}`}>
                      {risk.severity}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <TrendingDown className="w-3 h-3" />
                      Score: {risk.riskScore}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {risk.node.text}
                  </p>
                </div>
                {expandedRisk === risk.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </div>

              {/* Risk factors preview */}
              <div className="flex flex-wrap gap-1 mt-2">
                {risk.riskFactors.slice(0, 3).map((factor, idx) => {
                  const Icon = getFactorIcon(factor.icon);
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                    >
                      <Icon className="w-3 h-3" />
                      {factor.text}
                    </span>
                  );
                })}
                {risk.riskFactors.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{risk.riskFactors.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Expanded details */}
            {expandedRisk === risk.id && (
              <div className="px-4 pb-4 bg-gray-50">
                {/* All risk factors */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Risk Factors</h4>
                  <div className="space-y-1">
                    {risk.riskFactors.map((factor, idx) => {
                      const Icon = getFactorIcon(factor.icon);
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          <div className={`p-1 rounded ${
                            factor.severity === 'critical' ? 'bg-red-100 text-red-600' :
                            factor.severity === 'high' ? 'bg-amber-100 text-amber-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span>{factor.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {risk.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommendations</h4>
                    <div className="space-y-1">
                      {risk.recommendations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Zap className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            Risk scores are calculated based on deadlines, dependencies, assignments, and progress. 
            Review and address critical risks first.
          </p>
        </div>
      </div>
    </div>
  );
}

RiskMatrix.propTypes = {
  nodes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string,
    dueDate: PropTypes.string,
    completed: PropTypes.bool,
    priority: PropTypes.string,
    status: PropTypes.string,
    progress: PropTypes.number,
    startDate: PropTypes.string,
    estimatedHours: PropTypes.number,
    collaborators: PropTypes.array,
    assignedTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  })).isRequired,
  connections: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired
  })).isRequired,
  collaborators: PropTypes.array,
  onClose: PropTypes.func
};
