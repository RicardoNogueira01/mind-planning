// Date utility functions

/**
 * Get current day information including day name, date, and month
 * @returns {Object} Object containing dayName, dayNumber, and monthName
 */
export const getCurrentDayInfo = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
        dayName: days[now.getDay()],
        dayNumber: now.getDate(),
        monthName: months[now.getMonth()]
    };
};

/**
 * Format a due date string with translation support
 * @param {string} dueDate - The due date ('today', 'tomorrow', or number of days)
 * @param {Function} t - Translation function
 * @returns {string} Formatted due date string
 */
export const formatDueDate = (dueDate, t) => {
    if (dueDate === 'today') return t('activity.today');
    if (dueDate === 'tomorrow') return t('activity.tomorrow');
    return `${t('activity.inDays')} ${dueDate} ${t('holidays.days')}`;
};

/**
 * Calculate days until a specific date
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {number} Number of days until the date
 */
export const getDaysUntil = (dateString) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Format a relative time string (e.g., "2 hours ago", "Yesterday")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now - targetDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;

    return targetDate.toLocaleDateString();
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
    const today = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;

    return today.toDateString() === targetDate.toDateString();
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is in the past
 */
export const isPast = (date) => {
    const today = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < today;
};

// Alias for backwards compatibility - some components use this name
export const getRelativeTime = formatRelativeTime;
