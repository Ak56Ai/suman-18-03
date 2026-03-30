import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Truck, MapPin, Home, Gift } from 'lucide-react';

interface TimelineStep {
  status: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  date?: string;
}

interface HorizontalTimelineProps {
  deliveryStatus: any[];
  currentStatus: number;
}

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({ deliveryStatus, currentStatus }) => {
  const steps: TimelineStep[] = [
    {
      status: 1,
      name: 'Order Placed',
      description: 'Your order has been confirmed',
      icon: <Package className="h-5 w-5" />,
    },
    {
      status: 2,
      name: 'Processing',
      description: 'Order is being processed',
      icon: <Gift className="h-5 w-5" />,
    },
    {
      status: 3,
      name: 'Shipped',
      description: 'Order has been shipped',
      icon: <Truck className="h-5 w-5" />,
    },
    {
      status: 4,
      name: 'Out for Delivery',
      description: 'Out for delivery',
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      status: 5,
      name: 'Delivered',
      description: 'Order delivered',
      icon: <Home className="h-5 w-5" />,
    },
  ];

  // Get actual delivery dates from tracking data
  const getStepDate = (status: number) => {
    const tracking = deliveryStatus.find(t => t.status === status);
    return tracking?.created_at ? new Date(tracking.created_at).toLocaleDateString() : null;
  };

  // Determine if step is completed
  const isCompleted = (status: number) => {
    return currentStatus >= status;
  };

  // Determine if step is current
  const isCurrent = (status: number) => {
    return currentStatus === status;
  };

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[600px] md:min-w-full">
        <div className="relative flex items-center justify-between">
          {/* Connecting Lines Background */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2" />
          
          {/* Steps */}
          {steps.map((step, index) => (
            <div key={step.status} className="relative flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                  isCompleted(step.status)
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                    : isCurrent(step.status)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-100'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted(step.status) && step.status !== currentStatus ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </motion.div>

              {/* Step Content */}
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold ${
                  isCompleted(step.status) 
                    ? 'text-green-700' 
                    : isCurrent(step.status) 
                    ? 'text-blue-700' 
                    : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-[100px]">
                  {step.description}
                </p>
                {getStepDate(step.status) && (
                  <p className="text-xs text-gray-400 mt-1">
                    {getStepDate(step.status)}
                  </p>
                )}
              </div>

              {/* Connecting Line (Active) */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 transition-all duration-500 ${
                    isCompleted(step.status) && isCompleted(steps[index + 1].status)
                      ? 'bg-green-600'
                      : 'bg-gray-200'
                  }`}
                  style={{ left: '50%', width: '100%' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalTimeline;