import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListFilter as Filter, Grid2x2 as Grid, List, SlidersHorizontal, Search, ChevronDown } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import ProductCardAmazon from '../components/products/ProductCardAmazon';
import ProductCardFlipkart from '../components/products/ProductCardFlipkart';
import ProductCardModern from '../components/products/ProductCardModern';
import ProductCardMinimal from '../components/products/ProductCardMinimal';
import ProductCardLuxury from '../components/products/ProductCardLuxury';
import toast from 'react-hot-toast';

type CardStyle = 'amazon' | 'flipkart' | 'modern' | 'minimal' | 'luxury';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardStyle, setCardStyle] = useState<CardStyle>('modern');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase.from('products').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'discount':
          query = query.order('discount_percentage', { ascending: false });
          break;
        default:
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    return matchesSearch && matchesPrice;
  });

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'ayurveda', label: 'Ayurveda' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'meditation', label: 'Meditation' },
    { value: 'recipe', label: 'Traditional Recipes' },
  ];

  const cardStyles = [
    { value: 'amazon', label: 'Amazon Style', color: 'from-orange-500 to-yellow-500' },
    { value: 'flipkart', label: 'Flipkart Style', color: 'from-blue-500 to-yellow-400' },
    { value: 'modern', label: 'Modern Style', color: 'from-green-500 to-blue-500' },
    { value: 'minimal', label: 'Minimal Style', color: 'from-gray-700 to-gray-900' },
    { value: 'luxury', label: 'Luxury Style', color: 'from-yellow-600 to-amber-700' },
  ];

  const renderProductCard = (product: Product, index: number) => {
    const cardProps = { product };

    switch (cardStyle) {
      case 'amazon':
        return <ProductCardAmazon key={product.id} {...cardProps} />;
      case 'flipkart':
        return <ProductCardFlipkart key={product.id} {...cardProps} />;
      case 'modern':
        return <ProductCardModern key={product.id} {...cardProps} />;
      case 'minimal':
        return <ProductCardMinimal key={product.id} {...cardProps} />;
      case 'luxury':
        return <ProductCardLuxury key={product.id} {...cardProps} />;
      default:
        return <ProductCardModern key={product.id} {...cardProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-gray-600">Discover our complete collection of natural wellness products</p>
        </motion.div>

        {/* Card Style Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Grid className="h-5 w-5 mr-2 text-green-600" />
              Choose Card Style
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cardStyles.map((style) => (
              <motion.button
                key={style.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCardStyle(style.value as CardStyle)}
                className={`relative overflow-hidden rounded-xl p-4 text-center transition-all ${
                  cardStyle === style.value
                    ? 'ring-4 ring-green-500 shadow-lg'
                    : 'ring-1 ring-gray-200 hover:ring-gray-300'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${style.color} opacity-10`}></div>
                <div className="relative">
                  <Grid className={`h-8 w-8 mx-auto mb-2 ${
                    cardStyle === style.value ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    cardStyle === style.value ? 'text-green-900' : 'text-gray-700'
                  }`}>
                    {style.label}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <SlidersHorizontal className="h-5 w-5 mr-2 text-green-600" />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSortBy('featured');
                    setPriceRange({ min: 0, max: 10000 });
                    setSearchQuery('');
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₹{priceRange.min}</span>
                    <span>₹{priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="featured">Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="discount">Highest Discount</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">View:</span>
                  <button className="p-2 rounded-lg bg-green-100 text-green-600">
                    <Grid className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-lg p-12 text-center"
              >
                <Filter className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {renderProductCard(product, index)}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
