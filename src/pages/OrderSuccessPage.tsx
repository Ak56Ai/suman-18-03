import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleCheck as CheckCircle, Package, Truck, Calendar, Download, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderTimeline from '../components/order/OrderTimeline';
import OrderItems from '../components/order/OrderItems';
import { generateInvoicePDF } from '../lib/invoiceGenerator';
import toast from 'react-hot-toast';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [deliveryTracking, setDeliveryTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Fetch order items - USE DISTINCT to avoid duplicates
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Remove duplicates by product_id (in case of any duplicate entries)
      const uniqueItems = [];
      const seenProductIds = new Set();
      
      for (const item of (itemsData || [])) {
        if (!seenProductIds.has(item.product_id)) {
          seenProductIds.add(item.product_id);
          uniqueItems.push(item);
        }
      }

      // Fetch delivery tracking
      const { data: trackingData, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (trackingError) throw trackingError;

      setOrder(orderData);
      setOrderItems(uniqueItems);
      setDeliveryTracking(trackingData || []);
      
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Format order number correctly
  const formatOrderId = () => {
    if (!order) return 'RKIN-XXXXX';
    
    // If order has order_number field, use it
    if (order.order_number) {
      return order.order_number;
    }
    
    // Generate from created_at if order_number doesn't exist
    if (order.created_at) {
      const date = new Date(order.created_at);
      const yy = date.getFullYear().toString().slice(-2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
      
      // Get sequential number for the day
      // This is approximate - actual number should come from database
      const shortId = order.id.split('-').pop() || '';
      const seqNum = shortId.slice(0, 8).padStart(8, '0');
      
      return `RKIN-${yy}${mm}${dd}-${seqNum}`;
    }
    
    return `RKIN-${order.id.split('-').pop() || 'XXXXX'}`;
  };

  const getCurrentDeliveryStatus = () => {
    if (!deliveryTracking || deliveryTracking.length === 0) return 1;
    return Math.max(...deliveryTracking.map(dt => dt.status));
  };

  const handleDownloadInvoice = () => {
    if (order) {
      const orderWithDisplay = {
        ...order,
        display_id: formatOrderId()
      };
      generateInvoicePDF(orderWithDisplay);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100';
      case 'COD_PENDING':
        return 'text-blue-600 bg-blue-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payment Successful';
      case 'COD_PENDING':
        return 'Order Confirmed - COD';
      case 'PENDING':
        return 'Payment Pending';
      default:
        return status;
    }
  };

  // Calculate correct total from items (to verify)
  const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="h-12 w-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {order.payment_method === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
            </h1>
            
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold text-gray-900">{formatOrderId()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>
              {Math.abs(order.total_amount - calculatedTotal) > 0.01 && (
                <div className="mt-2 text-xs text-orange-600">
                  Note: Order total (₹{order.total_amount}) differs from items total (₹{calculatedTotal})
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Order Items */}
          <OrderItems items={orderItems} totalAmount={order.total_amount} />

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
              </div>
              
              <div className="text-gray-700">
                <p className="font-semibold">{order.shipping_address?.fullName || order.shipping_address?.name}</p>
                <p>{order.shipping_address?.address || order.shipping_address?.address_line_1}</p>
                <p>
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode || order.shipping_address?.postal_code}
                </p>
                <p className="mt-2">
                  <span className="text-gray-600">Phone:</span> {order.shipping_address?.phone}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span> {order.shipping_address?.email}
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            <OrderTimeline 
              deliveryStatus={deliveryTracking} 
              currentStatus={getCurrentDeliveryStatus()} 
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDownloadInvoice}
              className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Invoice
            </button>
            
            <Link
              to="/my-orders"
              className="flex items-center justify-center border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors"
            >
              View All Orders
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Thank You for Choosing NaturZen!</h3>
          <p className="text-green-100 mb-6">
            Your wellness journey continues with our premium natural products. 
            We're committed to delivering the highest quality items to support your healthy lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Rate Your Experience
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Join Our Newsletter
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;