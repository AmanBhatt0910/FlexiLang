import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://flexilang-backend.onrender.com/api',
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    response => response,
    error => {
        const errorMessage = error.response?.data?.message || 'Something went wrong';
        console.error('Request error:', errorMessage);
        return Promise.reject(error);
    }
)

export default axiosInstance;