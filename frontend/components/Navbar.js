import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        
        // Check if user is admin (username contains "admin")
        if (userObj.username && userObj.username.toLowerCase().includes('admin')) {
          setIsAdmin(true);
        }
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (login/logout)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    setIsAdmin(false);
    router.push('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Campus Creatives
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Always visible links */}
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Home
            </Link>
            
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
              Categories
            </Link>
            
            {/* Conditional links based on login status */}
            {user ? (
              <>
                <Link href="/create-post" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200">
                  Create Post
                </Link>
                
                <div className="flex items-center space-x-4">
                  {/* Admin Link - Only show for admin users */}
                  {isAdmin && (
                    <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-red-600">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        ⚙️
                      </div>
                      <span>Admin</span>
                    </Link>
                  )}
                  
                  <Link href="/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      📊
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>Profile</span>
                  </Link>
                  
                  <button 
                    onClick={handleLogout} 
                    className="text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  Login
                </Link>
                <Link href="/register" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition-all duration-200">
                  Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4 px-4">
              {/* Always visible links */}
              <Link 
                href="/" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-blue-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>

              {/* Conditional links based on login status */}
              {user ? (
                <>
                  <Link 
                    href="/create-post" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Post
                  </Link>
                  
                  {/* Admin Link - Only show for admin users */}
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      className="text-gray-700 hover:text-red-600 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  <Link 
                    href="/profile" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }} 
                    className="text-red-600 font-medium text-left py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  
                  <Link 
                    href="/register" 
                    className="text-blue-600 font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}