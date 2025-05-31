# AI Product Manager - Regras de Desenvolvimento

## Visão Geral do Projeto

- **Projeto**: Sistema de gerenciamento de projetos com funcionalidades de IA
- **Stack**: React 18 + TypeScript + Tailwind CSS + Vite
- **Dependências principais**: React Router DOM, Framer Motion, Lucide React
- **Arquitetura**: SPA com roteamento aninhado e gerenciamento de estado via Context API

## Estrutura de Arquivos Obrigatória

### Organização de Componentes
- **UI Components**: SEMPRE colocar em `src/components/ui/` (Button, Card, Badge, ProgressBar)
- **Feature Components**: Organizar em subpastas por funcionalidade (ex: `src/components/dashboard/`)
- **Naming Convention**: PascalCase para componentes, camelCase para funções e variáveis

### Estrutura de Páginas
- **Localização**: SEMPRE em `src/pages/`
- **Formato**: PascalCase + sufixo "Page" (ex: `TasksPage.tsx`)
- **Estrutura**: Seguir padrão das páginas existentes (Dashboard, ProjectDetail, TasksPage)

### Contextos de Estado
- **Localização**: SEMPRE em `src/contexts/`
- **Contextos Existentes**: `ProjectContext.tsx`, `ThemeContext.tsx`
- **Regra**: SEMPRE usar contextos existentes antes de criar novos

## Regras de TypeScript

### Tipagem Obrigatória
- **Tipos Centrais**: SEMPRE usar/estender tipos de `src/types.ts`
- **Interfaces Principais**: `Project`, `Task`, `Risk`, `Document`, `Milestone`
- **Enums**: Usar union types específicos: `'planning' | 'in-progress' | 'completed' | 'on-hold'`

### Extensão de Tipos
- **FAZER**: Estender interfaces existentes quando necessário
- **NÃO FAZER**: Duplicar tipos já existentes em `types.ts`
- **Exemplo Correto**: `interface ExtendedProject extends Project { newField: string }`

## Design System

### Cores Obrigatórias
- **Primary**: `primary-500` (#6271f0), `primary-600` (#4c53e1)
- **Accent**: `accent-500` (#0D9488), `accent-600` (#15887d) 
- **Secondary**: `secondary-500` (#8b5cf6), `secondary-600` (#7C3AED)
- **Estados**: `success-500`, `warning-500`, `error-500`

### Componentes UI
- **SEMPRE** usar componentes UI existentes antes de criar novos
- **Componentes Disponíveis**: `Button`, `Card`, `Badge`, `ProgressBar`
- **Localização**: Importar de `src/components/ui/`

### Fontes e Animações
- **Font Principal**: `font-sans` (Inter)
- **Font Display**: `font-display` (Playfair Display)
- **Animações**: Usar `animate-fade-in`, `animate-slide-in` ou Framer Motion

## Roteamento

### Estrutura de Rotas
- **Base**: Todas as rotas DEVEM estar dentro do `AppLayout`
- **Padrão**: `<Route path="/" element={<AppLayout />}>`
- **Rotas Existentes**: 
  - `/` → Dashboard
  - `/projects/:id` → ProjectDetail
  - `/projects/:id/tasks` → TasksPage

### Adição de Novas Rotas
- **FAZER**: Adicionar como rota aninhada no `App.tsx`
- **NÃO FAZER**: Criar rotas fora do AppLayout sem justificativa

## Padrões de Desenvolvimento

### Gerenciamento de Estado
- **Context API**: Usar `ProjectContext` para dados de projetos
- **Theme**: Usar `ThemeContext` para modo escuro/claro
- **Estado Local**: Usar `useState` apenas para estado específico do componente

### Importações
- **React**: `import React from 'react'`
- **Hooks**: Importar individualmente: `import { useState, useEffect } from 'react'`
- **Components**: Usar importações absolutas: `import Button from 'src/components/ui/Button'`

### Estrutura de Componentes
```typescript
interface ComponentProps {
  // Props tipadas
}

const Component: React.FC<ComponentProps> = ({ props }) => {
  // Hooks
  // Handlers
  // Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};

export default Component;
```

## Funcionalidades Específicas

### Dashboard
- **Componentes**: SEMPRE usar `AIAssistant`, `ProjectsOverview`, `TasksOverview`
- **Layout**: Grid responsivo com `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Projetos
- **Estados**: `planning`, `in-progress`, `completed`, `on-hold`
- **Prioridades**: `low`, `medium`, `high`, `urgent`
- **Dados**: SEMPRE usar interface `Project` de `types.ts`

### Tasks
- **Estados**: `todo`, `in-progress`, `review`, `completed`
- **Relações**: Task DEVE ter `projectId`, PODE ter `milestoneId`

## Regras de Estilo

### Tailwind CSS
- **FAZER**: Usar classes customizadas definidas no `tailwind.config.js`
- **FAZER**: Usar dark mode com `dark:` prefix
- **NÃO FAZER**: Criar CSS customizado sem justificativa

### Responsividade
- **Mobile First**: Usar `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Padrão**: Grid/Flex responsivo para todos os layouts

## Integrações e APIs

### Simulação de Dados
- **FAZER**: Usar dados mockados localmente
- **Padrão**: Arrays estáticos ou funções que simulam API calls
- **NÃO FAZER**: Integrar APIs reais sem configuração adequada

## Proibições Específicas

### Não Permitido
- ❌ Modificar `package.json` sem necessidade explícita
- ❌ Adicionar dependências desnecessárias
- ❌ Quebrar tipagem TypeScript
- ❌ Ignorar padrões de nomenclatura estabelecidos
- ❌ Criar componentes UI sem usar o design system
- ❌ Modificar estrutura de pastas estabelecida
- ❌ Usar CSS inline ou styled-components
- ❌ Criar novos contextos sem justificativa

### Obrigatório
- ✅ SEMPRE tipar props e retornos de função
- ✅ SEMPRE usar componentes UI existentes
- ✅ SEMPRE seguir padrões de nomenclatura
- ✅ SEMPRE verificar responsividade
- ✅ SEMPRE manter consistência visual
- ✅ SEMPRE usar dark mode support

## Workflow de Desenvolvimento

### Ordem de Implementação
1. Definir/estender tipos em `types.ts`
2. Criar/modificar componentes UI se necessário
3. Implementar componente/página seguindo padrões
4. Adicionar rota se necessário
5. Testar responsividade e dark mode

### Modificações Coordenadas
- **App.tsx**: Ao adicionar páginas, SEMPRE atualizar rotas
- **types.ts**: Ao modificar interfaces, verificar impacto em componentes
- **tailwind.config.js**: Mudanças de design system afetam todo o projeto

## Decisões de IA

### Prioridades de Implementação
1. **Funcionalidade Core** > Funcionalidades secundárias
2. **Consistência** > Inovação visual
3. **TypeScript Safety** > JavaScript flexível
4. **Reuso de Componentes** > Componentes únicos

### Resolução de Conflitos
- **Conflito de Design**: Seguir padrões do `tailwind.config.js`
- **Conflito de Arquitetura**: Manter estrutura de pastas existente
- **Conflito de Estado**: Usar contextos existentes primeiro 