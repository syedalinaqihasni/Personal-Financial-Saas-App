import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category_id: string | null;
  transaction_date: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at: string;
};
