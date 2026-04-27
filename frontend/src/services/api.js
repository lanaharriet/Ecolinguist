import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/auth/token', data);
export const register = (data) => api.post('/auth/register', data);

export const getProfile = () => api.get(`/profile`);
export const getWeather = (lat, lon) => api.get(`/weather?lat=${lat}&lon=${lon}`);
export const getSchemes = () => api.get('/schemes');
export const getResources = () => api.get('/resources');
export const generateReport = (data) => api.post('/generate-report', data); // Handles FormData
export const processVoice = (data) => api.post('/voice-input', data); // Handles FormData

export default api;
