/**
 * @fileoverview Unit tests for TaskOverviewCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskOverviewCard from '../../components/dashboard/TaskOverviewCard';
import type { TaskStats } from '../../types/dashboard';

describe('TaskOverviewCard', () => {
  const mockStats: TaskStats = {
    tasksCompleted: 30,
    tasksInProgress: 15,
    tasksNotStarted: 10,
    totalTasks: 55,
    overdueTasks: 3
  };

  it('should render task overview card with correct data', () => {
    render(<TaskOverviewCard stats={mockStats} />);

    expect(screen.getByTestId('task-overview-card')).toBeInTheDocument();
    expect(screen.getByText('Task Overview')).toBeInTheDocument();
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('55%');
    expect(screen.getByTestId('tasks-completed')).toHaveTextContent('+30');
  });

  it('should display correct task counts', () => {
    render(<TaskOverviewCard stats={mockStats} />);

    expect(screen.getByTestId('done-count')).toHaveTextContent('30');
    expect(screen.getByTestId('progress-count')).toHaveTextContent('15');
    expect(screen.getByTestId('todo-count')).toHaveTextContent('10');
  });

  it('should render progress bar with correct width', () => {
    render(<TaskOverviewCard stats={mockStats} />);

    const progressBar = screen.getByTestId('progress-bar');
    expect(progressBar).toHaveStyle({ width: '55%' });
  });

  it('should handle zero total tasks', () => {
    const zeroStats: TaskStats = {
      tasksCompleted: 0,
      tasksInProgress: 0,
      tasksNotStarted: 0,
      totalTasks: 0,
      overdueTasks: 0
    };

    render(<TaskOverviewCard stats={zeroStats} />);

    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('0%');
    expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '0%' });
  });
});
