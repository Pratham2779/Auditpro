import axios from 'axios';
import store from '../app/store';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  // Let Axios set Content-Type based on data type
});

axiosInstance.interceptors.request.use(
  (config) => {
    try {
      let token;

      // Option 1: Get token from Redux store
      const state = store.getState();
      if (state?.auth?.token) {
        token = state.auth.token;
      }

      // Option 2: Fallback to localStorage
      if (!token) {
        token = localStorage.getItem('token');
      }

      // Attach token to Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Axios request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Axios request config error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
