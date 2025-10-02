import axios from 'axios';
import Cookie from 'js-cookie';
import { auth } from './auth';

const API_BASE_URL = 'https://SanaJubin.pythonanywhere.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests - BUT NOT FOR LOGIN
api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  console.log('🔐 API Request:', config.method?.toUpperCase(), config.url);
  
  // DON'T add token to login or refresh requests
  if (token && !config.url.includes('/auth/token/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔄 Token expired, attempting refresh...');
      const refreshResult = await auth.refreshToken();
      
      if (refreshResult.success) {
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${refreshResult.access}`;
        return api(originalRequest);
      } else {
        // Refresh failed, redirect to login
        console.log('❌ Token refresh failed, redirecting to login');
        auth.logout();
        return Promise.reject(error);
      }
    }
    
    console.log('❌ API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/token/', credentials),
    refresh: (refresh) => api.post('/auth/token/refresh/', { refresh }),
    register: (userData) => api.post('/register/', userData),
  },

  // User endpoints
  users: {
    getProfile: () => api.get('/profiles/me/'),
    updateProfile: (data) => api.put('/profiles/me/', data),
    list: () => api.get('/profiles/'),
  },

  // Post endpoints
  posts: {
    list: () => api.get('/posts/'),
    create: (data) => api.post('/posts/', data),
    retrieve: (id) => api.get(`/posts/${id}/`),
    update: (id, data) => api.put(`/posts/${id}/`, data),
    delete: (id) => api.delete(`/posts/${id}/`),
    like: (id) => api.post(`/posts/${id}/like/`),
    comment: (id, data) => api.post(`/posts/${id}/comment/`, data),
    getComments: (id) => api.get(`/posts/${id}/comments/`),
  },

  // Comment endpoints
  comments: {
    list: () => api.get('/comments/'),
    delete: (id) => api.delete(`/comments/${id}/`),
  },

  // Category endpoints
  categories: {
    list: () => api.get('/categories/'),
  },
};

// Individual function exports for easier imports
export const getPost = (id) => api.get(`/posts/${id}/`);
export const likePost = (id) => api.post(`/posts/${id}/like/`);
export const commentOnPost = (id, data) => api.post(`/posts/${id}/comment/`, data);
export const getComments = (postId) => api.get(`/posts/${postId}/comments/`); // ✅ ADDED THIS LINE
export const getPosts = () => api.get('/posts/');
export const createPost = (data) => api.post('/posts/', data);
export const deletePost = (id) => api.delete(`/posts/${id}/`);
export const updatePost = (id, data) => api.put(`/posts/${id}/`, data);

// Also export api directly for flexibility
export { api };
export default apiService;