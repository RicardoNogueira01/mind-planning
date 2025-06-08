/**
 * @fileoverview Unit tests for dashboard utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCompletionPercentage,
  getInitials,
  getCollaboratorCompletionPercentage,
  getStatusClasses,
  getStatusText,
  getDeadlineStatusClasses
} from '../utils/dashboardUtils';
import type { TaskStats, Collaborator } from '../types/dashboard';

describe('dashboardUtils', () => {
  describe('calculateCompletionPercentage', () => {
    it('should calculate correct percentage for normal case', () => {
      const stats: TaskStats = {
        tasksCompleted: 30,
        tasksInProgress: 10,
        tasksNotStarted: 10,
        totalTasks: 50,
        overdueTasks: 5
      };
      expect(calculateCompletionPercentage(stats)).toBe(60);
    });

    it('should return 0 when total tasks is 0', () => {
      const stats: TaskStats = {
        tasksCompleted: 0,
        tasksInProgress: 0,
        tasksNotStarted: 0,
        totalTasks: 0,
        overdueTasks: 0
      };
      expect(calculateCompletionPercentage(stats)).toBe(0);
    });

    it('should round to nearest integer', () => {
      const stats: TaskStats = {
        tasksCompleted: 1,
        tasksInProgress: 0,
        tasksNotStarted: 0,
        totalTasks: 3,
        overdueTasks: 0
      };
      expect(calculateCompletionPercentage(stats)).toBe(33);
    });
  });

  describe('getInitials', () => {
    it('should extract initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Maria Rodriguez Smith')).toBe('MRS');
      expect(getInitials('Alex')).toBe('A');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });

    it('should convert to uppercase', () => {
      expect(getInitials('john doe')).toBe('JD');
    });
  });

  describe('getCollaboratorCompletionPercentage', () => {
    it('should calculate correct percentage for collaborator', () => {
      const collaborator: Collaborator = {
        id: 'test',
        name: 'Test User',
        initials: 'TU',
        color: '#000000',
        tasksAssigned: 10,
        tasksCompleted: 7,
        overdueTasks: 1
      };
      expect(getCollaboratorCompletionPercentage(collaborator)).toBe(70);
    });

    it('should return 0 when no tasks assigned', () => {
      const collaborator: Collaborator = {
        id: 'test',
        name: 'Test User',
        initials: 'TU',
        color: '#000000',
        tasksAssigned: 0,
        tasksCompleted: 0,
        overdueTasks: 0
      };
      expect(getCollaboratorCompletionPercentage(collaborator)).toBe(0);
    });
  });

  describe('getStatusClasses', () => {
    it('should return red classes for overdue tasks', () => {
      expect(getStatusClasses(1)).toBe('bg-red-100 text-red-700');
      expect(getStatusClasses(5)).toBe('bg-red-100 text-red-700');
    });

    it('should return green classes for no overdue tasks', () => {
      expect(getStatusClasses(0)).toBe('bg-emerald-100 text-emerald-700');
    });
  });

  describe('getStatusText', () => {
    it('should return overdue text for overdue tasks', () => {
      expect(getStatusText(1)).toBe('1 overdue');
      expect(getStatusText(5)).toBe('5 overdue');
    });

    it('should return on track text for no overdue tasks', () => {
      expect(getStatusText(0)).toBe('On track');
    });
  });

  describe('getDeadlineStatusClasses', () => {
    it('should return red classes for danger status', () => {
      expect(getDeadlineStatusClasses('danger')).toBe('bg-red-100 text-red-700 border border-red-200');
    });

    it('should return orange classes for warning status', () => {
      expect(getDeadlineStatusClasses('warning')).toBe('bg-orange-100 text-orange-700 border border-orange-200');
    });
  });
});
