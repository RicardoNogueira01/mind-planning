/**
 * @fileoverview Utility functions for Dashboard components
 */

import type { TaskStats, Collaborator } from '../types/dashboard';

/**
 * Calculates the completion percentage based on task statistics
 * @param stats - Task statistics object
 * @returns Completion percentage rounded to nearest integer
 */
export const calculateCompletionPercentage = (stats: TaskStats): number => {
  if (stats.totalTasks === 0) return 0;
  return Math.round((stats.tasksCompleted / stats.totalTasks) * 100);
};

/**
 * Generates initials from a full name
 * @param name - Full name string
 * @returns Initials string (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Calculates the completion percentage for a collaborator
 * @param collaborator - Collaborator object
 * @returns Completion percentage rounded to nearest integer
 */
export const getCollaboratorCompletionPercentage = (collaborator: Collaborator): number => {
  if (collaborator.tasksAssigned === 0) return 0;
  return Math.round((collaborator.tasksCompleted / collaborator.tasksAssigned) * 100);
};

/**
 * Determines the status class names based on overdue tasks
 * @param overdueTasks - Number of overdue tasks
 * @returns CSS class names for status badge
 */
export const getStatusClasses = (overdueTasks: number): string => {
  return overdueTasks > 0 
    ? 'bg-red-100 text-red-700' 
    : 'bg-emerald-100 text-emerald-700';
};

/**
 * Gets the status text for a collaborator
 * @param overdueTasks - Number of overdue tasks
 * @returns Status text
 */
export const getStatusText = (overdueTasks: number): string => {
  return overdueTasks > 0 
    ? `${overdueTasks} overdue` 
    : 'On track';
};

/**
 * Gets CSS classes for deadline status
 * @param status - Deadline status
 * @returns CSS class names for deadline badge
 */
export const getDeadlineStatusClasses = (status: 'danger' | 'warning'): string => {
  return status === 'danger' 
    ? 'bg-red-100 text-red-700 border border-red-200' 
    : 'bg-orange-100 text-orange-700 border border-orange-200';
};

/**
 * Common card styles for dashboard components
 */
export const CARD_STYLES = "bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200";

/**
 * Common icon container styles
 */
export const ICON_CONTAINER_STYLES = "p-2 text-white rounded-lg";
