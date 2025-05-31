import React, { createContext, useContext, useState } from 'react';
import { Project, Milestone, Task, Risk } from '../types';

interface ProjectContextType {
  projects: Project[];
  milestones: Milestone[];
  tasks: Task[];
  addProject: (project: Project) => void;
  updateProject: (id: string, updatedProject: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (id: string, updatedMilestone: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updatedTask: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Website Redesign',
    description:
      'Modernize our company website with a fresh design and improved UX',
    status: 'in-progress',
    progress: 65,
    createdAt: new Date('2025-01-15').toISOString(),
    updatedAt: new Date('2025-02-28').toISOString(),
    budget: 15000,
    risks: [
      {
        id: 'r1',
        type: 'risk',
        description: 'Content migration might take longer than expected',
        impact: 'medium',
        probability: 'high',
        status: 'mitigating',
      },
    ],
    benefits: [
      'Improved user experience',
      'Higher conversion rates',
      'Better mobile responsiveness',
    ],
  },
];

const initialMilestones: Milestone[] = [
  {
    id: 'm1',
    projectId: '1',
    title: 'Design Phase',
    description: 'Complete all design assets and get approval',
    status: 'in-progress',
    dueDate: new Date('2025-03-15').toISOString(),
    progress: 75,
    tasks: ['t1', 't2'],
  },
];

const initialTasks: Task[] = [
  {
    id: 't1',
    projectId: '1',
    milestoneId: 'm1',
    title: 'Create wireframes',
    description: 'Design wireframes for all main pages',
    status: 'completed',
    priority: 'high',
    createdAt: new Date('2025-01-20').toISOString(),
    dueDate: new Date('2025-02-01').toISOString(),
    completedAt: new Date('2025-01-30').toISOString(),
    estimatedHours: 20,
    actualHours: 18,
  },
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addProject = (project: Project) => {
    setProjects(prev => [...prev, project]);
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id ? { ...project, ...updatedProject } : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setMilestones(prev => prev.filter(milestone => milestone.projectId !== id));
    setTasks(prev => prev.filter(task => task.projectId !== id));
  };

  const addMilestone = (milestone: Milestone) => {
    setMilestones(prev => [...prev, milestone]);
  };

  const updateMilestone = (
    id: string,
    updatedMilestone: Partial<Milestone>
  ) => {
    setMilestones(prev =>
      prev.map(milestone =>
        milestone.id === id ? { ...milestone, ...updatedMilestone } : milestone
      )
    );
  };

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(milestone => milestone.id !== id));
    setTasks(prev => prev.filter(task => task.milestoneId !== id));
  };

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, ...updatedTask } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        milestones,
        tasks,
        addProject,
        updateProject,
        deleteProject,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);

  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }

  return context;
}
