import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MindMap from './components/MindMap';
import MindMapManager from './components/MindMapManager';
import TeamMembersManager from './components/TeamMembersManager';
import RecentlyCompletedTasksManager from './components/RecentlyCompletedTasksManager';
import UpcomingDeadlinesManager from './components/UpcomingDeadlinesManager';
import CalendarPage from './components/CalendarPage';

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mindmap" element={<MindMap />} />
          <Route path="/mindmaps" element={<MindMapManager onCreateNew={() => {}} onOpenMindMap={() => {}} onBack={() => {}} />} />
          <Route path="/team-members" element={<TeamMembersManager />} />
          <Route path="/completed-tasks" element={<RecentlyCompletedTasksManager />} />
          <Route path="/upcoming-deadlines" element={<UpcomingDeadlinesManager />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
