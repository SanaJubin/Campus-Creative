import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [siteStats, setSiteStats] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [reportedContent, setReportedContent] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      // For demo purposes, consider user as admin if username contains "admin"
      // In real app, you'd check against a proper admin field in the database
      if (userObj.username && userObj.username.toLowerCase().includes('admin')) {
        setIsAdmin(true);
        loadAdminData();
      } else {
        router.push('/');
      }
    } else {
      router.push('/login');
    }
  }, []);

  const loadAdminData = () => {
    // Load all posts
    const allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    setPosts(allPosts);

    // Load all users (simulated - in real app this would come from backend)
    const simulatedUsers = [
      { id: 1, username: 'admin', email: 'admin@campus.edu', role: 'admin', joined: '2024-01-01', status: 'active' },
      { id: 2, username: 'john_artist', email: 'john@campus.edu', role: 'student', joined: '2024-01-15', status: 'active' },
      { id: 3, username: 'sarah_writer', email: 'sarah@campus.edu', role: 'student', joined: '2024-01-20', status: 'active' },
      { id: 4, username: 'mike_photo', email: 'mike@campus.edu', role: 'student', joined: '2024-02-01', status: 'pending' },
    ];

    // Add users from posts
    const postAuthors = [...new Set(allPosts.map(post => post.author_name))];
    postAuthors.forEach((author, index) => {
      if (!simulatedUsers.find(u => u.username === author)) {
        simulatedUsers.push({
          id: simulatedUsers.length + 1,
          username: author,
          email: `${author}@campus.edu`,
          role: 'student',
          joined: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        });
      }
    });

    setUsers(simulatedUsers);

    // Calculate site stats
    const stats = {
      totalUsers: simulatedUsers.length,
      totalPosts: allPosts.length,
      totalLikes: allPosts.reduce((sum, post) => sum + post.likes_count, 0),
      totalComments: allPosts.reduce((sum, post) => sum + post.comments_count, 0),
      pendingVerification: simulatedUsers.filter(u => u.status === 'pending').length,
      reportedPosts: 3, // Simulated reported content
      activeToday: Math.floor(simulatedUsers.length * 0.7) // 70% active
    };

    setSiteStats(stats);

    // Simulated reported content
    setReportedContent([
      { id: 1, type: 'post', title: 'Inappropriate content', reporter: 'user1', status: 'pending' },
      { id: 2, type: 'comment', title: 'Spam comment', reporter: 'user2', status: 'resolved' },
      { id: 3, type: 'user', title: 'Suspicious activity', reporter: 'user3', status: 'pending' }
    ]);
  };

  const verifyUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: 'active' } : user
    ));
    // In real app, you'd make an API call here
  };

  const deletePost = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const resolveReport = (reportId) => {
    setReportedContent(reportedContent.map(report =>
      report.id === reportId ? { ...report, status: 'resolved' } : report
    ));
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
            <Link href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold">
              Return to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  ⚙️
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                  <p className="text-blue-200">Welcome, {user.username}. Manage your campus community.</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link href="/" className="bg-white/20 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/30 transition-all">
                  View Site
                </Link>
                <button className="border border-white/30 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/10 transition-all">
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{siteStats.totalUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Posts</p>
                  <p className="text-3xl font-bold">{siteStats.totalPosts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Pending Verification</p>
                  <p className="text-3xl font-bold">{siteStats.pendingVerification || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Reports</p>
                  <p className="text-3xl font-bold">{siteStats.reportedPosts || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚨</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-white/20">
              <nav className="flex space-x-8 px-6">
                {['overview', 'users', 'content', 'reports', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                      activeTab === tab
                        ? 'border-blue-400 text-blue-400'
                        : 'border-transparent text-blue-200 hover:text-white hover:border-white/30'
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                          <span>New user registration</span>
                          <span className="text-blue-300 text-sm">2 min ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                          <span>Post reported</span>
                          <span className="text-blue-300 text-sm">15 min ago</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                          <span>User verification needed</span>
                          <span className="text-blue-300 text-sm">1 hour ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white/5 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="bg-blue-500/20 hover:bg-blue-500/30 p-3 rounded text-left transition-colors">
                          <div className="text-lg mb-1">👥</div>
                          <div className="font-medium">Manage Users</div>
                        </button>
                        <button className="bg-green-500/20 hover:bg-green-500/30 p-3 rounded text-left transition-colors">
                          <div className="text-lg mb-1">📊</div>
                          <div className="font-medium">View Analytics</div>
                        </button>
                        <button className="bg-yellow-500/20 hover:bg-yellow-500/30 p-3 rounded text-left transition-colors">
                          <div className="text-lg mb-1">⏳</div>
                          <div className="font-medium">Pending Items</div>
                        </button>
                        <button className="bg-red-500/20 hover:bg-red-500/30 p-3 rounded text-left transition-colors">
                          <div className="text-lg mb-1">🚨</div>
                          <div className="font-medium">Reports</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">User Management ({users.length} users)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="pb-3">User</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Joined</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id} className="border-b border-white/10">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                  {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium">{user.username}</div>
                                  <div className="text-blue-200 text-sm">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' 
                                  ? 'bg-red-500/20 text-red-300' 
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.status === 'active' 
                                  ? 'bg-green-500/20 text-green-300' 
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 text-blue-200 text-sm">
                              {new Date(user.joined).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              {user.status === 'pending' && (
                                <button 
                                  onClick={() => verifyUser(user.id)}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded text-sm transition-colors"
                                >
                                  Verify
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Content Management ({posts.length} posts)</h3>
                  <div className="space-y-3">
                    {posts.slice(0, 10).map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-blue-200 text-sm">By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-300 text-sm">{post.likes_count} likes</span>
                          <button 
                            onClick={() => deletePost(post.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Content Reports</h3>
                  <div className="space-y-3">
                    {reportedContent.map(report => (
                      <div key={report.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="font-medium">{report.title}</h4>
                          <p className="text-blue-200 text-sm">Type: {report.type} • Reported by: {report.reporter}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            report.status === 'pending' 
                              ? 'bg-yellow-500/20 text-yellow-300' 
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {report.status}
                          </span>
                          {report.status === 'pending' && (
                            <button 
                              onClick={() => resolveReport(report.id)}
                              className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded text-sm transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Site Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Engagement Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Likes</span>
                          <span className="font-medium">{siteStats.totalLikes || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Comments</span>
                          <span className="font-medium">{siteStats.totalComments || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Users Today</span>
                          <span className="font-medium">{siteStats.activeToday || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="font-medium mb-3">Content Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Art Posts</span>
                          <span className="font-medium">{posts.filter(p => p.post_type === 'art').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Writing Posts</span>
                          <span className="font-medium">{posts.filter(p => p.post_type === 'writing').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Photo Posts</span>
                          <span className="font-medium">{posts.filter(p => p.post_type === 'photo').length}</span>
                        </div>
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