// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  progress: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  budget?: number;
  risks?: Risk[];
  benefits?: string[];
  documents?: Document[];
}

export interface Risk {
  id: string;
  type: 'risk' | 'issue' | 'dependency' | 'assumption' | 'constraint';
  description: string;
  impact: 'low' | 'medium' | 'high';
  probability?: 'low' | 'medium' | 'high';
  mitigation?: string;
  status: 'identified' | 'analyzing' | 'mitigating' | 'resolved';
}

export interface Document {
  id: string;
  title: string;
  type: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  dueDate: string;
  progress: number;
  tasks: string[]; // Array of task IDs
}

export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  assignee?: string;
  estimatedHours?: number;
  actualHours?: number;
}

// UI Types
export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'dueDate'
  | 'priority'
  | 'progress';

export type ViewMode = 'grid' | 'list' | 'timeline' | 'board';
