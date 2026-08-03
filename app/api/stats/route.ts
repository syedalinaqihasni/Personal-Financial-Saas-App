import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type TransactionWithCategory = {
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_id: string | null;
  categories: {
    name: string;
    color: string;
  } | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  let query = supabase
    .from('transactions')
    .select('amount, type, transaction_date, category_id, categories(name, color)');

  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }

  if (endDate) {
    query = query.lte('transaction_date', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transactions = (data || []) as unknown as TransactionWithCategory[];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  type CategoryBreakdown = {
    [key: string]: {
      name: string;
      amount: number;
      color: string;
    };
  };

  const categoryBreakdown = transactions.reduce((acc: CategoryBreakdown, t) => {
    if (t.type === 'expense' && t.categories) {
      const categoryName = t.categories.name;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          amount: 0,
          color: t.categories.color,
        };
      }
      acc[categoryName].amount += Number(t.amount);
    }
    return acc;
  }, {});

  const stats = {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    categoryBreakdown: Object.values(categoryBreakdown),
  };

  return NextResponse.json(stats);
}
