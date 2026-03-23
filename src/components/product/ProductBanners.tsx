import React from 'react';
import { motion } from 'framer-motion';

interface Banner {
  id: string;
  banner_url: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface Props {
  banners: Banner[];
}

const ProductBanners: React.FC<Props> = ({ banners }) => {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-1 h-6 rounded-full"></div>
        <h3 className="text-xl font-bold text-gray-900">Special Offers</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner, idx) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="relative cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <img
              src={banner.banner_url}
              alt={banner.title || `Special Offer ${idx + 1}`}
              className="w-full h-56 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Special+Offer';
              }}
            />
            
            {/* Overlay with title and description */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {banner.title && (
                  <p className="font-bold text-lg mb-1">{banner.title}</p>
                )}
                {banner.description && (
                  <p className="text-sm text-gray-200">{banner.description}</p>
                )}
              </div>
            </div>
            
            {/* Simple overlay on hover without text */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductBanners;