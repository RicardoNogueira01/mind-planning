import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, PieChart, Calendar, Users, X } from 'lucide-react';
import PropTypes from 'prop-types';

// Helper functions defined before component
const detectCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('design') || lower.includes('ui') || lower.includes('ux')) return 'Design';
  if (lower.includes('develop') || lower.includes('code') || lower.includes('build')) return 'Development';
  if (lower.includes('test') || lower.includes('qa')) return 'Testing';
  if (lower.includes('market') || lower.includes('content')) return 'Marketing';
  if (lower.includes('research') || lower.includes('analysis')) return 'Research';
  return 'Other';
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function BudgetTracker({ 
  nodes, 
  collaborators,
  projectBudget = 50000,
  hourlyRates = {},
  onUpdateBudget,
  onClose 
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const budgetAnalysis = useMemo(() => {
    // Calculate spent based on completed work
    let totalSpent = 0;
    let estimatedTotal = 0;
    const categorySpending = {};
    const teamSpending = {};

    nodes.forEach(node => {
      const hours = node.estimatedHours || 2;
      const assignees = node.collaborators || [];
      
      // Calculate cost
      let nodeCost = 0;
      assignees.forEach(collabId => {
        const rate = hourlyRates[collabId] || 50; // Default $50/hr
        nodeCost += hours * rate / assignees.length;
      });

      // If no assignees, use average rate
      if (assignees.length === 0) {
        const avgRate = Object.values(hourlyRates).reduce((a, b) => a + b, 0) / 
                        Object.values(hourlyRates).length || 50;
        nodeCost = hours * avgRate;
      }

      estimatedTotal += nodeCost;

      if (node.completed) {
        totalSpent += nodeCost;
      }

      // Category breakdown (detect from task text)
      const category = detectCategory(node.text);
      categorySpending[category] = (categorySpending[category] || 0) + nodeCost;

      // Team member spending
      assignees.forEach(collabId => {
        const collab = collaborators.find(c => c.id === collabId);
        if (collab) {
          teamSpending[collab.name] = (teamSpending[collab.name] || 0) + (nodeCost / assignees.length);
        }
      });
    });

    const remaining = projectBudget - totalSpent;
    const percentUsed = (totalSpent / projectBudget) * 100;
    const projectedOverrun = estimatedTotal - projectBudget;
    const burnRate = totalSpent / (new Date().getDate()); // Per day this month

    // Calculate runway (days until budget exhausted at current burn rate)
    const runway = burnRate > 0 ? Math.floor(remaining / burnRate) : Infinity;

    return {
      totalSpent,
      remaining,
      percentUsed,
      estimatedTotal,
      projectedOverrun,
      burnRate,
      runway,
      categorySpending,
      teamSpending,
      isOverBudget: totalSpent > projectBudget,
      isAtRisk: percentUsed > 80 || projectedOverrun > 0
    };
  }, [nodes, collaborators, projectBudget, hourlyRates]);

  const getStatusColor = () => {
    if (budgetAnalysis.isOverBudget) return 'from-red-500 to-rose-600';
    if (budgetAnalysis.isAtRisk) return 'from-amber-500 to-orange-600';
    return 'from-green-500 to-emerald-600';
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-md md:w-[480px] max-h-[85vh] flex flex-col mx-4">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getStatusColor()} p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Budget Tracker</h3>
              <p className="text-sm text-white/80">
                {budgetAnalysis.percentUsed.toFixed(1)}% of budget used
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

      {/* Main metrics */}
      <div className="p-4 space-y-4">
        {/* Budget overview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(projectBudget)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Remaining</div>
              <div className={`text-2xl font-bold ${
                budgetAnalysis.remaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(budgetAnalysis.remaining)}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetAnalysis.isOverBudget 
                    ? 'bg-gradient-to-r from-red-500 to-rose-500' 
                    : budgetAnalysis.isAtRisk
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetAnalysis.percentUsed, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatCurrency(budgetAnalysis.totalSpent)} spent</span>
              <span>{budgetAnalysis.percentUsed.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Burn Rate</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {formatCurrency(budgetAnalysis.burnRate)}/day
            </div>
          </div>

          <div className={`rounded-lg p-3 border ${
            budgetAnalysis.runway < 30 
              ? 'bg-red-50 border-red-100' 
              : 'bg-green-50 border-green-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className={`w-4 h-4 ${
                budgetAnalysis.runway < 30 ? 'text-red-600' : 'text-green-600'
              }`} />
              <span className={`text-xs font-medium ${
                budgetAnalysis.runway < 30 ? 'text-red-700' : 'text-green-700'
              }`}>
                Runway
              </span>
            </div>
            <div className={`text-lg font-bold ${
              budgetAnalysis.runway < 30 ? 'text-red-900' : 'text-green-900'
            }`}>
              {budgetAnalysis.runway === Infinity ? '∞' : `${budgetAnalysis.runway}d`}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">Projected Total</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {formatCurrency(budgetAnalysis.estimatedTotal)}
            </div>
          </div>

          <div className={`rounded-lg p-3 border ${
            budgetAnalysis.projectedOverrun > 0
              ? 'bg-amber-50 border-amber-100'
              : 'bg-green-50 border-green-100'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className={`w-4 h-4 ${
                budgetAnalysis.projectedOverrun > 0 ? 'text-amber-600' : 'text-green-600'
              }`} />
              <span className={`text-xs font-medium ${
                budgetAnalysis.projectedOverrun > 0 ? 'text-amber-700' : 'text-green-700'
              }`}>
                Variance
              </span>
            </div>
            <div className={`text-lg font-bold ${
              budgetAnalysis.projectedOverrun > 0 ? 'text-amber-900' : 'text-green-900'
            }`}>
              {budgetAnalysis.projectedOverrun > 0 ? '+' : ''}
              {formatCurrency(budgetAnalysis.projectedOverrun)}
            </div>
          </div>
        </div>

        {/* Warnings */}
        {budgetAnalysis.isAtRisk && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-1">Budget Alert</p>
              <p className="text-amber-700 text-xs">
                {budgetAnalysis.isOverBudget 
                  ? 'Project is over budget. Immediate action required.'
                  : budgetAnalysis.projectedOverrun > 0
                  ? `Project is projected to exceed budget by ${formatCurrency(budgetAnalysis.projectedOverrun)}.`
                  : 'Budget utilization is above 80%. Monitor closely.'}
              </p>
            </div>
          </div>
        )}

        {/* Breakdown toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <PieChart className="w-4 h-4" />
          {showBreakdown ? 'Hide' : 'Show'} Breakdown
        </button>
      </div>

      {/* Detailed breakdown */}
      {showBreakdown && (
        <div className="flex-1 overflow-y-auto border-t border-gray-100">
          <div className="p-4 space-y-4">
            {/* Category spending */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Spending by Category
              </h4>
              <div className="space-y-2">
                {Object.entries(budgetAnalysis.categorySpending)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => {
                    const percent = (amount / budgetAnalysis.estimatedTotal) * 100;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{category}</span>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(amount)} ({percent.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Team spending */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Spending by Team Member
              </h4>
              <div className="space-y-2">
                {Object.entries(budgetAnalysis.teamSpending)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, amount]) => {
                    const percent = (amount / budgetAnalysis.estimatedTotal) * 100;
                    const collab = collaborators.find(c => c.name === name);
                    return (
                      <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: collab?.color || '#666' }}
                          >
                            {collab?.initials || name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-700">{name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {percent.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

BudgetTracker.propTypes = {
  nodes: PropTypes.array.isRequired,
  collaborators: PropTypes.array,
  projectBudget: PropTypes.number,
  hourlyRates: PropTypes.object,
  onUpdateBudget: PropTypes.func,
  onClose: PropTypes.func
};
