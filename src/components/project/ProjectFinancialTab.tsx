import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  BarChart2,
  Receipt,
  User,
  CreditCard,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { Project, FinancialTransaction, FinancialTransactionType } from '../../types';

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

  // State for filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calculate financial analytics
  const analytics = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expenses = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const budgetUsed = project.budget ? (totalExpenses / project.budget) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      budgetUsed,
      transactionCount: transactions.length,
    };
  }, [transactions, project.budget]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const searchMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCategoryLabel(transaction.category).toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
      const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
      return searchMatch && typeMatch && categoryMatch;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, typeFilter, categoryFilter]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(transactions.map(t => t.category))];
  }, [transactions]);

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

  // Get transaction icon
  const getTransactionIcon = (type: FinancialTransactionType, category: string) => {
    if (type === 'income') {
      return TrendingUp;
    }
    switch (category) {
      case 'personnel':
        return User;
      case 'software':
      case 'equipment':
        return CreditCard;
      default:
        return TrendingDown;
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics - Inline Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Receitas totais: ${formatCurrency(analytics.totalIncome)}`}
        >
          <TrendingUp className="h-4 w-4 text-success-600 dark:text-success-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(analytics.totalIncome)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Receitas
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Despesas totais: ${formatCurrency(analytics.totalExpenses)}`}
        >
          <TrendingDown className="h-4 w-4 text-error-600 dark:text-error-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(analytics.totalExpenses)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Despesas
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Lucro líquido: ${formatCurrency(analytics.netProfit)}`}
        >
          <DollarSign className={`h-4 w-4 ${
            analytics.netProfit >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`} />
          <span className={`text-sm font-semibold ${
            analytics.netProfit >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            {formatCurrency(analytics.netProfit)}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Lucro
          </span>
        </motion.div>

        {project.budget && (
          <motion.div 
            className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            tabIndex={0}
            role="button"
            aria-label={`Orçamento usado: ${analytics.budgetUsed.toFixed(1)}%`}
          >
            <BarChart2 className={`h-4 w-4 ${
              analytics.budgetUsed > 100 ? 'text-error-600 dark:text-error-400' :
              analytics.budgetUsed > 80 ? 'text-warning-600 dark:text-warning-400' :
              'text-primary-600 dark:text-primary-400'
            }`} />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {analytics.budgetUsed.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Orçamento
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Search and Filter Section - Inline, no cards */}
      <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 placeholder-gray-500"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-0 rounded-lg px-3 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200"
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-0 rounded-lg px-3 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200"
            >
              <option value="all">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List - Minimalista */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transação' : 'transações'}
            </p>
          </div>

          {/* Transaction Items */}
          <div className="space-y-1">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.type, transaction.category);
              
              return (
                <div
                  key={transaction.id}
                  className="group flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-5 w-5 ${
                      transaction.type === 'income' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`} />
                  </div>
                  
                  {/* Transaction Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {transaction.description}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {getCategoryLabel(transaction.category)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      <span className={`font-medium ${
                        transaction.type === 'income' 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-error-600 dark:text-error-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Editar transação"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      title="Excluir transação"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-lg p-12">
          <div className="text-center">
            <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {transactions.length > 0 
                ? 'Nenhuma transação corresponde aos filtros'
                : 'Nenhuma transação financeira'
              }
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {transactions.length > 0 
                ? 'Tente ajustar os filtros ou termo de busca para encontrar as transações que procura.'
                : 'Comece adicionando transações financeiras ao projeto para acompanhar receitas e despesas.'
              }
            </p>
            
            {transactions.length > 0 ? (
              <Button
                variant="ghost"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use o botão flutuante no canto inferior direito para adicionar transações
                </p>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Categorias: Receitas, Despesas, Pessoal, Software, Equipamentos
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFinancialTab; 