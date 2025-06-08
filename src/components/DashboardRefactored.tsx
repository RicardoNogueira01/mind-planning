/**
 * @fileoverview Refactored Dashboard component using smaller, focused components
 */

import React from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import TaskOverviewCard from './dashboard/TaskOverviewCard';
import TaskStatusCard from './dashboard/TaskStatusCard';
import TeamOverviewCard from './dashboard/TeamOverviewCard';
import ProjectSummaryCard from './dashboard/ProjectSummaryCard';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-[27px]">
      <DashboardHeader />
      
      <main>
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <TaskOverviewCard stats={stats} />
          <TaskStatusCard stats={stats} />
          <TeamOverviewCard collaborators={collaborators} />
          <ProjectSummaryCard stats={stats} />
        </div>
        
        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentCompletedTasksCard recentCompletedTasks={recentCompletedTasks} />
          <UpcomingDeadlinesCard upcomingDeadlines={upcomingDeadlines} />
        </div>
        
        {/* Weekly Calendar Widget */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
          <WeeklyCalendarWidget />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
