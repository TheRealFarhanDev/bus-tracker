import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getCurrentUser: () => apiClient.get('/auth/me'),
};

export const routesAPI = {
  getRoutes: () => apiClient.get('/routes'),
  getRoute: (routeId) => apiClient.get(`/routes/${routeId}`),
};

export const adminAPI = {
  startSimulation: (routeId) => apiClient.post('/admin/simulate', { routeId }),
  stopSimulation: () => apiClient.post('/admin/stop-simulation'),
  getStatus: () => apiClient.get('/admin/status'),
};