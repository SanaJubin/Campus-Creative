import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import FilterSort from '../components/FilterSort'; // Add this import
import { getPosts } from '../utils/api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [filters, setFilters] = useState({
    post_type: 'all',
    sort: 'newest'
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Apply filters and sorting whenever posts or filters change
    applyFiltersAndSorting();
  }, [posts, filters]);

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
        }
      ];
      setPosts(demoPosts);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...posts];

    // Apply type filter
    if (filters.post_type !== 'all') {
      result = result.filter(post => post.post_type === filters.post_type);
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
                          post.post_type === 'art' ? 'bg-pink-100 text-pink-800' :
                          post.post_type === 'writing' ? 'bg-green-100 text-green-800' :
                          post.post_type === 'photography' ? 'bg-blue-100 text-blue-800' :
                          post.post_type === 'music' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {post.post_type}
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
                      
                      <button 
                        onClick={() => window.location.href = `/posts/${post.id}`}
                        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Post
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