import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RotateCcw,
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  Package,
  ChevronRight,
  Clock,
  Leaf,
  Heart,
  Truck,
  MapPin,
  CreditCard,
  DollarSign,
  Info,
  Loader,
  Shield,
  Sparkles,
  ArrowRight
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
  returnable: boolean;
  return_policy_days: number;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  payment_status?: string;
  order_items: any[];
}

interface DeliveryTracking {
  id: string;
  order_id: string;
  status: number;
  status_name: string;
  notes: string;
  created_at: string;
}

interface PendingOrder {
  id: string;
  display_id: string;
  total_amount: number;
  created_at: string;
  days_ago: number;
  status: string;
  returnable: boolean;
  return_policy_days: number;
  delivered_at?: string;
}

const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryTracking[]>([]);
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveredDate, setDeliveredDate] = useState<Date | null>(null);
  const [returnForm, setReturnForm] = useState({
    reason: '',
    comment: '',
  });
  const [showReturnForm, setShowReturnForm] = useState(false);

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
        .select('id, total_amount, status, created_at, returnable, return_policy_days')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const currentDate = new Date();
      const processedOrders = await Promise.all((orders || []).map(async (order) => {
        const orderDate = new Date(order.created_at);
        const daysDifference = Math.floor(
          (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
        );
        const shortId = order.id.split('-').pop() || order.id;

        // Check if order is delivered
        const { data: deliveryData } = await supabase
          .from('delivery_tracking')
          .select('created_at')
          .eq('order_id', order.id)
          .eq('status_name', 'Delivered')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Check if return already exists
        const { data: existingReturn } = await supabase
          .from('order_returns')
          .select('id')
          .eq('order_id', order.id)
          .single();

        const isEligible = order.returnable && 
                          daysDifference <= order.return_policy_days && 
                          deliveryData && 
                          !existingReturn;

        return {
          ...order,
          display_id: `NATURZEN-${shortId}`,
          days_ago: daysDifference,
          returnable: isEligible,
          delivered_at: deliveryData?.created_at
        };
      }));

      setPendingOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatOrderId = (orderId: string) => {
    const shortId = order.order_number || `NATURZEN-${order.id.split('-').pop()}`;
    return `NATURZEN-${shortId}`;
  };

  const parseOrderId = (displayId: string) => {
    if (displayId.startsWith('NATURZEN-')) {
      return displayId.replace('NATURZEN-', '');
    }
    return displayId;
  };

  const handleOrderClick = (orderId: string) => {
    setOrderNumber(orderId);
    setShowReturnForm(false);
    setTimeout(() => {
      const searchEvent = new Event('submit') as any;
      handleSearch(searchEvent);
    }, 100);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    if (!user) {
      toast.error('Please login to search for orders');
      return;
    }

    setLoading(true);
    setShowReturnForm(false);
    
    try {
      const searchId = parseOrderId(orderNumber.trim());

      // Fetch order details
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('order_number', orderNumber.trim()) // Use exact match on order_number
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        toast.error('Order not found. Please check your order number.');
        setOrderInfo(null);
        setDeliveryInfo([]);
        setIsDelivered(false);
        return;
      }

      const order = orders[0];
      setOrderInfo(order);

      // Fetch delivery tracking information
      const { data: tracking, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (trackingError) throw trackingError;
      
      setDeliveryInfo(tracking || []);

      // Check if order is delivered
      const delivered = tracking?.some(t => t.status_name === 'Delivered');
      setIsDelivered(!!delivered);

      if (delivered) {
        const deliveredRecord = tracking?.find(t => t.status_name === 'Delivered');
        if (deliveredRecord) {
          setDeliveredDate(new Date(deliveredRecord.created_at));
        }
      }

      // Check if return already exists
      const { data: existingReturn } = await supabase
        .from('order_returns')
        .select('*')
        .eq('order_id', order.id)
        .single();

      if (existingReturn) {
        toast.error('A return request has already been submitted for this order.');
        setShowReturnForm(false);
      } else {
        // Check return eligibility
        const orderDate = new Date(order.created_at);
        const currentDate = new Date();
        const daysSinceOrder = Math.floor(
          (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
        );

        if (!order.returnable) {
          toast.error('This order is not eligible for return.');
          setShowReturnForm(false);
        } else if (!delivered) {
          toast.error('This order can only be returned after delivery.');
          setShowReturnForm(false);
        } else if (daysSinceOrder > order.return_policy_days) {
          toast.error(`Return period has expired. Returns are only accepted within ${order.return_policy_days} days of delivery.`);
          setShowReturnForm(false);
        } else {
          setShowReturnForm(true);
          toast.success('Order found and eligible for return! 🌿');
        }
      }
      
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
        'Return request submitted successfully! Our team will review and confirm within 24 hours. 🙏'
      );
      setReturnForm({ reason: '', comment: '' });
      setOrderInfo(null);
      setDeliveryInfo([]);
      setOrderNumber('');
      setShowReturnForm(false);
      setIsDelivered(false);
      
      // Refresh pending orders list
      fetchPendingOrders();
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Failed to submit return request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const returnReasons = [
    'Product damaged during shipping',
    'Wrong product received',
    'Product quality not satisfactory',
    'Product not as described',
    'Expired product received',
    'Allergic reaction',
    'Changed mind',
    'Other',
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

  const getDeliveryStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'Order Placed':
        return <Package className="h-5 w-5" />;
      case 'Confirmed':
        return <CheckCircle className="h-5 w-5" />;
      case 'Processing':
        return <Loader className="h-5 w-5" />;
      case 'Shipped':
        return <Truck className="h-5 w-5" />;
      case 'Out for Delivery':
        return <MapPin className="h-5 w-5" />;
      case 'Delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const calculateDaysSinceDelivery = () => {
    if (!deliveredDate) return null;
    const currentDate = new Date();
    const daysDiff = Math.floor(
      (currentDate.getTime() - deliveredDate.getTime()) / (1000 * 3600 * 24)
    );
    return daysDiff;
  };

  const daysSinceDelivery = calculateDaysSinceDelivery();
  const remainingDays = orderInfo?.return_policy_days ? 
    orderInfo.return_policy_days - (daysSinceDelivery || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-green-600 transition-colors flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-green-600 font-medium">Returns & Exchanges</span>
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
            <div className="inline-flex items-center gap-2 bg-green-100 rounded-full px-4 py-2 mb-4">
              <RotateCcw className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">Easy Returns</span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Returns & Exchanges
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                With Peace of Mind
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Easy returns within {orderInfo?.return_policy_days || 7} days of delivery
            </p>
          </motion.div>

          {/* Recent Orders List */}
          {user && pendingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                </div>
                {loadingOrders && <Loader className="h-5 w-5 animate-spin text-green-600" />}
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Click on an order to initiate a return
              </p>

              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOrderClick(order.display_id)}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      order.returnable 
                        ? 'border-green-200 hover:border-green-500 hover:shadow-md bg-gradient-to-r from-white to-green-50/30' 
                        : 'border-gray-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {order.display_id}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          {order.returnable && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              Eligible
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {order.days_ago} {order.days_ago === 1 ? 'day' : 'days'} ago
                          </span>
                          <span className="font-semibold text-green-600">
                            ₹{order.total_amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {order.returnable && (
                        <ArrowRight className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    
                    {order.delivered_at && order.returnable && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Delivered on {new Date(order.delivered_at).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Order Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-4">
                <Search className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Find Your Order
                </h2>
                <p className="text-gray-600">
                  Enter your full order ID to check return eligibility
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Enter full order ID (e.g., NATURZEN-e177e3eaa544)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                    disabled={loading}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Find Order
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Order Information Display */}
            {orderInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-100 pt-8"
              >
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Package className="h-5 w-5 text-green-600 mr-2" />
                      Order Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-green-100">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-mono text-sm font-medium">
                          {formatOrderId(orderInfo.id)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-green-100">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-semibold text-green-600">
                          ₹{orderInfo.total_amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-green-100">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="font-medium text-green-600">
                          {orderInfo.payment_status || 'Paid'}
                        </span>
                      </div>
                      {orderInfo.razorpay_payment_id && (
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Payment ID:</span>
                          <span className="font-mono text-xs text-gray-600">
                            {orderInfo.razorpay_payment_id}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Order Date:</span>
                        <span className="text-gray-900">
                          {new Date(orderInfo.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                      Return Eligibility
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 border-b border-blue-100">
                        <span className="text-gray-600">Return Policy:</span>
                        <span className="font-medium text-blue-600">
                          {orderInfo.return_policy_days} days
                        </span>
                      </div>
                      {deliveredDate && (
                        <>
                          <div className="flex items-center justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">Delivered On:</span>
                            <span className="text-gray-900">
                              {deliveredDate.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-blue-100">
                            <span className="text-gray-600">Days Since Delivery:</span>
                            <span className={`font-semibold ${
                              daysSinceDelivery && daysSinceDelivery <= orderInfo.return_policy_days
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {daysSinceDelivery} days
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Remaining Days:</span>
                            <span className="font-semibold text-green-600">
                              {remainingDays} days
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delivery Tracking Timeline */}
                {deliveryInfo.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                      Delivery Timeline
                    </h3>
                    <div className="space-y-3">
                      {deliveryInfo.map((tracking, index) => (
                        <div
                          key={tracking.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className={`p-2 rounded-full ${
                            tracking.status_name === 'Delivered'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {getDeliveryStatusIcon(tracking.status_name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {tracking.status_name}
                                </p>
                                {tracking.notes && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {tracking.notes}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-gray-400">
                                {new Date(tracking.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Return Form */}
                {showReturnForm && (
                  <form onSubmit={handleSubmitReturn} className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-800 font-medium">
                            Return Confirmation Required
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            Please confirm that you want to return this order. Our team will review your request and confirm within 24 hours.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Return <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="reason"
                        value={returnForm.reason}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white"
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
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        name="comment"
                        value={returnForm.comment}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-gray-50 hover:bg-white focus:bg-white"
                        placeholder="Please provide any additional details to help us process your return..."
                        disabled={submitting}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {returnForm.comment.length}/500 characters
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin mr-2" />
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-5 w-5 mr-2" />
                          Confirm & Submit Return Request
                        </>
                      )}
                    </motion.button>
                    
                    <p className="text-xs text-center text-gray-500">
                      By submitting, you confirm that you've reviewed the return policy and agree to the terms.
                      Our team will review your request and confirm within 24 hours.
                    </p>
                  </form>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Return Policy Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  {orderInfo?.return_policy_days || 7}-Day Return Window
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Returns accepted within {orderInfo?.return_policy_days || 7} days of delivery
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  Original Condition
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Products must be unused with original packaging intact
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">
                  Quality Assurance
                </h3>
              </div>
              <p className="text-gray-600 text-sm">
                Every return is inspected to ensure quality standards
              </p>
            </div>
          </div>

          {/* Need Help */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              Need assistance? Contact our{' '}
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                customer support team
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsPage;