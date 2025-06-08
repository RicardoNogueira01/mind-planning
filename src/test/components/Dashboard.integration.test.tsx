/**
 * @fileoverview Integration tests for the main Dashboard component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../components/DashboardRefactored';

// Mock the WeeklyCalendarWidget since it's not part of our refactoring
vi.mock('../components/WeeklyCalendarWidget', () => ({
  default: () => <div data-testid="weekly-calendar-widget">Weekly Calendar</div>
}));

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Dashboard Integration', () => {
  it('should render all dashboard components', () => {
    render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );

    // Check header
    expect(screen.getByText('Project Dashboard')).toBeInTheDocument();
    
    // Check all cards
    expect(screen.getByTestId('task-overview-card')).toBeInTheDocument();
    expect(screen.getByTestId('task-status-card')).toBeInTheDocument();
    expect(screen.getByTestId('team-overview-card')).toBeInTheDocument();
    expect(screen.getByTestId('project-summary-card')).toBeInTheDocument();
    expect(screen.getByTestId('recent-completed-tasks-card')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming-deadlines-card')).toBeInTheDocument();
    
    // Check calendar widget
    expect(screen.getByTestId('weekly-calendar-widget')).toBeInTheDocument();
  });

  it('should display correct initial data', () => {
    render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );

    // Check completion percentage (32/62 = 52%)
    expect(screen.getByTestId('completion-percentage')).toHaveTextContent('52%');
    
    // Check tasks completed
    expect(screen.getByTestId('tasks-completed')).toHaveTextContent('+32');
    
    // Check collaborator names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Alex Kim')).toBeInTheDocument();
    expect(screen.getByText('Maria Rodriguez')).toBeInTheDocument();
  });

  it('should have correct navigation links', () => {
    render(
      <RouterWrapper>
        <Dashboard />
      </RouterWrapper>
    );

    expect(screen.getByRole('link', { name: /mind maps/i })).toHaveAttribute('href', '/mindmaps');
    expect(screen.getByTestId('view-all-team-link')).toHaveAttribute('href', '/team-members');
    expect(screen.getByTestId('view-all-completed-link')).toHaveAttribute('href', '/completed-tasks');
    expect(screen.getByTestId('view-all-deadlines-link')).toHaveAttribute('href', '/upcoming-deadlines');
  });
});
