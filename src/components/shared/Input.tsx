import React from 'react';
import clsx from 'clsx';
import { InputProps, InputSize } from './types';

/**
 * Input component for text fields
 */
const Input: React.FC<InputProps> = ({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    error,
    helperText,
    required = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className,
    size = 'md',
    ...rest
}) => {
    const sizes: Record<InputSize, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-5 py-3 text-base'
    };

    const iconSizes: Record<InputSize, number> = {
        sm: 14,
        md: 16,
        lg: 18
    };

    return (
        <div className={clsx('w-full', className)}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input Container */}
            <div className="relative">
                {/* Left Icon */}
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {React.isValidElement(leftIcon)
                            ? React.cloneElement(leftIcon as React.ReactElement<any>, { size: iconSizes[size] })
                            : leftIcon
                        }
                    </div>
                )}

                {/* Input */}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={clsx(
                        'w-full border rounded-lg transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500',
                        sizes[size],
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        error
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 hover:border-gray-400'
                    )}
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                    {...rest}
                />

                {/* Right Icon */}
                {rightIcon && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {React.isValidElement(rightIcon)
                            ? React.cloneElement(rightIcon as React.ReactElement<any>, { size: iconSizes[size] })
                            : rightIcon
                        }
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-1.5 text-sm text-red-600" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {error}
                </p>
            )}

            {/* Helper Text */}
            {!error && helperText && (
                <p className="mt-1.5 text-sm text-gray-500" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {helperText}
                </p>
            )}
        </div>
    );
};

export default Input;
