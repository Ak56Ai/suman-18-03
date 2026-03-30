// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Heart, Share2, Star, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Award, Eye, ThumbsUp, MessageCircle,
  Flag, ExternalLink, CheckCircle, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import RatingComponent from '../components/product/RatingComponent';
import CommentSection from '../components/product/CommentSection';
import ProductSpecifications from '../components/product/ProductSpecifications';
import ProductStory from '../components/product/ProductStory';
import ProductBanners from '../components/product/ProductBanners';
import RelatedProducts from '../components/product/RelatedProducts';
import ProductSchema from '../components/ProductSchema';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  image_url: string;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
  discount_percentage: number;
  returnable: boolean;
  return_policy_days: number;
  brand: string;
  size: string;
  country_of_origin: string;
  shelf_life: string;
  product_story: string;
  specifications: any[];
  banners: ProductBanner[];
  rating_average: number;
  rating_count: number;
}

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

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showImageModal, setShowImageModal] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [productBanners, setProductBanners] = useState<ProductBanner[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchProductBanners();
      checkWishlist();
      fetchUserRating();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;

      // Parse images if stored as JSON string
      let images = [];
      if (productData.images) {
        if (typeof productData.images === 'string') {
          try {
            images = JSON.parse(productData.images);
          } catch {
            images = [productData.image_url];
          }
        } else if (Array.isArray(productData.images)) {
          images = productData.images;
        } else {
          images = [productData.image_url];
        }
      } else {
        images = [productData.image_url];
      }

      setProduct({
        ...productData,
        images: images,
        banners: [] // Will be filled by fetchProductBanners
      });
      
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductBanners = async () => {
    if (!id) {
      console.log('No product ID available');
      return;
    }

    console.log('=== DEBUG: Fetching banners ===');
    console.log('Product ID:', id);
    
    try {
      const { data, error, status, statusText } = await supabase
        .from('product_banners')
        .select('*')
        .eq('product_id', id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      console.log('Supabase Response Status:', status);
      console.log('Supabase Response Status Text:', statusText);
      
      if (error) {
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        return;
      }

      console.log('Fetched banners count:', data?.length || 0);
      console.log('Fetched banners data:', data);
      
      if (data && data.length > 0) {
        setProductBanners(data);
        console.log('Banners set to state:', data);
      } else {
        console.log('No banners found for this product');
        // Set empty array to ensure component renders with no banners
        setProductBanners([]);
      }
      
    } catch (error) {
      console.error('Exception in fetchProductBanners:', error);
    }
  };

  const checkWishlist = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('wishlist')
        .select('*')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsWishlisted(!!data);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const fetchUserRating = async () => {
    if (!user || !id) return;
    
    try {
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setUserRating(data.rating);
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.image_url
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('product_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert({ product_id: id, user_id: user.id });
        
        if (error) throw error;
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Something went wrong');
    }
  };

  const calculateDiscount = () => {
    if (!product) return 0;
    return Math.round(((product.original_price - product.price) / product.original_price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!product) return null;

  const discount = calculateDiscount();
  const productImages = product.images?.length > 0 ? product.images : [product.image_url];
  // Use productBanners from state, not from product.banners
  const bannersToShow = productBanners;

  return (
    <>
      {/* 🔥 SEO Schema (Invisible) */}
      <ProductSchema product={product} />

      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="cursor-pointer hover:text-green-600" onClick={() => navigate('/')}>Home</span>
              <span>/</span>
              <span className="cursor-pointer hover:text-green-600" onClick={() => navigate('/products')}>Products</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{product.category}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Product Main Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Images */}
              <div>
                {/* Main Image */}
                <div className="relative mb-4">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-auto rounded-xl cursor-pointer border border-gray-200"
                    onClick={() => setShowImageModal(true)}
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      -{discount}%
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {productImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                          selectedImage === idx ? 'border-green-500' : 'border-gray-200 hover:border-green-300'
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div>
                {/* Brand & Title */}
                <div className="mb-4">
                  {product.brand && (
                    <p className="text-sm text-green-600 font-semibold mb-2">{product.brand}</p>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating_average || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600 font-medium">
                        {product.rating_average?.toFixed(1) || 'No'} stars
                      </span>
                    </div>
                    <span className="text-gray-400">|</span>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-blue-600 hover:underline"
                    >
                      {product.rating_count || 0} ratings
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                    {product.original_price > product.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">₹{product.original_price.toFixed(2)}</span>
                        <span className="text-green-600 font-semibold">Save ₹{(product.original_price - product.price).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {product.returnable && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="w-4 h-4 text-green-600" />
                      <span>{product.return_policy_days}-day returns</span>
                    </div>
                  )}
                  {product.shelf_life && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-green-600" />
                      <span>Shelf Life: {product.shelf_life}</span>
                    </div>
                  )}
                  {product.country_of_origin && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Origin: {product.country_of_origin}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>Free delivery</span>
                  </div>
                </div>

                {/* Size */}
                {product.size && (
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Size:</p>
                    <div className="flex gap-2 flex-wrap">
                      {product.size.split(',').map((s) => (
                        <button
                          key={s}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:border-green-500 hover:text-green-600 transition-colors"
                        >
                          {s.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Quantity:</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:border-green-500 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 border border-gray-300 rounded-lg hover:border-green-500 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-500">{product.stock} pieces available</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="inline mr-2 w-5 h-5" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={`p-3 rounded-full border transition-all ${
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-300 hover:border-red-300 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  </button>
                  <button className="p-3 rounded-full border border-gray-300 hover:border-green-500 transition-colors">
                    <Share2 className="w-6 h-6" />
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Truck className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">Free Shipping</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">Secure Payment</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-600">100% Authentic</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="border-b">
              <div className="flex overflow-x-auto">
                {['description', 'specifications', 'story', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-green-600 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'specifications' && 'Specifications'}
                    {tab === 'story' && 'Product Story'}
                    {tab === 'reviews' && 'Reviews & Comments'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
              {activeTab === 'specifications' && (
                <ProductSpecifications specifications={product.specifications} />
              )}
              {activeTab === 'story' && (
                <ProductStory story={product.product_story} images={product.images} />
              )}
              {activeTab === 'reviews' && (
                <div>
                  <RatingComponent
                    productId={product.id}
                    userRating={userRating}
                    onRatingSubmit={() => fetchUserRating()}
                    onRatingCountChange={(count) => {
                      console.log(`Total ratings: ${count}`);
                    }}
                  />
                  <CommentSection productId={product.id} />
                </div>
              )}
            </div>
          </div>

          {/* Product Banners - Use the banners from state */}
          {bannersToShow && bannersToShow.length > 0 && (
            <ProductBanners banners={bannersToShow} />
          )}

          {/* Related Products */}
          <RelatedProducts category={product.category} currentProductId={product.id} />
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-screen object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage((prev) => (prev + 1) % productImages.length);
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;