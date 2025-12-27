import React from 'react';
import clsx from 'clsx';
import { AvatarWithInitialsProps, Size } from './types';

/**
 * Reusable avatar component with initials
 * Used throughout the application for user avatars
 */
const AvatarWithInitials: React.FC<AvatarWithInitialsProps> = ({
    initials,
    color = 'bg-gray-500',
    size = 'md',
    className = '',
    showOnlineStatus = false,
    isOnline = false
}) => {
    const sizeClasses: Record<Size, string> = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-14 h-14 text-lg'
    };

    const statusSizeClasses: Record<Size, string> = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4'
    };

    return (
        <div className={clsx(
            'rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 relative',
            sizeClasses[size],
            color,
            className
        )}>
            {initials}
            {showOnlineStatus && (
                <div className={clsx(
                    'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
                    statusSizeClasses[size],
                    isOnline ? 'bg-green-400' : 'bg-gray-400'
                )}></div>
            )}
        </div>
    );
};

export default AvatarWithInitials;
