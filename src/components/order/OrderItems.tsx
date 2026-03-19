import React from 'react';
import { motion } from 'framer-motion';
import { Package, Tag, Percent } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface OrderItemsProps {
  items: OrderItem[];
  totalAmount: number;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, totalAmount }) => {
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const gst = subtotal * 0.18;
  const finalTotal = subtotal + gst;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Package className="h-6 w-6 text-green-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                <p className="text-green-600 font-medium">₹{item.price.toFixed(2)} each</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">₹{item.total_price.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({items.length} items)</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              GST (18%)
            </span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className="text-green-600 font-medium">Free</span>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total Amount</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;