import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Sparkles, Shield, Truck, RotateCcw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { isMobileDevice } from '../../utils/deviceUtils';

interface ProductBanner {
  id: string;
  product_id: string;
  banner_url: string;
  title: string;
  description: string;
  button_link?: string;
  button_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Props {
  banners: ProductBanner[];
  productId?: string;
}

const ProductBanners: React.FC<Props> = ({ banners, productId }) => {
  const navigate = useNavigate();
  
  // Filter banners by product_id if productId is provided
  const filteredBanners = productId 
    ? banners.filter(banner => banner.product_id === productId && banner.is_active)
    : banners.filter(banner => banner.is_active);

  if (!filteredBanners || filteredBanners.length === 0) {
    return null;
  }

  // Sort by display_order
  const sortedBanners = [...filteredBanners].sort((a, b) => a.display_order - b.display_order);
  
  // Split banners into main feature and grid
  const mainBanner = sortedBanners[0];
  const gridBanners = sortedBanners.slice(1, 4);

  const handleNavigation = (buttonLink?: string) => {
    if (!buttonLink) return;
    
    const isMobile = isMobileDevice();
    
    if (isMobile) {
      // Mobile: Use React Router navigation (same window)
      // Clean the link if needed
      let cleanLink = buttonLink;
      
      // Handle query parameters
      if (cleanLink.includes('?')) {
        // For links with query params, we need to navigate with state or direct
        navigate(cleanLink);
      } else {
        navigate(cleanLink);
      }
    } else {
      // Desktop: Open in new tab
      window.open(buttonLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleButtonClick = (e: React.MouseEvent, buttonLink?: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleNavigation(buttonLink);
  };

  const handleCardClick = (buttonLink?: string) => {
    handleNavigation(buttonLink);
  };

  // For debugging - log the link being clicked
  const logLink = (link: string) => {
    console.log('Navigating to:', link);
    console.log('Is mobile:', isMobileDevice());
  };

  return (
    <div className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-1.5 h-8 rounded-full"></div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {mainBanner?.title || 'Featured Collection'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {mainBanner?.description || 'Discover our curated collection'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => handleNavigation('/products')}
          className="group flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
        >
          <span>View All</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Large Banner */}
        {mainBanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            onClick={() => {
              if (mainBanner.button_link) {
                logLink(mainBanner.button_link);
                handleCardClick(mainBanner.button_link);
              }
            }}
            className="lg:col-span-2 relative group cursor-pointer overflow-hidden rounded-2xl shadow-xl"
          >
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
              <img
                src={mainBanner.banner_url}
                alt={mainBanner.title || "Featured Collection"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&h=600&fit=crop';
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <span className="inline-block bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  Special Offer
                </span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  {mainBanner.title || "New Arrivals"}
                </h3>
                <p className="text-gray-200 text-sm md:text-base mb-4 max-w-md">
                  {mainBanner.description || "Discover our latest collection of handcrafted pieces designed to elevate your space."}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mainBanner.button_link) {
                      logLink(mainBanner.button_link);
                      handleButtonClick(e, mainBanner.button_link);
                    }
                  }}
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-full font-semibold text-sm hover:shadow-lg transition-all"
                >
                  {mainBanner.button_text || 'Shop Now'}
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Side Grid Banners */}
        <div className="space-y-6">
          {gridBanners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              onClick={() => {
                if (banner.button_link) {
                  logLink(banner.button_link);
                  handleCardClick(banner.button_link);
                }
              }}
              className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg"
            >
              <div className="relative h-[150px] md:h-[156px] overflow-hidden">
                <img
                  src={banner.banner_url}
                  alt={banner.title || "Collection"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=400&h=300&fit=crop';
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 p-5 flex flex-col justify-center">
                  <span className="inline-block bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-2 w-fit">
                    {idx === 0 ? 'Best Seller' : idx === 1 ? 'New' : 'Sale'}
                  </span>
                  <h4 className="text-white font-bold text-lg mb-1">
                    {banner.title}
                  </h4>
                  <p className="text-gray-200 text-xs mb-3 line-clamp-2">
                    {banner.description}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (banner.button_link) {
                        logLink(banner.button_link);
                        handleButtonClick(e, banner.button_link);
                      }
                    }}
                    className="text-white text-sm font-medium hover:text-green-400 transition-colors inline-flex items-center gap-1 w-fit"
                  >
                    {banner.button_text || 'Shop Now'}
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-center group">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <Truck className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Free Shipping</h4>
          <p className="text-gray-500 text-xs">
            On orders over ₹999
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-center group">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <ShoppingBag className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Easy Returns</h4>
          <p className="text-gray-500 text-xs">
            7-day return policy
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-center group">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Secure Payment</h4>
          <p className="text-gray-500 text-xs">
            100% secure transactions
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all text-center group">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
            <Sparkles className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Premium Quality</h4>
          <p className="text-gray-500 text-xs">
            Authentic products
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductBanners;