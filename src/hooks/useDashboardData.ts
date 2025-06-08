/**
 * @fileoverview Custom hook for managing dashboard data
 */

import { useState } from 'react';
import type { DashboardData, TaskStats, Collaborator, CompletedTask, UpcomingDeadline } from '../types/dashboard';

/**
 * Custom hook for managing dashboard data state
 * @returns Dashboard data and setter functions
 */
export const useDashboardData = (): DashboardData & {
  setStats: React.Dispatch<React.SetStateAction<TaskStats>>;
  setCollaborators: React.Dispatch<React.SetStateAction<Collaborator[]>>;
  setRecentCompletedTasks: React.Dispatch<React.SetStateAction<CompletedTask[]>>;
  setUpcomingDeadlines: React.Dispatch<React.SetStateAction<UpcomingDeadline[]>>;
} => {
  const [stats, setStats] = useState<TaskStats>({
    tasksCompleted: 32,
    tasksInProgress: 18,
    tasksNotStarted: 12,
    totalTasks: 62,
    overdueTasks: 5
  });
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { 
      id: 'jd', 
      name: 'John Doe', 
      initials: 'JD', 
      color: '#3B82F6', 
      tasksAssigned: 14, 
      tasksCompleted: 8, 
      overdueTasks: 2 
    },
    { 
      id: 'ak', 
      name: 'Alex Kim', 
      initials: 'AK', 
      color: '#10B981', 
      tasksAssigned: 20, 
      tasksCompleted: 15, 
      overdueTasks: 0 
    },
    { 
      id: 'mr', 
      name: 'Maria Rodriguez', 
      initials: 'MR', 
      color: '#F59E0B', 
      tasksAssigned: 18, 
      tasksCompleted: 5, 
      overdueTasks: 3 
    },
    { 
      id: 'ts', 
      name: 'Taylor Smith', 
      initials: 'TS', 
      color: '#8B5CF6', 
      tasksAssigned: 10, 
      tasksCompleted: 4, 
      overdueTasks: 0 
    }
  ]);
  
  const [recentCompletedTasks, setRecentCompletedTasks] = useState<CompletedTask[]>([
    { 
      id: 1, 
      title: 'Finalize design mockups', 
      completedBy: 'Alex Kim', 
      color: '#10B981', 
      completedAt: '2 hours ago' 
    },
    { 
      id: 2, 
      title: 'Review sprint backlog', 
      completedBy: 'John Doe', 
      color: '#3B82F6', 
      completedAt: '4 hours ago' 
    },
    { 
      id: 3, 
      title: 'Update user documentation', 
      completedBy: 'Taylor Smith', 
      color: '#8B5CF6', 
      completedAt: 'Yesterday' 
    },
    { 
      id: 4, 
      title: 'Prepare presentation slides', 
      completedBy: 'Alex Kim', 
      color: '#10B981', 
      completedAt: 'Yesterday' 
    },
    { 
      id: 5, 
      title: 'Client feedback meeting', 
      completedBy: 'Maria Rodriguez', 
      color: '#F59E0B', 
      completedAt: '2 days ago' 
    }
  ]);
  
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([
    { 
      id: 1, 
      title: 'API integration testing', 
      assignedTo: 'John Doe', 
      color: '#3B82F6', 
      dueDate: 'Today', 
      status: 'danger' 
    },
    { 
      id: 2, 
      title: 'Create social media campaign', 
      assignedTo: 'Maria Rodriguez', 
      color: '#F59E0B', 
      dueDate: 'Today', 
      status: 'danger' 
    },
    { 
      id: 3, 
      title: 'Update project timeline', 
      assignedTo: 'Maria Rodriguez', 
      color: '#F59E0B', 
      dueDate: 'Tomorrow', 
      status: 'warning' 
    },
    { 
      id: 4, 
      title: 'Finalize Q1 budget', 
      assignedTo: 'Alex Kim', 
      color: '#10B981', 
      dueDate: 'In 2 days', 
      status: 'warning' 
    },
    { 
      id: 5, 
      title: 'Prepare meeting agenda', 
      assignedTo: 'Taylor Smith', 
      color: '#8B5CF6', 
      dueDate: 'In 3 days', 
      status: 'warning' 
    }
  ]);

  return {
    stats,
    collaborators,
    recentCompletedTasks,
    upcomingDeadlines,
    setStats,
    setCollaborators,
    setRecentCompletedTasks,
    setUpcomingDeadlines
  };
};
