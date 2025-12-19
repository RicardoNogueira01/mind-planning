import React from 'react';
import clsx from 'clsx';
import { Inbox } from 'lucide-react';

/**
 * EmptyState component for displaying when there's no data
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display (default: Inbox)
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.action - Action button or element
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 */
const EmptyState = ({
    icon: Icon = Inbox,
    title = 'No data found',
    description,
    action,
    className,
    size = 'md'
}) => {
    const sizes = {
        sm: {
            container: 'py-8',
            icon: 32,
            iconContainer: 'w-12 h-12',
            title: 'text-base',
            description: 'text-xs'
        },
        md: {
            container: 'py-12',
            icon: 48,
            iconContainer: 'w-16 h-16',
            title: 'text-lg',
            description: 'text-sm'
        },
        lg: {
            container: 'py-16',
            icon: 64,
            iconContainer: 'w-20 h-20',
            title: 'text-xl',
            description: 'text-base'
        }
    };

    const currentSize = sizes[size];

    return (
        <div
            className={clsx(
                'flex flex-col items-center justify-center text-center',
                currentSize.container,
                className
            )}
        >
            {/* Icon */}
            <div
                className={clsx(
                    'flex items-center justify-center rounded-full bg-gray-100 mb-4',
                    currentSize.iconContainer
                )}
            >
                {typeof Icon === 'function' ? (
                    <Icon size={currentSize.icon} className="text-gray-400" />
                ) : (
                    Icon
                )}
            </div>

            {/* Title */}
            <h3
                className={clsx(
                    'font-bold text-gray-900 mb-2',
                    currentSize.title
                )}
                style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
                {title}
            </h3>

            {/* Description */}
            {description && (
                <p
                    className={clsx(
                        'text-gray-500 max-w-md mb-6',
                        currentSize.description
                    )}
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                    {description}
                </p>
            )}

            {/* Action */}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
};

export default EmptyState;
