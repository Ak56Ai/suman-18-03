import React, { useState } from 'react';
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
  Sun,
  Wind,
  Flower2,
  Shield,
  Sparkles,
  Navigation,
  Compass
} from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: any;
  estimated_delivery?: string;
  tracking_number?: string;
  courier_partner?: string;
}

const ShippingInfoPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [deliveryStatuses, setDeliveryStatuses] = useState<DeliveryStatus[]>(
    []
  );

  const formatOrderId = (orderId: string) => {
    const shortId = orderId.split('-').pop() || orderId;
    return `NATURZEN-${shortId}`;
  };

  const parseOrderId = (displayId: string) => {
    if (displayId.startsWith('NATURZEN-')) {
      return displayId.replace('NATURZEN-', '');
    }
    return displayId;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    setLoading(true);
    try {
      const searchId = parseOrderId(orderNumber.trim());

      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .ilike('id', `%${searchId}%`)
        .limit(1);

      if (orderError) throw orderError;

      if (!orders || orders.length === 0) {
        toast.error('Order not found. Please check your order number.');
        setOrderInfo(null);
        setDeliveryStatuses([]);
        return;
      }

      const order = orders[0];
      setOrderInfo(order);

      const { data: tracking, error: trackingError } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: true });

      if (trackingError) throw trackingError;

      setDeliveryStatuses(tracking || []);
      toast.success('Order found! Your wellness package is on its way! 🌿');
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

      {/* Breadcrumb with Nature Touch */}
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

          {/* Order Tracking Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-50 to-transparent rounded-tr-full" />
            
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg mr-4">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Find Your Order
                  </h2>
                  <p className="text-gray-600">
                    Enter your order number to begin tracking
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
                      placeholder="Enter order number (e.g., NATURZEN-e177e3eaa544)"
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

              {/* Order Information */}
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
                        <span className="text-sm font-medium text-gray-700">
                          Journey Progress
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          {Math.round(
                            getStatusProgress(
                              deliveryStatuses[deliveryStatuses.length - 1].status
                            )
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${getStatusProgress(
                              deliveryStatuses[deliveryStatuses.length - 1].status
                            )}%`,
                          }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2.5 rounded-full"
                        ></motion.div>
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
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              orderInfo.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-800'
                                : orderInfo.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {orderInfo.status}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-green-100">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="text-gray-900">
                            {new Date(orderInfo.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {orderInfo.tracking_number && (
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Tracking #:</span>
                            <span className="font-mono text-sm text-blue-600">
                              {orderInfo.tracking_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                        Shipping Address
                      </h3>
                      {orderInfo.shipping_address && (
                        <div className="space-y-2 text-gray-600">
                          <p className="font-medium text-gray-900">
                            {orderInfo.shipping_address.name}
                          </p>
                          <p>{orderInfo.shipping_address.address_line_1}</p>
                          {orderInfo.shipping_address.address_line_2 && (
                            <p>{orderInfo.shipping_address.address_line_2}</p>
                          )}
                          <p>
                            {orderInfo.shipping_address.area},{' '}
                            {orderInfo.shipping_address.city}
                          </p>
                          <p>
                            {orderInfo.shipping_address.state_province} -{' '}
                            {orderInfo.shipping_address.postal_code}
                          </p>
                          <p>{orderInfo.shipping_address.country}</p>
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
                          <p className="text-sm text-gray-600">
                            Estimated Arrival
                          </p>
                          <p className="text-xl font-bold text-gray-900">
                            {getEstimatedDeliveryDate()}
                          </p>
                        </div>
                      </div>
                      {orderInfo.courier_partner && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Delivery Partner</p>
                          <p className="font-semibold text-gray-900">
                            {orderInfo.courier_partner}
                          </p>
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

                      {/* Tracking Steps Visualization */}
                      <div className="mb-8 overflow-x-auto">
                        <div className="min-w-[600px]">
                          <div className="flex justify-between">
                            {getTrackingSteps().map((step, index) => (
                              <div
                                key={step.status}
                                className="flex flex-col items-center relative flex-1"
                              >
                                <div className="relative z-10">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                      deliveryStatuses.some(
                                        (s) => s.status >= step.status
                                      )
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    <step.icon className="h-6 w-6" />
                                  </div>
                                </div>
                                <p
                                  className={`text-xs mt-2 text-center font-medium ${
                                    deliveryStatuses.some(
                                      (s) => s.status >= step.status
                                    )
                                      ? 'text-green-600'
                                      : 'text-gray-400'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-xs text-gray-400 text-center hidden sm:block">
                                  {step.description}
                                </p>
                                {index < getTrackingSteps().length - 1 && (
                                  <div
                                    className={`absolute top-6 left-1/2 w-full h-0.5 ${
                                      deliveryStatuses.some(
                                        (s) => s.status > step.status
                                      )
                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                                        : 'bg-gray-200'
                                    }`}
                                    style={{ transform: 'translateX(50%)' }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

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
                              <div
                                className={`p-2 rounded-full ${getStatusColor(
                                  status.status
                                )}`}
                              >
                                {getStatusIcon(status.status)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {status.status_name}
                                </h4>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    status.status
                                  )}`}
                                >
                                  Step {status.status}/7
                                </span>
                              </div>
                              {status.notes && (
                                <p className="text-gray-600 text-sm mb-2">
                                  {status.notes}
                                </p>
                              )}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Preparing Your Wellness Package
                      </h3>
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
                transition={{ delay: index * 0.1 + 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 bg-${info.color}-100 rounded-lg group-hover:scale-110 transition-transform`}>
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">
                    {info.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Our Shipping Promise
              </h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="h-5 w-5 text-rose-600 mr-2" />
                    Conscious Processing
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Each order is handled with care and intention. Our team ensures every 
                    product is packed with love, using eco-friendly materials that honor 
                    Mother Earth.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Truck className="h-5 w-5 text-green-600 mr-2" />
                    Sustainable Delivery
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    We partner with eco-conscious logistics providers who share our 
                    commitment to reducing carbon footprint and protecting the environment.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delivery Timeframes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">
                        Standard Delivery
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">3-5 business days</p>
                    <p className="text-xs text-green-600 mt-1">Free over ₹999</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">
                        Express Delivery
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">1-2 business days</p>
                    <p className="text-xs text-blue-600 mt-1">Priority handling</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                      <span className="font-medium text-gray-900">
                        Same Day Delivery
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Available in select cities</p>
                    <p className="text-xs text-purple-600 mt-1">Order before 12 PM</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6">
                <div className="flex items-start">
                  <Droplets className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">
                      Patience is a Virtue
                    </h4>
                    <p className="text-sm text-amber-700">
                      Sometimes deliveries may take longer due to natural circumstances like weather, 
                      festivals, or high demand. We'll keep you updated every step of the way with 
                      email and SMS notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Need Help */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-gray-500 text-sm">
              Need assistance with your order? Our wellness support team is here for you.
              <a
                href="/contact"
                className="text-green-600 hover:text-green-700 font-medium hover:underline ml-1 inline-flex items-center"
              >
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