import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Search,
  Calendar,
  CircleAlert as AlertCircle,
  CircleCheck as CheckCircle,
  Package,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface OrderInfo {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: any[];
}

interface PendingOrder {
  id: string;
  display_id: string;
  total_amount: number;
  created_at: string;
  days_ago: number;
  status: string;
}

const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [returnForm, setReturnForm] = useState({
    reason: '',
    comment: '',
  });

  // Fetch pending orders for the user
  useEffect(() => {
    if (user) {
      fetchPendingOrders();
    }
  }, [user]);

  const fetchPendingOrders = async () => {
    if (!user) return;

    setLoadingOrders(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('user_id', user.id)
        .neq('status', 'DELIVERED') // Don't show delivered orders
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders that are within 7 days and eligible for return
      const currentDate = new Date();
      const eligibleOrders = (orders || [])
        .map((order) => {
          const orderDate = new Date(order.created_at);
          const daysDifference = Math.floor(
            (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
          );
          const shortId = order.id.split('-').pop() || order.id;

          return {
            ...order,
            display_id: `RKIN-${shortId}`,
            days_ago: daysDifference,
          };
        })
        .filter((order) => order.days_ago <= 7); // Only show orders within 7 days

      setPendingOrders(eligibleOrders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatOrderId = (orderId: string) => {
    const shortId = orderId.split('-').pop() || orderId;
    return `RKIN-${shortId}`;
  };

  const parseOrderId = (displayId: string) => {
    if (displayId.startsWith('RKIN-')) {
      return displayId.replace('RKIN-', '');
    }
    return displayId;
  };

  const handleOrderClick = (orderId: string) => {
    setOrderNumber(orderId);
    // Automatically trigger search after a short delay
    setTimeout(() => {
      const searchEvent = new Event('submit') as any;
      handleSearch(searchEvent);
    }, 100);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    if (!user) {
      toast.error('Please login to search for orders');
      return;
    }

    setLoading(true);
    try {
      const searchId = parseOrderId(orderNumber.trim());

      // Search for order by partial ID match and user
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .ilike('id', `%${searchId}%`)
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        toast.error('Order not found or does not belong to you.');
        setOrderInfo(null);
        return;
      }

      const order = orders[0];

      // Check if order is eligible for return (within 7 days)
      const orderDate = new Date(order.created_at);
      const currentDate = new Date();
      const daysDifference = Math.floor(
        (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
      );

      if (daysDifference > 7) {
        toast.error(
          'This order is not eligible for return. Return period has expired (7 days).'
        );
        setOrderInfo(null);
        return;
      }

      // Check if order is already returned
      const { data: existingReturn, error: returnError } = await supabase
        .from('order_returns')
        .select('*')
        .eq('order_id', order.id)
        .single();

      if (existingReturn) {
        toast.error(
          'A return request has already been submitted for this order.'
        );
        setOrderInfo(null);
        return;
      }

      setOrderInfo(order);
      toast.success('Order found and eligible for return!');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to fetch order information');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setReturnForm({
      ...returnForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInfo || !user) return;

    if (!returnForm.reason) {
      toast.error('Please select a reason for return');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('order_returns').insert([
        {
          order_id: orderInfo.id,
          user_id: user.id,
          reason: returnForm.reason,
          comment: returnForm.comment,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast.success(
        'Return request submitted successfully! We will contact you soon.'
      );
      setReturnForm({ reason: '', comment: '' });
      setOrderInfo(null);
      setOrderNumber('');

      // Refresh pending orders list
      fetchPendingOrders();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  const returnReasons = [
    'Defective/Damaged Product',
    'Wrong Item Received',
    'Size/Fit Issues',
    'Not as Described',
    'Quality Issues',
    'Changed Mind',
    'Other',
  ];

  const returnPolicies = [
    {
      title: '7-Day Return Policy',
      description:
        'Items can be returned within 7 days of delivery for a full refund.',
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Original Condition',
      description:
        'Items must be in original condition with tags and packaging intact.',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
    },
    {
      title: 'Quality Assurance',
      description:
        'We inspect all returned items to ensure they meet our quality standards.',
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">
              Returns & Exchanges
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <RotateCcw className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-xl text-gray-600">
              Easy returns within 7 days of delivery
            </p>
          </motion.div>

          {/* Pending Orders List */}
          {user && pendingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-green-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">
                  Your Pending Orders
                </h2>
                {loadingOrders && (
                  <div className="ml-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Click on an order ID to quickly fill the search box below
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOrderClick(order.display_id)}
                    className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-mono text-gray-900">
                          {order.display_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {order.days_ago}{' '}
                          {order.days_ago === 1 ? 'day' : 'days'} ago
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{order.total_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        Eligible for return
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Return Request Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <RotateCcw className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Request a Return
                </h2>
                <p className="text-gray-600">
                  Enter your order details to start the return process
                </p>
              </div>
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800">
                    Please login to request a return.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter your order number (e.g., RKIN-e177e3eaa544)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    disabled={loading || !user}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !user}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Order
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Order Information and Return Form */}
            {orderInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="border-t pt-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p>
                        <span className="font-medium">Order ID:</span>
                        <span className="ml-2 font-mono text-sm">
                          {formatOrderId(orderInfo.id)}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Total Amount:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          ₹{orderInfo.total_amount.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Status:</span>
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            orderInfo.status
                          )}`}
                        >
                          {orderInfo.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Order Date:</span>
                        <span className="ml-2">
                          {new Date(orderInfo.created_at).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Return Eligibility
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800 font-medium">
                          Eligible for Return
                        </p>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        This order is within the 7-day return window.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Form */}
                <form onSubmit={handleSubmitReturn} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Return <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="reason"
                      value={returnForm.reason}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      disabled={submitting}
                    >
                      <option value="">Select a reason</option>
                      {returnReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments
                    </label>
                    <textarea
                      name="comment"
                      value={returnForm.comment}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-300"
                      placeholder="Please provide additional details about your return request..."
                      disabled={submitting}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {returnForm.comment.length}/500 characters
                      </p>
                      {returnForm.comment.length > 400 && (
                        <p className="text-xs text-orange-500">
                          Approaching character limit
                        </p>
                      )}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      <>
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Submit Return Request
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </motion.div>

          {/* Return Policy Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {returnPolicies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">{policy.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">
                    {policy.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {policy.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Detailed Return Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Return Policy Details
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Eligible Items
                </h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• Items must be returned within 7 days of delivery</li>
                  <li>
                    • Products must be in original condition with tags attached
                  </li>
                  <li>• Original packaging must be intact</li>
                  <li>• Items should be unused and unwashed</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Return Process
                </h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Submit a return request using the form above</li>
                  <li>Our team will review your request within 24 hours</li>
                  <li>
                    If approved, we'll provide return shipping instructions
                  </li>
                  <li>Pack the item securely and ship it back to us</li>
                  <li>
                    Refund will be processed within 5-7 business days after we
                    receive the item
                  </li>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Refund Information
                </h3>
                <p className="text-gray-600">
                  Refunds will be processed to the original payment method. For
                  COD orders, refunds will be processed via bank transfer or
                  UPI. Processing time may vary depending on your bank or
                  payment provider.
                </p>
              </div>
            </div>

            {/* Non-Returnable Items */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Non-Returnable Items
              </h3>
              <p className="text-gray-600 text-sm">
                The following items cannot be returned: perishable goods,
                personal care items, intimate apparel, and items marked as
                "Final Sale". Please check product descriptions for specific
                return eligibility.
              </p>
            </div>
          </motion.div>

          {/* Need Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Need assistance with your return? Contact our{' '}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                customer support team
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsPage;
