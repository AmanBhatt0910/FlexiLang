import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://flexilang-backend.onrender.com/api',
  timeout: 10000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
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

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Network Error - Please check your internet connection';
    const statusCode = error.response?.status;

    if (statusCode === 401) {
      console.error('Authentication error - Redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    console.error(`API Error [${statusCode}]: ${errorMessage}`);
    
    return Promise.reject({
      message: errorMessage,
      status: statusCode || 500,
      originalError: error
    });
  }
);

export default axiosInstance;