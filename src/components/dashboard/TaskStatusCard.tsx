/**
 * @fileoverview Task Status Card component displaying detailed task statistics
 */

import React from 'react';
import { Activity, CheckCircle, Clock, Circle, AlertTriangle } from 'lucide-react';
import type { TaskStats } from '../../types/dashboard';
import { CARD_STYLES, ICON_CONTAINER_STYLES } from '../../utils/dashboardUtils';

interface TaskStatusCardProps {
  /** Task statistics data */
  stats: TaskStats;
}

/**
 * Task Status Card component showing detailed breakdown of task statuses
 * @param props - Component props
 * @returns JSX element representing the task status card
 */
const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ stats }) => {
  const statusItems = [
    {
      icon: CheckCircle,
      label: 'Completed',
      count: stats.tasksCompleted,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      testId: 'completed-status'
    },
    {
      icon: Clock,
      label: 'In Progress',
      count: stats.tasksInProgress,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-700',
      testId: 'progress-status'
    },
    {
      icon: Circle,
      label: 'Not Started',
      count: stats.tasksNotStarted,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-100',
      iconBg: 'bg-gray-400',
      textColor: 'text-gray-700',
      testId: 'not-started-status'
    },
    {
      icon: AlertTriangle,
      label: 'Overdue',
      count: stats.overdueTasks,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      iconBg: 'bg-red-500',
      textColor: 'text-red-600',
      testId: 'overdue-status'
    }
  ];

  return (
    <div className={CARD_STYLES} data-testid="task-status-card">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Task Status</h2>
        <div className={`${ICON_CONTAINER_STYLES} bg-gradient-to-br from-blue-500 to-cyan-600`}>
          <Activity size={22} />
        </div>
      </div>
      
      <div className="space-y-4">
        {statusItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.label}
              className={`flex items-center justify-between p-3 ${item.bgColor} rounded-xl border ${item.borderColor}`}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 ${item.iconBg} text-white rounded-lg shadow-md`}>
                  <IconComponent size={18} />
                </div>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`${item.textColor} font-bold text-lg`} data-testid={`${item.testId}-count`}>
                  {item.count}
                </span>
                <span className="text-gray-400">/{stats.totalTasks}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskStatusCard;
