import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CircleCheck as CheckCircle, Clock, MapPin } from 'lucide-react';

interface DeliveryStatus {
  id: string;
  order_id: string;
  status: number;
  status_name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderTimelineProps {
  deliveryStatus?: DeliveryStatus[];
  currentStatus: number;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ deliveryStatus = [], currentStatus = 1 }) => {
  const statusSteps = [
    { step: 1, name: 'Order Placed', icon: CheckCircle, description: 'Your order has been confirmed' },
    { step: 2, name: 'Processing', icon: Clock, description: 'We are preparing your order' },
    { step: 3, name: 'Packed', icon: Package, description: 'Your order has been packed' },
    { step: 4, name: 'Shipped', icon: Truck, description: 'Your order is on the way' },
    { step: 5, name: 'Out for Delivery', icon: MapPin, description: 'Your order is out for delivery' },
    { step: 6, name: 'Delivered', icon: CheckCircle, description: 'Your order has been delivered' },
    { step: 7, name: 'Completed', icon: CheckCircle, description: 'Order completed successfully' }
  ];

  const getStatusDate = (step: number) => {
    const status = deliveryStatus.find(s => s.status === step);
    return status ? new Date(status.updated_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : null;
  };

  const getStatusNotes = (step: number) => {
    const status = deliveryStatus.find(s => s.status === step);
    return status?.notes;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-6">
        <Truck className="h-6 w-6 text-green-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Order Timeline</h2>
      </div>

      <div className="space-y-6">
        {statusSteps.map((step, index) => {
          const isCompleted = step.step <= currentStatus;
          const isCurrent = step.step === currentStatus;
          const statusDate = getStatusDate(step.step);
          const statusNotes = getStatusNotes(step.step);
          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start"
            >
              <div className="flex flex-col items-center mr-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`w-0.5 h-12 mt-2 ${
                    step.step < currentStatus ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${
                    isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </h3>
                  {statusDate && (
                    <span className="text-sm text-gray-500">{statusDate}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                {statusNotes && (
                  <p className="text-green-600 text-sm mt-1 font-medium">{statusNotes}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;