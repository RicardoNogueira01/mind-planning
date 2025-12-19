import React from 'react';

/**
 * Reusable select input component
 * Used in SettingsPage and other forms
 */
const SelectInput = ({
    label,
    value,
    onChange,
    options = [],
    icon: Icon,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {label}
            </label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SelectInput;
