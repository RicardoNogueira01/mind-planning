/**
 * Overdue Badge Component
 * 
 * Displays a visual indicator when a task is overdue
 * Shows the number of days overdue with appropriate styling
 * US-1.1.2 implementation
 */

import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * Calculate days overdue from a due date
 */
export function calculateDaysOverdue(dueDate) {
    if (!dueDate) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
}

/**
 * Calculate days until deadline
 */
export function calculateDaysUntil(dueDate) {
    if (!dueDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Check if task is overdue
 */
export function isOverdue(dueDate, status) {
    if (!dueDate) return false;
    if (status === 'completed' || status === 'cancelled') return false;

    return calculateDaysOverdue(dueDate) > 0;
}

/**
 * Overdue Badge Component
 */
export function OverdueBadge({ dueDate, status, size = 'sm', showIcon = true }) {
    if (!dueDate) return null;

    const daysOverdue = calculateDaysOverdue(dueDate);
    const isTaskOverdue = isOverdue(dueDate, status);

    if (!isTaskOverdue) return null;

    const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1 font-semibold rounded-full
        ${sizeClasses[size]}
        ${daysOverdue > 7
                    ? 'bg-red-600 text-white'
                    : daysOverdue > 3
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                }
      `}
            title={`${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`}
        >
            {showIcon && <AlertTriangle size={iconSizes[size]} />}
            {daysOverdue}d overdue
        </span>
    );
}

OverdueBadge.propTypes = {
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
    showIcon: PropTypes.bool,
};

/**
 * Deadline Badge Component
 * Shows approaching deadlines or overdue status
 */
export function DeadlineBadge({ dueDate, status, size = 'sm' }) {
    if (!dueDate) return null;
    if (status === 'completed' || status === 'cancelled') {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700`}>
                Completed
            </span>
        );
    }

    const daysUntil = calculateDaysUntil(dueDate);

    if (daysUntil < 0) {
        return <OverdueBadge dueDate={dueDate} status={status} size={size} />;
    }

    const sizeClasses = {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    // Determine urgency styling
    let bgClass = 'bg-gray-100 text-gray-600';
    let label = `${daysUntil}d left`;

    if (daysUntil === 0) {
        bgClass = 'bg-red-100 text-red-700 border border-red-200';
        label = 'Due Today!';
    } else if (daysUntil === 1) {
        bgClass = 'bg-orange-100 text-orange-700 border border-orange-200';
        label = 'Due Tomorrow';
    } else if (daysUntil <= 3) {
        bgClass = 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        label = `${daysUntil} days left`;
    } else if (daysUntil <= 7) {
        bgClass = 'bg-blue-50 text-blue-600';
        label = `${daysUntil} days left`;
    }

    return (
        <span
            className={`inline-flex items-center gap-1 font-medium rounded-full ${sizeClasses[size]} ${bgClass}`}
            title={`Due: ${new Date(dueDate).toLocaleDateString()}`}
        >
            <Clock size={12} />
            {label}
        </span>
    );
}

DeadlineBadge.propTypes = {
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
    size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
};

/**
 * Overdue Counter - For displaying in lists/dashboards
 */
export function OverdueCounter({ count, onClick }) {
    if (count === 0) return null;

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
        >
            <AlertTriangle size={16} className="text-red-600" />
            <span className="text-red-700 font-medium">
                {count} overdue task{count !== 1 ? 's' : ''}
            </span>
        </button>
    );
}

OverdueCounter.propTypes = {
    count: PropTypes.number.isRequired,
    onClick: PropTypes.func,
};

/**
 * Days Overdue Display - Large format for task details
 */
export function DaysOverdueDisplay({ dueDate, status }) {
    if (!dueDate) return null;

    const daysOverdue = calculateDaysOverdue(dueDate);
    const isTaskOverdue = isOverdue(dueDate, status);

    if (!isTaskOverdue) return null;

    return (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="w-12 h-12 bg-red-500 text-white rounded-lg flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{daysOverdue}</span>
                <span className="text-[8px] uppercase tracking-wider">days</span>
            </div>
            <div>
                <p className="font-medium text-red-800">This task is overdue</p>
                <p className="text-sm text-red-600">
                    Was due on {new Date(dueDate).toLocaleDateString()}
                </p>
            </div>
        </div>
    );
}

DaysOverdueDisplay.propTypes = {
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    status: PropTypes.string,
};

export default OverdueBadge;
