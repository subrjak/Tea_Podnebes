/**
 * @fileoverview Axios-клиент для same-origin Next.js BFF.
 * Используйте его во feature-модулях для запросов Laravel API. Браузер
 * автоматически отправляет HttpOnly-cookie на `/api`; BFF добавляет Bearer
 * токен при серверном запросе к Laravel.
 * @example const { data } = await api.get('/teas');
 */
import axios from 'axios';

/** Настроенный same-origin клиент запросов к Next.js BFF. */
const api = axios.create({
  baseURL: '/api',
  headers: {
    Accept: 'application/json',
  },
});

export default api;
