// API Client for Mind Planning Backend
// Uses Clerk for authentication

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;
  
  /**
   * Set the token getter function (from Clerk)
   * Call this once when the app initializes
   */
  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }
  
  /**
   * Make an authenticated request to the API
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    // Build URL with query params
    let url = `${API_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    // Get auth token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    
    if (this.getToken) {
      const token = await this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new ApiError(response.status, error.error || 'Request failed');
    }
    
    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }
    
    return response.json();
  }
  
  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }
  
  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton instance
export const api = new ApiClient();

// ===========================================
// API ENDPOINTS
// ===========================================

// User Profile Interface
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  initials?: string;
  color: string;
  role: string;
  isActive: boolean;
  organizationId: string;
  organization?: { id: string; name: string; slug: string };
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  memberOfTeams?: Array<{ team: { id: string; name: string; color?: string } }>;
  stats?: {
    completed: number;
    inProgress: number;
    overdue: number;
    total: number;
    successRate: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    task: string;
    time: string;
    project: string;
  }>;
  holidayRequests?: Array<{
    id: string;
    startDate: string;
    endDate: string;
    days: number;
    status: string;
    reason?: string;
  }>;
}

// User
export const userApi = {
  getMe: () => api.get<UserProfile>('/me'),
  
  updateMe: (data: Partial<{
    initials: string;
    color: string;
    phone: string;
    location: string;
    department: string;
    jobTitle: string;
    bio: string;
    skills: string[];
  }>) => api.patch<UserProfile>('/me', data),
  
  // Get all team members
  getAll: () => api.get<UserProfile[]>('/users'),
  
  // Get specific user profile
  getById: (id: string) => api.get<UserProfile>(`/users/${id}`),
  
  // Update user profile
  update: (id: string, data: Partial<{
    name: string;
    initials: string;
    color: string;
    phone: string;
    location: string;
    department: string;
    jobTitle: string;
    bio: string;
    skills: string[];
    linkedinUrl: string;
    githubUrl: string;
    websiteUrl: string;
  }>) => api.patch<UserProfile>(`/users/${id}`, data),
};

// MindMaps
export interface MindMapData {
  id: string;
  title: string;
  description?: string;
  color: string;
  isFavorite: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string; avatar?: string };
  nodes: NodeData[];
  connections: ConnectionData[];
  _count?: { nodes: number };
}

export interface NodeData {
  id: string;
  text: string;
  x: number;
  y: number;
  bgColor?: string;
  fontColor?: string;
  shapeType?: string;
  emoji?: string;
  status: string;
  priority: string;
  completed: boolean;
  notes?: string;
  dueDate?: string;
  assignee?: { id: string; name: string; avatar?: string };
}

export interface ConnectionData {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  style?: string;
  color?: string;
}

export const mindMapsApi = {
  getAll: () => api.get<MindMapData[]>('/mindmaps'),
  
  getById: (id: string) => api.get<MindMapData>(`/mindmaps/${id}`),
  
  create: (data: { title: string; description?: string; color?: string; projectId?: string }) =>
    api.post<MindMapData>('/mindmaps', data),
  
  update: (id: string, data: Partial<{ title: string; description: string; color: string; isFavorite: boolean; isPublic: boolean }>) =>
    api.patch<MindMapData>(`/mindmaps/${id}`, data),
  
  delete: (id: string) => api.delete(`/mindmaps/${id}`),
};

// Nodes
export const nodesApi = {
  create: (mindMapId: string, data: Partial<NodeData>) =>
    api.post<NodeData>(`/mindmaps/${mindMapId}/nodes`, data),
  
  update: (id: string, data: Partial<NodeData>) =>
    api.patch<NodeData>(`/nodes/${id}`, data),
  
  delete: (id: string) => api.delete(`/nodes/${id}`),
};

// Connections
export const connectionsApi = {
  create: (mindMapId: string, data: { fromId: string; toId: string; label?: string; style?: string; color?: string }) =>
    api.post<ConnectionData>(`/mindmaps/${mindMapId}/connections`, data),
  
  delete: (id: string) => api.delete(`/connections/${id}`),
};

export default api;
