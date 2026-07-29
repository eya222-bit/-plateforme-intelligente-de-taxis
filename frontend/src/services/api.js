import axios from 'axios';

// Adresse de ton backend FastAPI
const API_URL = 'http://127.0.0.1:8005';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur : Ajoute automatiquement le Token JWT s'il existe dans le localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;