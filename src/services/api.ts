import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const USE_PRODUCTION = true; // Set to false for local development
const PRODUCTION_URL = 'https://tappd-backend.onrender.com/api/v1';
const PORT = 3000; // Backend port for local development
const LOCAL_MACHINE_IP = '192.168.1.100'; // Replace with your machine's IP for real device testing

// Detect environment and set base URL
const getBaseURL = (): string => {
  // Use production URL if enabled
  if (USE_PRODUCTION) {
    return PRODUCTION_URL;
  }

  // Local development configuration
  const isDevice = Device.isDevice ?? true; // Fallback to true if undefined

  if (Platform.OS === 'android' && !isDevice) {
    // Android Emulator
    return `http://10.0.2.2:${PORT}/api/v1`;
  } else if (Platform.OS === 'ios' && !isDevice) {
    // iOS Simulator
    return `http://localhost:${PORT}/api/v1`;
  } else {
    // Real device (Android or iOS)
    // For real devices, connect to the machine's IP on the local network
    return `http://${LOCAL_MACHINE_IP}:${PORT}/api/v1`;
  }
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 seconds timeout (for cold starts on free hosting)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = (data as any)?.message || `HTTP ${status}: ${error.message}`;
      console.error(`API Error [${status}]:`, message);
      throw new Error(message);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
      console.error('Request URL:', error.config?.url);
      console.error('Base URL:', error.config?.baseURL);
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. The server is taking too long to respond. It may be starting up (can take 30-60s on free hosting).');
      }
      
      throw new Error(`Cannot connect to ${error.config?.baseURL}. Please check:\n1. Your internet connection\n2. Backend server is running\n3. If using Render free tier, server may be waking up (wait 30-60s)`);
    } else {
      // Other error
      console.error('Request Error:', error.message);
      throw new Error(error.message);
    }
  }
);

// API methods
export const apiClient = {
  get: <T = any>(endpoint: string): Promise<T> => api.get(endpoint).then(res => res.data),
  post: <T = any>(endpoint: string, data?: any): Promise<T> => api.post(endpoint, data).then(res => res.data),
  put: <T = any>(endpoint: string, data?: any): Promise<T> => api.put(endpoint, data).then(res => res.data),
  patch: <T = any>(endpoint: string, data?: any): Promise<T> => api.patch(endpoint, data).then(res => res.data),
  delete: <T = any>(endpoint: string): Promise<AxiosResponse<T>> => api.delete(endpoint),
};

// Utility to get current base URL (for debugging)
export const getCurrentBaseURL = (): string => api.defaults.baseURL || '';

export default api;