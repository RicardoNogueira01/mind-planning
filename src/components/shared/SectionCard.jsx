import React from 'react';

/**
 * Reusable section card component with icon and header
 * Used for consistent card layouts throughout the application
 */
const SectionCard = ({
    icon: Icon,
    iconColor = 'bg-blue-100',
    iconTextColor = 'text-blue-600',
    title,
    subtitle,
    children,
    className = '',
    headerAction
}) => {
    return (
        <div className={`bg-white rounded-2xl shadow-md border border-gray-200 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`p-2 ${iconColor} rounded-lg`}>
                            <Icon size={20} className={iconTextColor} />
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>
                {headerAction}
            </div>
            {children}
        </div>
    );
};

export default SectionCard;
