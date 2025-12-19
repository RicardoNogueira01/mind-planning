import React from 'react';
import clsx from 'clsx';

/**
 * Reusable status badge component
 * Used for displaying status indicators throughout the application
 */
const StatusBadge = ({
    status,
    label,
    showDot = true,
    size = 'md',
    className = ''
}) => {
    const statusColors = {
        success: 'bg-green-50 text-green-700 border-green-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        error: 'bg-red-50 text-red-700 border-red-200',
        info: 'bg-blue-50 text-blue-700 border-blue-200',
        neutral: 'bg-gray-50 text-gray-700 border-gray-200',
        // Legacy support
        excellent: 'bg-green-100 text-green-700',
        good: 'bg-blue-100 text-blue-700',
        'needs-improvement': 'bg-orange-100 text-orange-700',
        approved: 'bg-green-50 text-green-700',
        pending: 'bg-amber-50 text-amber-700',
        canceled: 'bg-gray-50 text-gray-700',
        rejected: 'bg-red-50 text-red-700'
    };

    const dotColors = {
        success: 'bg-green-600',
        warning: 'bg-amber-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        neutral: 'bg-gray-600',
        excellent: 'bg-green-600',
        good: 'bg-blue-600',
        'needs-improvement': 'bg-orange-600',
        approved: 'bg-green-600',
        pending: 'bg-amber-600',
        canceled: 'bg-gray-600',
        rejected: 'bg-red-600'
    };

    const sizeClasses = {
        xs: 'text-[10px] px-1.5 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5'
    };

    const dotSizeClasses = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2'
    };

    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 rounded-full font-semibold',
                sizeClasses[size],
                statusColors[status] || statusColors.neutral,
                className
            )}
            style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
            {showDot && (
                <span className={clsx(
                    'rounded-full',
                    dotSizeClasses[size],
                    dotColors[status] || dotColors.neutral
                )}></span>
            )}
            {label || status.replace('-', ' ')}
        </span>
    );
};

export default StatusBadge;
