import React from 'react';
import clsx from 'clsx';
import { ButtonProps, ButtonVariant, ButtonSize } from './types';

/**
 * Button component with multiple variants and sizes
 */
const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    onClick,
    className,
    type = 'button',
    ...rest
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<ButtonVariant, string> = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
    };

    const sizes: Record<ButtonSize, string> = {
        xs: 'px-2.5 py-1.5 text-xs gap-1',
        sm: 'px-3 py-2 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2'
    };

    const iconSizes: Record<ButtonSize, number> = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={clsx(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            {...rest}
        >
            {loading && (
                <svg
                    className="animate-spin"
                    width={iconSizes[size]}
                    height={iconSizes[size]}
                    viewBox="0 0 24 24"
                    fill="none"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}

            {!loading && leftIcon && (
                <span className="flex-shrink-0">
                    {React.isValidElement(leftIcon)
                        ? React.cloneElement(leftIcon as React.ReactElement<any>, { size: iconSizes[size] })
                        : leftIcon
                    }
                </span>
            )}

            <span>{children}</span>

            {!loading && rightIcon && (
                <span className="flex-shrink-0">
                    {React.isValidElement(rightIcon)
                        ? React.cloneElement(rightIcon as React.ReactElement<any>, { size: iconSizes[size] })
                        : rightIcon
                    }
                </span>
            )}
        </button>
    );
};

export default Button;
