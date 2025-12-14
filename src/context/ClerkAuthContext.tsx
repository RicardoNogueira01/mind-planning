// Authentication Context using Clerk
// This provides user authentication and authorization across the app

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react';
import { api, userApi } from '../api/client';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types';

// ============================================
// TYPES
// ============================================

interface AppUser {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  initials?: string;
  color: string;
  role: UserRole;
  isActive: boolean;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  skills?: string[];
}

interface AuthContextValue {
  // Clerk user data
  clerkUser: ReturnType<typeof useUser>['user'];
  
  // App user data (from our database)
  user: AppUser | null;
  
  // State
  isLoaded: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<boolean>;
  
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

type EntityType = 'node' | 'project' | 'mindmap' | 'user' | 'holiday' | 'team' | 'organization';
type AccessAction = 'view' | 'edit' | 'delete' | 'manage';

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
  
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set up API client with token getter
  useEffect(() => {
    api.setTokenGetter(async () => {
      if (!isSignedIn) return null;
      return getToken();
    });
  }, [getToken, isSignedIn]);
  
  // Fetch app user when Clerk user is available
  useEffect(() => {
    const fetchUser = async () => {
      if (!isSignedIn || !clerkUser) {
        setUser(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const appUser = await userApi.getMe() as AppUser;
        setUser(appUser);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user data');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (clerkLoaded) {
      fetchUser();
    }
  }, [clerkLoaded, isSignedIn, clerkUser]);
  
  // ============================================
  // ACTIONS
  // ============================================
  
  const signOut = useCallback(async () => {
    await clerkSignOut();
    setUser(null);
  }, [clerkSignOut]);
  
  const refreshUser = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      const appUser = await userApi.getMe() as AppUser;
      setUser(appUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [isSignedIn]);
  
  const updateProfile = useCallback(async (data: Partial<AppUser>): Promise<boolean> => {
    try {
      const updated = await userApi.updateMe(data) as AppUser;
      setUser(updated);
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  }, []);
  
  // ============================================
  // PERMISSION HELPERS
  // ============================================
  
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;
    
    const roleHierarchy: Record<UserRole, number> = {
      admin: 100,
      team_manager: 50,
      user: 25,
      viewer: 10,
      auditor: 5,
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[role];
  }, [user]);
  
  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);
  
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  }, [user]);
  
  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);
  
  const canAccess = useCallback((
    _entityType: EntityType,
    _entityId: string,
    action: AccessAction
  ): boolean => {
    if (!user) return false;
    
    // Admin can do anything
    if (user.role === 'admin') return true;
    
    // Map actions to permissions
    const actionPermissions: Record<AccessAction, Permission> = {
      view: 'read',
      edit: 'write',
      delete: 'delete',
      manage: 'admin',
    };
    
    return hasPermission(actionPermissions[action]);
  }, [user, hasPermission]);
  
  const isTeamManager = useCallback((_teamId?: string): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'team_manager';
  }, [user]);
  
  const isProjectMember = useCallback((_projectId: string): boolean => {
    if (!user) return false;
    // For now, return true - would check actual membership
    return true;
  }, [user]);
  
  const getAccessibleProjectIds = useCallback((): string[] => {
    // Would return actual project IDs - for now return empty
    return [];
  }, []);
  
  // ============================================
  // CONTEXT VALUE
  // ============================================
  
  const value = useMemo<AuthContextValue>(() => ({
    clerkUser: clerkUser || null,
    user,
    isLoaded: clerkLoaded,
    isSignedIn: isSignedIn || false,
    isLoading,
    error,
    signOut,
    refreshUser,
    updateProfile,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccess,
    isTeamManager,
    isProjectMember,
    getAccessibleProjectIds,
  }), [
    clerkUser,
    user,
    clerkLoaded,
    isSignedIn,
    isLoading,
    error,
    signOut,
    refreshUser,
    updateProfile,
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
// HIGHER ORDER COMPONENT
// ============================================

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: UserRole
) {
  return function AuthenticatedComponent(props: P) {
    const { isSignedIn, isLoaded, hasRole } = useAuth();
    
    if (!isLoaded) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      );
    }
    
    if (!isSignedIn) {
      // Redirect to sign-in would happen via Clerk's <RedirectToSignIn />
      return null;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
          </div>
        </div>
      );
    }
    
    return <WrappedComponent {...props} />;
  };
}

// ============================================
// REQUIRE PERMISSION COMPONENT
// ============================================

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
