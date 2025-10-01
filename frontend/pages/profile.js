import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    studentId: '',
    email: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setEditForm({
        fullName: userObj.fullName || userObj.username || '',
        bio: userObj.bio || 'No bio yet. Tell us about yourself!',
        studentId: userObj.studentId || '',
        email: userObj.email || ''
      });
      loadUserPosts(userObj.username);
    } else {
      router.push('/login');
    }
  }, []);

  const loadUserPosts = (username) => {
    const allPosts = JSON.parse(localStorage.getItem('posts') || '[]');
    const userPosts = allPosts.filter(post => post.author_name === username);
    setUserPosts(userPosts);
    setLoading(false);
  };

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = {
        ...user,
        ...editForm
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: user?.fullName || user?.username || '',
      bio: user?.bio || 'No bio yet. Tell us about yourself!',
      studentId: user?.studentId || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedUser = {
          ...user,
          avatar: e.target.result
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  const getPostCountByType = () => {
    const counts = { art: 0, writing: 0, photo: 0, other: 0 };
    userPosts.forEach(post => {
      counts[post.post_type] = (counts[post.post_type] || 0) + 1;
    });
    return counts;
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const postCounts = getPostCountByType();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      📷
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                      className="text-center border-b-2 border-blue-500 outline-none"
                      placeholder="Full Name"
                    />
                  ) : (
                    user.fullName || user.username
                  )}
                </h1>
                <p className="text-gray-600">@{user.username}</p>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                        <input
                          type="text"
                          value={editForm.studentId}
                          onChange={(e) => setEditForm({...editForm, studentId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Student ID"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Email address"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 text-lg mb-4">
                      {user.bio || "No bio yet. Tell us about yourself!"}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{userPosts.length}</div>
                        <div className="text-sm text-gray-600">Posts</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {userPosts.reduce((sum, post) => sum + post.likes_count, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Likes</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {userPosts.reduce((sum, post) => sum + post.comments_count, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Comments</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">
                          {user.studentId ? 'Verified' : 'Unverified'}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push('/create-post')}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      Create New Post
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['posts', 'stats', 'activity'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors duration-200 ${
                      activeTab === tab
                        ? 'border-purple-500 text-purple-600'
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
              {activeTab === 'posts' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">My Posts ({userPosts.length})</h3>
                  {userPosts.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {userPosts.map((post) => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <h4 className="font-semibold text-gray-900 mb-2">{post.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span className="capitalize">{post.post_type}</span>
                            <span>❤️ {post.likes_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📝</div>
                      <p className="text-gray-600">No posts yet. Share your first creation!</p>
                      <button
                        onClick={() => router.push('/create-post')}
                        className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold"
                      >
                        Create Your First Post
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Post Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(postCounts).map(([type, count]) => (
                      <div key={type} className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{type}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Engagement Stats */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Engagement Overview</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Likes Received</span>
                        <span className="font-semibold text-green-600">
                          {userPosts.reduce((sum, post) => sum + post.likes_count, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Comments Received</span>
                        <span className="font-semibold text-blue-600">
                          {userPosts.reduce((sum, post) => sum + post.comments_count, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Likes per Post</span>
                        <span className="font-semibold text-purple-600">
                          {userPosts.length > 0 
                            ? Math.round(userPosts.reduce((sum, post) => sum + post.likes_count, 0) / userPosts.length)
                            : 0
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {userPosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white">
                          📝
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Published "{post.title}"</p>
                          <p className="text-sm text-gray-600">
                            {new Date(post.created_at).toLocaleDateString()} • 
                            {post.likes_count} likes • {post.comments_count} comments
                          </p>
                        </div>
                      </div>
                    ))}
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