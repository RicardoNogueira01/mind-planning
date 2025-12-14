import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  X, 
  Plus,
  Trash2,
  Play,
  Pause,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Tag,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  Flag,
  ArrowRight,
  Copy,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Settings,
  FileText
} from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * AutomationBuilder - No-code automation with visual UI
 * Create "When X happens, do Y" rules:
 * - Visual trigger and action builder
 * - Common automation templates
 * - Enable/disable automations
 * - Activity log
 */

const TRIGGERS = [
  { id: 'task_created', label: 'Task is created', icon: Plus, category: 'task' },
  { id: 'task_completed', label: 'Task is completed', icon: CheckCircle2, category: 'task' },
  { id: 'task_assigned', label: 'Task is assigned', icon: User, category: 'task' },
  { id: 'priority_changed', label: 'Priority changes', icon: Flag, category: 'task' },
  { id: 'due_date_near', label: 'Due date is approaching', icon: Clock, category: 'time' },
  { id: 'due_date_passed', label: 'Due date has passed', icon: AlertCircle, category: 'time' },
  { id: 'status_changed', label: 'Status changes to...', icon: Tag, category: 'status' },
  { id: 'blocked', label: 'Task becomes blocked', icon: AlertCircle, category: 'status' },
  { id: 'comment_added', label: 'Comment is added', icon: MessageSquare, category: 'activity' },
  { id: 'member_joins', label: 'Team member joins', icon: User, category: 'team' }
];

const ACTIONS = [
  { id: 'notify', label: 'Send notification', icon: Bell, category: 'notify' },
  { id: 'email', label: 'Send email', icon: Mail, category: 'notify' },
  { id: 'assign', label: 'Assign to person', icon: User, category: 'task' },
  { id: 'set_priority', label: 'Set priority', icon: Flag, category: 'task' },
  { id: 'add_tag', label: 'Add tag/label', icon: Tag, category: 'task' },
  { id: 'move_status', label: 'Change status to...', icon: ArrowRight, category: 'task' },
  { id: 'create_subtask', label: 'Create subtask', icon: Plus, category: 'task' },
  { id: 'add_to_calendar', label: 'Add to calendar', icon: Calendar, category: 'integrate' },
  { id: 'create_doc', label: 'Create document', icon: FileText, category: 'integrate' },
  { id: 'webhook', label: 'Call webhook', icon: Zap, category: 'advanced' }
];

const CONDITIONS = [
  { id: 'priority_is', label: 'Priority is', options: ['critical', 'high', 'medium', 'low'] },
  { id: 'assigned_to', label: 'Assigned to', options: 'collaborators' },
  { id: 'has_tag', label: 'Has tag', options: 'tags' },
  { id: 'project_is', label: 'Project is', options: 'projects' }
];

const TEMPLATES = [
  {
    id: 'notify_overdue',
    name: 'Notify on overdue',
    description: 'Send notification when task passes due date',
    trigger: 'due_date_passed',
    action: 'notify',
    actionConfig: { message: 'Task "{task}" is overdue!' }
  },
  {
    id: 'auto_assign_high',
    name: 'Auto-assign urgent tasks',
    description: 'Assign high priority tasks to team lead',
    trigger: 'priority_changed',
    condition: { type: 'priority_is', value: 'high' },
    action: 'assign',
    actionConfig: { assignee: 'team_lead' }
  },
  {
    id: 'celebrate_complete',
    name: 'Celebrate completions',
    description: 'Notify team when task is completed',
    trigger: 'task_completed',
    action: 'notify',
    actionConfig: { message: '🎉 {assignee} completed "{task}"!' }
  },
  {
    id: 'due_reminder',
    name: 'Due date reminder',
    description: 'Notify 1 day before due date',
    trigger: 'due_date_near',
    triggerConfig: { days: 1 },
    action: 'notify',
    actionConfig: { message: 'Reminder: "{task}" is due tomorrow!' }
  },
  {
    id: 'blocked_alert',
    name: 'Blocked task alert',
    description: 'Alert manager when task is blocked',
    trigger: 'blocked',
    action: 'email',
    actionConfig: { to: 'manager', subject: 'Task blocked: {task}' }
  }
];

export default function AutomationBuilder({ 
  collaborators = [],
  nodes = [],
  onClose 
}) {
  const [automations, setAutomations] = useState([
    {
      id: 1,
      name: 'Notify on overdue tasks',
      enabled: true,
      trigger: 'due_date_passed',
      triggerConfig: {},
      conditions: [],
      action: 'notify',
      actionConfig: { message: 'Task "{task}" is overdue!' },
      runs: 12,
      lastRun: '2024-12-13T14:30:00'
    },
    {
      id: 2,
      name: 'Auto-assign high priority',
      enabled: true,
      trigger: 'priority_changed',
      triggerConfig: {},
      conditions: [{ type: 'priority_is', value: 'high' }],
      action: 'assign',
      actionConfig: { assignee: 'jd' },
      runs: 5,
      lastRun: '2024-12-12T10:15:00'
    },
    {
      id: 3,
      name: 'Weekly status reminder',
      enabled: false,
      trigger: 'due_date_near',
      triggerConfig: { days: 7 },
      conditions: [],
      action: 'email',
      actionConfig: { to: 'team', subject: 'Weekly task reminder' },
      runs: 0,
      lastRun: null
    }
  ]);
  
  const [view, setView] = useState('list'); // 'list' | 'create' | 'templates'
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  
  // New automation form
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    trigger: '',
    triggerConfig: {},
    conditions: [],
    action: '',
    actionConfig: {}
  });

  const [activityLog] = useState([
    { id: 1, automationId: 1, time: '2024-12-13T14:30:00', task: 'API Integration', status: 'success' },
    { id: 2, automationId: 2, time: '2024-12-12T10:15:00', task: 'Security Review', status: 'success' },
    { id: 3, automationId: 1, time: '2024-12-11T09:00:00', task: 'Database Migration', status: 'success' }
  ]);

  const handleToggleAutomation = (id) => {
    setAutomations(prev => prev.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleDeleteAutomation = (id) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  const handleCreateAutomation = () => {
    if (!newAutomation.name || !newAutomation.trigger || !newAutomation.action) return;
    
    const automation = {
      id: Date.now(),
      ...newAutomation,
      enabled: true,
      runs: 0,
      lastRun: null
    };
    
    setAutomations(prev => [automation, ...prev]);
    setNewAutomation({
      name: '',
      trigger: '',
      triggerConfig: {},
      conditions: [],
      action: '',
      actionConfig: {}
    });
    setView('list');
  };

  const handleUseTemplate = (template) => {
    const automation = {
      id: Date.now(),
      name: template.name,
      trigger: template.trigger,
      triggerConfig: template.triggerConfig || {},
      conditions: template.condition ? [template.condition] : [],
      action: template.action,
      actionConfig: template.actionConfig || {},
      enabled: true,
      runs: 0,
      lastRun: null
    };
    
    setAutomations(prev => [automation, ...prev]);
    setView('list');
  };

  const getTrigger = (id) => TRIGGERS.find(t => t.id === id);
  const getAction = (id) => ACTIONS.find(a => a.id === id);

  const formatTime = (isoString) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const stats = useMemo(() => ({
    total: automations.length,
    active: automations.filter(a => a.enabled).length,
    totalRuns: automations.reduce((sum, a) => sum + a.runs, 0)
  }), [automations]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full max-w-sm sm:max-w-xl md:w-[600px] max-h-[90vh] flex flex-col mx-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Automations</h3>
              <p className="text-sm text-amber-100">
                {stats.active} active • {stats.totalRuns} runs total
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

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'list', label: 'My Automations' },
          { id: 'create', label: 'Create New' },
          { id: 'templates', label: 'Templates' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              view === tab.id 
                ? 'text-amber-600 border-b-2 border-amber-600 bg-amber-50/50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="flex-1 overflow-y-auto">
          {automations.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500">No automations yet</p>
              <p className="text-gray-400 text-sm mt-1">Create one or use a template</p>
              <button
                onClick={() => setView('templates')}
                className="mt-4 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm hover:bg-amber-200 transition-colors"
              >
                Browse Templates
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {automations.map(automation => {
                const trigger = getTrigger(automation.trigger);
                const action = getAction(automation.action);
                const isExpanded = expandedId === automation.id;
                const TriggerIcon = trigger?.icon || AlertCircle;
                const ActionIcon = action?.icon || Zap;
                
                return (
                  <div key={automation.id} className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggleAutomation(automation.id)}
                        className={`mt-0.5 transition-colors ${automation.enabled ? 'text-amber-500' : 'text-gray-300'}`}
                      >
                        {automation.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium text-sm ${automation.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                            {automation.name}
                          </h4>
                          {automation.runs > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                              {automation.runs} runs
                            </span>
                          )}
                        </div>
                        
                        {/* Trigger → Action preview */}
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded ${automation.enabled ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'}`}>
                            <TriggerIcon className="w-3 h-3" />
                            <span>{trigger?.label || 'Unknown'}</span>
                          </div>
                          <ArrowRight className={`w-3 h-3 ${automation.enabled ? 'text-gray-400' : 'text-gray-300'}`} />
                          <div className={`flex items-center gap-1 px-2 py-1 rounded ${automation.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                            <ActionIcon className="w-3 h-3" />
                            <span>{action?.label || 'Unknown'}</span>
                          </div>
                        </div>
                        
                        {/* Conditions */}
                        {automation.conditions.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            Conditions: {automation.conditions.map(c => `${c.type} = ${c.value}`).join(', ')}
                          </div>
                        )}
                        
                        {/* Last run */}
                        <div className="mt-2 text-xs text-gray-400">
                          Last run: {formatTime(automation.lastRun)}
                        </div>
                        
                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
                            <div>
                              <span className="font-medium text-gray-600">Action config:</span>
                              <pre className="mt-1 text-gray-500 overflow-x-auto">
                                {JSON.stringify(automation.actionConfig, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : automation.id)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAutomation(automation.id)}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Recent Activity */}
          {activityLog.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {activityLog.slice(0, 3).map(log => {
                  const automation = automations.find(a => a.id === log.automationId);
                  return (
                    <div key={log.id} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-gray-600">{automation?.name || 'Automation'}</span>
                      <span className="text-gray-400">ran on</span>
                      <span className="text-gray-600 font-medium">{log.task}</span>
                      <span className="text-gray-400 ml-auto">{formatTime(log.time)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create View */}
      {view === 'create' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Automation Name</label>
            <input
              type="text"
              value={newAutomation.name}
              onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Notify on overdue tasks"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          {/* Trigger Selection */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-2">WHEN</span>
              Select Trigger
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRIGGERS.map(trigger => {
                const Icon = trigger.icon;
                const isSelected = newAutomation.trigger === trigger.id;
                return (
                  <button
                    key={trigger.id}
                    onClick={() => setNewAutomation(prev => ({ ...prev, trigger: trigger.id }))}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isSelected ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                      {trigger.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Action Selection */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded mr-2">THEN</span>
              Select Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIONS.map(action => {
                const Icon = action.icon;
                const isSelected = newAutomation.action === action.id;
                return (
                  <button
                    key={action.id}
                    onClick={() => setNewAutomation(prev => ({ ...prev, action: action.id }))}
                    className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`text-xs ${isSelected ? 'text-amber-700 font-medium' : 'text-gray-600'}`}>
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Action Config (contextual) */}
          {newAutomation.action === 'notify' && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Notification Message</label>
              <textarea
                value={newAutomation.actionConfig.message || ''}
                onChange={(e) => setNewAutomation(prev => ({ 
                  ...prev, 
                  actionConfig: { ...prev.actionConfig, message: e.target.value }
                }))}
                placeholder='Use {task}, {assignee}, {project} placeholders'
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none h-20"
              />
            </div>
          )}
          
          {newAutomation.action === 'assign' && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Assign To</label>
              <select
                value={newAutomation.actionConfig.assignee || ''}
                onChange={(e) => setNewAutomation(prev => ({ 
                  ...prev, 
                  actionConfig: { ...prev.actionConfig, assignee: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select person...</option>
                {collaborators.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {newAutomation.action === 'set_priority' && (
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Set Priority To</label>
              <select
                value={newAutomation.actionConfig.priority || ''}
                onChange={(e) => setNewAutomation(prev => ({ 
                  ...prev, 
                  actionConfig: { ...prev.actionConfig, priority: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select priority...</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
          
          {/* Preview */}
          {newAutomation.trigger && newAutomation.action && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-xs text-amber-800">
                <span className="font-medium">Preview:</span> When{' '}
                <span className="font-semibold">{getTrigger(newAutomation.trigger)?.label}</span>, then{' '}
                <span className="font-semibold">{getAction(newAutomation.action)?.label}</span>
              </div>
            </div>
          )}
          
          {/* Create Button */}
          <button
            onClick={handleCreateAutomation}
            disabled={!newAutomation.name || !newAutomation.trigger || !newAutomation.action}
            className="w-full py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create Automation
          </button>
        </div>
      )}

      {/* Templates View */}
      {view === 'templates' && (
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-gray-500 mb-4">
            Start with a pre-built automation and customize it to your needs.
          </p>
          
          <div className="space-y-3">
            {TEMPLATES.map(template => {
              const trigger = getTrigger(template.trigger);
              const action = getAction(template.action);
              const TriggerIcon = trigger?.icon || Zap;
              const ActionIcon = action?.icon || Zap;
              
              return (
                <div 
                  key={template.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-amber-300 hover:bg-amber-50/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs">
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          <TriggerIcon className="w-3 h-3" />
                          <span>{trigger?.label}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded">
                          <ActionIcon className="w-3 h-3" />
                          <span>{action?.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Use This
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Automate repetitive work</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>{stats.active} automations running</span>
          </div>
        </div>
      </div>
    </div>
  );
}

AutomationBuilder.propTypes = {
  collaborators: PropTypes.array,
  nodes: PropTypes.array,
  onClose: PropTypes.func
};
