export interface User {
  id: string;
  name: string;
  email: string;
  securityQuestion?: string;
}

export interface Transaction {
  _id?: string;
  id?: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMode: string;
  type: 'income' | 'expense';
}

export interface Budget {
  _id?: string;
  id?: string;
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentSpent: number;
  isExceeded: boolean;
  month: string;
}

export interface Stats {
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    currentMonthExpenses: number;
    prevMonthExpenses: number;
  };
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    value: number;
  }>;
  recentTransactions: Transaction[];
}

export type Timeframe = 'all' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type TransactionTypeFilter = 'all' | 'income' | 'expense';
