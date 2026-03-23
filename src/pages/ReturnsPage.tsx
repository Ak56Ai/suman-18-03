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
  DollarSign,
  Info,
  Loader,
  Shield,
  Sparkles,
  ArrowRight,
  XCircle,
  Flower2,
  Droplets,
  Compass,
  X,
  Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Helper function to determine action type based on delivery status
const getActionType = (status: string) => {
  const cancelStages = ['Order Placed', 'Confirmed', 'Processing', 'Packed'];
  const returnStages = ['Delivered', 'Completed'];

  if (cancelStages.includes(status)) return 'cancel';
  if (returnStages.includes(status)) return 'return';

  return 'none';
};

const ReturnsPage: React.FC = () => {
  const { user } = useAuth();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [form, setForm] = useState({
    reason: '',
    comment: '',
  });

  // Fetch pending orders on load
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
        .select('id, order_number, total_amount, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const processedOrders = await Promise.all(
        (orders || []).map(async (order) => {
          const { data: deliveryData } = await supabase
            .from('delivery_tracking')
            .select('status_name, created_at')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { data: items } = await supabase
            .from('order_items')
            .select('id')
            .eq('order_id', order.id);

          const currentStatus = deliveryData?.status_name || 'Processing';
          const actionType = getActionType(currentStatus);

          return {
            ...order,
            display_id: order.order_number || `RKIN-${order.id.replace(/-/g, '').slice(-12)}`,
            current_status: currentStatus,
            action_type: actionType,
            delivered_at: deliveryData?.status_name === 'Delivered' ? deliveryData.created_at : null,
            items_count: items?.length || 0
          };
        })
      );

      setPendingOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const generateOrderNumber = (id: string) => {
    const uuidWithoutHyphens = id.replace(/-/g, '');
    const last12Chars = uuidWithoutHyphens.slice(-12);
    return `RKIN-${last12Chars}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error('Enter order number');
      return;
    }

    if (!user) {
      toast.error('Login required');
      return;
    }

    setLoading(true);

    try {
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      if (orderNumber.startsWith('RKIN-')) {
        query = query.eq('order_number', orderNumber);
      } else {
        query = query.or(`id::text.ilike.%${orderNumber}%`);
      }

      const { data: orders, error } = await query.limit(1);

      if (error) throw error;

      if (!orders || orders.length === 0) {
        toast.error('Order not found');
        setOrderInfo(null);
        setSelectedItems([]);
        return;
      }

      const order = orders[0];

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          price,
          total_price,
          product_id,
          product_name
        `)
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      const productIds = items?.map(item => item.product_id) || [];
      let productMap = new Map();
      
      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, returnable, return_policy_days, image_url')
          .in('id', productIds);
        
        products?.forEach(product => {
          productMap.set(product.id, product);
        });
      }

      const { data: deliveryData } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false })
        .maybeSingle();

      const currentStatus = deliveryData?.status_name || 'Processing';
      const actionType = getActionType(currentStatus);
      const isDelivered = deliveryData?.status_name === 'Delivered';
      let deliveryDate = null;
      if (isDelivered) {
        deliveryDate = deliveryData.created_at;
      }

      const { data: existingReturns } = await supabase
        .from('order_returns')
        .select('order_item_id')
        .eq('order_id', order.id);

      const { data: existingCancellations } = await supabase
        .from('order_cancellations')
        .select('order_item_id')
        .eq('order_id', order.id);

      const returnedItemIds = new Set(existingReturns?.map(r => r.order_item_id) || []);
      const cancelledItemIds = new Set(existingCancellations?.map(c => c.order_item_id) || []);
      const processedItemIds = new Set([...returnedItemIds, ...cancelledItemIds]);

      const itemsWithProducts = items?.map(item => {
        const product = productMap.get(item.product_id);
        const isProcessed = processedItemIds.has(item.id);
        
        let isReturnable = false;
        let isCancelable = false;
        let returnPolicyDays = 7;
        
        if (product && !isProcessed) {
          // Parse returnable if it's a string
          let productReturnable = product.returnable;
          if (typeof productReturnable === 'string') {
            productReturnable = productReturnable === 'true';
          }
          
          if (actionType === 'cancel') {
            isCancelable = true;
          } else if (actionType === 'return' && productReturnable === true) {
            returnPolicyDays = product.return_policy_days || 7;
            
            if (isDelivered && deliveryDate) {
              const deliveredDateObj = new Date(deliveryDate);
              const currentDate = new Date();
              const daysSinceDelivery = Math.floor(
                (currentDate.getTime() - deliveredDateObj.getTime()) / (1000 * 3600 * 24)
              );
              
              if (daysSinceDelivery <= returnPolicyDays) {
                isReturnable = true;
              }
            }
          }
        }

        return {
          ...item,
          product: {
            name: item.product_name,
            image_url: product?.image_url || '/placeholder.png',
            returnable: isReturnable,
            cancelable: isCancelable,
            return_policy_days: returnPolicyDays
          },
          isProcessed
        };
      }) || [];

      setOrderInfo({
        ...order,
        order_items: itemsWithProducts,
        isDelivered,
        deliveryDate,
        currentStatus,
        actionType
      });

      setSelectedItems([]);
      setForm({ reason: '', comment: '' });
      toast.success('Order loaded');

    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  // Submit Return Handler
  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderInfo || !user) return;

    if (selectedItems.length === 0) {
      toast.error('Select at least one item');
      return;
    }

    if (!form.reason) {
      toast.error('Select return reason');
      return;
    }

    setSubmitting(true);

    try {
      const payload = selectedItems.map(itemId => ({
        order_id: orderInfo.id,
        order_item_id: itemId,
        user_id: user.id,
        order_number: orderInfo.order_number || generateOrderNumber(orderInfo.id),
        reason: form.reason,
        comment: form.comment,
        status: 'pending',
      }));

      const { error } = await supabase
        .from('order_returns')
        .insert(payload);

      if (error) throw error;

      toast.success(`Return request submitted for ${selectedItems.length} item(s)`);

      setOrderInfo(null);
      setSelectedItems([]);
      setForm({ reason: '', comment: '' });
      setOrderNumber('');
      fetchPendingOrders();

    } catch (err) {
      console.error(err);
      toast.error('Failed to submit return');
    } finally {
      setSubmitting(false);
    }
  };

    // Cancel Handler
  const handleCancel = async () => {
    if (!orderInfo || selectedItems.length === 0) {
      toast.error('Select items to cancel');
      return;
    }

    setSubmitting(true);

    try {
      // Make sure user is logged in and has an ID
      if (!user || !user.id) {
        toast.error('User not authenticated');
        return;
      }

      console.log('Submitting cancellation with user_id:', user.id);

      const payload = selectedItems.map(itemId => ({
        order_id: orderInfo.id,
        order_item_id: itemId,
        user_id: user.id,  // This must match auth.uid()
        order_number: orderInfo.order_number || generateOrderNumber(orderInfo.id),
        reason: form.reason || 'User requested cancellation',
        comment: form.comment,
        status: 'cancelled'
      }));

      console.log('Payload:', payload);

      const { data, error } = await supabase
        .from('order_cancellations')
        .insert(payload)
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Cancellation successful:', data);
      toast.success(`Cancellation request submitted for ${selectedItems.length} item(s)`);

      // Reset state
      setOrderInfo(null);
      setSelectedItems([]);
      setForm({ reason: '', comment: '' });
      setOrderNumber('');
      fetchPendingOrders();

    } catch (err) {
      console.error('Error in cancellation:', err);
      toast.error('Failed to submit cancellation. Please try again.');
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

  const cancelReasons = [
    'Changed mind',
    'Ordered by mistake',
    'Found better price elsewhere',
    'Delivery takes too long',
    'Other',
  ];

  const returnPolicyCards = [
    {
      title: '7-Day Return Window',
      description: 'Returns accepted within 7 days of delivery',
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      color: 'blue'
    },
    {
      title: 'Cancel Before Shipping',
      description: 'Cancel anytime before order is shipped',
      icon: <XCircle className="h-6 w-6 text-orange-600" />,
      color: 'orange'
    },
    {
      title: 'Original Condition',
      description: 'Products must be unused with original packaging intact',
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: 'green'
    },
    {
      title: 'Free Pickup',
      description: 'Free return pickup from your doorstep',
      icon: <Truck className="h-6 w-6 text-purple-600" />,
      color: 'purple'
    },
    {
      title: 'Quality Assurance',
      description: 'Every return is inspected to ensure quality standards',
      icon: <Shield className="h-6 w-6 text-emerald-600" />,
      color: 'emerald'
    },
    {
      title: 'Quick Refund',
      description: 'Refund processed within 5-7 business days',
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      color: 'green'
    }
  ];

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
            <span className="text-green-600 font-medium">Returns & Cancellations</span>
          </div>
        </div>
      </div>

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
              <span className="text-green-700 text-sm font-medium">Easy Returns & Cancellations</span>
            </div>
            <div className="flex items-center justify-center mb-4">
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Returns & Cancellations
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                With Peace of Mind
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Cancel before shipping | Return within 7 days of delivery
            </p>
          </motion.div>

          {/* Recent Orders Section */}
          {user && pendingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-3">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                  </div>
                  {loadingOrders && <Loader className="h-5 w-5 animate-spin text-green-600" />}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any order to load it for return or cancellation
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setOrderNumber(order.order_number || generateOrderNumber(order.id))}
                      className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-mono text-gray-900 font-medium">
                            {order.display_id}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.current_status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          order.action_type === 'cancel' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.current_status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{order.total_amount.toLocaleString()}
                        </p>
                        <p className={`text-xs flex items-center gap-1 ${
                          order.action_type === 'cancel' ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          {order.action_type === 'cancel' ? (
                            <><XCircle className="h-3 w-3" /> Cancel Available</>
                          ) : order.action_type === 'return' ? (
                            <><RotateCcw className="h-3 w-3" /> Return Available</>
                          ) : (
                            <><Clock className="h-3 w-3" /> No Action</>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-50 to-transparent rounded-tr-full" />
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Find Your Order</h2>
                  <p className="text-gray-600">Enter your order number to check eligibility</p>
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
                      placeholder="Enter order number (e.g., RKIN-2411bdcdc6c5)"
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

              {/* Order Details */}
              {orderInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100 pt-8"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                      <p className="font-mono text-sm text-gray-600">
                        {orderInfo.order_number || generateOrderNumber(orderInfo.id)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Status: {orderInfo.currentStatus}
                      </p>
                      {orderInfo.deliveryDate && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Delivered on {new Date(orderInfo.deliveryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">₹{orderInfo.total_amount}</p>
                      <p className="text-xs text-gray-500">Total Amount</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    {orderInfo.order_items.map((item: any) => {
                      const isReturnable = item.product?.returnable && !item.isProcessed;
                      const isCancelable = item.product?.cancelable && !item.isProcessed;

                      return (
                        <div
                          key={item.id}
                          className={`flex gap-4 border rounded-xl p-4 transition-all ${
                            (isReturnable || isCancelable) ? 'hover:border-green-300' : 'opacity-60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            disabled={!(isReturnable || isCancelable)}
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="mt-2 w-5 h-5 accent-green-600"
                          />
                          <img
                            src={item.product?.image_url || '/placeholder.png'}
                            alt={item.product?.name}
                            className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product?.name || item.product_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{item.total_price}</p>
                            {item.isProcessed ? (
                              <p className="text-blue-600 text-xs flex items-center gap-1 mt-1">
                                <CheckCircle className="h-3 w-3" />
                                Request Already Submitted
                              </p>
                            ) : isReturnable ? (
                              <p className="text-green-600 text-xs flex items-center gap-1 mt-1">
                                <RotateCcw className="h-3 w-3" />
                                Returnable ({item.product?.return_policy_days || 7} days)
                              </p>
                            ) : isCancelable ? (
                              <p className="text-orange-600 text-xs flex items-center gap-1 mt-1">
                                <XCircle className="h-3 w-3" />
                                Cancelable
                              </p>
                            ) : (
                              <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                <XCircle className="h-3 w-3" />
                                Not Allowed
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Form */}
                  {selectedItems.length > 0 && (
                    <div className="border-t pt-4 space-y-4">
                      <div className={`rounded-lg p-4 ${
                        orderInfo.actionType === 'cancel' 
                          ? 'bg-orange-50 border border-orange-200' 
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex items-start">
                          <Info className={`h-5 w-5 mt-0.5 mr-2 flex-shrink-0 ${
                            orderInfo.actionType === 'cancel' ? 'text-orange-600' : 'text-yellow-600'
                          }`} />
                          <div>
                            <p className={`text-sm font-medium ${
                              orderInfo.actionType === 'cancel' ? 'text-orange-800' : 'text-yellow-800'
                            }`}>
                              {orderInfo.actionType === 'cancel' 
                                ? 'Cancel Confirmation Required' 
                                : 'Return Confirmation Required'}
                            </p>
                            <p className={`text-xs mt-1 ${
                              orderInfo.actionType === 'cancel' ? 'text-orange-700' : 'text-yellow-700'
                            }`}>
                              {orderInfo.actionType === 'cancel' 
                                ? 'Please confirm that you want to cancel the selected items.'
                                : 'Please confirm that you want to return the selected items.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason for {orderInfo.actionType === 'cancel' ? 'Cancellation' : 'Return'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={form.reason}
                          onChange={(e) => setForm({ ...form, reason: e.target.value })}
                          className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                          required
                        >
                          <option value="">Select a reason</option>
                          {(orderInfo.actionType === 'cancel' ? cancelReasons : returnReasons).map((reason) => (
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
                          placeholder="Please provide any additional details..."
                          value={form.comment}
                          onChange={(e) => setForm({ ...form, comment: e.target.value })}
                          rows={3}
                          className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-green-500 resize-none"
                        />
                      </div>

                      {orderInfo.actionType === 'return' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleSubmitReturn}
                          disabled={submitting}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader className="h-5 w-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-5 w-5" />
                              Submit Return Request ({selectedItems.length} item{selectedItems.length > 1 ? 's' : ''})
                            </>
                          )}
                        </motion.button>
                      )}

                      {orderInfo.actionType === 'cancel' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCancel}
                          disabled={submitting}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader className="h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-5 w-5" />
                              Cancel Selected Items ({selectedItems.length} item{selectedItems.length > 1 ? 's' : ''})
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Policy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {returnPolicyCards.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 bg-${policy.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                    {policy.icon}
                  </div>
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

          {/* Policy Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Policy Details</h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 text-orange-600 mr-2" />
                    Cancellation Policy
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Orders can be cancelled before they are shipped
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Full refund will be processed within 5-7 business days
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      Partial cancellation is allowed
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      No cancellation fee applies
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <RotateCcw className="h-5 w-5 text-green-600 mr-2" />
                    Return Policy
                  </h3>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Returns accepted within 7 days of delivery
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Products must be unused with original packaging
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Free return pickup available
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      Refund processed after quality check
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Droplets className="h-5 w-5 text-purple-600 mr-2" />
                  Refund Information
                </h3>
                <p className="text-gray-600">
                  Refunds are processed to the original payment method within 5-7 business days 
                  after approval. For COD orders, refunds are processed via bank transfer or UPI.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 text-amber-600 mr-2" />
                Non-Returnable & Non-Cancelable Items
              </h3>
              <p className="text-gray-600 text-sm">
                Once shipped, orders cannot be cancelled. For hygiene and safety reasons, 
                opened personal care products, perishable goods, and items marked as "Final Sale" 
                cannot be returned.
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
              Need assistance? Contact our{' '}
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