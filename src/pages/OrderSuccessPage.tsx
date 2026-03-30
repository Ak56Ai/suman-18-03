import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Package, Truck, Calendar, Download, ArrowRight, 
  MapPin, CreditCard, Clock, ShoppingBag, ChevronRight, 
  Printer, Share2, HelpCircle, Shield, ThumbsUp, Award,
  Receipt, Building, FileText, Percent
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import HorizontalTimeline from '../components/order/HorizontalTimeline';
import { generateInvoicePDF } from '../lib/invoiceGenerator';
import toast from 'react-hot-toast';
import logo from '../../public/Logo1.png';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [deliveryTracking, setDeliveryTracking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // GST Calculation (18% GST)
  const calculateGST = (amount: number) => {
    const gstRate = 0.18; // 18% GST
    const cgst = (amount * gstRate) / 2;
    const sgst = (amount * gstRate) / 2;
    return {
      totalGST: amount * gstRate,
      cgst: cgst,
      sgst: sgst,
      rate: 18
    };
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products (
            id,
            name,
            image_url,
            images,
            price,
            description,
            category,
            gst_percentage
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const processedItems = (itemsData || []).map(item => {
        let productImage = 'https://via.placeholder.com/100?text=Product';
        
        if (item.product) {
          if (item.product.image_url) {
            productImage = item.product.image_url;
          } else if (item.product.images) {
            try {
              const images = typeof item.product.images === 'string' 
                ? JSON.parse(item.product.images) 
                : item.product.images;
              if (images && images.length > 0) {
                productImage = images[0];
              }
            } catch (e) {
              console.error('Error parsing images:', e);
            }
          }
        }
        
        return {
          ...item,
          image_url: productImage,
          product_name: item.product?.name || item.product_name,
          product_price: item.product?.price || item.price,
          gst_percentage: item.product?.gst_percentage || 18
        };
      });

      const uniqueItems = [];
      const seenProductIds = new Set();
      
      for (const item of processedItems) {
        if (!seenProductIds.has(item.product_id)) {
          seenProductIds.add(item.product_id);
          uniqueItems.push(item);
        }
      }

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

  const formatOrderId = () => {
    if (!order) return 'RKIN-XXXXX';
    if (order.order_number) return order.order_number;
    
    if (order.created_at) {
      const date = new Date(order.created_at);
      const yy = date.getFullYear().toString().slice(-2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');
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
      const orderWithDisplay = { ...order, display_id: formatOrderId() };
      generateInvoicePDF(orderWithDisplay);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Order link copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'COD_PENDING':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payment Successful';
      case 'COD_PENDING':
        return 'Order Confirmed - Cash on Delivery';
      case 'PENDING':
        return 'Payment Pending';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'COD_PENDING':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Package className="h-5 w-5 text-yellow-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate totals with GST
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const gstDetails = calculateGST(subtotal);
  const shipping = 0; // Free shipping
  const total = subtotal + gstDetails.totalGST + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <Link to="/" className="text-green-600 hover:text-green-700 inline-flex items-center gap-2">
            Return to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Logo and Order Status */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="NaturZen" className="h-12 w-auto" />
              <div className="h-8 w-px bg-gray-300 hidden md:block" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                <p className="text-sm text-gray-500">Order #{formatOrderId()}</p>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="font-medium">{getStatusText(order.status)}</span>
            </div>
          </div>
        </div>

        {/* Order Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Placed</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(order.created_at)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-sm font-semibold text-gray-900">₹{total.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Estimated Delivery</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Order Items (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Items in Your Order</h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {orderItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex gap-4">
                      <div 
                        onClick={() => navigate(`/product/${item.product_id}`)}
                        className="cursor-pointer flex-shrink-0"
                      >
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/100?text=Product';
                          }}
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h3 
                              onClick={() => navigate(`/product/${item.product_id}`)}
                              className="font-semibold text-gray-900 hover:text-green-600 cursor-pointer transition-colors"
                            >
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">₹{item.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">
                              ₹{(item.price * item.quantity).toFixed(2)} total
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-3">
                          <button 
                            onClick={() => navigate(`/product/${item.product_id}`)}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            Buy Again
                          </button>
                          <button className="text-xs text-gray-500 hover:text-gray-700">
                            Write a Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Order Summary Footer with GST */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Percent className="h-3 w-3" />
                      <span>GST ({gstDetails.rate}%)</span>
                    </div>
                    <span className="text-gray-900">₹{gstDetails.totalGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-500 text-xs">CGST ({gstDetails.rate/2}%)</span>
                    <span className="text-gray-500 text-xs">₹{gstDetails.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-500 text-xs">SGST ({gstDetails.rate/2}%)</span>
                    <span className="text-gray-500 text-xs">₹{gstDetails.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">₹{total.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download Invoice</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Right Column - Shipping Address */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="font-semibold text-gray-900">
                  {order.shipping_address?.fullName || order.shipping_address?.name}
                </p>
                <p className="text-gray-600 mt-1">
                  {order.shipping_address?.address || order.shipping_address?.address_line_1}
                </p>
                {order.shipping_address?.address_line_2 && (
                  <p className="text-gray-600">{order.shipping_address.address_line_2}</p>
                )}
                <p className="text-gray-600">
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode || order.shipping_address?.postal_code}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-medium">Phone:</span> {order.shipping_address?.phone}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {order.shipping_address?.email}
                </p>
              </div>
            </motion.div>
            
            {/* GST Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Tax Invoice</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GSTIN:</span>
                  <span className="text-gray-900 font-mono text-xs">No Data</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">PAN:</span>
                  <span className="text-gray-900 font-mono text-xs">No Data</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">HSN Code:</span>
                  <span className="text-gray-900">3304.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxable Value:</span>
                    <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">IGST/GST:</span>
                    <span className="text-gray-900">₹{gstDetails.totalGST.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Need Help Section */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Have questions about your order? We're here to help!
                  </p>
                  <Link to="/contact" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                    Contact Support
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Horizontal Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 overflow-hidden"
        >
          <div className="flex items-center gap-2 mb-6">
            <Truck className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Tracking</h2>
          </div>
          <HorizontalTimeline 
            deliveryStatus={deliveryTracking} 
            currentStatus={getCurrentDeliveryStatus()} 
          />
        </motion.div>

        
        {/* Thank You Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-full">
                <ThumbsUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Thank You for Shopping with NaturZen!</h3>
                <p className="text-sm text-gray-600">We hope you enjoy your products. Your wellness journey continues!</p>
              </div>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
        
        {/* Trust Badges */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secure Shopping</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Truck className="h-4 w-4 text-green-600" />
            <span>Free Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>7-Day Returns</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4 text-green-600" />
            <span>100% Authentic</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;