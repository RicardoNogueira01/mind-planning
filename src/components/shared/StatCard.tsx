import React from 'react';
import { StatCardProps } from './types';

/**
 * Reusable stat card component for displaying metrics
 * Used in Dashboard and other analytics views
 */
const StatCard: React.FC<StatCardProps> = ({
    value,
    label,
    icon: Icon,
    iconColor = 'text-gray-500',
    bgColor = 'bg-gray-50',
    borderColor = 'border-gray-200',
    valueColor = 'text-gray-900',
    className = ''
}) => {
    return (
        <div className={`${bgColor} rounded-xl px-4 py-3 border ${borderColor} min-w-[100px] ${className}`}>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={16} className={iconColor} />}
                <span className={`text-2xl font-bold ${valueColor}`} style={{ fontFamily: 'DM Mono, monospace' }}>
                    {value}
                </span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-1">{label}</p>
        </div>
    );
};

export default StatCard;
