import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, CreditCard, Truck, Eye, Download, RotateCcw, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
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
}

const MyOrdersPage = () => {
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
          // Fetch order items
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) console.error('Error fetching items:', itemsError);

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

          // Determine return status
          const hasReturn = returnData && returnData.length > 0;
          const hasCancellation = cancellationData && cancellationData.length > 0;

          return {
            ...order,
            order_items: itemsData || [],
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

  const getStatusColor = (status: string, order?: Order) => {
    // Check if order has been cancelled
    if (order?.cancellation_status?.has_cancellation) {
      return 'text-red-600 bg-red-100 border-red-200';
    }
    
    // Check if order has been returned
    if (order?.return_status?.has_return) {
      const returnStatus = order.return_status.return_data?.status;
      if (returnStatus === 'approved') {
        return 'text-orange-600 bg-orange-100 border-orange-200';
      } else if (returnStatus === 'pending') {
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      } else if (returnStatus === 'rejected') {
        return 'text-gray-600 bg-gray-100 border-gray-200';
      }
      return 'text-orange-600 bg-orange-100 border-orange-200';
    }

    // Normal status checks
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
    // Check if order has been cancelled
    if (order?.cancellation_status?.has_cancellation) {
      const cancelStatus = order.cancellation_status.cancellation_data?.status;
      if (cancelStatus === 'approved') {
        return 'Cancelled';
      } else if (cancelStatus === 'pending') {
        return 'Cancellation Requested';
      } else if (cancelStatus === 'rejected') {
        return 'Cancellation Rejected';
      }
      return 'Cancelled';
    }
    
    // Check if order has been returned
    if (order?.return_status?.has_return) {
      const returnStatus = order.return_status.return_data?.status;
      if (returnStatus === 'approved') {
        return 'Returned';
      } else if (returnStatus === 'pending') {
        return 'Return Requested';
      } else if (returnStatus === 'rejected') {
        return 'Return Rejected';
      }
      return 'Returned';
    }

    // Normal status checks
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
    // Check if order has been cancelled
    if (order?.cancellation_status?.has_cancellation) {
      return <XCircle className="h-4 w-4" />;
    }
    
    // Check if order has been returned
    if (order?.return_status?.has_return) {
      return <RefreshCw className="h-4 w-4" />;
    }

    // Normal status checks
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'COD_PENDING':
        return <Clock className="h-4 w-4" />;
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

  const formatOrderId = (order: Order | any) => {
    if (order.order_number) {
      return order.order_number;
    }
    
    if (order.id) {
      const uuidWithoutHyphens = order.id.replace(/-/g, '');
      const last12Chars = uuidWithoutHyphens.slice(-12);
      return `RKIN-${last12Chars}`;
    }
    
    return 'RKIN-XXXXXX';
  };

  const getCurrentDeliveryStatus = (deliveryTracking: any[]) => {
    if (!deliveryTracking || deliveryTracking.length === 0) return 1;
    return Math.max(...deliveryTracking.map(dt => dt.status));
  };

  const getDeliveryProgress = (deliveryTracking: any[]) => {
    if (!deliveryTracking || deliveryTracking.length === 0) return 0;
    const maxStatus = 7;
    const currentStatus = Math.max(...deliveryTracking.map(dt => dt.status));
    return (currentStatus / maxStatus) * 100;
  };

  const getReturnCancellationMessage = (order: Order) => {
    if (order.cancellation_status?.has_cancellation) {
      const cancelData = order.cancellation_status.cancellation_data;
      return {
        message: `Cancellation Request - ${cancelData?.status === 'approved' ? 'Approved' : cancelData?.status === 'pending' ? 'Pending Approval' : 'Rejected'}`,
        reason: cancelData?.reason,
        comment: cancelData?.comment,
        type: 'cancellation'
      };
    }
    
    if (order.return_status?.has_return) {
      const returnData = order.return_status.return_data;
      return {
        message: `Return Request - ${returnData?.status === 'approved' ? 'Approved' : returnData?.status === 'pending' ? 'Pending Approval' : 'Rejected'}`,
        reason: returnData?.reason,
        comment: returnData?.comment,
        type: 'return'
      };
    }
    
    return null;
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
            <RotateCcw className="h-5 w-5 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
          </div>
        </div>

        <div className="space-y-6">
          {orders.map((order, index) => {
            const returnCancelInfo = getReturnCancellationMessage(order);
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                className="bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden"
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
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
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
                          ₹{order.total_amount.toFixed(2)}
                        </p>
                        <p className="text-gray-600 text-sm flex items-center justify-end gap-1">
                          <CreditCard className="h-3 w-3" />
                          {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Return/Cancellation Info Banner */}
                  {returnCancelInfo && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      returnCancelInfo.type === 'cancellation' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-orange-50 border border-orange-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {returnCancelInfo.type === 'cancellation' ? (
                          <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        ) : (
                          <RefreshCw className="h-5 w-5 text-orange-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-medium ${
                            returnCancelInfo.type === 'cancellation' 
                              ? 'text-red-800' 
                              : 'text-orange-800'
                          }`}>
                            {returnCancelInfo.message}
                          </p>
                          {returnCancelInfo.reason && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Reason:</span> {returnCancelInfo.reason}
                            </p>
                          )}
                          {returnCancelInfo.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Comment:</span> {returnCancelInfo.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items Summary */}
                <div className="p-6">
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm mb-1">
                          {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''} in this order
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {order.order_items.slice(0, 3).map((item, idx) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-sm text-gray-700 shadow-sm"
                            >
                              <Package className="h-3 w-3 text-green-500" />
                              {item.product_name}
                              <span className="text-gray-400">x{item.quantity}</span>
                            </span>
                          ))}
                          {order.order_items.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600">
                              +{order.order_items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery Progress - Only show if not cancelled/returned */}
                      {!order.cancellation_status?.has_cancellation && !order.return_status?.has_return && (
                        <div className="min-w-[200px]">
                          <div className="text-sm text-gray-600 mb-1">Delivery Progress</div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-green-600" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getDeliveryProgress(order.delivery_tracking || [])}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-green-600">
                              {getCurrentDeliveryStatus(order.delivery_tracking || [])}/7
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/order-success/${order.id}`}
                      className="flex items-center justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                    
                    <button className="flex items-center justify-center border-2 border-green-600 text-green-600 px-4 py-2.5 rounded-lg font-medium hover:bg-green-600 hover:text-white transition-all duration-300">
                      <Download className="h-4 w-4 mr-2" />
                      Download Invoice
                    </button>

                    {!order.cancellation_status?.has_cancellation && !order.return_status?.has_return && (
                      <Link
                        to={`/track-order/${order.id}`}
                        className="flex items-center justify-center border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300"
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Link>
                    )}
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