import axios from 'axios';

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken
} from '../utils/authStorage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const httpClient = axios.create({
  baseURL: API_URL
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();
    const canRefresh =
      error.response?.status === 401 &&
      refreshToken &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login');

    if (canRefresh) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken
        });

        saveAccessToken(response.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

        return httpClient(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
      clearTokens();
    }

    return Promise.reject(error);
  }
);

export default httpClient;
