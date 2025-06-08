/**
 * @fileoverview Type definitions for Dashboard components
 */

export interface TaskStats {
  /** Number of completed tasks */
  tasksCompleted: number;
  /** Number of tasks currently in progress */
  tasksInProgress: number;
  /** Number of tasks not yet started */
  tasksNotStarted: number;
  /** Total number of tasks */
  totalTasks: number;
  /** Number of overdue tasks */
  overdueTasks: number;
}

export interface Collaborator {
  /** Unique identifier for the collaborator */
  id: string;
  /** Full name of the collaborator */
  name: string;
  /** Initials for display purposes */
  initials: string;
  /** Hex color code for the collaborator's avatar */
  color: string;
  /** Number of tasks assigned to this collaborator */
  tasksAssigned: number;
  /** Number of tasks completed by this collaborator */
  tasksCompleted: number;
  /** Number of overdue tasks for this collaborator */
  overdueTasks: number;
}

export interface CompletedTask {
  /** Unique identifier for the task */
  id: number;
  /** Title/name of the task */
  title: string;
  /** Name of the person who completed the task */
  completedBy: string;
  /** Hex color code for the task */
  color: string;
  /** Relative time when the task was completed */
  completedAt: string;
}

export interface UpcomingDeadline {
  /** Unique identifier for the task */
  id: number;
  /** Title/name of the task */
  title: string;
  /** Name of the person assigned to the task */
  assignedTo: string;
  /** Hex color code for the task */
  color: string;
  /** Relative due date */
  dueDate: string;
  /** Urgency status of the deadline */
  status: 'danger' | 'warning';
}

export interface DashboardData {
  /** Task statistics overview */
  stats: TaskStats;
  /** List of team collaborators */
  collaborators: Collaborator[];
  /** Recently completed tasks */
  recentCompletedTasks: CompletedTask[];
  /** Upcoming deadlines */
  upcomingDeadlines: UpcomingDeadline[];
}
