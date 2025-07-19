/**
 * @fileoverview Refactored Dashboard component using smaller, focused components
 */

import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import TaskOverviewCard from './dashboard/TaskOverviewCard';
import TaskStatusCard from './dashboard/TaskStatusCard';
import ActiveTasksCard from './dashboard/ActiveTasksCard';
import PriorityItemsCard from './dashboard/PriorityItemsCard';
import TeamOverviewCard from './dashboard/TeamOverviewCard';
import RecentCompletedTasksCard from './dashboard/RecentCompletedTasksCard';
import UpcomingDeadlinesCard from './dashboard/UpcomingDeadlinesCard';
import WeeklyCalendarWidget from './WeeklyCalendarWidget';
import { useDashboardData } from '../hooks/useDashboardData';

/**
 * Main Dashboard component that orchestrates all dashboard cards and sections
 * @returns JSX element representing the complete dashboard
 */
const Dashboard: React.FC = () => {
  const { stats, collaborators, recentCompletedTasks, upcomingDeadlines } = useDashboardData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <DashboardHeader />
      
      <main>
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TaskOverviewCard stats={stats} />
          <TaskStatusCard stats={stats} />
          <ActiveTasksCard stats={stats} />
          <PriorityItemsCard stats={stats} />
        </div>
        
        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <TeamOverviewCard collaborators={collaborators} />
          <RecentCompletedTasksCard recentCompletedTasks={recentCompletedTasks} />
          <UpcomingDeadlinesCard upcomingDeadlines={upcomingDeadlines} />
        </div>
        
        {/* Weekly Calendar Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <WeeklyCalendarWidget />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
