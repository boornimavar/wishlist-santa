import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  auth: {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    checkAuth: () => api.get('/auth/check'),
    getCurrentUser: () => api.get('/auth/me'),
  },

  users: {
    getAll: () => api.get('/users'),
    getById: (userId) => api.get(`/users/${userId}`),
    updateProfile: (userData) => api.put('/users/profile', userData),
  },

  events: {
    getAll: () => api.get('/events'),
    create: (eventData) => api.post('/events', eventData),
    update: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
    delete: (eventId) => api.delete(`/events/${eventId}`),
  },

  wishes: {
    add: (eventId, wishData) => api.post(`/events/${eventId}/wishes`, wishData),
    update: (wishId, wishData) => api.put(`/wishes/${wishId}`, wishData),
    delete: (wishId) => api.delete(`/wishes/${wishId}`),
    reserve: (wishId) => api.post(`/wishes/${wishId}/reserve`),
    unreserve: (wishId) => api.delete(`/wishes/${wishId}/unreserve`),
  },

  reservations: {
    getMy: () => api.get('/my-reservations'),
  },
};

export default apiService;