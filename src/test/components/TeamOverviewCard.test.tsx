/**
 * @fileoverview Unit tests for TeamOverviewCard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TeamOverviewCard from '../../components/dashboard/TeamOverviewCard';
import type { Collaborator } from '../../types/dashboard';

// Wrapper component to provide routing context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('TeamOverviewCard', () => {
  const mockCollaborators: Collaborator[] = [
    {
      id: 'jd',
      name: 'John Doe',
      initials: 'JD',
      color: '#3B82F6',
      tasksAssigned: 10,
      tasksCompleted: 8,
      overdueTasks: 0
    },
    {
      id: 'ak',
      name: 'Alex Kim',
      initials: 'AK',
      color: '#10B981',
      tasksAssigned: 15,
      tasksCompleted: 10,
      overdueTasks: 2
    },
    {
      id: 'mr',
      name: 'Maria Rodriguez',
      initials: 'MR',
      color: '#F59E0B',
      tasksAssigned: 8,
      tasksCompleted: 6,
      overdueTasks: 0
    },
    {
      id: 'ts',
      name: 'Taylor Smith',
      initials: 'TS',
      color: '#8B5CF6',
      tasksAssigned: 12,
      tasksCompleted: 4,
      overdueTasks: 1
    }
  ];

  it('should render team overview card with correct data', () => {
    render(
      <RouterWrapper>
        <TeamOverviewCard collaborators={mockCollaborators} />
      </RouterWrapper>
    );

    expect(screen.getByTestId('team-overview-card')).toBeInTheDocument();
    expect(screen.getByText('Team Overview')).toBeInTheDocument();
  });

  it('should display only first 3 collaborators', () => {
    render(
      <RouterWrapper>
        <TeamOverviewCard collaborators={mockCollaborators} />
      </RouterWrapper>
    );

    expect(screen.getByTestId('collaborator-jd')).toBeInTheDocument();
    expect(screen.getByTestId('collaborator-ak')).toBeInTheDocument();
    expect(screen.getByTestId('collaborator-mr')).toBeInTheDocument();
    expect(screen.queryByTestId('collaborator-ts')).not.toBeInTheDocument();
  });

  it('should display correct collaborator information', () => {
    render(
      <RouterWrapper>
        <TeamOverviewCard collaborators={mockCollaborators} />
      </RouterWrapper>
    );

    const johnDoeCard = screen.getByTestId('collaborator-jd');
    expect(johnDoeCard).toHaveTextContent('John Doe');
    expect(johnDoeCard).toHaveTextContent('8/10 tasks');
    expect(johnDoeCard).toHaveTextContent('On track');
  });

  it('should show overdue status for collaborators with overdue tasks', () => {
    render(
      <RouterWrapper>
        <TeamOverviewCard collaborators={mockCollaborators} />
      </RouterWrapper>
    );

    const alexKimCard = screen.getByTestId('collaborator-ak');
    expect(alexKimCard).toHaveTextContent('2 overdue');
  });

  it('should render view all link', () => {
    render(
      <RouterWrapper>
        <TeamOverviewCard collaborators={mockCollaborators} />
      </RouterWrapper>
    );

    const viewAllLink = screen.getByTestId('view-all-team-link');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/team-members');
  });
});
