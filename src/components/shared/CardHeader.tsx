import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CardHeaderProps } from './types';

/**
 * Reusable card header component with optional view all link
 * Used in Dashboard cards and other list views
 */
const CardHeader: React.FC<CardHeaderProps> = ({
    icon: Icon,
    title,
    subtitle,
    viewAllLink,
    viewAllText = 'View All',
    onViewAllClick,
    iconBgColor = 'bg-gray-50',
    iconColor = 'text-gray-700'
}) => {
    const ViewAllButton = viewAllLink ? Link : 'button';
    const viewAllProps: any = viewAllLink
        ? { to: viewAllLink }
        : { onClick: onViewAllClick };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <div className="flex items-center gap-2">
                {Icon && (
                    <div className={`p-2 ${iconBgColor} rounded-lg`}>
                        <Icon size={18} className={iconColor} />
                    </div>
                )}
                <div>
                    <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {(viewAllLink || onViewAllClick) && (
                <ViewAllButton
                    {...viewAllProps}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                    {viewAllText}
                    <ArrowRight size={14} />
                </ViewAllButton>
            )}
        </div>
    );
};

export default CardHeader;
