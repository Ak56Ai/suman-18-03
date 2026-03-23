import React from 'react';
import { Star, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardFlipkartProps {
  product: Product;
}

const ProductCardFlipkart: React.FC<ProductCardFlipkartProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const rating = (4 + Math.random()).toFixed(1);
  const reviews = Math.floor(Math.random() * 10000) + 500;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-sm border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      <div className="relative bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-60 object-contain p-4"
        />

        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors">
          <Heart className="h-4 w-4 text-gray-700 hover:text-red-500" />
        </button>

        {product.discount_percentage > 0 && (
          <div className="absolute bottom-3 left-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-r">
            {product.discount_percentage}% OFF
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
          {product.name}
        </h3>

        <div className="flex items-center mb-2">
          <div className="flex items-center bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded">
            {rating}
            <Star className="h-3 w-3 ml-1 fill-current" />
          </div>
          <span className="text-gray-500 text-xs ml-2">
            ({reviews.toLocaleString()} ratings)
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
                <span className="text-sm text-green-600 font-semibold">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-green-600 font-medium mt-1">Free delivery</p>
        </div>

        {product.stock < 10 && product.stock > 0 && (
          <div className="flex items-center text-xs text-orange-600 font-medium mb-3">
            <Zap className="h-3 w-3 mr-1" />
            Only {product.stock} left in stock
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 rounded font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {product.stock === 0 ? 'Out of Stock' : 'ADD TO CART'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCardFlipkart;
