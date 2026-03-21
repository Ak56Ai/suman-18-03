// src/components/product/CommentSection.tsx
import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, Reply, Flag, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  parent_comment_id: string | null;
  likes_count: number;
  created_at: string;
  users: {
    full_name: string;
  };
  replies?: Comment[];
  isLiked?: boolean;
}

interface CommentSectionProps {
  productId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ productId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostLiked'>('newest');
  const [showAllComments, setShowAllComments] = useState(false);
  const [totalComments, setTotalComments] = useState(0);

  const INITIAL_COMMENTS_COUNT = 3;
  const displayedComments = showAllComments ? comments : comments.slice(0, INITIAL_COMMENTS_COUNT);

  useEffect(() => {
    fetchComments();
    fetchTotalCommentsCount();
  }, [productId, sortBy]);

  const fetchTotalCommentsCount = async () => {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .is('parent_comment_id', null);

    if (!error && count) {
      setTotalComments(count);
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    
    try {
      // First fetch parent comments
      let query = supabase
        .from('comments')
        .select('*')
        .eq('product_id', productId)
        .is('parent_comment_id', null);

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      } else if (sortBy === 'mostLiked') {
        query = query.order('likes_count', { ascending: false });
      }

      const { data: parentComments, error: parentError } = await query;

      if (parentError) {
        console.error('Error fetching parent comments:', parentError);
        toast.error('Failed to load comments');
        return;
      }

      if (!parentComments || parentComments.length === 0) {
        setComments([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs from parent comments
      const parentUserIds = [...new Set(parentComments.map(c => c.user_id))];
      
      // Fetch user details for parent comments
      const { data: parentUsers, error: parentUsersError } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', parentUserIds);

      if (parentUsersError) {
        console.error('Error fetching parent users:', parentUsersError);
      }

      // Create a map of user ID to user data
      const userMap = new Map();
      parentUsers?.forEach(user => {
        userMap.set(user.id, { full_name: user.full_name });
      });

      // Process each parent comment to get its replies
      const commentsWithReplies = await Promise.all(
        parentComments.map(async (parentComment) => {
          // Fetch replies for this parent comment
          const { data: replies, error: repliesError } = await supabase
            .from('comments')
            .select('*')
            .eq('parent_comment_id', parentComment.id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('Error fetching replies:', repliesError);
          }

          // Get user IDs from replies
          let repliesWithUsers: Comment[] = [];
          if (replies && replies.length > 0) {
            const replyUserIds = [...new Set(replies.map(r => r.user_id))];
            
            // Fetch user details for replies
            const { data: replyUsers, error: replyUsersError } = await supabase
              .from('users')
              .select('id, full_name')
              .in('id', replyUserIds);

            if (replyUsersError) {
              console.error('Error fetching reply users:', replyUsersError);
            }

            // Create a map for reply users
            const replyUserMap = new Map();
            replyUsers?.forEach(user => {
              replyUserMap.set(user.id, { full_name: user.full_name });
            });

            // Map replies with user data
            repliesWithUsers = replies.map(reply => ({
              ...reply,
              users: {
                full_name: replyUserMap.get(reply.user_id)?.full_name || 'Anonymous User'
              }
            }));
          }

          // Check if current user liked the parent comment
          let isLiked = false;
          if (user) {
            const { data: likeData } = await supabase
              .from('comment_likes')
              .select('*')
              .eq('comment_id', parentComment.id)
              .eq('user_id', user.id)
              .maybeSingle();
            isLiked = !!likeData;
          }

          // Return parent comment with its data
          return {
            ...parentComment,
            users: {
              full_name: userMap.get(parentComment.user_id)?.full_name || 'Anonymous User'
            },
            replies: repliesWithUsers,
            isLiked
          };
        })
      );
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error in fetchComments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          product_id: productId,
          user_id: user.id,
          content: newComment,
          parent_comment_id: null
        });

      if (error) {
        console.error('Error adding comment:', error);
        toast.error(error.message || 'Failed to add comment');
      } else {
        toast.success('Comment added!');
        setNewComment('');
        fetchComments();
        fetchTotalCommentsCount();
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!user) {
      toast.error('Please login to reply');
      return;
    }
    
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    const { error } = await supabase
      .from('comments')
      .insert({
        product_id: productId,
        user_id: user.id,
        content: replyContent,
        parent_comment_id: parentId
      });

    if (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } else {
      toast.success('Reply added!');
      setReplyContent('');
      setReplyingTo(null);
      fetchComments();
      fetchTotalCommentsCount();
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please login to like comments');
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (comment.isLiked) {
      // Unlike
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);
      
      if (!error) {
        await supabase
          .from('comments')
          .update({ likes_count: (comment.likes_count || 1) - 1 })
          .eq('id', commentId);
        toast.success('Removed like');
        fetchComments();
      }
    } else {
      // Like
      const { error } = await supabase
        .from('comment_likes')
        .insert({ comment_id: commentId, user_id: user.id });
      
      if (!error) {
        await supabase
          .from('comments')
          .update({ likes_count: (comment?.likes_count || 0) + 1 })
          .eq('id', commentId);
        toast.success('Liked comment');
        fetchComments();
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const CommentComponent: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [localReplyContent, setLocalReplyContent] = useState('');

    const handleLocalReply = async () => {
      if (!localReplyContent.trim()) return;
      
      if (!user) {
        toast.error('Please login to reply');
        return;
      }

      const { error } = await supabase
        .from('comments')
        .insert({
          product_id: productId,
          user_id: user.id,
          content: localReplyContent,
          parent_comment_id: comment.id
        });

      if (!error) {
        toast.success('Reply added!');
        setLocalReplyContent('');
        setShowReplyForm(false);
        fetchComments();
        fetchTotalCommentsCount();
      } else {
        toast.error('Failed to add reply');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${!isReply ? 'bg-white rounded-xl p-4 mb-4 border' : 'pl-8 mb-3'}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {comment.users?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <div>
                <span className="font-semibold text-gray-900">{comment.users?.full_name || 'Anonymous'}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <Flag className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-gray-700 mb-2 leading-relaxed">{comment.content}</p>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  comment.isLiked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likes_count || 0}</span>
              </button>
              
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-500"
                >
                  <Reply className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {showReplyForm && (
              <div className="mt-3">
                <textarea
                  placeholder="Write your reply..."
                  rows={2}
                  value={localReplyContent}
                  onChange={(e) => setLocalReplyContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleLocalReply}
                    className="bg-green-500 text-white px-4 py-1 rounded-full text-sm hover:bg-green-600 transition"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setLocalReplyContent('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <CommentComponent key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">Customer Comments</h3>
          <span className="text-gray-500 text-sm">({totalComments})</span>
        </div>
        
        {comments.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="mostLiked">Most liked</option>
          </select>
        )}
      </div>

      {/* Add Comment */}
      <div className="mb-8">
        <textarea
          placeholder={user ? "Write a comment..." : "Please login to comment"}
          rows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={!user}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
        />
        {user && (
          <div className="flex justify-end mt-2">
            <button
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        )}
        {!user && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            <button className="text-green-600 hover:underline">Sign in</button> to join the conversation
          </p>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {displayedComments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </AnimatePresence>
          </div>

          {!showAllComments && comments.length > INITIAL_COMMENTS_COUNT && (
            <div className="text-center pt-6">
              <button
                onClick={() => setShowAllComments(true)}
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
              >
                See all {comments.length} comments
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {showAllComments && comments.length > INITIAL_COMMENTS_COUNT && (
            <div className="text-center pt-6">
              <button
                onClick={() => setShowAllComments(false)}
                className="text-gray-500 hover:text-gray-600 font-medium inline-flex items-center gap-1"
              >
                Show less
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentSection;