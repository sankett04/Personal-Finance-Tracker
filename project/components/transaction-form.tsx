"use client";

import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, TrendingUp, TrendingDown, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

export function TransactionForm({ transaction, onSubmit, onClose }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    description: '',
    type: 'expense' as 'income' | 'expense',
    category: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: Math.abs(transaction.amount).toString(),
        date: transaction.date,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category
      });
    } else {
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        type: 'expense',
        category: ''
      });
    }
  }, [transaction]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const amount = parseFloat(formData.amount);
    
    onSubmit({
      amount: formData.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      date: formData.date,
      description: formData.description.trim(),
      type: formData.type,
      category: formData.category
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, amount: value });
      if (errors.amount) {
        setErrors({ ...errors, amount: '' });
      }
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData({ ...formData, type, category: '' });
    if (errors.category) {
      setErrors({ ...errors, category: '' });
    }
  };

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl border-0 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Transaction Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'expense' ? 'default' : 'outline'}
                  onClick={() => handleTypeChange('expense')}
                  className={`flex-1 ${
                    formData.type === 'expense' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'text-red-500 border-red-200 hover:bg-red-50'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'income' ? 'default' : 'outline'}
                  onClick={() => handleTypeChange('income')}
                  className={`flex-1 ${
                    formData.type === 'income' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'text-green-500 border-green-200 hover:bg-green-50'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Income
                </Button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                Category
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => {
                  setFormData({ ...formData, category: value });
                  if (errors.category) {
                    setErrors({ ...errors, category: '' });
                  }
                }}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Select a category" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (errors.date) {
                      setErrors({ ...errors, date: '' });
                    }
                  }}
                  className={`pl-10 ${errors.date ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) {
                      setErrors({ ...errors, description: '' });
                    }
                  }}
                  placeholder="Enter transaction description..."
                  className={`pl-10 min-h-[80px] resize-none ${errors.description ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {transaction ? 'Update' : 'Add'} Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}