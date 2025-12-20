// Main App Component with Clerk Authentication
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard';
import MindMap from './components/MindMap';
import MindMapManager from './components/MindMapManager';
import TeamMembersManager from './components/TeamMembersManager';
import TeamHierarchy from './components/TeamHierarchy';
import RecentlyCompletedTasksManager from './components/RecentlyCompletedTasksManager';
import UpcomingDeadlinesManager from './components/UpcomingDeadlinesManager';
import TeamHolidaysManager from './components/TeamHolidaysManager';
import LeaveRequestPage from './components/LeaveRequestPage';
import TeamHolidaysPage from './components/TeamHolidaysPage';
import ProfilePage from './components/ProfilePage';
import EditProfilePage from './components/EditProfilePage';
import SettingsPage from './components/SettingsPage';
import CalendarPage from './components/CalendarPage';
import RemindersPage from './components/RemindersPage';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/ClerkAuthContext';

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing VITE_CLERK_PUBLISHABLE_KEY - Auth will not work properly');
}

// Wrapper components to handle navigation
const MindMapManagerWrapper = () => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    // The MindMapManager component handles adding the new map to the list
    // We stay on the manager page to allow creating more maps
  };

  const handleOpenMindMap = (mapId: string) => {
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

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

// Auth Pages
function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
      />
    </div>
  );
}

// Main App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/mindmap/:mapId" element={
        <ProtectedRoute>
          <MindMapWrapper />
        </ProtectedRoute>
      } />
      <Route path="/mindmaps" element={
        <ProtectedRoute>
          <MindMapManagerWrapper />
        </ProtectedRoute>
      } />
      <Route path="/team-members" element={<TeamMembersManager />} />
      <Route path="/team-hierarchy/:profession" element={<TeamHierarchy />} />
      <Route path="/completed-tasks" element={
        <ProtectedRoute>
          <RecentlyCompletedTasksManager />
        </ProtectedRoute>
      } />
      <Route path="/upcoming-deadlines" element={
        <ProtectedRoute>
          <UpcomingDeadlinesManager />
        </ProtectedRoute>
      } />

      {/* Leave Management Routes */}
      <Route path="/my-leave" element={
        <ProtectedRoute>
          <LeaveRequestPage />
        </ProtectedRoute>
      } />
      <Route path="/team-holidays" element={
        <ProtectedRoute>
          <TeamHolidaysPage />
        </ProtectedRoute>
      } />
      <Route path="/team-holidays-old" element={
        <ProtectedRoute>
          <TeamHolidaysManager />
        </ProtectedRoute>
      } />

      {/* Profile Routes */}
      <Route path="/profile/:memberId" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:memberId/edit" element={
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:memberId/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  // If no Clerk key, allow app to work in demo mode
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/mindmap/:mapId" element={<MindMapWrapper />} />
            <Route path="/mindmaps" element={<MindMapManagerWrapper />} />
            <Route path="/team-members" element={<TeamMembersManager />} />
            <Route path="/team-hierarchy/:profession" element={<TeamHierarchy />} />
            <Route path="/completed-tasks" element={<RecentlyCompletedTasksManager />} />
            <Route path="/upcoming-deadlines" element={<UpcomingDeadlinesManager />} />
            <Route path="/my-leave" element={<LeaveRequestPage />} />
            <Route path="/team-holidays" element={<TeamHolidaysPage />} />
            <Route path="/profile/:memberId" element={<ProfilePage />} />
            <Route path="/profile/:memberId/edit" element={<EditProfilePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </ClerkProvider>
  );
}

export default App;
