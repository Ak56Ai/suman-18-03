import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search, Package, Leaf } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFoundPage = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          {/* Animated 404 */}
          <div className="relative mb-8">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="text-9xl md:text-9xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent"
            >
              404
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-4 -right-4 md:top-0 md:right-0"
            >
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2 shadow-lg">
                <Search className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              The page <span className="font-mono text-green-600 bg-green-50 px-2 py-1 rounded">{pathname}</span> doesn't exist or has been moved.
            </p>
            <p className="text-gray-500">
              Don't worry, we'll help you find your way back to wellness.
            </p>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              You might be looking for:
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Products', path: '/products' },
                { name: 'My Orders', path: '/my-orders' },
                { name: 'Cart', path: '/cart' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact', path: '/contact' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 bg-gray-50 hover:bg-green-50 rounded-lg text-gray-700 hover:text-green-600 transition-all duration-300 text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Home className="h-5 w-5" />
                Go to Homepage
              </motion.button>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto border-2 border-green-600 text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Need assistance? <Link to="/contact" className="text-green-600 hover:text-green-700 font-medium hover:underline">Contact our support team</Link>
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFoundPage;