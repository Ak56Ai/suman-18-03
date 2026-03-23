import React from 'react';
import { ShoppingBag, Heart, Eye, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardModernProps {
  product: Product;
}

const ProductCardModern: React.FC<ProductCardModernProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group relative"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>

      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {product.discount_percentage > 0 && (
          <div className="absolute top-4 right-4">
            <div className="bg-red-500 text-white px-3 py-2 rounded-full font-bold text-sm shadow-lg">
              -{product.discount_percentage}%
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          >
            <Heart className="h-5 w-5 text-gray-700 hover:text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-gray-700 hover:text-blue-500" />
          </motion.button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-white text-gray-900 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Quick Add</span>
          </motion.button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center mb-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            product.category === 'ayurveda' ? 'bg-green-100 text-green-800' :
            product.category === 'recipe' ? 'bg-amber-100 text-amber-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {product.category}
          </span>
          <div className="flex items-center ml-auto">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700 ml-1">4.8</span>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.original_price}</span>
            )}
          </div>

          <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardModern;
