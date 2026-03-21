import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  story: string;
  images?: string[];
}

const ProductStory: React.FC<Props> = ({ story, images }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Product Story</h3>
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6">{story}</p>
        
        {images && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {images.slice(0, 4).map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt={`Story ${idx + 1}`}
                className="rounded-xl w-full h-64 object-cover cursor-pointer hover:opacity-90 transition"
                whileHover={{ scale: 1.05 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStory;