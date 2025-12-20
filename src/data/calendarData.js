/**
 * Shared Calendar Data
 * Used by both WeeklyCalendarWidget (dashboard) and CalendarPage (full calendar)
 * Events are generated relative to the current date to ensure data consistency
 */

// Helper to format date as YYYY-MM-DD
const formatDateString = (date) => {
    return date.toISOString().split('T')[0];
};

// Helper to get a date relative to today
const getRelativeDate = (daysFromToday) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return formatDateString(date);
};

// Helper to get the Monday of the current week
const getCurrentWeekMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return monday;
};

// Helper to get date for a specific day of current week (0 = Monday, 6 = Sunday)
const getWeekDay = (dayIndex) => {
    const monday = getCurrentWeekMonday();
    const date = new Date(monday);
    date.setDate(monday.getDate() + dayIndex);
    return formatDateString(date);
};

// Shared holidays data
export const holidays = [
    { id: 1, name: 'First Friday', date: '2025-12-05', emoji: '🎉', color: '#8B5CF6' },
    { id: 2, name: 'Christmas Day', date: '2025-12-25', emoji: '🎄', color: '#EF4444' },
    { id: 3, name: 'New Year\'s Day', date: '2026-01-01', emoji: '🎆', color: '#6366F1' }
];

// Shared events data - these will appear in the current week
export const events = [
    {
        id: 1,
        title: 'Team standup',
        description: 'Daily team synchronization meeting',
        time: '09:00',
        startTime: '09:00',
        endTime: '09:30',
        date: getWeekDay(0), // Monday
        color: '#3B82F6',
        category: 'meeting',
        type: 'meeting',
        attendees: ['John Doe', 'Alex Kim'],
        location: 'Conference Room A',
        isRecurring: true
    },
    {
        id: 2,
        title: 'API review session',
        description: 'Review the new API endpoints and documentation',
        time: '14:30',
        startTime: '14:30',
        endTime: '15:30',
        date: getWeekDay(1), // Tuesday
        color: '#10B981',
        category: 'review',
        type: 'review',
        attendees: ['Maria Rodriguez', 'Taylor Smith'],
        location: 'Virtual',
        isRecurring: false
    },
    {
        id: 3,
        title: 'Client presentation',
        description: 'Quarterly business review with key client',
        time: '16:00',
        startTime: '16:00',
        endTime: '17:00',
        date: getWeekDay(2), // Wednesday
        color: '#F59E0B',
        category: 'presentation',
        type: 'presentation',
        attendees: ['Alex Kim', 'Sarah Wilson'],
        location: 'Client Office',
        isRecurring: false
    },
    {
        id: 4,
        title: 'Design workshop',
        description: 'Collaborative design session for new features',
        time: '10:00',
        startTime: '10:00',
        endTime: '12:00',
        date: getWeekDay(3), // Thursday
        color: '#8B5CF6',
        category: 'workshop',
        type: 'workshop',
        attendees: ['Design Team'],
        location: 'Design Studio',
        isRecurring: false
    },
    {
        id: 5,
        title: 'Sprint planning',
        description: 'Plan tasks and estimates for next sprint',
        time: '15:00',
        startTime: '15:00',
        endTime: '16:30',
        date: getWeekDay(4), // Friday
        color: '#EF4444',
        category: 'planning',
        type: 'planning',
        attendees: ['Development Team'],
        location: 'Conference Room B',
        isRecurring: true
    },
    {
        id: 6,
        title: 'Code review session',
        description: 'Review pull requests and code quality',
        time: '11:00',
        startTime: '11:00',
        endTime: '12:00',
        date: getWeekDay(0), // Monday (another event)
        color: '#06B6D4',
        category: 'review',
        type: 'review',
        attendees: ['John Doe', 'Taylor Smith'],
        location: 'Virtual',
        isRecurring: true
    },
    {
        id: 7,
        title: 'Product demo',
        description: 'Demonstrate new features to stakeholders',
        time: '13:30',
        startTime: '13:30',
        endTime: '14:30',
        date: getWeekDay(2), // Wednesday (another event)
        color: '#84CC16',
        category: 'demo',
        type: 'demo',
        attendees: ['Product Team', 'Stakeholders'],
        location: 'Main Conference Room',
        isRecurring: false
    },
    {
        id: 8,
        title: 'Team retrospective',
        description: 'Reflect on sprint performance and improvements',
        time: '09:30',
        startTime: '09:30',
        endTime: '10:30',
        date: getWeekDay(4), // Friday
        color: '#F97316',
        category: 'meeting',
        type: 'meeting',
        attendees: ['Full Team'],
        location: 'Conference Room A',
        isRecurring: true
    },
    {
        id: 9,
        title: 'User testing session',
        description: 'Conduct usability tests with real users',
        time: '14:00',
        startTime: '14:00',
        endTime: '16:00',
        date: getWeekDay(3), // Thursday
        color: '#EC4899',
        category: 'testing',
        type: 'testing',
        attendees: ['UX Team', 'Research Team'],
        location: 'UX Lab',
        isRecurring: false
    },
    {
        id: 10,
        title: 'Weekly report preparation',
        description: 'Compile and prepare weekly progress report',
        time: '16:30',
        startTime: '16:30',
        endTime: '17:30',
        date: getWeekDay(0), // Monday
        color: '#6366F1',
        category: 'administrative',
        type: 'report',
        attendees: ['Project Managers'],
        location: 'Office',
        isRecurring: true
    },
    // Additional events for next week to show continuity
    {
        id: 11,
        title: 'Stakeholder meeting',
        description: 'Monthly stakeholder alignment',
        time: '10:00',
        startTime: '10:00',
        endTime: '11:00',
        date: getRelativeDate(7), // Next week
        color: '#3B82F6',
        category: 'meeting',
        type: 'meeting',
        attendees: ['Stakeholders', 'Management'],
        location: 'Board Room',
        isRecurring: false
    },
    {
        id: 12,
        title: 'Training session',
        description: 'New feature training for team',
        time: '14:00',
        startTime: '14:00',
        endTime: '16:00',
        date: getRelativeDate(8), // Next week
        color: '#8B5CF6',
        category: 'workshop',
        type: 'training',
        attendees: ['Development Team'],
        location: 'Training Room',
        isRecurring: false
    }
];

// Categories for filtering
export const categories = [
    'all',
    'meeting',
    'review',
    'presentation',
    'workshop',
    'planning',
    'demo',
    'testing',
    'administrative'
];

// Export as default object as well for convenience
export default {
    events,
    holidays,
    categories
};
