// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'member';

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  progress?: number;
  startDate: string;
  endDate: string;
  budget?: number;
  assigneeIds: string[];
  createdAt: string;
  updatedAt: string;
  
  // Related entities
  tasks: Task[];
  milestones: Milestone[];
  risks: Risk[];
  documents: Document[];
  financialTransactions?: FinancialTransaction[];
}

export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Task Types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Optional milestone association
  milestoneId?: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed' | 'blocked';

// Milestone Types
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  progress: number;
  associatedTaskIds: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type MilestoneStatus = 'planning' | 'in-progress' | 'completed' | 'overdue';

// Risk Types
export interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: RiskCategory;
  impact: RiskImpact;
  probability: RiskProbability;
  status: RiskStatus;
  mitigation?: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export type RiskCategory = 'technical' | 'financial' | 'operational' | 'external' | 'resource';
export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';
export type RiskProbability = 'low' | 'medium' | 'high';
export type RiskStatus = 'open' | 'mitigated' | 'closed' | 'accepted';

// Document Types
export interface Document {
  id: string;
  projectId: string;
  title: string;
  type: DocumentType;
  url: string;
  size?: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType = 'pdf' | 'doc' | 'xls' | 'image' | 'video' | 'other';

// Financial Types
export interface FinancialTransaction {
  id: string;
  projectId: string;
  type: FinancialTransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type FinancialTransactionType = 'income' | 'expense';

export type IncomeCategory = 
  | 'client-payment'
  | 'grant'
  | 'investment'
  | 'milestone-bonus'
  | 'other-income';

export type ExpenseCategory = 
  | 'personnel'
  | 'equipment'
  | 'software'
  | 'infrastructure'
  | 'marketing'
  | 'travel'
  | 'training'
  | 'other-expense';

// Comment Types
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string; // For nested comments
  
  // Polymorphic association
  entityType: 'project' | 'task' | 'milestone' | 'risk';
  entityId: string;
}

// UI/UX Types
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  disabled?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

// Dashboard Types
export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalBudget: number;
  spentBudget: number;
}

// Analytics Types
export interface ProjectAnalytics {
  projectId: string;
  completionRate: number;
  burndownData: BurndownPoint[];
  velocityData: VelocityPoint[];
  timeTracking: TimeTrackingData;
  budgetTracking: BudgetTrackingData;
}

export interface BurndownPoint {
  date: string;
  remainingTasks: number;
  idealRemaining: number;
}

export interface VelocityPoint {
  period: string;
  completedTasks: number;
  completedHours: number;
}

export interface TimeTrackingData {
  estimatedHours: number;
  actualHours: number;
  efficiency: number;
}

export interface BudgetTrackingData {
  plannedBudget: number;
  actualSpend: number;
  projectedSpend: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Search Types
export interface SearchResult {
  id: string;
  type: 'project' | 'task' | 'milestone' | 'document';
  title: string;
  description: string;
  url: string;
  highlightedText?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox';
  value: any;
  options?: { value: string; label: string }[];
  required?: boolean;
  validation?: (value: any) => string | undefined;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Context Types
export interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Project actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Task actions
  addTask: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => Promise<void>;
  
  // Milestone actions
  addMilestone: (projectId: string, milestone: Omit<Milestone, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMilestone: (milestoneId: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
}
