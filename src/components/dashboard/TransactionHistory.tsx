import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ListFilter as Filter, Download, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  order_id: string;
  payment_method: string;
  payment_status: string;
  amount: number;
  created_at: string;
  order: {
    id: string;
    total_amount: number;
    status: string;
  };
}

interface TransactionHistoryProps {
  userId: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, [userId]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_logs')
        .select(`
          *,
          order:orders(id, total_amount, status)
        `)
        .eq('order.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'razorpay':
        return '💳';
      case 'cod':
        return '💵';
      default:
        return '💰';
    }
  };

  const formatOrderId = (orderId: string) => {
    const lastPart = orderId.split('-').pop() || '';
    return `RKIN-${lastPart}`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.payment_status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-300 rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CreditCard className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Transactions</option>
              <option value="success">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { 
            label: 'Total Spent', 
            value: `₹${transactions.filter(t => t.payment_status === 'SUCCESS').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`,
            color: 'bg-green-500'
          },
          { 
            label: 'Total Orders', 
            value: transactions.length.toString(),
            color: 'bg-blue-500'
          },
          { 
            label: 'Pending Payments', 
            value: transactions.filter(t => t.payment_status === 'PENDING').length.toString(),
            color: 'bg-yellow-500'
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center">
              <div className={`${stat.color} p-2 rounded-full mr-3`}>
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getPaymentMethodIcon(transaction.payment_method)}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        Order {formatOrderId(transaction.order_id)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.payment_status)}`}>
                        {transaction.payment_status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      
                      <div>
                        Method: {transaction.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{transaction.amount.toFixed(2)}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={() => window.location.href = `/order-success/${transaction.order_id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Order
                    </button>
                    
                    {transaction.payment_status === 'SUCCESS' && (
                      <button className="text-green-600 hover:text-green-700 text-sm flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;