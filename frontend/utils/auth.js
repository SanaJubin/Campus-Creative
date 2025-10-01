import { api } from './api';
import Cookie from 'js-cookie';
import axios from 'axios';

export const auth = {
  login: async (credentials) => {
    try {
      console.log('🔄 Sending login to backend...', credentials);
      
      const response = await axios.post('http://127.0.0.1:8000/api/auth/token/', credentials);
      
      console.log('✅ Login successful!', response.data);
      const { access, refresh } = response.data;
      
      // Store tokens in both cookies and localStorage for redundancy
      Cookie.set('access_token', access, { expires: 1 }); // 1 day
      Cookie.set('refresh_token', refresh, { expires: 7 }); // 7 days
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify({
        username: credentials.username
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data);
      return { success: false, error: error.response?.data || 'Login failed' };
    }
  },

  // Add token refresh function
  refreshToken: async () => {
    try {
      const refreshToken = Cookie.get('refresh_token') || localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing token...');
      const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
        refresh: refreshToken
      });

      const { access } = response.data;
      
      // Update tokens
      Cookie.set('access_token', access, { expires: 1 });
      localStorage.setItem('access_token', access);
      
      console.log('✅ Token refreshed successfully');
      return { success: true, access };
    } catch (error) {
      console.log('❌ Token refresh failed:', error.response?.data);
      // Clear invalid tokens
      auth.logout();
      return { success: false, error: 'Token refresh failed' };
    }
  },

  logout: async () => {
    // Clear all token storage
    Cookie.remove('access_token');
    Cookie.remove('refresh_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: async () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: () => {
    const token = Cookie.get('access_token') || localStorage.getItem('access_token');
    return !!token;
  },

  // Get current access token
  getAccessToken: () => {
    return Cookie.get('access_token') || localStorage.getItem('access_token');
  }
};