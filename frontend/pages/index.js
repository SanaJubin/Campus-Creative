import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import FilterSort from '../components/FilterSort';
import { getPosts, getComments, api } from '../utils/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [filters, setFilters] = useState({
    post_type: 'all',
    sort: 'newest'
  });
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  
  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [posts, filters]);

  // Fix post type mapping
  const getPostTypeDisplay = (postType) => {
    const typeMap = {
      'art': 'art',
      'writing': 'writing', 
      'photography': 'photography',
      'photo': 'photography',  // Map old 'photo' to 'photography'
      'music': 'music',
      'other': 'other'
    };
    return typeMap[postType] || 'other';
  };

  const fetchPosts = async () => {
    try {
      console.log('🔄 Attempting to fetch posts from backend...');
      const response = await getPosts();
      console.log('✅ Loaded posts from backend:', response.data.length);
      
      setPosts(response.data);
      setBackendStatus('connected');
    } catch (error) {
      console.error('❌ Backend unavailable, using demo data:', error);
      setBackendStatus('disconnected');
      // Use demo data as fallback
      const demoPosts = [
        {
          id: 1,
          title: 'Welcome to Campus Creatives!',
          content: 'Share your art, writing, photography, and more with the campus community.',
          post_type: 'writing',
          author_name: 'Admin',
          likes_count: 42,
          comments_count: 8,
          created_at: new Date().toISOString(),
          image: null
        },
        {
          id: 2,
          title: 'Amazing Campus Sunset',
          content: 'Captured this beautiful sunset near the library yesterday!',
          post_type: 'photography',
          author_name: 'Photo Student',
          likes_count: 15,
          comments_count: 3,
          created_at: new Date().toISOString(),
          image: null
        }
      ];
      setPosts(demoPosts);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId, forceRefresh = false) => {
    try {
      console.log('🔄 Fetching comments for post:', postId);
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      
      // Force fresh data from server (don't use cache)
      const response = await api.get(`/posts/${postId}/comments/`, {
        params: {
          _t: forceRefresh ? Date.now() : 0 // Add timestamp to avoid cache
        }
      });
      
      console.log('✅ Comments loaded:', response.data.length, 'comments');
      setComments(prev => ({
        ...prev,
        [postId]: response.data
      }));
      
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      
      // Check if this post has comments in the post data itself
      const post = posts.find(p => p.id === postId);
      
      if (post && post.comments) {
        // Use comments from post data
        setComments(prev => ({
          ...prev,
          [postId]: post.comments
        }));
      } else {
        // Fallback to demo comments
        const demoComments = [
          {
            id: Date.now(),
            post: postId,
            author_name: 'Campus Fan',
            content: 'This is amazing work! Keep creating! 🎨',
            created_at: new Date().toISOString()
          },
          {
            id: Date.now() + 1,
            post: postId,
            author_name: 'Art Lover',
            content: 'Love the creativity in this post!',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ];
        
        setComments(prev => ({
          ...prev,
          [postId]: demoComments
        }));
      }
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const refreshComments = async (postId) => {
    console.log('🔄 Manually refreshing comments for post:', postId);
    await fetchComments(postId, true); // Force refresh
  };

  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        await fetchComments(postId);
      }
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...posts];

    // Apply type filter with fixed mapping
    if (filters.post_type !== 'all') {
      result = result.filter(post => 
        getPostTypeDisplay(post.post_type) === filters.post_type
      );
    }

    // Apply sorting
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'most_liked':
        result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'most_commented':
        result.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredPosts(result);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (sortValue) => {
    setFilters(prev => ({
      ...prev,
      sort: sortValue
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      post_type: 'all',
      sort: 'newest'
    });
  };

  return (
    <Layout>
      <Head>
        <title>Campus Creatives - Showcase Your Talent</title>
        <meta name="description" content="Share and discover creative work from campus students" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Campus Creatives</h1>
          <p className="text-xl mb-8 opacity-90">
            Discover and share amazing creative work from students across campus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/create-post'}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Share Your Work
            </button>
            <button 
              onClick={clearAllFilters}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Explore All
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Backend Status */}
        <div className={`text-center mb-6 p-3 rounded-lg ${
          backendStatus === 'connected' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        }`}>
          {backendStatus === 'connected' ? (
            <span>✅ Connected to backend - Showing real data</span>
          ) : (
            <span>⚠️ Using demo data - Backend unavailable</span>
          )}
        </div>

        {/* Filter and Sort Component */}
        <FilterSort 
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          currentFilters={filters}
        />

        {/* Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredPosts.length} of {posts.length} posts
                {filters.post_type !== 'all' && ` in ${filters.post_type}`}
              </p>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No posts found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.post_type !== 'all' 
                    ? `No ${filters.post_type} posts found. Try changing your filters.`
                    : 'No posts available yet. Be the first to share!'
                  }
                </p>
                <button 
                  onClick={() => window.location.href = '/create-post'}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {post.image && (
                      <img 
                        src={post.image} 
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          getPostTypeDisplay(post.post_type) === 'art' ? 'bg-pink-100 text-pink-800' :
                          getPostTypeDisplay(post.post_type) === 'writing' ? 'bg-green-100 text-green-800' :
                          getPostTypeDisplay(post.post_type) === 'photography' ? 'bg-blue-100 text-blue-800' :
                          getPostTypeDisplay(post.post_type) === 'music' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {getPostTypeDisplay(post.post_type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.content}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>By {post.author_name}</span>
                        <div className="flex gap-3">
                          <span>❤️ {post.likes_count || 0}</span>
                          <span>💬 {post.comments_count || 0}</span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <button 
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1 text-blue-600 text-sm hover:text-blue-700 font-medium"
                          >
                            <span>💬</span>
                            {expandedPostId === post.id ? 'Hide' : 'Show'} Comments 
                            {post.comments_count > 0 && ` (${post.comments_count})`}
                          </button>
                          
                          {expandedPostId === post.id && comments[post.id] && (
                            <button 
                              onClick={() => refreshComments(post.id)}
                              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                              title="Refresh comments"
                            >
                              🔄 Refresh
                            </button>
                          )}
                        </div>
                        
                        {expandedPostId === post.id && (
                          <div className="mt-3 border-t pt-3">
                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                              <span>💭</span>
                              Comments ({comments[post.id] ? comments[post.id].length : 0})
                            </h4>
                            
                            {commentsLoading[post.id] ? (
                              // Loading state
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              </div>
                            ) : !comments[post.id] ? (
                              // Not loaded yet
                              <div className="text-center py-4">
                                <p className="text-gray-500 text-sm">Click refresh to load comments</p>
                              </div>
                            ) : comments[post.id].length === 0 ? (
                              // No comments
                              <div className="text-center py-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl mb-2">💬</div>
                                <p className="text-gray-500 text-sm">No comments yet.</p>
                                <p className="text-gray-400 text-xs mt-1">Be the first to comment!</p>
                              </div>
                            ) : (
                              // Display comments
                              <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                                {comments[post.id].map((comment) => (
                                  <div key={comment.id || comment.content} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium text-gray-800 text-sm">
                                        {comment.author_name}
                                      </span>
                                      <span className="text-gray-500 text-xs">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Add Comment Button */}
                            <button 
                              onClick={() => {
                                window.location.href = `/posts/${post.id}`;
                              }}
                              className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                            >
                              + Add Your Comment
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => window.location.href = `/posts/${post.id}`}
                        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Full Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}