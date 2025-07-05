"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Budget, Transaction, CATEGORY_COLORS } from '@/types/transaction';

interface BudgetComparisonChartProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function BudgetComparisonChart({ budgets, transactions }: BudgetComparisonChartProps) {
  const chartData = useMemo(() => {
    const data = budgets.map(budget => {
      const spent = transactions
        .filter(t => t.category === budget.category && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        category: budget.category,
        budget: budget.amount,
        spent: spent,
        remaining: Math.max(0, budget.amount - spent),
        overBudget: Math.max(0, spent - budget.amount)
      };
    });

    return data.sort((a, b) => b.budget - a.budget);
  }, [budgets, transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              Budget: ${data.budget.toLocaleString()}
            </p>
            <p className="text-sm text-red-600">
              Spent: ${data.spent.toLocaleString()}
            </p>
            {data.overBudget > 0 ? (
              <p className="text-sm text-red-700 font-medium">
                Over Budget: ${data.overBudget.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-green-600">
                Remaining: ${data.remaining.toLocaleString()}
              </p>
            )}
            <p className="text-sm text-slate-600">
              Usage: {((data.spent / data.budget) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No budget data</p>
          <p className="text-sm">Set up budgets to see comparison with actual spending</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="category" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="budget" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="Budget"
          />
          <Bar 
            dataKey="spent" 
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            name="Spent"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}