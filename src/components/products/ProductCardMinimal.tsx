import React from 'react';
import { Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardMinimalProps {
  product: Product;
}

const ProductCardMinimal: React.FC<ProductCardMinimalProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group"
    >
      <div className="relative bg-gray-50 p-6">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-56 object-contain transform group-hover:scale-105 transition-transform duration-500"
        />

        {product.discount_percentage > 0 && (
          <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">
            SAVE {product.discount_percentage}%
          </div>
        )}

        <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
          <Heart className="h-4 w-4 text-gray-700" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-gray-400 line-through">₹{product.original_price}</span>
              )}
            </div>
            <p className="text-xs text-green-600 font-medium mt-1">Free Shipping</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Bag'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="p-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </span>
            <span className="uppercase tracking-wide">{product.category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardMinimal;
