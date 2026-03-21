// src/components/product/RatingComponent.tsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface RatingProps {
  productId: string;
  userRating: number | null;
  onRatingSubmit: () => void;
  onRatingCountChange?: (count: number) => void;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  user_id: string;
  verified_purchase: boolean;
  created_at: string;
  users: {
    full_name: string;
  };
}

const RatingComponent: React.FC<RatingProps> = ({ 
  productId, 
  userRating, 
  onRatingSubmit,
  onRatingCountChange 
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(userRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allRatings, setAllRatings] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  const INITIAL_REVIEWS_COUNT = 2;
  const displayedReviews = showAllReviews ? allRatings : allRatings.slice(0, INITIAL_REVIEWS_COUNT);

  useEffect(() => {
    fetchRatings();
  }, [productId]);

  useEffect(() => {
    if (userRating) setRating(userRating);
  }, [userRating]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      
      // First fetch ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (ratingsError) {
        console.error('Error fetching ratings:', ratingsError);
        toast.error('Failed to load ratings');
        return;
      }

      if (ratingsData && ratingsData.length > 0) {
        // Fetch user details separately for each rating
        const userIds = [...new Set(ratingsData.map(r => r.user_id))];
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
        }

        // Combine the data
        const userMap = new Map();
        usersData?.forEach(user => {
          userMap.set(user.id, user);
        });

        const combinedData = ratingsData.map(rating => ({
          ...rating,
          users: {
            full_name: userMap.get(rating.user_id)?.full_name || 'Anonymous User'
          }
        }));

        setAllRatings(combinedData);
        if (onRatingCountChange) onRatingCountChange(combinedData.length);
        
        // Calculate statistics
        const total = combinedData.length;
        const sum = combinedData.reduce((acc, r) => acc + r.rating, 0);
        const average = total > 0 ? sum / total : 0;
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        combinedData.forEach(r => {
          distribution[r.rating as keyof typeof distribution]++;
        });
        
        setRatingStats({ average, total, distribution });
      } else {
        setAllRatings([]);
        setRatingStats({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
    } catch (error) {
      console.error('Error in fetchRatings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login to rate this product');
      return;
    }
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check if user already rated
      const { data: existingRating, error: fetchError } = await supabase
        .from('ratings')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing rating:', fetchError);
      }

      let error;
      if (existingRating) {
        // Update existing rating
        const { error: updateError } = await supabase
          .from('ratings')
          .update({
            rating,
            title,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);
        error = updateError;
        
        if (!error) {
          toast.success('Review updated successfully!');
        }
      } else {
        // Insert new rating
        const { error: insertError } = await supabase
          .from('ratings')
          .insert({
            product_id: productId,
            user_id: user.id,
            rating,
            title,
            comment,
            verified_purchase: false
          });
        error = insertError;
        
        if (!error) {
          toast.success('Review submitted successfully!');
        }
      }
      
      if (error) {
        console.error('Error submitting rating:', error);
        throw error;
      }
      
      // Refresh ratings
      await fetchRatings();
      onRatingSubmit();
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {ratingStats.average.toFixed(1)}
            </div>
            <div className="flex items-center justify-center md:justify-start mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(ratingStats.average)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-600">
              {ratingStats.total} global ratings
            </div>
          </div>
          
          <div>
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600 w-6">{star}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{
                      width: `${ratingStats.total > 0 ? (ratingStats.distribution[star as keyof typeof ratingStats.distribution] / ratingStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12">
                  {ratingStats.distribution[star as keyof typeof ratingStats.distribution]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write a Review Section */}
      {user && (
        <div className="border rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-2">Your Rating *</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Review title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <textarea
              placeholder="What did you like or dislike about this product? What did you use it for?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : userRating ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {/* Customer Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          {allRatings.length > 0 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
            >
              {showAllReviews ? (
                <>
                  Show less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  See all {allRatings.length} reviews <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>

        {allRatings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.users?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{review.users?.full_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            {review.verified_purchase && (
                              <span className="text-xs text-green-600 ml-2">✓ Verified Purchase</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-semibold text-gray-800 mt-2">{review.title}</h4>
                      )}
                      <p className="text-gray-600 mt-2 leading-relaxed">{review.comment}</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>Helpful</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                          <Flag className="w-4 h-4" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {!showAllReviews && allRatings.length > INITIAL_REVIEWS_COUNT && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllReviews(true)}
                  className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                >
                  See all {allRatings.length} reviews
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingComponent;