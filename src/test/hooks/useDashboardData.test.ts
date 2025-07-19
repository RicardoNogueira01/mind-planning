/**
 * @fileoverview Unit tests for useDashboardData hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardData } from '../../hooks/useDashboardData';

describe('useDashboardData', () => {
  it('should return initial dashboard data', () => {
    const { result } = renderHook(() => useDashboardData());

    expect(result.current.stats).toEqual({
      tasksCompleted: 32,
      tasksInProgress: 18,
      tasksNotStarted: 12,
      totalTasks: 62,
      overdueTasks: 5
    });

    expect(result.current.collaborators).toHaveLength(4);
    expect(result.current.collaborators[0]).toEqual({
      id: 'jd',
      name: 'John Doe',
      initials: 'JD',
      color: '#3B82F6',
      tasksAssigned: 14,
      tasksCompleted: 8,
      overdueTasks: 2
    });

    expect(result.current.recentCompletedTasks).toHaveLength(5);
    expect(result.current.recentCompletedTasks[0]).toEqual({
      id: 1,
      title: 'Finalize design mockups',
      completedBy: 'Alex Kim',
      color: '#10B981',
      completedAt: '2 hours ago'
    });

    expect(result.current.upcomingDeadlines).toHaveLength(5);
    expect(result.current.upcomingDeadlines[0]).toEqual({
      id: 1,
      title: 'API integration testing',
      assignedTo: 'John Doe',
      color: '#3B82F6',
      dueDate: 'Today',
      status: 'danger'
    });
  });

  it('should provide setter functions', () => {
    const { result } = renderHook(() => useDashboardData());

    expect(typeof result.current.setStats).toBe('function');
    expect(typeof result.current.setCollaborators).toBe('function');
    expect(typeof result.current.setRecentCompletedTasks).toBe('function');
    expect(typeof result.current.setUpcomingDeadlines).toBe('function');
  });
});
