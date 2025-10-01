import { useState, useEffect } from 'react';
import Link from 'next/link';
import { likePost } from '../utils/api'; // Direct import

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [loading, setLoading] = useState(false);

  // Check if user has liked this post
  useEffect(() => {
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
    setIsLiked(likedPosts[post.id] || false);
  }, [post.id]);

  const handleLike = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (loading) return;
    
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to like posts');
      return;
    }
    
    setLoading(true);
    try {
      const response = await likePost(post.id);
      
      if (response.data.status === 'liked') {
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        // Store in localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        likedPosts[post.id] = true;
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      } else {
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        // Remove from localStorage
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '{}');
        delete likedPosts[post.id];
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.response?.status === 401) {
        alert('Please login to like posts');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      {/* Post Image */}
      {post.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.image_url} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      
      {/* Post Content */}
      <div className="p-6">
        {/* Category and Date */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
            {post.post_type}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          <Link href={`/posts/${post.id}`}>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">
              {post.title}
            </span>
          </Link>
        </h3>
        
        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
        
        {/* Author and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Like and Comment Buttons */}
          <div className="flex items-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loading}
              className={`flex items-center space-x-2 transition-all ${
                isLiked 
                  ? 'text-red-600 transform scale-110' 
                  : 'text-gray-500 hover:text-red-600 hover:scale-105'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg 
                className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} 
                fill={isLiked ? 'currentColor' : 'none'} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={isLiked ? 0 : 2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            
            {/* Comment Button */}
            <Link href={`/posts/${post.id}`}>
              <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="text-sm font-medium">{post.comments_count || 0}</span>
              </button>
            </Link>
          </div>
          
          {/* Author */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{post.author_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}