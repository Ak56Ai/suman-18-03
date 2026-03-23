import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Search,
  Truck,
  Clock,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Phone,
  Leaf,
  Heart,
  Droplets,
  Flower2,
  Shield,
  Sparkles,
  Navigation,
  Compass
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface DeliveryStatus {
  id: string;
  order_id: string;
  status: number;
  status_name: string;
  notes: string;
  created_at: string;
}

interface OrderInfo {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  estimated_delivery?: string;
  tracking_number?: string;
  courier_partner?: string;
}

interface PendingOrder {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  days_ago: number;
  status: string;
  last_delivery_status?: string;
  last_delivery_status_name?: string;
}

const ShippingInfoPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>([]);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        fetchPendingOrders(currentUser.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchPendingOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      // Fetch all orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setPendingOrders([]);
        setLoadingOrders(false);
        return;
      }

      // Get order IDs
      const orderIds = orders.map(order => order.id);
      
      // Fetch returns for these orders
      const { data: returnData, error: returnError } = await supabase
        .from('order_returns')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('user_id', userId);

      if (returnError) console.error('Error fetching returns:', returnError);

      // Fetch cancellations for these orders
      const { data: cancellationData, error: cancellationError } = await supabase
        .from('order_cancellations')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('user_id', userId);

      if (cancellationError) console.error('Error fetching cancellations:', cancellationError);

      // Create sets of order IDs that have returns or cancellations
      const returnedOrderIds = new Set(returnData?.map(r => r.order_id) || []);
      const cancelledOrderIds = new Set(cancellationData?.map(c => c.order_id) || []);
      
      // Filter out orders that have returns OR cancellations
      const activeOrders = orders.filter(order => 
        !returnedOrderIds.has(order.id) && !cancelledOrderIds.has(order.id)
      );

      if (activeOrders.length === 0) {
        setPendingOrders([]);
        setLoadingOrders(false);
        return;
      }

      // Fetch delivery status for active orders only
      const ordersWithStatus = await Promise.all(
        activeOrders.map(async (order) => {
          // Use maybeSingle() instead of single() to avoid errors when no tracking exists
          const { data: deliveryData, error: deliveryError } = await supabase
            .from('delivery_tracking')
            .select('status, status_name')
            .eq('order_id', order.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const orderDate = new Date(order.created_at);
          const currentDate = new Date();
          const daysDifference = Math.floor(
            (currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24)
          );

          // Only show orders that are NOT delivered
          const isDelivered = deliveryData?.status_name === 'Delivered';
          
          if (!isDelivered) {
            return {
              id: order.id,
              order_number: order.order_number || formatOrderId(order),
              total_amount: order.total_amount,
              created_at: order.created_at,
              days_ago: daysDifference,
              status: order.status,
              last_delivery_status: deliveryData?.status,
              last_delivery_status_name: deliveryData?.status_name || 'Processing'
            };
          }
          return null;
        })
      );

      const filteredOrders = ordersWithStatus.filter(order => order !== null);
      setPendingOrders(filteredOrders as PendingOrder[]);
      
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatOrderId = (order: OrderInfo | any) => {
    if (order.order_number) {
      return order.order_number;
    }
    
    if (order.created_at) {
      const date = new Date(order.created_at);
      const yy = date.getFullYear().toString().slice(-2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
      const shortId = order.id.split('-').pop()?.slice(0, 5) || '00001';
      return `RKIN-${yy}${mm}${dd}-${shortId}`;
    }
    
    const shortId = order.id.split('-').pop() || order.id;
    return `RKIN-${shortId.slice(0, 5)}`;
  };

  const handleOrderClick = (orderNumber: string) => {
    setOrderNumber(orderNumber);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(fakeEvent);
    }, 100);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*');

      const searchTerm = orderNumber.trim();
      
      // Search by order_number if it starts with RKIN
      if (searchTerm.startsWith('RKIN-')) {
        query = query.eq('order_number', searchTerm);
      } 
      // Otherwise search by partial ID (convert UUID to text)
      else {
        query = query.or(`id::text.ilike.%${searchTerm}%,order_number.ilike.%${searchTerm}%`);
      }

      const { data: orders, error: orderError } = await query.limit(1);

      if (orderError) {
        console.error('Order fetch error:', orderError);
        throw orderError;
      }

      if (!orders || orders.length === 0) {
        toast.error('Order not found. Please check your order number.');
        setOrderInfo(null);
        setDeliveryStatuses([]);
        return;
      }

      const order = orders[0];
      
      // Check if the order has been returned or cancelled
      const { data: returnCheck, error: returnCheckError } = await supabase
        .from('order_returns')
        .select('id, status')
        .eq('order_id', order.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (returnCheckError) console.error('Error checking returns:', returnCheckError);

      const { data: cancellationCheck, error: cancellationCheckError } = await supabase
        .from('order_cancellations')
        .select('id, status')
        .eq('order_id', order.id)
        .eq('user_id', user?.id)
        .maybeSingle();

      if (cancellationCheckError) console.error('Error checking cancellations:', cancellationCheckError);

      // If order is returned or cancelled, show appropriate message
      if (returnCheck) {
        const returnStatus = returnCheck.status;
        if (returnStatus === 'approved') {
          toast.error('This order has been returned and is no longer active.');
        } else if (returnStatus === 'pending') {
          toast.info('This order has a pending return request and cannot be tracked.');
        } else {
          toast.error('This order has been returned and cannot be tracked.');
        }
        setOrderInfo(null);
        setDeliveryStatuses([]);
        return;
      }

      if (cancellationCheck) {
        const cancelStatus = cancellationCheck.status;
        if (cancelStatus === 'approved') {
          toast.error('This order has been cancelled and is no longer active.');
        } else if (cancelStatus === 'pending') {
          toast.info('This order has a pending cancellation request and cannot be tracked.');
        } else {
          toast.error('This order has been cancelled and cannot be tracked.');
        }
        setOrderInfo(null);
        setDeliveryStatuses([]);
        return;
      }

      console.log('Order found:', order);
      setOrderInfo(order);

      // Fetch delivery tracking
      const { data: tracking, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (trackingError) throw trackingError;

      setDeliveryStatuses(tracking || []);
      
      if (tracking && tracking.length > 0) {
        const lastStatus = tracking[tracking.length - 1];
        toast.success(`Order found! Status: ${lastStatus.status_name}`);
      } else {
        toast.success('Order found! Tracking information will appear soon.');
      }
      
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Unable to track order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
      case 2:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 3:
      case 4:
      case 5:
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 6:
      case 7:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
      case 2:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 3:
      case 4:
      case 5:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 6:
      case 7:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusProgress = (status: number) => {
    const maxStatus = 7;
    return (status / maxStatus) * 100;
  };

  const getEstimatedDeliveryDate = () => {
    if (!orderInfo?.created_at) return null;

    const orderDate = new Date(orderInfo.created_at);
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(orderDate.getDate() + 5);

    return estimatedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadgeColor = (statusName?: string) => {
    switch (statusName) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const shippingInfo = [
    {
      title: 'Conscious Processing',
      description: 'Orders are carefully processed with love within 1-2 business days.',
      icon: <Heart className="h-6 w-6 text-rose-600" />,
      color: 'rose',
    },
    {
      title: 'Eco-Friendly Shipping',
      description: 'We use biodegradable packaging and carbon-neutral delivery partners.',
      icon: <Leaf className="h-6 w-6 text-green-600" />,
      color: 'green',
    },
    {
      title: 'Real-Time Tracking',
      description: 'Follow your wellness package journey with our live tracking system.',
      icon: <Navigation className="h-6 w-6 text-blue-600" />,
      color: 'blue',
    },
  ];

  const getTrackingSteps = () => {
    const steps = [
      { status: 1, label: 'Order Received', icon: Heart, description: 'Your order is confirmed' },
      { status: 2, label: 'Blessed & Packed', icon: Flower2, description: 'Carefully packed with love' },
      { status: 3, label: 'Awaiting Dispatch', icon: Clock, description: 'Ready for shipment' },
      { status: 4, label: 'On the Way', icon: Truck, description: 'Journey begins' },
      { status: 5, label: 'Near You', icon: MapPin, description: 'Arriving soon' },
      { status: 6, label: 'Out for Delivery', icon: Compass, description: 'Coming today' },
      { status: 7, label: 'Delivered', icon: CheckCircle, description: 'Enjoy your wellness' },
    ];
    return steps;
  };

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
            <span className="text-green-600 font-medium">Track Your Wellness</span>
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
              <Navigation className="w-4 h-4 text-green-600" />
              <span className="text-green-700 text-sm font-medium">Track Your Journey</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Track Your
              <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Wellness Package
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Follow your natural products on their journey from our heart to your home
            </p>
          </motion.div>

          {/* Pending Orders Section */}
          {user && pendingOrders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Active Orders</h2>
                  {loadingOrders && (
                    <div className="ml-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Click on any order to track its delivery status
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOrderClick(order.order_number)}
                      className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-green-500 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-mono text-gray-900 font-medium">
                            {order.order_number}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {order.days_ago} {order.days_ago === 1 ? 'day' : 'days'} ago
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(order.last_delivery_status_name)}`}
                        >
                          {order.last_delivery_status_name || 'Processing'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{order.total_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          Track Order
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Order Tracking Section */}
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
                  <p className="text-gray-600">Enter your order number to begin tracking</p>
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
                      placeholder="Enter order number (e.g., RKIN-260321-00001)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-gray-50 hover:bg-white focus:bg-white"
                      disabled={loading}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Track Order
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
                  {/* Progress Bar */}
                  {deliveryStatuses.length > 0 && (
                    <div className="mb-8">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Journey Progress</span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(getStatusProgress(deliveryStatuses[deliveryStatuses.length - 1].status))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getStatusProgress(deliveryStatuses[deliveryStatuses.length - 1].status)}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Package className="h-5 w-5 text-green-600 mr-2" />
                        Order Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Order ID:</span>
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {formatOrderId(orderInfo)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-semibold text-green-600">
                            ₹{orderInfo.total_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            orderInfo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            orderInfo.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {orderInfo.status}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="text-gray-900">
                            {new Date(orderInfo.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                        Shipping Address
                      </h3>
                      {orderInfo.shipping_address && (
                        <div className="space-y-2 text-gray-600">
                          <p className="font-medium text-gray-900">{orderInfo.shipping_address.fullName || orderInfo.shipping_address.name}</p>
                          <p>{orderInfo.shipping_address.address_line_1 || orderInfo.shipping_address.address}</p>
                          {orderInfo.shipping_address.address_line_2 && <p>{orderInfo.shipping_address.address_line_2}</p>}
                          <p>{orderInfo.shipping_address.area}, {orderInfo.shipping_address.city}</p>
                          <p>{orderInfo.shipping_address.state_province || orderInfo.shipping_address.state} - {orderInfo.shipping_address.pincode || orderInfo.shipping_address.postal_code}</p>
                          {orderInfo.shipping_address.phone && (
                            <p className="flex items-center mt-4 pt-4 border-t border-blue-100">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              {orderInfo.shipping_address.phone}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-green-100 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-6 w-6 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Estimated Arrival</p>
                          <p className="text-xl font-bold text-gray-900">{getEstimatedDeliveryDate()}</p>
                        </div>
                      </div>
                      {orderInfo.courier_partner && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery Partner</p>
                          <p className="font-semibold text-gray-900">{orderInfo.courier_partner}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Delivery Timeline */}
                  {deliveryStatuses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <Compass className="h-5 w-5 text-green-600 mr-2" />
                        Journey Timeline
                      </h3>

                      {/* Status Timeline */}
                      <div className="space-y-4">
                        {deliveryStatuses.map((status, index) => (
                          <motion.div
                            key={status.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
                          >
                            <div className="flex-shrink-0 mr-4">
                              <div className={`p-2 rounded-full ${getStatusColor(status.status)}`}>
                                {getStatusIcon(status.status)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">{status.status_name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                                  Step {status.status}/7
                                </span>
                              </div>
                              {status.notes && <p className="text-gray-600 text-sm mb-2">{status.notes}</p>}
                              <div className="flex items-center text-xs text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(status.created_at).toLocaleString()}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Delivery Confirmation */}
                      {deliveryStatuses.some((s) => s.status === 7) && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <Sparkles className="h-5 w-5 text-green-600 mr-2" />
                            <p className="text-green-800 font-medium">
                              Your wellness package has arrived! We hope you enjoy your natural products! 🌿
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* No Tracking Info */}
                  {deliveryStatuses.length === 0 && orderInfo && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-10 w-10 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Preparing Your Wellness Package</h3>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Our team is carefully preparing your natural products. 
                        Tracking information will appear here once your order ships.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Shipping Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {shippingInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 bg-${info.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">{info.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{info.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Need Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Need assistance with your order? Our wellness support team is here for you.
              <a href="/contact" className="text-green-600 hover:text-green-700 font-medium hover:underline ml-1 inline-flex items-center">
                Contact Us
                <ChevronRight className="h-3 w-3 ml-1" />
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShippingInfoPage;