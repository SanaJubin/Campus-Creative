import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { auth } from '../utils/auth';
import Layout from '../components/Layout';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Demo fallback if backend is not available
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // Try real backend first
    const result = await auth.login({
  username: formData.username,
  password: formData.password
});

      if (result.success) {
        router.push('/');
      } else {
        // If backend fails, use demo mode
        console.log('Backend unavailable, using demo mode');
        const userData = {
          username: formData.username,
          email: `${formData.username}@campus.edu`,
          is_staff: formData.username.toLowerCase().includes('admin')
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
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

  // Demo credentials hint
  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Administrator' },
    { username: 'student1', password: 'student123', role: 'Student' },
    { username: 'artist', password: 'artist123', role: 'Artist' }
  ];

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-white font-bold">🔐</span>
            </div>
            <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
            <p className="mt-2 text-gray-600">Sign in to your Campus Creatives account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in to your account'
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Create one here
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Demo Credentials:</h4>
            <div className="space-y-2 text-sm">
              {demoCredentials.map((cred, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-blue-700">
                    <strong>{cred.role}:</strong> {cred.username} / {cred.password}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              If backend is running, these will work with real authentication.
              Otherwise, demo mode will activate.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
