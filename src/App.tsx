import './App.css'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import MindMap from './components/MindMap';
import MindMapManager from './components/MindMapManager';
import TeamMembersManager from './components/TeamMembersManager';
import RecentlyCompletedTasksManager from './components/RecentlyCompletedTasksManager';
import UpcomingDeadlinesManager from './components/UpcomingDeadlinesManager';
import TeamHolidaysManager from './components/TeamHolidaysManager';
import ProfilePage from './components/ProfilePage';
import EditProfilePage from './components/EditProfilePage';
import SettingsPage from './components/SettingsPage';
import CalendarPage from './components/CalendarPage';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

// Wrapper components to handle navigation
const MindMapManagerWrapper = () => {
  const navigate = useNavigate();
  
  const handleCreateNew = () => {
    // The MindMapManager component handles adding the new map to the list
    // We stay on the manager page to allow creating more maps
  };
  
  const handleOpenMindMap = (mapId) => {
    // Navigate to mind map editor with specific map ID
    navigate(`/mindmap/${mapId}`);
  };
  
  const handleBack = () => {
    // Navigate back to dashboard
    navigate('/');
  };
  
  return (
    <MindMapManager 
      onCreateNew={handleCreateNew}
      onOpenMindMap={handleOpenMindMap}
      onBack={handleBack}
    />
  );
};

const MindMapWrapper = () => {
  const navigate = useNavigate();
  const { mapId } = useParams();
  
  const handleBackToManager = () => {
    navigate('/mindmaps');
  };
  
  return (
    <MindMap 
      mapId={mapId}
      onBack={handleBackToManager}
    />
  );
};

function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mindmap/:mapId" element={<MindMapWrapper />} />
            <Route path="/mindmaps" element={<MindMapManagerWrapper />} />
            <Route path="/team-members" element={<TeamMembersManager />} />
            <Route path="/completed-tasks" element={<RecentlyCompletedTasksManager />} />
            <Route path="/upcoming-deadlines" element={<UpcomingDeadlinesManager />} />
            <Route path="/team-holidays" element={<TeamHolidaysManager />} />
            <Route path="/profile/:memberId" element={<ProfilePage />} />
            <Route path="/profile/:memberId/edit" element={<EditProfilePage />} />
            <Route path="/profile/:memberId/settings" element={<SettingsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
