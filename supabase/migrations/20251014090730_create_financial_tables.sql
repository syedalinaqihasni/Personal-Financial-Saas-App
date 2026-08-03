/*
  # Personal Financial App Schema

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name (e.g., Food, Transport, Salary)
      - `type` (text) - Either 'income' or 'expense'
      - `color` (text) - Hex color for visualization
      - `created_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `amount` (numeric) - Transaction amount
      - `description` (text) - Transaction description
      - `category_id` (uuid) - Foreign key to categories
      - `transaction_date` (date) - Date of transaction
      - `type` (text) - Either 'income' or 'expense'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (no auth required for demo)
    
  3. Indexes
    - Index on transaction_date for faster queries
    - Index on category_id for joins
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert categories"
  ON categories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update categories"
  ON categories FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete categories"
  ON categories FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Public can view transactions"
  ON transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Public can insert transactions"
  ON transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can update transactions"
  ON transactions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete transactions"
  ON transactions FOR DELETE
  TO anon
  USING (true);

INSERT INTO categories (name, type, color) VALUES
  ('Salary', 'income', '#10b981'),
  ('Freelance', 'income', '#34d399'),
  ('Investment', 'income', '#6ee7b7'),
  ('Food & Dining', 'expense', '#ef4444'),
  ('Transportation', 'expense', '#f97316'),
  ('Shopping', 'expense', '#f59e0b'),
  ('Entertainment', 'expense', '#ec4899'),
  ('Bills & Utilities', 'expense', '#8b5cf6'),
  ('Healthcare', 'expense', '#06b6d4'),
  ('Other', 'expense', '#6b7280')
ON CONFLICT DO NOTHING;