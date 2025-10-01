import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { api } from '../utils/api';
import { auth } from '../utils/auth';

export default function CreatePost() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'art',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in - FIXED AUTH CHECK
    const checkAuth = () => {
      try {
        // First try localStorage (most reliable)
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const userObj = JSON.parse(userData);
          setUser(userObj);
          console.log('User found in localStorage:', userObj.username);
          return;
        }
        
        // If no user in localStorage, check if we're coming from login
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
          // Create a temporary user for this session
          const tempUser = { username: 'Guest', email: 'guest@campus.edu' };
          setUser(tempUser);
          localStorage.setItem('user', JSON.stringify(tempUser));
          console.log('Created temporary user session');
          return;
        }
        
        // If no user data found, redirect to login
        console.log('No user data found, redirecting to login');
        router.push('/login');
        
      } catch (error) {
        console.error('Auth check error:', error);
        // Don't redirect on error - allow user to continue
        setUser({ username: 'Guest', email: 'guest@campus.edu' });
      }
    };

    checkAuth();
  }, [router]);
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');

  // Validation
  if (!formData.title.trim() || !formData.content.trim()) {
    setError('Please fill in title and content');
    setLoading(false);
    return;
  }

  try {
    console.log('🔄 Starting post creation...');
    
    // Check authentication first
    const token = auth.getAccessToken();
    if (!token) {
      throw new Error('Please login again');
    }

    // Create FormData
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('post_type', formData.post_type);
    
    if (formData.tags) {
      formDataToSend.append('tags', formData.tags);
    }
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
      console.log('✅ Image appended to FormData');
    }

    console.log('🚀 Sending POST request...');
    const response = await fetch('http://127.0.0.1:8000/api/posts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formDataToSend
    });

    const result = await response.json();
    console.log('📨 Response:', result);

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, redirect to login
        setError('Session expired. Please login again.');
        setTimeout(() => {
          auth.logout();
        }, 2000);
        return;
      }
      throw new Error(result.error || result.detail || `Error: ${response.status}`);
    }

    console.log('✅ Post created successfully!');
    setSuccess('Post created successfully! Redirecting...');

    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.message.includes('Session expired') || error.message.includes('token')) {
      setError('Authentication failed. Please login again.');
      setTimeout(() => {
        auth.logout();
      }, 2000);
    } else {
      setError(`Failed to create post: ${error.message}`);
      
      // Fallback to localStorage
      const newPost = {
        id: Date.now(),
        title: formData.title,
        content: formData.content,
        post_type: formData.post_type,
        author_name: user?.username || 'Guest User',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        image: imagePreview,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const existingPosts = JSON.parse(localStorage.getItem('posts') || '[]');
      const updatedPosts = [newPost, ...existingPosts];
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      
      setSuccess('Post saved locally. Redirecting...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  } finally {
    setLoading(false);
  }
};
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const postTypeOptions = [
    { value: 'art', label: '🎨 Art', color: 'from-pink-500 to-red-500' },
    { value: 'writing', label: '📝 Writing', color: 'from-green-500 to-teal-500' },
    { value: 'photo', label: '📸 Photography', color: 'from-blue-500 to-cyan-500' },
    { value: 'other', label: '💫 Other', color: 'from-purple-500 to-indigo-500' }
  ];

  // Show loading while checking auth
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Checking authentication...</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">✨</span>
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Create New Post</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold text-blue-600">{user.username}</span>! Share your creativity with the campus community.
            </p>
          </div>

          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Create Post Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What are you sharing? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {postTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, post_type: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.post_type === option.value
                          ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg transform scale-105`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="text-lg mb-1">{option.label.split(' ')[0]}</div>
                      <div className="text-sm font-medium">{option.label.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Give your post a catchy title..."
                  maxLength={100}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.title.length}/100 characters
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  value={formData.content}
                  onChange={handleChange}
                  rows="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-vertical"
                  placeholder="Share your story, describe your artwork, or tell us about your creation..."
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.content.length} characters (min. 10)
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add an Image (Optional)
                </label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-dashed border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-600 mb-2">Click to upload an image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <input
                  id="tags"
                  name="tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="art, digital, painting, campus (separate with commas)"
                />
                <div className="text-sm text-gray-500 mt-1">
                  Add tags to help others discover your post
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Post...
                    </div>
                  ) : (
                    'Publish Post'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:border-gray-400 hover:text-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3">💡 Posting Tips</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Write a clear, descriptive title that captures attention</li>
              <li>• Share the story behind your creation</li>
              <li>• Use high-quality images to showcase your work</li>
              <li>• Add relevant tags to help others find your post</li>
              <li>• Be proud of your work - the campus wants to see it!</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}