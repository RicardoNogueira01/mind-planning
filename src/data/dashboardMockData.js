// Mock data for Dashboard component
// In a real application, this would come from an API or state management

export const dashboardStats = {
    tasksCompleted: 32,
    tasksInProgress: 18,
    tasksNotStarted: 12,
    totalTasks: 62,
    overdueTasks: 5
};

export const collaborators = [
    { id: 'jd', name: 'John Doe', initials: 'JD', color: 'bg-blue-500', tasksAssigned: 14, tasksCompleted: 8, overdueTasks: 2 },
    { id: 'ak', name: 'Alex Kim', initials: 'AK', color: 'bg-green-500', tasksAssigned: 20, tasksCompleted: 15, overdueTasks: 0 },
    { id: 'mr', name: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', tasksAssigned: 18, tasksCompleted: 5, overdueTasks: 3 },
    { id: 'ts', name: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', tasksAssigned: 10, tasksCompleted: 4, overdueTasks: 0 }
];

export const recentCompletedTasks = [
    { id: 1, title: 'Finalize design mockups', completedBy: 'Alex Kim', initials: 'AK', color: 'bg-green-500', completedAt: '2 hours ago' },
    { id: 2, title: 'Review sprint backlog', completedBy: 'John Doe', initials: 'JD', color: 'bg-blue-500', completedAt: '4 hours ago' },
    { id: 3, title: 'Update user documentation', completedBy: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', completedAt: 'Yesterday' },
    { id: 4, title: 'Prepare presentation slides', completedBy: 'Alex Kim', initials: 'AK', color: 'bg-green-500', completedAt: 'Yesterday' },
    { id: 5, title: 'Client feedback meeting', completedBy: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', completedAt: '2 days ago' }
];

export const upcomingDeadlines = [
    { id: 1, title: 'API integration testing', assignedTo: 'John Doe', initials: 'JD', color: 'bg-blue-500', dueDate: 'today', status: 'danger' },
    { id: 2, title: 'Create social media campaign', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'today', status: 'danger' },
    { id: 3, title: 'Update project timeline', assignedTo: 'Maria Rodriguez', initials: 'MR', color: 'bg-yellow-500', dueDate: 'tomorrow', status: 'warning' },
    { id: 4, title: 'Finalize Q1 budget', assignedTo: 'Alex Kim', initials: 'AK', color: 'bg-green-500', dueDate: '2', status: 'warning' },
    { id: 5, title: 'Prepare meeting agenda', assignedTo: 'Taylor Smith', initials: 'TS', color: 'bg-purple-500', dueDate: '3', status: 'warning' }
];

export const upcomingHolidays = [
    { id: 1, name: 'First Friday', date: '2025-12-05', daysUntil: 4, emoji: '🎉', color: 'bg-blue-500', type: 'country' },
    { id: 2, name: 'Christmas Day', date: '2025-12-25', daysUntil: 25, emoji: '🎄', color: 'bg-red-500', type: 'country' },
    { id: 3, name: 'New Year\'s Day', date: '2026-01-01', daysUntil: 32, emoji: '🎆', color: 'bg-indigo-500', type: 'country' },
    { id: 4, name: 'Valentine\'s Day', date: '2026-02-14', daysUntil: 76, emoji: '💝', color: 'bg-pink-500', type: 'country' },
    { id: 5, name: 'Easter Sunday', date: '2026-04-20', daysUntil: 141, emoji: '🐰', color: 'bg-purple-500', type: 'country' }
];

export const recentMindMaps = [
    {
        id: 1,
        title: 'Q1 Marketing Strategy',
        lastModified: '2 hours ago',
        nodeCount: 24,
        color: 'bg-blue-500',
        isFavorite: true,
        createdBy: 'Alex Kim',
        initials: 'AK',
        avatarColor: 'bg-green-500'
    },
    {
        id: 2,
        title: 'Product Development Roadmap',
        lastModified: '5 hours ago',
        nodeCount: 18,
        color: 'bg-purple-500',
        isFavorite: false,
        createdBy: 'John Doe',
        initials: 'JD',
        avatarColor: 'bg-blue-500'
    },
    {
        id: 3,
        title: 'Team Brainstorming Session',
        lastModified: 'Yesterday',
        nodeCount: 32,
        color: 'bg-green-500',
        isFavorite: true,
        createdBy: 'Maria Rodriguez',
        initials: 'MR',
        avatarColor: 'bg-yellow-500'
    },
    {
        id: 4,
        title: 'Project Alpha Planning',
        lastModified: '2 days ago',
        nodeCount: 15,
        color: 'bg-orange-500',
        isFavorite: false,
        createdBy: 'Taylor Smith',
        initials: 'TS',
        avatarColor: 'bg-purple-500'
    }
];

export const teamHolidayRequests = [
    {
        id: 1,
        employeeName: 'Alex Kim',
        initials: 'AK',
        color: 'bg-green-500',
        startDate: '2025-12-20',
        endDate: '2025-12-27',
        days: 6,
        status: 'approved',
        type: 'Vacation'
    },
    {
        id: 2,
        employeeName: 'Maria Rodriguez',
        initials: 'MR',
        color: 'bg-yellow-500',
        startDate: '2026-01-15',
        endDate: '2026-01-19',
        days: 5,
        status: 'pending',
        type: 'Personal'
    },
    {
        id: 3,
        employeeName: 'Taylor Smith',
        initials: 'TS',
        color: 'bg-purple-500',
        startDate: '2026-02-10',
        endDate: '2026-02-14',
        days: 5,
        status: 'approved',
        type: 'Vacation'
    }
];
