/**
 * ============================================
 * MIND PLANNING - CENTRAL TYPE DEFINITIONS
 * ============================================
 * 
 * This file defines all core types for the application.
 * These types will serve as the foundation for:
 * - Database schema (Prisma models)
 * - API contracts
 * - Frontend state management
 * 
 * All entities are connected through relationships:
 * - User is the central entity (everything relates to a user)
 * - Organizations/Teams group users
 * - Projects contain MindMaps and Tasks
 * - Tasks can be assigned to users and belong to projects
 */

// ============================================
// ENUMS - Role & Status Types
// ============================================

/**
 * User roles in the system
 * Determines permissions and access levels
 */
export type UserRole = 
  | 'admin'        // Full system access, can manage everything
  | 'team_manager' // Can manage team members, approve holidays, view all team data
  | 'user'         // Regular user, can create/manage own content
  | 'viewer'       // Read-only access to shared content
  | 'auditor';     // Read-only access for audit purposes, can see logs

/**
 * Task status values
 */
export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'blocked'
  | 'waiting'
  | 'completed'
  | 'cancelled';

/**
 * Task priority levels
 */
export type TaskPriority = 
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

/**
 * Holiday request status
 */
export type HolidayStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

/**
 * Project status
 */
export type ProjectStatus = 
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'archived';

/**
 * Notification types
 */
export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'mention'
  | 'comment'
  | 'holiday_approved'
  | 'holiday_rejected'
  | 'project_update'
  | 'deadline_reminder'
  | 'system';

// ============================================
// BASE INTERFACES - Common fields
// ============================================

/**
 * Base entity with common audit fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Entity with ownership tracking
 */
export interface OwnedEntity extends BaseEntity {
  createdById: string;
  createdBy?: User;
}

// ============================================
// CORE ENTITIES
// ============================================

/**
 * User - Central entity, all other entities relate to users
 */
export interface User extends BaseEntity {
  // Identity
  email: string;
  name: string;
  initials: string;
  avatar?: string;
  color: string; // Hex color for UI representation
  
  // Role & Permissions
  role: UserRole;
  isActive: boolean;
  
  // Profile
  phone?: string;
  location?: string;
  department?: string;
  jobTitle?: string;
  bio?: string;
  
  // Social links
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  
  // Skills & attributes
  skills: string[];
  
  // Settings (stored as JSON)
  settings?: UserSettings;
  
  // Relationships
  organizationId: string;
  organization?: Organization;
  teamIds: string[];
  teams?: Team[];
  
  // Activity stats (computed)
  stats?: UserStats;
}

export interface UserSettings {
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskAssignmentNotifications: boolean;
  taskUpdateNotifications: boolean;
  deadlineReminders: boolean;
  teamActivityNotifications: boolean;
  weeklyDigest: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  
  // Preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number; // in minutes
}

export interface UserStats {
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  completionRate: number;
  projectsCount: number;
  mindMapsCount: number;
}

/**
 * Organization - Top-level grouping of users
 */
export interface Organization extends BaseEntity {
  name: string;
  slug: string; // URL-friendly identifier
  logo?: string;
  
  // Settings
  settings?: OrganizationSettings;
  
  // Relationships
  ownerId: string;
  owner?: User;
  members?: User[];
  teams?: Team[];
  projects?: Project[];
}

export interface OrganizationSettings {
  allowPublicProjects: boolean;
  defaultUserRole: UserRole;
  holidayApprovalRequired: boolean;
  maxHolidayDaysPerYear: number;
}

/**
 * Team - Group of users within an organization
 */
export interface Team extends BaseEntity {
  name: string;
  description?: string;
  color: string;
  
  // Relationships
  organizationId: string;
  organization?: Organization;
  managerId: string;
  manager?: User;
  memberIds: string[];
  members?: User[];
  projectIds: string[];
  projects?: Project[];
}

/**
 * Project - Container for MindMaps and Tasks
 */
export interface Project extends OwnedEntity {
  name: string;
  description?: string;
  color: string;
  status: ProjectStatus;
  
  // Dates
  startDate?: Date;
  endDate?: Date;
  
  // Budget
  budget?: number;
  currency?: string;
  
  // Relationships
  organizationId: string;
  organization?: Organization;
  teamId?: string;
  team?: Team;
  memberIds: string[];
  members?: User[];
  mindMaps?: MindMap[];
  tasks?: Task[];
  
  // Computed stats
  stats?: ProjectStats;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionPercentage: number;
  totalBudgetUsed?: number;
  totalHoursLogged?: number;
}

/**
 * MindMap - Visual task organization
 */
export interface MindMap extends OwnedEntity {
  title: string;
  description?: string;
  color: string;
  isFavorite: boolean;
  isTemplate: boolean;
  
  // Sharing
  isPublic: boolean;
  sharedWithUserIds: string[];
  sharedWithUsers?: User[];
  sharedWithTeamIds: string[];
  sharedWithTeams?: Team[];
  
  // Content - Nodes and Connections are now separate entities
  nodes?: Node[];
  connections?: NodeConnection[];
  
  // Versioning / Snapshots
  snapshots?: MindMapSnapshot[];
  
  // Relationships
  projectId?: string;
  project?: Project;
  
  // Last activity
  lastModifiedById?: string;
  lastModifiedBy?: User;
}

/**
 * Node - Unified entity that represents both visual node AND task
 * Each node in a MindMap IS a task with visual properties
 */
export interface Node extends OwnedEntity {
  // ===== VISUAL PROPERTIES =====
  text: string;
  x: number;
  y: number;
  bgColor?: string;
  fontColor?: string;
  shapeType?: 'rectangle' | 'rounded' | 'diamond' | 'ellipse' | 'hexagon';
  emoji?: string;
  
  // ===== TASK PROPERTIES =====
  notes?: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  
  // Dates
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Time tracking
  estimatedHours?: number;
  loggedHours?: number;
  
  // ===== RELATIONSHIPS =====
  
  // MindMap this node belongs to
  mindMapId: string;
  mindMap?: MindMap;
  
  // Project (denormalized)
  projectId?: string;
  project?: Project;
  
  // Primary Assignee
  assigneeId?: string;
  assignee?: User;
  
  // Multiple assignees
  assignees?: NodeAssignee[];
  
  // Parent node (for hierarchy/subtasks)
  parentId?: string;
  parent?: Node;
  children?: Node[];
  
  // Connections
  connectionsFrom?: NodeConnection[];
  connectionsTo?: NodeConnection[];
  
  // Dependencies (blocking relationships)
  blockedByNodeIds?: string[];
  blockedByNodes?: Node[];
  blockingNodeIds?: string[];
  blockingNodes?: Node[];
  
  // Rich content
  tags?: string[];
  attachments?: Attachment[];
  comments?: Comment[];
  
  // Activity
  activityLog?: ActivityLogEntry[];
}

// Alias for backwards compatibility
export type MindMapNode = Node;

// Alias Task -> Node for backwards compatibility
export type Task = Node;

export interface NodeAssignee {
  id: string;
  nodeId: string;
  userId: string;
  user?: User;
  role: 'assignee' | 'reviewer' | 'observer';
  allocatedHours?: number;
  createdAt: Date;
}

export interface NodeConnection {
  id: string;
  fromId: string;
  from?: Node;
  toId: string;
  to?: Node;
  label?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  mindMapId: string;
}

// Alias for backwards compatibility
export type MindMapConnection = NodeConnection;

export interface MindMapSnapshot extends BaseEntity {
  name: string;
  description?: string;
  nodes: Node[];
  connections: NodeConnection[];
  
  mindMapId: string;
  createdById: string;
  createdBy?: User;
}

/**
 * Holiday Request - Time off request by a user
 */
export interface HolidayRequest extends OwnedEntity {
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason?: string;
  status: HolidayStatus;
  
  // Approval
  reviewedById?: string;
  reviewedBy?: User;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Relationships
  userId: string;
  user?: User;
}

/**
 * Attachment - File attached to nodes, mindmaps, etc.
 */
export interface Attachment extends BaseEntity {
  name: string;
  url: string;
  mimeType: string;
  size: number;
  
  // Relationships
  uploadedById: string;
  uploadedBy?: User;
  nodeId?: string;
  node?: Node;
  mindMapId?: string;
  mindMap?: MindMap;
}

/**
 * Comment - Comments on nodes
 */
export interface Comment extends BaseEntity {
  content: string;
  
  // Relationships
  authorId: string;
  author?: User;
  nodeId: string;
  node?: Node;
  
  // Reply threading
  parentCommentId?: string;
  parentComment?: Comment;
  replies?: Comment[];
  
  // Mentions
  mentionedUserIds?: string[];
  mentionedUsers?: User[];
}

/**
 * Notification - User notifications
 */
export interface Notification extends BaseEntity {
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  
  // Related entities
  userId: string;
  user?: User;
  nodeId?: string;
  node?: Node;
  projectId?: string;
  project?: Project;
  triggeredById?: string;
  triggeredBy?: User;
  
  // Action URL
  actionUrl?: string;
}

/**
 * Activity Log Entry - Audit trail
 */
export interface ActivityLogEntry extends BaseEntity {
  action: string;
  entityType: 'node' | 'project' | 'mindmap' | 'user' | 'holiday' | 'comment';
  entityId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  
  // Who did it
  userId: string;
  user?: User;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Decision Log - Record of decisions made
 */
export interface Decision extends OwnedEntity {
  title: string;
  description: string;
  category: 'technical' | 'design' | 'process' | 'resource' | 'timeline' | 'scope' | 'other';
  status: 'final' | 'pending' | 'revised';
  
  // Who decided
  decidedById: string;
  decidedBy?: User;
  decidedAt: Date;
  
  // Related entities
  projectId?: string;
  project?: Project;
  taskIds?: string[];
  tasks?: Task[];
  
  // Stakeholders
  stakeholderIds?: string[];
  stakeholders?: User[];
}

/**
 * Expense - Project expense tracking
 */
export interface Expense extends OwnedEntity {
  description: string;
  amount: number;
  currency: string;
  date: Date;
  category: 'software' | 'hardware' | 'services' | 'travel' | 'office' | 'training' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  
  // Who paid
  paidById: string;
  paidBy?: User;
  
  // Receipt
  receiptUrl?: string;
  
  // Approval
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: Date;
  
  // Split between participants
  participantIds?: string[];
  participants?: User[];
  
  // Relationships
  projectId?: string;
  project?: Project;
}

/**
 * Automation Rule - No-code automation
 */
export interface AutomationRule extends OwnedEntity {
  name: string;
  isEnabled: boolean;
  
  // Trigger
  trigger: AutomationTrigger;
  
  // Conditions
  conditions?: AutomationCondition[];
  
  // Actions
  actions: AutomationAction[];
  
  // Stats
  runCount: number;
  lastRunAt?: Date;
  
  // Scope
  projectId?: string;
  project?: Project;
  organizationId?: string;
  organization?: Organization;
}

export interface AutomationTrigger {
  type: 'task_created' | 'task_completed' | 'task_assigned' | 'priority_changed' | 
        'due_date_near' | 'due_date_passed' | 'status_changed' | 'blocked' | 
        'comment_added' | 'member_joins';
  config?: Record<string, unknown>;
}

export interface AutomationCondition {
  type: 'priority_is' | 'assigned_to' | 'has_tag' | 'project_is' | 'status_is';
  value: string;
  operator?: 'equals' | 'not_equals' | 'contains' | 'not_contains';
}

export interface AutomationAction {
  type: 'notify' | 'email' | 'assign' | 'set_priority' | 'add_tag' | 
        'move_status' | 'create_subtask' | 'add_to_calendar' | 'webhook';
  config: Record<string, unknown>;
}

// ============================================
// SEARCH & FILTER TYPES
// ============================================

/**
 * Global search result
 */
export interface SearchResult {
  type: 'task' | 'project' | 'mindmap' | 'user' | 'decision' | 'comment';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  score: number;
  highlights?: string[];
  
  // Permissions
  canView: boolean;
  canEdit: boolean;
}

/**
 * Search filters
 */
export interface SearchFilters {
  query: string;
  types?: SearchResult['type'][];
  projectIds?: string[];
  assigneeIds?: string[];
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

// ============================================
// AUTH CONTEXT TYPES
// ============================================

/**
 * Current authenticated user context
 */
export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Permissions helpers
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  canAccess: (entityType: string, entityId: string, action: 'view' | 'edit' | 'delete') => boolean;
}

export type Permission = 
  | 'manage_users'
  | 'manage_teams'
  | 'manage_projects'
  | 'approve_holidays'
  | 'view_all_tasks'
  | 'view_audit_logs'
  | 'manage_automations'
  | 'manage_billing';

/**
 * Role-based permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'manage_users',
    'manage_teams', 
    'manage_projects',
    'approve_holidays',
    'view_all_tasks',
    'view_audit_logs',
    'manage_automations',
    'manage_billing'
  ],
  team_manager: [
    'manage_teams',
    'manage_projects',
    'approve_holidays',
    'view_all_tasks',
    'manage_automations'
  ],
  user: [
    'manage_projects' // own projects only
  ],
  viewer: [],
  auditor: [
    'view_all_tasks',
    'view_audit_logs'
  ]
};

// Re-export legacy types for backward compatibility
export * from './dashboard';
export * from './mindmap';
