import axios from 'axios';

let memoryToken = null;

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://teapodnebes-production.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const setAuthToken = (token) => {
    memoryToken = token || null;
};

export const clearAuthToken = () => {
    memoryToken = null;
};

// Автоматически добавляем токен авторизации, если он сохранён
api.interceptors.request.use(config => {
    let token = memoryToken;

    try {
        token = localStorage.getItem('token') || token;
    } catch {
        // Fall back to the in-memory token when browser storage is unavailable.
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
