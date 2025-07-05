"use client";

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Transaction, Budget, CATEGORY_COLORS } from '@/types/transaction';

interface SpendingInsightsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

export function SpendingInsights({ transactions, budgets }: SpendingInsightsProps) {
  const insights = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
    
    // Current month data
    const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
    const currentMonthExpenses = currentMonthTransactions.filter(t => t.type === 'expense');
    const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income');
    
    // Last month data
    const lastMonthTransactions = transactions.filter(t => t.date.startsWith(lastMonth));
    const lastMonthExpenses = lastMonthTransactions.filter(t => t.type === 'expense');
    
    // Calculate totals
    const currentExpenseTotal = currentMonthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const currentIncomeTotal = currentMonthIncome.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const lastExpenseTotal = lastMonthExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate changes
    const expenseChange = lastExpenseTotal > 0 ? ((currentExpenseTotal - lastExpenseTotal) / lastExpenseTotal) * 100 : 0;
    const netBalance = currentIncomeTotal - currentExpenseTotal;
    
    // Category analysis
    const categorySpending = currentMonthExpenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / currentExpenseTotal) * 100
      }));
    
    // Budget analysis
    const currentMonthBudgets = budgets.filter(b => b.month === currentMonth);
    const budgetAnalysis = currentMonthBudgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const percentage = (spent / budget.amount) * 100;
      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        percentage,
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });
    
    // Spending trends
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();
    
    const monthlyTrends = last6Months.map(month => {
      const monthTransactions = transactions.filter(t => t.date.startsWith(month));
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        expenses,
        income,
        net: income - expenses
      };
    });
    
    return {
      currentExpenseTotal,
      currentIncomeTotal,
      expenseChange,
      netBalance,
      topCategories,
      budgetAnalysis,
      monthlyTrends
    };
  }, [transactions, budgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const currentMonth = formatMonth(new Date().toISOString().slice(0, 7));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Monthly Spending Change
            </CardTitle>
            {insights.expenseChange >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              insights.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {insights.expenseChange >= 0 ? '+' : ''}{insights.expenseChange.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Net Balance This Month
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${insights.netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              insights.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(insights.netBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Income - Expenses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Budget Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {insights.budgetAnalysis.filter(b => b.status !== 'good').length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Categories need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Top Spending Categories - {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.topCategories.length > 0 ? (
            <div className="space-y-4">
              {insights.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-slate-400">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{category.category}</p>
                      <p className="text-sm text-slate-500">
                        {category.percentage.toFixed(1)}% of total spending
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {formatCurrency(category.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No spending data for this month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Budget Performance */}
      {insights.budgetAnalysis.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Target className="h-5 w-5 text-green-600" />
              Budget Performance - {currentMonth}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.budgetAnalysis.map((budget) => (
                <div key={budget.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{budget.category}</h4>
                      <Badge 
                        variant={budget.status === 'good' ? 'default' : budget.status === 'warning' ? 'secondary' : 'destructive'}
                        className={
                          budget.status === 'good' ? 'bg-green-100 text-green-800' :
                          budget.status === 'warning' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {budget.status === 'good' ? 'On Track' : 
                         budget.status === 'warning' ? 'Warning' : 'Over Budget'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {budget.percentage.toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(budget.percentage, 100)} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Calendar className="h-5 w-5 text-blue-600" />
            6-Month Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.monthlyTrends.map((trend) => (
              <div key={trend.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="font-medium text-slate-900">
                  {trend.month}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-green-600">
                    Income: {formatCurrency(trend.income)}
                  </div>
                  <div className="text-red-600">
                    Expenses: {formatCurrency(trend.expenses)}
                  </div>
                  <div className={`font-medium ${trend.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Net: {formatCurrency(trend.net)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}