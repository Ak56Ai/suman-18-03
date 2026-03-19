/*
  # Fix RLS policies and add new features

  1. Fix RLS Policies
    - Add proper INSERT policy for delivery_tracking table
    - Fix existing policies

  2. New Tables
    - `wishlist` table for user wishlist items
    - `notifications` table for user notifications
    - `global_messages` table for admin messages

  3. Enhanced Tables
    - Update `users` table with additional profile fields
    - Add triggers for notifications

  4. Security
    - Enable RLS on all new tables
    - Add appropriate policies for each table
*/

-- Fix delivery_tracking RLS policy
DROP POLICY IF EXISTS "Users can insert delivery tracking" ON delivery_tracking;
CREATE POLICY "Users can insert delivery tracking"
  ON delivery_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = delivery_tracking.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Add missing INSERT policy for delivery_tracking
CREATE POLICY "System can insert delivery tracking"
  ON delivery_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
  ON wishlist
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create global_messages table
CREATE TABLE IF NOT EXISTS global_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE global_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active global messages"
  ON global_messages
  FOR SELECT
  TO authenticated
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  is_read boolean DEFAULT false,
  related_table text,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_global_messages_active ON global_messages(is_active, expires_at);

-- Update users table with additional profile fields
DO $$
BEGIN
  -- Add date_of_birth if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE users ADD COLUMN date_of_birth date;
  END IF;

  -- Add gender if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'gender'
  ) THEN
    ALTER TABLE users ADD COLUMN gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
  END IF;

  -- Add profile_image_url if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_image_url text;
  END IF;

  -- Add bio if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio text;
  END IF;
END $$;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_related_table text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_table, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_table, p_related_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for address changes
CREATE OR REPLACE FUNCTION notify_address_change() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Address Added',
      'A new address has been added to your account.',
      'success',
      'user_addresses',
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Address Updated',
      'Your address has been updated successfully.',
      'info',
      'user_addresses',
      NEW.id
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for cart changes
CREATE OR REPLACE FUNCTION notify_cart_change() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Item Added to Cart',
      'A new item has been added to your cart.',
      'success',
      'cart_items',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for order changes
CREATE OR REPLACE FUNCTION notify_order_change() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      NEW.user_id,
      'Order Placed',
      'Your order has been placed successfully. Order ID: ' || NEW.id,
      'success',
      'orders',
      NEW.id
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'Order Status Updated',
      'Your order status has been updated to: ' || NEW.status,
      'info',
      'orders',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for delivery tracking changes
CREATE OR REPLACE FUNCTION notify_delivery_change() RETURNS TRIGGER AS $$
DECLARE
  order_user_id uuid;
BEGIN
  -- Get the user_id from the related order
  SELECT user_id INTO order_user_id
  FROM orders
  WHERE id = NEW.order_id;

  IF order_user_id IS NOT NULL THEN
    PERFORM create_notification(
      order_user_id,
      'Delivery Update',
      'Your order delivery status has been updated to: ' || COALESCE(NEW.status_name, 'Status ' || NEW.status),
      'info',
      'delivery_tracking',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS address_change_notification ON user_addresses;
CREATE TRIGGER address_change_notification
  AFTER INSERT OR UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION notify_address_change();

DROP TRIGGER IF EXISTS cart_change_notification ON cart_items;
CREATE TRIGGER cart_change_notification
  AFTER INSERT ON cart_items
  FOR EACH ROW EXECUTE FUNCTION notify_cart_change();

DROP TRIGGER IF EXISTS order_change_notification ON orders;
CREATE TRIGGER order_change_notification
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_order_change();

DROP TRIGGER IF EXISTS delivery_change_notification ON delivery_tracking;
CREATE TRIGGER delivery_change_notification
  AFTER INSERT OR UPDATE ON delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION notify_delivery_change();