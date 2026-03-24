import React from 'react';
import { ShoppingCart, Heart, Star, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProductCardLuxuryProps {
  product: Product;
}

const ProductCardLuxury: React.FC<ProductCardLuxuryProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`${product.name} added to wishlist!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
    >
      {/* Premium Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ padding: '2px' }}>
        <div className="absolute inset-0 bg-white rounded-2xl" />
      </div>

      <div className="relative bg-white rounded-2xl overflow-hidden">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Link to={`/product/${product.id}`}>
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Discount Badge */}
          {product.discount_percentage > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg flex items-center space-x-1"
              >
                <Sparkles className="h-3 w-3" />
                <span>-{product.discount_percentage}%</span>
              </motion.div>
            </div>
          )}

          {/* Wishlist Button */}
          <div className="absolute top-4 left-4 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 group/btn"
            >
              <Heart className="h-5 w-5 text-gray-600 group-hover/btn:text-red-500 transition-colors" />
            </motion.button>
          </div>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current" />
                <span>FEATURED</span>
              </div>
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
            <Link to={`/product/${product.id}`}>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
              >
                Quick View
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category and Rating */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />
              <span className="text-xs font-bold text-gray-700">4.9</span>
              <span className="text-xs text-gray-400">(128)</span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Price Section */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                )}
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <p className="text-xs text-green-600 font-semibold">Premium Quality</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span className="text-xs text-gray-500">Authentic</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group/btn"
          >
            <ShoppingCart className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </motion.button>

          {/* Stock Status */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-mono">
                SKU: {product.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardLuxury;