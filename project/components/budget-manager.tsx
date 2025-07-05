"use client";

import { useState } from 'react';
import { Plus, Edit2, Trash2, Target, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Budget, EXPENSE_CATEGORIES } from '@/types/transaction';

interface BudgetManagerProps {
  budgets: Budget[];
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  onUpdate: (id: string, budget: Omit<Budget, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function BudgetManager({ budgets, onAdd, onUpdate, onDelete }: BudgetManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.month) {
      newErrors.month = 'Month is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const budgetData = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      month: formData.month
    };

    if (editingBudget) {
      onUpdate(editingBudget.id, budgetData);
    } else {
      onAdd(budgetData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7)
    });
    setErrors({});
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month
    });
    setIsFormOpen(true);
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString + '-01').toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const currentMonthBudgets = budgets.filter(b => 
    b.month === new Date().toISOString().slice(0, 7)
  );

  return (
    <div className="space-y-4">
      {!isFormOpen ? (
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      ) : (
        <Card className="p-4 border-2 border-green-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => {
                      setFormData({ ...formData, amount: e.target.value });
                      if (errors.amount) setErrors({ ...errors, amount: '' });
                    }}
                    placeholder="0.00"
                    className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <Label htmlFor="month">Month</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => {
                      setFormData({ ...formData, month: e.target.value });
                      if (errors.month) setErrors({ ...errors, month: '' });
                    }}
                    className={`pl-10 ${errors.month ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.month && (
                  <p className="text-sm text-red-500 mt-1">{errors.month}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full">
              {editingBudget ? 'Update Budget' : 'Add Budget'}
            </Button>
          </form>
        </Card>
      )}

      {/* Current Month Budgets */}
      {currentMonthBudgets.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-900">Current Month Budgets</h4>
          {currentMonthBudgets.map((budget) => (
            <Card key={budget.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{budget.category}</p>
                    <p className="text-sm text-slate-500">{formatMonth(budget.month)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    ${budget.amount.toLocaleString()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(budget)}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(budget.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {budgets.length === 0 && !isFormOpen && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No budgets set</h3>
          <p className="text-slate-500">Create your first budget to start tracking your spending goals.</p>
        </div>
      )}
    </div>
  );
}