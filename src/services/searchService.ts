/**
 * ============================================
 * GLOBAL SEARCH SERVICE
 * ============================================
 * 
 * This service provides unified search across all entities:
 * - Tasks
 * - Projects
 * - MindMaps
 * - Team Members
 * - Decisions
 * - Comments
 * 
 * Results are filtered based on user permissions.
 */

import { SearchResult, TaskStatus, TaskPriority, User } from '../types';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ============================================
// SEARCH SERVICE
// ============================================

export interface GlobalSearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  types?: SearchResult['type'][];
  projectIds?: string[];
  includeArchived?: boolean;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  took: number; // Time in ms
}

/**
 * Perform a global search across all entities
 */
export async function globalSearch(
  options: GlobalSearchOptions,
  token?: string
): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    const params = new URLSearchParams({
      q: options.query,
      limit: String(options.limit || 20),
      offset: String(options.offset || 0),
    });

    if (options.types?.length) {
      params.set('types', options.types.join(','));
    }

    if (options.projectIds?.length) {
      params.set('projectIds', options.projectIds.join(','));
    }

    if (options.includeArchived) {
      params.set('includeArchived', 'true');
    }

    const response = await fetch(`${API_BASE}/search?${params.toString()}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        took: Date.now() - startTime,
      };
    }

    throw new Error('Search failed');
  } catch {
    console.warn('API not available, using mock search');
    // Fallback to mock search for development
    return mockSearch(options, startTime);
  }
}

// ============================================
// MOCK SEARCH (for development)
// ============================================

// Mock data - would come from actual components/API in production
const mockData: {
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    projectId?: string;
    projectName?: string;
    assignee?: string;
    dueDate?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
    memberCount: number;
  }>;
  mindmaps: Array<{
    id: string;
    title: string;
    description?: string;
    nodeCount: number;
    projectName?: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  }>;
  decisions: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
  }>;
} = {
  tasks: [
    { id: 't1', title: 'Update homepage design', description: 'Revamp the landing page with new branding', status: 'in_progress', priority: 'high', projectId: 'p1', projectName: 'Website Redesign', assignee: 'John Doe', dueDate: '2024-02-15' },
    { id: 't2', title: 'Fix authentication bug', description: 'Users unable to login with SSO', status: 'not_started', priority: 'critical', projectId: 'p2', projectName: 'Backend API', assignee: 'Jane Smith' },
    { id: 't3', title: 'Write API documentation', description: 'Document all REST endpoints', status: 'completed', priority: 'medium', projectId: 'p2', projectName: 'Backend API' },
    { id: 't4', title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'in_progress', priority: 'high', projectId: 'p3', projectName: 'Infrastructure' },
    { id: 't5', title: 'User testing session', description: 'Conduct usability tests with 5 participants', status: 'waiting', priority: 'medium', projectId: 'p1', projectName: 'Website Redesign' },
    { id: 't6', title: 'Database optimization', description: 'Improve query performance on reports', status: 'not_started', priority: 'high', projectId: 'p2', projectName: 'Backend API' },
    { id: 't7', title: 'Mobile responsive fixes', description: 'Fix layout issues on mobile devices', status: 'in_progress', priority: 'medium', projectId: 'p1', projectName: 'Website Redesign' },
    { id: 't8', title: 'Security audit preparation', description: 'Prepare documentation for annual security review', status: 'not_started', priority: 'high', projectId: 'p3', projectName: 'Infrastructure' },
  ],
  projects: [
    { id: 'p1', name: 'Website Redesign', description: 'Complete overhaul of company website', status: 'active', memberCount: 5 },
    { id: 'p2', name: 'Backend API', description: 'RESTful API development', status: 'active', memberCount: 3 },
    { id: 'p3', name: 'Infrastructure', description: 'Cloud infrastructure and DevOps', status: 'active', memberCount: 2 },
    { id: 'p4', name: 'Mobile App', description: 'iOS and Android companion app', status: 'planning', memberCount: 4 },
    { id: 'p5', name: 'Data Analytics', description: 'Business intelligence dashboard', status: 'on_hold', memberCount: 2 },
  ],
  mindmaps: [
    { id: 'm1', title: 'Q1 Product Roadmap', description: 'Feature planning for Q1 2024', nodeCount: 24, projectName: 'Website Redesign' },
    { id: 'm2', title: 'API Architecture', description: 'Microservices architecture diagram', nodeCount: 18, projectName: 'Backend API' },
    { id: 'm3', title: 'User Journey Map', description: 'Customer experience flow', nodeCount: 32 },
    { id: 'm4', title: 'Sprint Planning', description: 'Current sprint tasks and dependencies', nodeCount: 15 },
    { id: 'm5', title: 'Team Structure', description: 'Organization chart and responsibilities', nodeCount: 12 },
  ],
  users: [
    { id: 'u1', name: 'John Doe', email: 'john.doe@example.com', role: 'admin', department: 'Engineering' },
    { id: 'u2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'team_manager', department: 'Engineering' },
    { id: 'u3', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'user', department: 'Design' },
    { id: 'u4', name: 'Alice Williams', email: 'alice.williams@example.com', role: 'user', department: 'Marketing' },
    { id: 'u5', name: 'Charlie Brown', email: 'charlie.brown@example.com', role: 'user', department: 'Product' },
  ],
  decisions: [
    { id: 'd1', title: 'Use React for frontend', description: 'Decided to use React with TypeScript for the frontend stack', category: 'technical', status: 'final' },
    { id: 'd2', title: 'PostgreSQL as primary database', description: 'Chosen PostgreSQL over MySQL for better JSON support', category: 'technical', status: 'final' },
    { id: 'd3', title: 'Bi-weekly sprint cycles', description: 'Team will work in 2-week sprints', category: 'process', status: 'final' },
    { id: 'd4', title: 'Cloud provider selection', description: 'Evaluating AWS vs GCP for hosting', category: 'technical', status: 'pending' },
  ],
};

/**
 * Mock search implementation for development
 */
function mockSearch(options: GlobalSearchOptions, startTime: number): SearchResponse {
  const query = options.query.toLowerCase().trim();
  const limit = options.limit || 20;
  const offset = options.offset || 0;
  const types = options.types || ['task', 'project', 'mindmap', 'user', 'decision'];

  // Note: We proceeded even if query is empty to show default/all items

  const results: SearchResult[] = [];

  // Search tasks
  if (types.includes('task')) {
    mockData.tasks.forEach(task => {
      // If query is empty, match everything. Otherwise check includes.
      const match = !query ||
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.projectName?.toLowerCase().includes(query);

      if (match) {
        results.push({
          type: 'task',
          id: task.id,
          title: task.title,
          subtitle: task.projectName ? `Project: ${task.projectName}` : undefined,
          description: task.description,
          url: `/mindmap?task=${task.id}`,
          score: !query ? 1.0 : (task.title.toLowerCase().includes(query) ? 1.0 : 0.7),
          highlights: highlightMatches(task.title, query),
          canView: true,
          canEdit: true,
        });
      }
    });
  }

  // Search projects
  if (types.includes('project')) {
    mockData.projects.forEach(project => {
      const match = !query ||
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);

      if (match) {
        results.push({
          type: 'project',
          id: project.id,
          title: project.name,
          subtitle: `${project.memberCount} members • ${project.status}`,
          description: project.description,
          url: `/project/${project.id}`,
          score: !query ? 1.0 : (project.name.toLowerCase().includes(query) ? 1.0 : 0.7),
          highlights: highlightMatches(project.name, query),
          canView: true,
          canEdit: true,
        });
      }
    });
  }

  // Search mindmaps
  if (types.includes('mindmap')) {
    mockData.mindmaps.forEach(mindmap => {
      const match = !query ||
        mindmap.title.toLowerCase().includes(query) ||
        mindmap.description?.toLowerCase().includes(query);

      if (match) {
        results.push({
          type: 'mindmap',
          id: mindmap.id,
          title: mindmap.title,
          subtitle: `${mindmap.nodeCount} nodes${mindmap.projectName ? ` • ${mindmap.projectName}` : ''}`,
          description: mindmap.description,
          url: `/mindmap/${mindmap.id}`,
          score: !query ? 1.0 : (mindmap.title.toLowerCase().includes(query) ? 1.0 : 0.7),
          highlights: highlightMatches(mindmap.title, query),
          canView: true,
          canEdit: true,
        });
      }
    });
  }

  // Search users
  if (types.includes('user')) {
    mockData.users.forEach(user => {
      const match = !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query);

      if (match) {
        results.push({
          type: 'user',
          id: user.id,
          title: user.name,
          subtitle: `${user.role} • ${user.department || 'No department'}`,
          description: user.email,
          url: `/team-members?user=${user.id}`,
          score: !query ? 1.0 : (user.name.toLowerCase().includes(query) ? 1.0 : 0.8),
          highlights: highlightMatches(user.name, query),
          canView: true,
          canEdit: false,
        });
      }
    });
  }

  // Search decisions
  if (types.includes('decision')) {
    mockData.decisions.forEach(decision => {
      const match = !query ||
        decision.title.toLowerCase().includes(query) ||
        decision.description.toLowerCase().includes(query);

      if (match) {
        results.push({
          type: 'decision',
          id: decision.id,
          title: decision.title,
          subtitle: `${decision.category} • ${decision.status}`,
          description: decision.description,
          url: `/decisions?id=${decision.id}`,
          score: !query ? 1.0 : (decision.title.toLowerCase().includes(query) ? 1.0 : 0.7),
          highlights: highlightMatches(decision.title, query),
          canView: true,
          canEdit: true,
        });
      }
    });
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  // Paginate
  const total = results.length;
  const paginatedResults = results.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total,
    hasMore: offset + paginatedResults.length < total,
    took: Date.now() - startTime,
  };
}

/**
 * Highlight matching parts of text
 */
function highlightMatches(text: string, query: string): string[] {
  if (!query) return [text];

  const highlights: string[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let startIndex = 0;
  let index = lowerText.indexOf(lowerQuery, startIndex);

  while (index !== -1) {
    // Add text before match
    if (index > startIndex) {
      highlights.push(text.substring(startIndex, index));
    }
    // Add highlighted match
    highlights.push(`<mark>${text.substring(index, index + query.length)}</mark>`);
    startIndex = index + query.length;
    index = lowerText.indexOf(lowerQuery, startIndex);
  }

  // Add remaining text
  if (startIndex < text.length) {
    highlights.push(text.substring(startIndex));
  }

  return highlights.length > 0 ? highlights : [text];
}

// ============================================
// SEARCH SUGGESTIONS
// ============================================

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'popular' | 'suggested';
  icon?: string;
}

/**
 * Get search suggestions based on partial query
 */
export async function getSearchSuggestions(
  query: string,
  token?: string
): Promise<SearchSuggestion[]> {
  try {
    const response = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (response.ok) {
      return await response.json();
    }

    throw new Error('Failed to get suggestions');
  } catch {
    // Mock suggestions for development
    return getMockSuggestions(query);
  }
}

/**
 * Get mock suggestions for development
 */
function getMockSuggestions(query: string): SearchSuggestion[] {
  const suggestions: SearchSuggestion[] = [];
  const lowerQuery = query.toLowerCase();

  // Recent searches (would come from localStorage in real implementation)
  const recentSearches = [
    'website design',
    'API documentation',
    'sprint planning',
    'John Doe',
  ];

  recentSearches.forEach(search => {
    if (search.toLowerCase().includes(lowerQuery)) {
      suggestions.push({
        text: search,
        type: 'recent',
        icon: 'clock',
      });
    }
  });

  // Suggested based on data
  const allSearchableText = [
    ...mockData.tasks.map(t => t.title),
    ...mockData.projects.map(p => p.name),
    ...mockData.mindmaps.map(m => m.title),
    ...mockData.users.map(u => u.name),
  ];

  allSearchableText.forEach(text => {
    if (text.toLowerCase().includes(lowerQuery) && !suggestions.find(s => s.text === text)) {
      suggestions.push({
        text,
        type: 'suggested',
        icon: 'search',
      });
    }
  });

  return suggestions.slice(0, 8);
}

// ============================================
// RECENT SEARCHES
// ============================================

const RECENT_SEARCHES_KEY = 'mind_planning_recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Save a search query to recent searches
 */
export function saveRecentSearch(query: string): void {
  if (!query.trim()) return;

  const recent = getRecentSearches();
  const filtered = recent.filter(r => r !== query);
  filtered.unshift(query);

  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(filtered.slice(0, MAX_RECENT_SEARCHES))
  );
}

/**
 * Get recent search queries
 */
export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear recent search history
 */
export function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ============================================
// ADVANCED SEARCH FILTERS
// ============================================

export interface AdvancedSearchFilters {
  query: string;
  types?: SearchResult['type'][];
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeIds?: string[];
  projectIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  createdByMe?: boolean;
  assignedToMe?: boolean;
}

/**
 * Perform an advanced search with filters
 */
export async function advancedSearch(
  filters: AdvancedSearchFilters,
  currentUser: User | null,
  token?: string
): Promise<SearchResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${API_BASE}/search/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(filters),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ...data,
        took: Date.now() - startTime,
      };
    }

    throw new Error('Advanced search failed');
  } catch {
    // Mock advanced search for development
    return mockAdvancedSearch(filters, currentUser, startTime);
  }
}

/**
 * Mock advanced search for development
 */
function mockAdvancedSearch(
  filters: AdvancedSearchFilters,
  currentUser: User | null,
  startTime: number
): SearchResponse {
  // Start with basic search
  const basicResults = mockSearch(
    {
      query: filters.query || '',
      types: filters.types,
      projectIds: filters.projectIds,
    },
    startTime
  );

  let results = [...basicResults.results];

  // Filter by status (tasks only)
  if (filters.status?.length) {
    results = results.filter(r => {
      if (r.type !== 'task') return true;
      const task = mockData.tasks.find(t => t.id === r.id);
      return task && filters.status?.includes(task.status);
    });
  }

  // Filter by priority (tasks only)
  if (filters.priority?.length) {
    results = results.filter(r => {
      if (r.type !== 'task') return true;
      const task = mockData.tasks.find(t => t.id === r.id);
      return task && filters.priority?.includes(task.priority);
    });
  }

  // Filter by "assigned to me"
  if (filters.assignedToMe && currentUser) {
    results = results.filter(r => {
      if (r.type !== 'task') return true;
      const task = mockData.tasks.find(t => t.id === r.id);
      return task?.assignee === currentUser.name;
    });
  }

  return {
    results,
    total: results.length,
    hasMore: false,
    took: Date.now() - startTime,
  };
}

export default {
  globalSearch,
  getSearchSuggestions,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  advancedSearch,
};
