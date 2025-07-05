"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/transaction';

interface MonthlyExpensesChartProps {
  transactions: Transaction[];
}

export function MonthlyExpensesChart({ transactions }: MonthlyExpensesChartProps) {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { month: string; expenses: number; income: number }> = {};

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, expenses: 0, income: 0 };
      }

      if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += Math.abs(transaction.amount);
      } else {
        monthlyData[monthKey].income += Math.abs(transaction.amount);
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm ${
              entry.dataKey === 'expenses' ? 'text-red-600' : 'text-green-600'
            }`}>
              {entry.dataKey === 'expenses' ? 'Expenses' : 'Income'}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No data to display</p>
          <p className="text-sm">Add some transactions to see your monthly expenses chart</p>
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
            dataKey="month" 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="expenses" 
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
            name="Expenses"
          />
          <Bar 
            dataKey="income" 
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
            name="Income"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}