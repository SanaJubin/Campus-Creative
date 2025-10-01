import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getPost, likePost, commentOnPost, deletePost } from '../../utils/api';

export default function PostDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPost(id);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        setError('Post not found');
      } else {
        setError('Failed to load post');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await likePost(post.id);
      setPost(prev => ({
        ...prev,
        likes_count: response.data.likes_count,
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const response = await commentOnPost(post.id, { content: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      setPost(prev => ({
        ...prev,
        comments_count: prev.comments_count + 1
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await deletePost(post.id);
      // Show success message
      setShowDeleteConfirm(false);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/edit-post/${post.id}`);
  };

  const isAuthor = user && post && user.username === post.author_name;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600">Post not found</h2>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Author Actions */}
          {isAuthor && (
            <div className="flex justify-end gap-4 mb-6">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <span>✏️</span>
                <span>Edit Post</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <span>🗑️</span>
                <span>Delete Post</span>
              </button>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Post Content */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            <div className="flex items-center justify-between text-gray-600 mb-4">
              <div>
                <span>By {post.author_name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                post.post_type === 'art' ? 'bg-pink-100 text-pink-800' :
                post.post_type === 'writing' ? 'bg-green-100 text-green-800' :
                post.post_type === 'photography' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {post.post_type}
              </span>
            </div>

          {post.image ? (
  <img 
    src={post.image} 
    alt={post.title}
    className="w-full h-48 object-cover rounded-lg mb-4"
    onError={(e) => {
      console.error('Image failed to load:', post.image);
      e.target.style.display = 'none';
      // Show placeholder instead
      const placeholder = document.createElement('div');
      placeholder.className = 'w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4';
      placeholder.innerHTML = '<span class="text-gray-500">Image not available</span>';
      e.target.parentNode.insertBefore(placeholder, e.target);
    }}
    onLoad={() => console.log('Image loaded successfully:', post.image)}
  />
) : (
  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
    <span className="text-gray-500">No image</span>
  </div>
)}


            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-line">{post.content}</p>
            </div>

            {/* Like Button */}
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>❤️</span>
                <span>Like ({post.likes_count || 0})</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comments ({post.comments_count || 0})
            </h2>

            {/* Add Comment Form */}
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                disabled={commentLoading}
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}