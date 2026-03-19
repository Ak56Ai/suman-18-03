/*
  # Delivery Tracking System

  1. New Tables
    - `delivery_tracking` - Track delivery status for orders
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `status` (integer, 1-7 for different stages)
      - `status_name` (text, human readable status)
      - `updated_at` (timestamp)
      - `notes` (text, optional notes)

  2. Security
    - Enable RLS on delivery_tracking table
    - Add policies for authenticated users

  3. Status Mapping
    - 1: Order Placed
    - 2: Processing
    - 3: Packed
    - 4: Shipped
    - 5: Out for Delivery
    - 6: Delivered
    - 7: Completed
*/

-- Delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status integer NOT NULL DEFAULT 1,
  status_name text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_tracking table
CREATE POLICY "Users can view own delivery tracking" ON delivery_tracking
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = delivery_tracking.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(status);

-- Create trigger for updated_at
CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON delivery_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create initial delivery tracking when order is created
CREATE OR REPLACE FUNCTION create_initial_delivery_tracking()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO delivery_tracking (order_id, status, status_name, notes)
    VALUES (NEW.id, 1, 'Order Placed', 'Your order has been successfully placed');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create delivery tracking
CREATE TRIGGER create_delivery_tracking_on_order
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION create_initial_delivery_tracking();