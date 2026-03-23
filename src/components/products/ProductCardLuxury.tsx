import React from 'react';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative">
        <div className="relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-72 object-cover filter brightness-90 group-hover:brightness-100 transition-all duration-700"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

          {product.discount_percentage > 0 && (
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-xl flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>-{product.discount_percentage}%</span>
              </div>
            </div>
          )}

          <div className="absolute top-6 left-6">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-xl hover:bg-white transition-colors"
            >
              <Heart className="h-5 w-5 text-gray-900" />
            </motion.button>
          </div>

          {product.featured && (
            <div className="absolute bottom-6 left-6">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-xl flex items-center space-x-1">
                <Star className="h-3 w-3 fill-current" />
                <span>FEATURED</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-green-400 uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-bold text-gray-300">4.9</span>
            </div>
          </div>

          <h3 className="font-bold text-white text-xl mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-white">₹{product.price}</span>
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-gray-500 line-through">₹{product.original_price}</span>
                )}
              </div>
              <p className="text-xs text-green-400 font-semibold mt-1">Premium Quality</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>{product.stock === 0 ? 'Unavailable' : 'Add to Cart'}</span>
            </motion.button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-bold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
              <span className="text-gray-500">SKU: {product.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCardLuxury;
