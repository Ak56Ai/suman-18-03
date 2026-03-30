import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, Calendar, CreditCard, Truck, Eye, Download, RotateCcw, 
  CheckCircle, Clock, RefreshCw, XCircle, ArrowRight, 
  ShoppingBag, Percent, Receipt, MapPin, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: any[];
  delivery_tracking?: any[];
  return_status?: {
    has_return: boolean;
    return_data?: any;
  };
  cancellation_status?: {
    has_cancellation: boolean;
    cancellation_data?: any;
  };
  shipping_address?: any;
}

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        toast.error('Please login to view orders');
        return;
      }

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          // Fetch order items with product details including images
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products (
                id,
                name,
                image_url,
                images,
                price
              )
            `)
            .eq('order_id', order.id);

          if (itemsError) console.error('Error fetching items:', itemsError);

          // Process items to include product images
          const processedItems = (itemsData || []).map(item => {
            let productImage = 'https://via.placeholder.com/80?text=Product';
            
            // Get image from product data
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
              product_id: item.product?.id || item.product_id
            };
          });

          // Fetch delivery tracking
          const { data: trackingData, error: trackingError } = await supabase
            .from('delivery_tracking')
            .select('*')
            .eq('order_id', order.id)
            .order('created_at', { ascending: true });

          if (trackingError) console.error('Error fetching tracking:', trackingError);

          // Check for returns
          const { data: returnData, error: returnError } = await supabase
            .from('order_returns')
            .select('*')
            .eq('order_id', order.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (returnError) console.error('Error fetching returns:', returnError);

          // Check for cancellations
          const { data: cancellationData, error: cancellationError } = await supabase
            .from('order_cancellations')
            .select('*')
            .eq('order_id', order.id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (cancellationError) console.error('Error fetching cancellations:', cancellationError);

          const hasReturn = returnData && returnData.length > 0;
          const hasCancellation = cancellationData && cancellationData.length > 0;

          return {
            ...order,
            order_items: processedItems || [],
            delivery_tracking: trackingData || [],
            return_status: {
              has_return: hasReturn,
              return_data: hasReturn ? returnData[0] : null
            },
            cancellation_status: {
              has_cancellation: hasCancellation,
              cancellation_data: hasCancellation ? cancellationData[0] : null
            }
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Calculate GST (18%)
  const calculateGST = (amount: number) => {
    const gstRate = 0.18;
    return {
      totalGST: amount * gstRate,
      cgst: (amount * gstRate) / 2,
      sgst: (amount * gstRate) / 2,
      rate: 18
    };
  };

  const getStatusColor = (status: string, order?: Order) => {
    if (order?.cancellation_status?.has_cancellation) {
      return 'text-red-600 bg-red-100 border-red-200';
    }
    
    if (order?.return_status?.has_return) {
      const returnStatus = order.return_status.return_data?.status;
      if (returnStatus === 'approved') {
        return 'text-orange-600 bg-orange-100 border-orange-200';
      } else if (returnStatus === 'pending') {
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      }
      return 'text-orange-600 bg-orange-100 border-orange-200';
    }

    switch (status) {
      case 'PAID':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'COD_PENDING':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      case 'DELIVERED':
        return 'text-emerald-600 bg-emerald-100 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusText = (status: string, order?: Order) => {
    if (order?.cancellation_status?.has_cancellation) {
      const cancelStatus = order.cancellation_status.cancellation_data?.status;
      if (cancelStatus === 'approved') return 'Cancelled';
      if (cancelStatus === 'pending') return 'Cancellation Requested';
      return 'Cancelled';
    }
    
    if (order?.return_status?.has_return) {
      const returnStatus = order.return_status.return_data?.status;
      if (returnStatus === 'approved') return 'Returned';
      if (returnStatus === 'pending') return 'Return Requested';
      return 'Returned';
    }

    switch (status) {
      case 'PAID':
        return 'Payment Successful';
      case 'COD_PENDING':
        return 'Order Confirmed - COD';
      case 'PENDING':
        return 'Payment Pending';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string, order?: Order) => {
    if (order?.cancellation_status?.has_cancellation) {
      return <XCircle className="h-4 w-4" />;
    }
    if (order?.return_status?.has_return) {
      return <RefreshCw className="h-4 w-4" />;
    }
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'COD_PENDING':
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getDispatchStatus = (order: Order) => {
    if (order.cancellation_status?.has_cancellation) return 'Cancelled';
    if (order.return_status?.has_return) return 'Returned';
    
    const tracking = order.delivery_tracking;
    if (!tracking || tracking.length === 0) return 'Processing';
    
    const lastStatus = tracking[tracking.length - 1];
    return lastStatus.status_name || 'Processing';
  };

  const formatOrderId = (order: Order | any) => {
    if (order.order_number) return order.order_number;
    if (order.id) {
      const uuidWithoutHyphens = order.id.replace(/-/g, '');
      const last12Chars = uuidWithoutHyphens.slice(-12);
      return `RKIN-${last12Chars}`;
    }
    return 'RKIN-XXXXXX';
  };

  const getDeliveryProgress = (deliveryTracking: any[]) => {
    if (!deliveryTracking || deliveryTracking.length === 0) return 0;
    const maxStatus = 7;
    const currentStatus = Math.max(...deliveryTracking.map(dt => dt.status));
    return (currentStatus / maxStatus) * 100;
  };

  // Handle product click - navigate to product detail page
  const handleProductClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent triggering order click
    navigate(`/product/${productId}`);
  };

  // Handle order click - navigate to order success page
  const handleOrderClick = (orderId: string) => {
    navigate(`/order-success/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <Package className="h-24 w-24 text-green-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
              <p className="text-gray-600 mb-8 text-lg">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Link
                to="/"
                className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Shopping
                <Truck className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <span className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
            </div>
            <button onClick={() => fetchOrders()} className="hover:rotate-180 transition-transform duration-300">
              <RotateCcw className="h-5 w-5 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order, index) => {
            const subtotal = order.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const gstDetails = calculateGST(subtotal);
            const finalAmount = subtotal + gstDetails.totalGST;
            const dispatchStatus = getDispatchStatus(order);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                onClick={() => handleOrderClick(order.id)}
                className="bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group h-full flex flex-col"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-full">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {formatOrderId(order)}
                        </h3>
                        <p className="text-gray-600 text-sm flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-green-500" />
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status, order)}`}>
                        {getStatusIcon(order.status, order)}
                        {getStatusText(order.status, order)}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-green-600">
                          ₹{finalAmount.toFixed(2)}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center justify-end gap-1">
                          <CreditCard className="h-3 w-3" />
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items with Images */}
                <div className="p-6 flex-1">
                  <div className="space-y-4">
                    {/* Show up to 2 items */}
                    {order.order_items.slice(0, 2).map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="flex gap-4 items-center group/item cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                        onClick={(e) => handleProductClick(e, item.product_id)}
                      >
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/80?text=Product';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 hover:text-green-600 transition-colors line-clamp-2">
                            {item.product_name}
                          </h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    
                    {order.order_items.length > 2 && (
                      <div className="text-center text-sm text-gray-500">
                        +{order.order_items.length - 2} more items
                      </div>
                    )}
                  </div>

                  {/* Order Summary with GST */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Subtotal</p>
                        <p className="text-sm font-semibold text-gray-900">₹{subtotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Percent className="h-3 w-3" />
                          GST ({gstDetails.rate}%)
                        </p>
                        <p className="text-sm font-semibold text-gray-900">₹{gstDetails.totalGST.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Shipping</p>
                        <p className="text-sm font-semibold text-green-600">FREE</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold">Total</p>
                        <p className="text-lg font-bold text-green-600">₹{finalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch Status & Delivery Progress */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          dispatchStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                          dispatchStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          dispatchStatus === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {dispatchStatus}
                        </span>
                      </div>
                      
                      {!order.cancellation_status?.has_cancellation && !order.return_status?.has_return && (
                        <div className="flex-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Progress</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-green-600 to-emerald-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${getDeliveryProgress(order.delivery_tracking || [])}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-green-600">
                              {Math.round(getDeliveryProgress(order.delivery_tracking || []))}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-end">
                      <div className="flex items-center text-green-600 group-hover:text-green-700 font-medium text-sm">
                        View Order Details
                        <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;