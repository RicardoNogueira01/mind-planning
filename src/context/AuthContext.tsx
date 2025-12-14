import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '../types';

// ============================================
// AUTH CONTEXT TYPES
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  
  // Permission helpers
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  canAccess: (entityType: EntityType, entityId: string, action: AccessAction) => boolean;
  
  // Team/Org helpers
  isTeamManager: (teamId?: string) => boolean;
  isProjectMember: (projectId: string) => boolean;
  getAccessibleProjectIds: () => string[];
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
  organizationName?: string; // For creating new org
}

type EntityType = 'task' | 'project' | 'mindmap' | 'user' | 'holiday' | 'team' | 'organization';
type AccessAction = 'view' | 'edit' | 'delete' | 'manage';

// ============================================
// AUTH CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | null>(null);

// API Base URL (would come from env in production)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// AUTH PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // State
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // ============================================
  // INITIAL LOAD - Check for existing session
  // ============================================
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Validate token and get user
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setState({
            user: data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token invalid, clear it
          localStorage.removeItem('auth_token');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth init error:', error);
        // For development, create a mock user if API is not available
        const mockUser = createMockUser();
        setState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  // ============================================
  // AUTH ACTIONS
  // ============================================

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        const error = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Login failed',
        }));
        return false;
      }
    } catch {
      // For development, allow mock login
      console.warn('API not available, using mock login');
      const mockUser = createMockUser(email);
      setState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        localStorage.setItem('auth_token', responseData.token);
        setState({
          user: responseData.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        const error = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Registration failed',
        }));
        return false;
      }
    } catch {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error',
      }));
      return false;
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/users/${state.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setState(prev => ({
          ...prev,
          user: { ...prev.user, ...updatedUser } as User,
        }));
        return true;
      }
      return false;
    } catch {
      // For development, just update local state
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } as User : null,
      }));
      return true;
    }
  }, [state.user]);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          user: data.user,
        }));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  }, []);

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  const hasRole = useCallback((role: UserRole): boolean => {
    if (!state.user) return false;
    return state.user.role === role;
  }, [state.user]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  }, [state.user]);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!state.user) return false;
    const userPermissions = ROLE_PERMISSIONS[state.user.role] || [];
    return userPermissions.includes(permission);
  }, [state.user]);

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!state.user) return false;
    const userPermissions = ROLE_PERMISSIONS[state.user.role] || [];
    return permissions.some(p => userPermissions.includes(p));
  }, [state.user]);

  const canAccess = useCallback((
    entityType: EntityType,
    entityId: string,
    action: AccessAction
  ): boolean => {
    if (!state.user) return false;
    
    // Admins can do everything
    if (state.user.role === 'admin') return true;
    
    // Auditors can only view
    if (state.user.role === 'auditor') {
      return action === 'view';
    }
    
    // Viewers can only view
    if (state.user.role === 'viewer') {
      return action === 'view';
    }
    
    // For now, team managers and regular users
    // In a real app, this would check database relationships
    switch (entityType) {
      case 'task':
      case 'project':
      case 'mindmap':
        // Users can view/edit their own content or content shared with them
        // This would normally check against actual data
        return ['view', 'edit'].includes(action);
      
      case 'user':
        // Users can only edit their own profile
        return action === 'view' || (action === 'edit' && entityId === state.user.id);
      
      case 'holiday':
        // Users can manage their own holidays
        // Team managers can approve/reject team holidays
        if (state.user.role === 'team_manager') {
          return ['view', 'edit', 'manage'].includes(action);
        }
        return ['view', 'edit'].includes(action);
      
      case 'team':
        // Team managers can manage their teams
        if (state.user.role === 'team_manager') {
          return true;
        }
        return action === 'view';
      
      case 'organization':
        // Only admins can manage organizations
        return action === 'view';
      
      default:
        return false;
    }
  }, [state.user]);

  // ============================================
  // TEAM/ORG HELPERS
  // ============================================

  const isTeamManager = useCallback((_teamId?: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    if (state.user.role !== 'team_manager') return false;
    
    // If teamId specified, check if user manages that specific team
    // This would check against actual team data
    return true;
  }, [state.user]);

  const isProjectMember = useCallback((_projectId: string): boolean => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    
    // This would check against actual project membership data
    return true;
  }, [state.user]);

  const getAccessibleProjectIds = useCallback((): string[] => {
    if (!state.user) return [];
    
    // This would return actual project IDs the user has access to
    // For now, return empty array (would be populated from API)
    return [];
  }, [state.user]);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = useMemo<AuthContextValue>(() => ({
    ...state,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccess,
    isTeamManager,
    isProjectMember,
    getAccessibleProjectIds,
  }), [
    state,
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccess,
    isTeamManager,
    isProjectMember,
    getAccessibleProjectIds,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a mock user for development (when API is not available)
 */
function createMockUser(email?: string): User {
  const name = email?.split('@')[0] || 'John Doe';
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return {
    id: 'mock-user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: email || 'john.doe@example.com',
    name,
    initials,
    color: '#6366f1',
    role: 'admin', // For development, give admin access
    isActive: true,
    skills: ['JavaScript', 'React', 'TypeScript'],
    organizationId: 'mock-org-1',
    teamIds: ['mock-team-1'],
    settings: {
      emailNotifications: true,
      pushNotifications: true,
      taskAssignmentNotifications: true,
      taskUpdateNotifications: true,
      deadlineReminders: true,
      teamActivityNotifications: true,
      weeklyDigest: true,
      profileVisibility: 'team',
      showEmail: true,
      showPhone: false,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      twoFactorEnabled: false,
      sessionTimeout: 60,
    },
  };
}

// ============================================
// HIGHER-ORDER COMPONENTS
// ============================================

/**
 * HOC to require authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requiredRole?: UserRole; redirectTo?: string }
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // In a real app, redirect to login
      window.location.href = options?.redirectTo || '/login';
      return null;
    }
    
    if (options?.requiredRole && !hasRole(options.requiredRole)) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * Component to conditionally render based on permissions
 */
interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  role?: UserRole;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  permissions,
  role,
  roles,
  fallback = null,
  children,
}: RequirePermissionProps): React.ReactElement | null {
  const { hasPermission, hasAnyPermission, hasRole, hasAnyRole } = useAuth();
  
  // Check single permission
  if (permission && !hasPermission(permission)) {
    return fallback as React.ReactElement | null;
  }
  
  // Check multiple permissions (any)
  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return fallback as React.ReactElement | null;
  }
  
  // Check single role
  if (role && !hasRole(role)) {
    return fallback as React.ReactElement | null;
  }
  
  // Check multiple roles (any)
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return fallback as React.ReactElement | null;
  }
  
  return children as React.ReactElement;
}

export default AuthContext;
