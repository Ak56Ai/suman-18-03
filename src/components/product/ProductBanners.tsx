import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  banners: string[];
}

const ProductBanners: React.FC<Props> = ({ banners }) => {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Special Offers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {banners.map((banner, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative cursor-pointer group"
          >
            <img
              src={banner}
              alt={`Banner ${idx + 1}`}
              className="w-full h-48 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProductBanners;