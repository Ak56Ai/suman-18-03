import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Star, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'minimal' | 'featured';
  showQuickView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default',
  showQuickView = true 
}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleProductClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success(`${product.name} added to wishlist!`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // You can implement a quick view modal here
    toast.success(`Quick view coming soon!`);
  };

  const cardVariants = {
    default: "bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden",
    minimal: "bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden",
    featured: "bg-gradient-to-br from-green-50 via-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden border-2 border-green-100 hover:border-green-300"
  };

  const calculateDiscountPercentage = () => {
    if (product.original_price && product.original_price > product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return product.discount_percentage || 0;
  };

  const discount = calculateDiscountPercentage();
  const rating = product.rating_average || 4.5;
  const ratingCount = product.rating_count || 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cardVariants[variant]}
      onClick={handleProductClick}
    >
      <div className="relative overflow-hidden">
        {/* Product Image with Hover Zoom */}
        <div className="relative overflow-hidden bg-gray-100">
          <motion.img
            src={product.image_url}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {discount > 0 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              >
                -{discount}% OFF
              </motion.div>
            )}
            
            {product.featured && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                Featured
              </motion.div>
            )}
            
            {product.stock < 10 && product.stock > 0 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              >
                Only {product.stock} left
              </motion.div>
            )}
            
            {product.stock === 0 && (
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              >
                Out of Stock
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition-all duration-300 group/btn"
            >
              <Heart className="h-4 w-4 text-gray-600 group-hover/btn:text-red-500 transition-colors" />
            </motion.button>
            
            {showQuickView && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleQuickView}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-green-50 transition-all duration-300 group/btn"
              >
                <Eye className="h-4 w-4 text-gray-600 group-hover/btn:text-green-500 transition-colors" />
              </motion.button>
            )}
          </div>

          {/* Quick Add Overlay - Appears on Hover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-2.5 rounded-full font-semibold flex items-center justify-center gap-2 transition-all ${
                product.stock === 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{product.stock === 0 ? 'Out of Stock' : 'Quick Add'}</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="p-4">
        {/* Category & Brand */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            variant === 'featured' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {product.category}
          </span>
          
          {product.brand && (
            <span className="text-xs text-gray-500">
              {product.brand}
            </span>
          )}
        </div>

        {/* Product Name with Hover Effect */}
        <motion.h3 
          className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-green-600 transition-colors duration-300"
          whileHover={{ x: 5 }}
        >
          {product.name}
        </motion.h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-gray-500">({ratingCount} ratings)</span>
        </div>

        {/* Description - Only show on featured variant */}
        {variant === 'featured' && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          {product.original_price && product.original_price > product.price ? (
            <>
              <span className="text-xl font-bold text-green-600">₹{product.price}</span>
              <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
              <span className="text-xs text-green-600 font-medium">Save ₹{(product.original_price - product.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="text-xl font-bold text-green-600">₹{product.price}</span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          
          {variant === 'featured' && (
            <button
              onClick={handleQuickView}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600 transition-all"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Free Shipping Badge */}
        {product.price > 999 && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              ✓ Free Shipping
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;