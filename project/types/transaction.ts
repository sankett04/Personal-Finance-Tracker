export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // YYYY-MM format
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other'
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Gift',
  'Other'
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#ef4444',
  'Transportation': '#f97316',
  'Shopping': '#eab308',
  'Entertainment': '#22c55e',
  'Bills & Utilities': '#06b6d4',
  'Healthcare': '#3b82f6',
  'Education': '#8b5cf6',
  'Travel': '#ec4899',
  'Personal Care': '#f59e0b',
  'Other': '#6b7280',
  'Salary': '#10b981',
  'Freelance': '#059669',
  'Investment': '#0d9488',
  'Business': '#0891b2',
  'Gift': '#7c3aed',
};