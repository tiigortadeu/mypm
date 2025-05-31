import React, { createContext, useContext, useState } from 'react';
import { Project, Milestone, Task, Risk, TaskComment } from '../types';

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
  getTaskById: (id: string) => Task | undefined;
  recoverNotes: (taskId: string) => string | null;
  addComment: (taskId: string, content: string) => void;
  calculateDynamicProgress: (projectId: string) => number;
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

  // Carregar anotações e comentários do localStorage na inicialização
  React.useEffect(() => {
    setTasks(prev => 
      prev.map(task => {
        let updatedTask = { ...task };
        
        // Carregar notes (padrão existente)
        try {
          const storageKey = `task-notes-${task.id}`;
          const savedNotes = localStorage.getItem(storageKey);
          
          // Conflict resolution: localStorage wins if it has newer content
          if (savedNotes && savedNotes !== task.notes) {
            // Check if localStorage has more recent content
            const storageTimestamp = localStorage.getItem(`${storageKey}-timestamp`);
            const currentTime = Date.now();
            
            if (storageTimestamp) {
              const timeDiff = currentTime - parseInt(storageTimestamp);
              // If saved within last 24 hours, prefer localStorage
              if (timeDiff < 24 * 60 * 60 * 1000) {
                updatedTask = { ...updatedTask, notes: savedNotes };
              }
            } else if (savedNotes.trim().length > 0) {
              // If no timestamp but has content, use localStorage
              updatedTask = { ...updatedTask, notes: savedNotes };
            }
          }
        } catch (error) {
          console.warn(`Não foi possível carregar anotações para tarefa ${task.id}:`, error);
        }

        // Carregar comentários (novo)
        try {
          const commentsKey = `task-comments-${task.id}`;
          const savedComments = localStorage.getItem(commentsKey);
          
          if (savedComments) {
            const parsedComments = JSON.parse(savedComments) as TaskComment[];
            updatedTask = { 
              ...updatedTask, 
              comments: parsedComments,
              commentsSequence: Math.max(...parsedComments.map(c => c.sequence), 0)
            };
          }
        } catch (error) {
          console.warn(`Não foi possível carregar comentários para tarefa ${task.id}:`, error);
        }
        
        return updatedTask;
      })
    );
  }, []);

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
      prev.map(task => {
        if (task.id === id) {
          const newTask = { ...task, ...updatedTask };
          
          // Enhanced sync com localStorage para notes
          if (updatedTask.notes !== undefined) {
            try {
              const storageKey = `task-notes-${id}`;
              const timestampKey = `${storageKey}-timestamp`;
              
              if (updatedTask.notes && updatedTask.notes.trim()) {
                // Save content and timestamp
                localStorage.setItem(storageKey, updatedTask.notes);
                localStorage.setItem(timestampKey, Date.now().toString());
              } else {
                // Remove empty notes
                localStorage.removeItem(storageKey);
                localStorage.removeItem(timestampKey);
              }
            } catch (error) {
              console.warn('Não foi possível salvar anotações no localStorage:', error);
              // Continue without localStorage - app still functions
            }
          }
          
          return newTask;
        }
        return task;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  // Função utilitária para recovery de anotações
  const recoverNotes = (taskId: string): string | null => {
    try {
      const storageKey = `task-notes-${taskId}`;
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.warn('Não foi possível recuperar anotações:', error);
      return null;
    }
  };

  // Função para limpar anotações e comentários órfãos do localStorage
  const cleanupOrphanedNotes = React.useCallback(() => {
    try {
      const existingTaskIds = new Set(tasks.map(task => task.id));
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('task-notes-') || key?.startsWith('task-comments-')) {
          let taskId: string;
          
          if (key.startsWith('task-notes-')) {
            taskId = key.replace('task-notes-', '').replace('-timestamp', '');
          } else {
            taskId = key.replace('task-comments-', '').replace('-timestamp', '');
          }
          
          if (!existingTaskIds.has(taskId)) {
            localStorage.removeItem(key);
            // Remove associated timestamp
            if (key.startsWith('task-notes-')) {
              localStorage.removeItem(`task-notes-${taskId}-timestamp`);
            } else {
              localStorage.removeItem(`task-comments-${taskId}-timestamp`);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Não foi possível limpar dados órfãos:', error);
    }
  }, [tasks]);

  // Executar limpeza periodicamente
  React.useEffect(() => {
    const cleanup = setTimeout(cleanupOrphanedNotes, 5000); // 5 seconds after load
    return () => clearTimeout(cleanup);
  }, [cleanupOrphanedNotes]);

  const addComment = (taskId: string, content: string) => {
    if (!content.trim()) return;

    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const currentSequence = task.commentsSequence || 0;
          const newSequence = currentSequence + 1;
          
          const newComment: TaskComment = {
            id: crypto.randomUUID(),
            content: content.trim(),
            createdAt: new Date().toISOString(),
            author: 'Usuário', // Futuro: sistema de usuários
            sequence: newSequence,
            readonly: true // Journal behavior - comentários são readonly após criação
          };

          const updatedComments = [...(task.comments || []), newComment] as readonly TaskComment[];
          const updatedTask = { 
            ...task, 
            comments: updatedComments,
            commentsSequence: newSequence
          };
          
          // Sync com localStorage
          try {
            const storageKey = `task-comments-${taskId}`;
            localStorage.setItem(storageKey, JSON.stringify(updatedComments));
            localStorage.setItem(`${storageKey}-timestamp`, Date.now().toString());
          } catch (error) {
            console.warn('Erro ao salvar comentários:', error);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  const calculateDynamicProgress = (projectId: string): number => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(t => t.status === 'completed');
    return Math.round((completedTasks.length / projectTasks.length) * 100);
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
        getTaskById,
        recoverNotes,
        addComment,
        calculateDynamicProgress,
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
