/*
  # Add order returns table and update products table

  1. New Tables
    - `order_returns`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `user_id` (uuid, foreign key to auth.users)
      - `reason` (text)
      - `comment` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Changes
    - Add `returnable` column to products table
    - Add `return_policy_days` column to products table

  3. Security
    - Enable RLS on `order_returns` table
    - Add policies for users to manage their own returns
*/

-- Add returnable column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'returnable'
  ) THEN
    ALTER TABLE products ADD COLUMN returnable boolean DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'return_policy_days'
  ) THEN
    ALTER TABLE products ADD COLUMN return_policy_days integer DEFAULT 7;
  END IF;
END $$;

-- Create order_returns table
CREATE TABLE IF NOT EXISTS order_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  comment text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_returns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own returns"
  ON order_returns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own returns"
  ON order_returns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own returns"
  ON order_returns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_returns_user_id ON order_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_order_id ON order_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_order_returns_status ON order_returns(status);