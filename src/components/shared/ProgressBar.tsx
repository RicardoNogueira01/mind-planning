import React from 'react';
import clsx from 'clsx';
import { ProgressBarProps } from './types';

/**
 * Reusable progress bar component
 * Used in Dashboard and other views to show task completion progress
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
    percentage,
    color = 'bg-blue-500',
    bgColor = 'bg-gray-100',
    height = 'h-2',
    showLabel = false,
    label = '',
    animated = true,
    className = ''
}) => {
    return (
        <div className={className}>
            {showLabel && label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                </div>
            )}
            <div className={clsx('rounded-full overflow-hidden', height, bgColor)}>
                <div
                    className={clsx(
                        'rounded-full',
                        height,
                        color,
                        animated && 'transition-all duration-500'
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
