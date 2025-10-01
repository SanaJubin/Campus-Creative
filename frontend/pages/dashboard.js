import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all'); // all, week, month
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      loadUserData(userObj.username);
    } else {
      router.push('/login');
    }
  }, []);

  const loadUserData = (username) => {
    const allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const userPosts = allPosts.filter(post => post.author_name === username);
    setUserPosts(userPosts);
    calculateStats(userPosts);
  };

  const calculateStats = (posts) => {
    // Basic stats
    const totalPosts = posts.length;
    const totalLikes = posts.reduce((sum, post) => sum + post.likes_count, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments_count, 0);
    
    // Posts by type
    const postsByType = {};
    posts.forEach(post => {
      postsByType[post.post_type] = (postsByType[post.post_type] || 0) + 1;
    });

    // Engagement rate (likes + comments per post)
    const avgEngagement = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts).toFixed(1) : 0;

    // Most popular post
    const mostPopular = posts.length > 0 
      ? posts.reduce((max, post) => post.likes_count > max.likes_count ? post : max)
      : null;

    // Recent activity (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentPosts = posts.filter(post => new Date(post.created_at) > oneWeekAgo);

    setStats({
      totalPosts,
      totalLikes,
      totalComments,
      postsByType,
      avgEngagement,
      mostPopular,
      recentPosts: recentPosts.length
    });
  };

  const getEngagementLevel = (engagement) => {
    if (engagement > 10) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100' };
    if (engagement > 5) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getPostTypeColor = (type) => {
    const colors = {
      art: 'from-pink-500 to-red-500',
      writing: 'from-green-500 to-teal-500',
      photo: 'from-blue-500 to-cyan-500',
      other: 'from-purple-500 to-indigo-500'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getPostTypeIcon = (type) => {
    const icons = {
      art: '🎨',
      writing: '📝',
      photo: '📸',
      other: '💫'
    };
    return icons[type] || '📄';
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const engagement = getEngagementLevel(stats.avgEngagement);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Welcome back, {user.username}! Here's your creative journey.</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link href="/create-post" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
                  Create New Post
                </Link>
                <Link href="/profile" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-all">
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.totalPosts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Likes</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalLikes || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">❤️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Comments</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalComments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Avg Engagement</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.avgEngagement || 0}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${engagement.bg} ${engagement.color}`}>
                    {engagement.level}
                  </span>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['overview', 'posts', 'analytics', 'achievements'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Posts by Type */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Your Content Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(stats.postsByType || {}).map(([type, count]) => (
                        <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`w-12 h-12 bg-gradient-to-r ${getPostTypeColor(type)} rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                            {getPostTypeIcon(type)}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className="text-sm text-gray-600 capitalize">{type}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Most Popular Post */}
                  {stats.mostPopular && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Most Popular Post</h3>
                      <Link href={`/posts/${stats.mostPopular.id}`}>
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{stats.mostPopular.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {stats.mostPopular.likes_count} likes • {stats.mostPopular.comments_count} comments
                              </p>
                            </div>
                            <div className={`bg-gradient-to-r ${getPostTypeColor(stats.mostPopular.post_type)} text-white px-3 py-1 rounded-full text-sm`}>
                              {getPostTypeIcon(stats.mostPopular.post_type)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link href="/create-post" className="bg-indigo-500 text-white p-4 rounded-lg text-center hover:bg-indigo-600 transition-colors">
                        <div className="text-2xl mb-2">✨</div>
                        <div className="font-semibold">Create New Post</div>
                      </Link>
                      <Link href="/profile" className="bg-white border border-gray-300 p-4 rounded-lg text-center hover:bg-gray-50 transition-colors">
                        <div className="text-2xl mb-2">👤</div>
                        <div className="font-semibold">Edit Profile</div>
                      </Link>
                      <Link href="/categories" className="bg-white border border-gray-300 p-4 rounded-lg text-center hover:bg-gray-50 transition-colors">
                        <div className="text-2xl mb-2">🏷️</div>
                        <div className="font-semibold">Explore Categories</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Posts ({userPosts.length})</h3>
                  {userPosts.length > 0 ? (
                    <div className="space-y-4">
                      {userPosts.map(post => (
                        <Link key={post.id} href={`/posts/${post.id}`}>
                          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{post.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Date(post.created_at).toLocaleDateString()} • 
                                  {post.likes_count} likes • {post.comments_count} comments
                                </p>
                              </div>
                              <div className={`bg-gradient-to-r ${getPostTypeColor(post.post_type)} text-white px-3 py-1 rounded-full text-sm`}>
                                {getPostTypeIcon(post.post_type)} {post.post_type}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📝</div>
                      <p>No posts yet. Start sharing your creativity!</p>
                      <Link href="/create-post" className="inline-block mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg font-semibold">
                        Create Your First Post
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Detailed Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Engagement Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Likes per Post</span>
                          <span className="font-semibold">
                            {stats.totalPosts > 0 ? (stats.totalLikes / stats.totalPosts).toFixed(1) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Comments per Post</span>
                          <span className="font-semibold">
                            {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Engagement</span>
                          <span className="font-semibold">{stats.totalLikes + stats.totalComments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">Recent Activity</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Posts this week</span>
                          <span className="font-semibold">{stats.recentPosts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average posting rate</span>
                          <span className="font-semibold">
                            {stats.totalPosts > 0 ? (stats.totalPosts / 30).toFixed(1) : 0}/day
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Achievement Cards */}
                    <div className={`border-2 ${stats.totalPosts >= 1 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} p-4 rounded-lg`}>
                      <div className="text-2xl mb-2">{stats.totalPosts >= 1 ? '🎉' : '🔒'}</div>
                      <h4 className="font-semibold">First Post</h4>
                      <p className="text-sm text-gray-600">Publish your first creative work</p>
                      <div className="mt-2 text-xs text-green-600 font-semibold">
                        {stats.totalPosts >= 1 ? 'Unlocked!' : 'Locked'}
                      </div>
                    </div>

                    <div className={`border-2 ${stats.totalLikes >= 10 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} p-4 rounded-lg`}>
                      <div className="text-2xl mb-2">{stats.totalLikes >= 10 ? '❤️' : '🔒'}</div>
                      <h4 className="font-semibold">Popular Creator</h4>
                      <p className="text-sm text-gray-600">Receive 10+ likes on your posts</p>
                      <div className="mt-2 text-xs text-green-600 font-semibold">
                        {stats.totalLikes >= 10 ? 'Unlocked!' : 'Locked'}
                      </div>
                    </div>

                    <div className={`border-2 ${stats.totalPosts >= 3 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'} p-4 rounded-lg`}>
                      <div className="text-2xl mb-2">{stats.totalPosts >= 3 ? '📚' : '🔒'}</div>
                      <h4 className="font-semibold">Active Contributor</h4>
                      <p className="text-sm text-gray-600">Publish 3 or more posts</p>
                      <div className="mt-2 text-xs text-green-600 font-semibold">
                        {stats.totalPosts >= 3 ? 'Unlocked!' : 'Locked'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}