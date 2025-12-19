// String utility functions

/**
 * Generate initials from a full name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials in uppercase
 */
export const getInitials = (name, maxInitials = 2) => {
    if (!name) return '';

    const words = name.trim().split(/\s+/);
    const initials = words
        .slice(0, maxInitials)
        .map(word => word[0])
        .join('')
        .toUpperCase();

    return initials;
};

/**
 * Truncate text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to title case
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
export const toTitleCase = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Convert kebab-case or snake_case to Title Case
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
export const formatLabel = (str) => {
    if (!str) return '';
    return str
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => capitalize(word))
        .join(' ');
};

/**
 * Pluralize a word based on count
 * @param {number} count - Count to check
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (optional, defaults to singular + 's')
 * @returns {string} Pluralized word
 */
export const pluralize = (count, singular, plural) => {
    if (count === 1) return singular;
    return plural || `${singular}s`;
};
