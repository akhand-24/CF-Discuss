import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cf-discuss-1.onrender.com/api'
});

api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('cf_user');
    if (storedUser) {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
