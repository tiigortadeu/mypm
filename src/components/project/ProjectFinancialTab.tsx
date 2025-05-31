import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Calendar,
  BarChart2,
  PieChart,
  CreditCard,
  Receipt,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { Project, FinancialTransaction, FinancialTransactionType, IncomeCategory, ExpenseCategory } from '../../types';

interface ProjectFinancialTabProps {
  project: Project;
  formatDate: (dateString?: string) => string;
}

const ProjectFinancialTab: React.FC<ProjectFinancialTabProps> = ({
  project,
  formatDate,
}) => {
  // Mock data for demonstration (in real app, this would come from context or props)
  const mockTransactions: FinancialTransaction[] = [
    {
      id: '1',
      projectId: project.id,
      type: 'income',
      category: 'client-payment',
      amount: 15000,
      description: 'Pagamento inicial do cliente',
      date: '2024-01-15',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      projectId: project.id,
      type: 'expense',
      category: 'personnel',
      amount: 8000,
      description: 'Salários da equipe de desenvolvimento',
      date: '2024-01-20',
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-20T14:00:00Z',
    },
    {
      id: '3',
      projectId: project.id,
      type: 'expense',
      category: 'software',
      amount: 1200,
      description: 'Licenças de software e ferramentas',
      date: '2024-01-25',
      createdAt: '2024-01-25T09:00:00Z',
      updatedAt: '2024-01-25T09:00:00Z',
    },
    {
      id: '4',
      projectId: project.id,
      type: 'income',
      category: 'milestone-bonus',
      amount: 5000,
      description: 'Bônus por milestone atingido',
      date: '2024-02-01',
      createdAt: '2024-02-01T16:00:00Z',
      updatedAt: '2024-02-01T16:00:00Z',
    },
  ];

  // Get transactions from project or use mock data
  const transactions = project.financialTransactions || mockTransactions;

  // State for filters and modal
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Calculate financial analytics
  const analytics = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Budget analysis
    const budgetUsed = project.budget ? (totalExpenses / project.budget) * 100 : 0;
    const budgetRemaining = project.budget ? project.budget - totalExpenses : 0;

    // Category breakdowns
    const incomeByCategory = income.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const expensesByCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      budgetUsed,
      budgetRemaining,
      incomeByCategory,
      expensesByCategory,
      transactionCount: transactions.length,
    };
  }, [transactions, project.budget]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
      // For simplicity, we'll skip period filtering in this implementation
      return typeMatch && categoryMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter]);

  // Get category label
  const getCategoryLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      'client-payment': 'Pagamento do Cliente',
      'grant': 'Subsídio/Grant',
      'investment': 'Investimento',
      'milestone-bonus': 'Bônus de Milestone',
      'other-income': 'Outras Receitas',
      'personnel': 'Pessoal',
      'equipment': 'Equipamentos',
      'software': 'Software',
      'infrastructure': 'Infraestrutura',
      'marketing': 'Marketing',
      'travel': 'Viagens',
      'training': 'Treinamento',
      'other-expense': 'Outras Despesas',
    };
    return categoryLabels[category] || category;
  };

  // Get type color
  const getTypeColor = (type: FinancialTransactionType): string => {
    return type === 'income' ? 'success' : 'error';
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receitas Totais</p>
                <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                  {formatCurrency(analytics.totalIncome)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {transactions.filter(t => t.type === 'income').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Despesas Totais</p>
                <p className="text-2xl font-bold text-error-600 dark:text-error-400">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-error-500" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {transactions.filter(t => t.type === 'expense').length} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${
                  analytics.netProfit >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  {formatCurrency(analytics.netProfit)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${
                analytics.netProfit >= 0 ? 'text-success-500' : 'text-error-500'
              }`} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Margem: {analytics.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Orçamento</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {project.budget ? formatCurrency(project.budget) : 'N/A'}
                </p>
              </div>
              <BarChart2 className="h-8 w-8 text-primary-500" />
            </div>
            {project.budget && (
              <>
                <ProgressBar 
                  value={Math.min(analytics.budgetUsed, 100)} 
                  variant={analytics.budgetUsed > 100 ? 'error' : analytics.budgetUsed > 80 ? 'warning' : 'success'}
                  size="sm" 
                  className="mt-2" 
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {analytics.budgetUsed.toFixed(1)}% utilizado
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transações Financeiras
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {analytics.transactionCount} transações total
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Adicionar
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="text-xs bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300"
                  >
                    <option value="all">Todos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Categoria:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300"
                  >
                    <option value="all">Todas</option>
                    <option value="client-payment">Pagamento do Cliente</option>
                    <option value="grant">Subsídio/Grant</option>
                    <option value="milestone-bonus">Bônus de Milestone</option>
                    <option value="personnel">Pessoal</option>
                    <option value="software">Software</option>
                    <option value="equipment">Equipamentos</option>
                    <option value="marketing">Marketing</option>
                  </select>
                </div>
              </div>

              {/* Transactions List */}
              {filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' 
                            ? 'bg-success-100 dark:bg-success-900/30' 
                            : 'bg-error-100 dark:bg-error-900/30'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className={`h-4 w-4 text-success-600 dark:text-success-400`} />
                          ) : (
                            <TrendingDown className={`h-4 w-4 text-error-600 dark:text-error-400`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {transaction.description}
                          </h5>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getTypeColor(transaction.type) as any} className="text-xs">
                              {getCategoryLabel(transaction.category)}
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' 
                              ? 'text-success-600 dark:text-success-400' 
                              : 'text-error-600 dark:text-error-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Editar transação"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            className="p-1 rounded text-gray-400 hover:text-error-600 dark:hover:text-error-400"
                            title="Excluir transação"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </p>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="mt-3" 
                    leftIcon={<Plus size={16} />}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Adicionar Primeira Transação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary & Charts */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Despesas por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.expensesByCategory).map(([category, amount]) => {
                  const percentage = analytics.totalExpenses > 0 
                    ? (amount / analytics.totalExpenses) * 100 
                    : 0;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getCategoryLabel(category)}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <ProgressBar 
                        value={percentage} 
                        variant="error"
                        size="sm" 
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Budget Status */}
          {project.budget && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5" />
                  Status do Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Orçamento Total</span>
                    <span className="font-medium">{formatCurrency(project.budget)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gastos</span>
                    <span className="font-medium text-error-600 dark:text-error-400">
                      {formatCurrency(analytics.totalExpenses)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Restante</span>
                    <span className={`font-medium ${
                      analytics.budgetRemaining >= 0 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`}>
                      {formatCurrency(analytics.budgetRemaining)}
                    </span>
                  </div>

                  <ProgressBar 
                    value={Math.min(analytics.budgetUsed, 100)} 
                    variant={analytics.budgetUsed > 100 ? 'error' : analytics.budgetUsed > 80 ? 'warning' : 'success'}
                    size="md" 
                  />
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {analytics.budgetUsed.toFixed(1)}% do orçamento utilizado
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="ghost" 
                leftIcon={<Download size={16} />}
                className="w-full justify-start"
              >
                Exportar PDF
              </Button>
              
              <Button 
                variant="ghost" 
                leftIcon={<Download size={16} />}
                className="w-full justify-start"
              >
                Exportar Excel
              </Button>
              
              <Button 
                variant="ghost" 
                leftIcon={<BarChart2 size={16} />}
                className="w-full justify-start"
              >
                Gerar Gráfico
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal Placeholder */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Adicionar Transação</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Modal de formulário será implementado na próxima iteração.
            </p>
            <Button 
              variant="ghost" 
              onClick={() => setIsAddModalOpen(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFinancialTab; 