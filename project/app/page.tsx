"use client";

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar, FileText, PieChart, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm } from '@/components/transaction-form';
import { TransactionList } from '@/components/transaction-list';
import { MonthlyExpensesChart } from '@/components/monthly-expenses-chart';
import { CategoryPieChart } from '@/components/category-pie-chart';
import { BudgetManager } from '@/components/budget-manager';
import { BudgetComparisonChart } from '@/components/budget-comparison-chart';
import { SpendingInsights } from '@/components/spending-insights';
import { Transaction, Budget, CategorySummary, CATEGORY_COLORS } from '@/types/transaction';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedBudgets = localStorage.getItem('budgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setIsFormOpen(false);
  };

  const updateTransaction = (id: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...updatedTransaction, id } : t
    ));
    setEditingTransaction(null);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
    };
    setBudgets([...budgets.filter(b => !(b.category === budget.category && b.month === budget.month)), newBudget]);
  };

  const updateBudget = (id: string, updatedBudget: Omit<Budget, 'id'>) => {
    setBudgets(budgets.map(b => 
      b.id === id ? { ...updatedBudget, id } : b
    ));
  };

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  // Calculate summary data
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // Category breakdown for current month
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonthKey) && t.type === 'expense'
  );

  const categoryBreakdown: CategorySummary[] = currentMonthTransactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.category === transaction.category);
    if (existing) {
      existing.amount += Math.abs(transaction.amount);
    } else {
      acc.push({
        category: transaction.category,
        amount: Math.abs(transaction.amount),
        percentage: 0,
        color: CATEGORY_COLORS[transaction.category as keyof typeof CATEGORY_COLORS] || '#6b7280'
      });
    }
    return acc;
  }, [] as CategorySummary[]);

  const totalCategoryAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0);
  categoryBreakdown.forEach(cat => {
    cat.percentage = totalCategoryAmount > 0 ? (cat.amount / totalCategoryAmount) * 100 : 0;
  });

  // Budget alerts
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonthKey);
  const budgetAlerts = currentMonthBudgets.filter(budget => {
    const spent = categoryBreakdown.find(cat => cat.category === budget.category)?.amount || 0;
    return spent > budget.amount * 0.8; // Alert when 80% of budget is used
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Personal Finance Tracker
              </h1>
              <p className="text-slate-600 text-lg">
                Track expenses, manage budgets, and gain financial insights
              </p>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Transaction
            </Button>
          </div>

          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <div className="mb-6">
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-amber-800">Budget Alerts</h3>
                  </div>
                  <div className="space-y-1">
                    {budgetAlerts.map(budget => {
                      const spent = categoryBreakdown.find(cat => cat.category === budget.category)?.amount || 0;
                      const percentage = (spent / budget.amount) * 100;
                      return (
                        <p key={budget.id} className="text-sm text-amber-700">
                          <strong>{budget.category}</strong>: {percentage.toFixed(0)}% of budget used (${spent.toLocaleString()} / ${budget.amount.toLocaleString()})
                        </p>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Income
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${totalIncome.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    All time total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Expenses
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${totalExpenses.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    All time total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Net Balance
                  </CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(totalIncome - totalExpenses).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Income - Expenses
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Transactions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {transactions.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Total recorded
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Monthly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyExpensesChart transactions={transactions} />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Category Breakdown - {currentMonth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CategoryPieChart data={categoryBreakdown} />
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={transactions.slice(0, 5)}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                  showAll={false}
                />
                {transactions.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('transactions')}
                    >
                      View All Transactions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-slate-900">All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList
                  transactions={transactions}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                  showAll={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Target className="h-5 w-5 text-green-600" />
                    Budget Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetManager
                    budgets={budgets}
                    onAdd={addBudget}
                    onUpdate={updateBudget}
                    onDelete={deleteBudget}
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Budget vs Actual - {currentMonth}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetComparisonChart
                    budgets={currentMonthBudgets}
                    transactions={currentMonthTransactions}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <SpendingInsights transactions={transactions} budgets={budgets} />
          </TabsContent>
        </Tabs>

        {/* Transaction Form Modal */}
        {isFormOpen && (
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={editingTransaction ? 
              (data) => updateTransaction(editingTransaction.id, data) : 
              addTransaction
            }
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
}
export function getStaticProps() {
  return {
    props: {},
  };
}
