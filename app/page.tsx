'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/stats-cards';
import { TransactionList } from '@/components/transaction-list';
import { AddTransactionDialog } from '@/components/add-transaction-dialog';
import { ExpenseChart } from '@/components/expense-chart';
import { Category } from '@/lib/supabase';
import { Wallet } from 'lucide-react';

type Transaction = {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense';
  categories: {
    name: string;
    color: string;
  } | null;
};

type Stats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  categoryBreakdown: Array<{
    name: string;
    amount: number;
    color: string;
  }>;
};

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    transactionCount: 0,
    categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, categoriesRes, statsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
        fetch('/api/stats'),
      ]);

      const [transactionsData, categoriesData, statsData] = await Promise.all([
        transactionsRes.json(),
        categoriesRes.json(),
        statsRes.json(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Personal Finance
              </h1>
              <p className="text-slate-600">Track your income and expenses</p>
            </div>
          </div>
          <AddTransactionDialog categories={categories} onTransactionAdded={fetchData} />
        </div>

        <div className="space-y-6">
          <StatsCards stats={stats} />

          <div className="grid gap-6 lg:grid-cols-2">
            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
            <ExpenseChart data={stats.categoryBreakdown} />
          </div>
        </div>
      </div>
    </div>
  );
}
