import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardAmazonProps {
  product: Product;
}

const ProductCardAmazon: React.FC<ProductCardAmazonProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const rating = 4.5;
  const reviews = Math.floor(Math.random() * 5000) + 100;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <div className="relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-56 object-cover"
        />

        {product.discount_percentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount_percentage}% off
          </div>
        )}

        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-orange-600 cursor-pointer">
          {product.name}
        </h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center bg-green-700 text-white text-xs px-2 py-0.5 rounded">
            <span className="font-semibold mr-1">{rating}</span>
            <Star className="h-3 w-3 fill-current" />
          </div>
          <span className="text-gray-500 text-xs ml-2">({reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-2xl font-medium text-gray-900">₹{product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <>
              <span className="text-sm text-gray-500 line-through">₹{product.original_price}</span>
              <span className="text-sm text-green-700 font-medium">
                ({Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off)
              </span>
            </>
          )}
        </div>

        <div className="text-xs text-gray-600 mb-3">
          Get it by <span className="font-semibold text-gray-900">
            {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-yellow-400 text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardAmazon;
