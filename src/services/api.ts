import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIG ================= */

const USE_PRODUCTION = true; // ✅ UPDATED TO LOCAL
const PRODUCTION_URL = "https://tappd-backend.onrender.com/api/v1";
const LOCAL_URL = "http://192.168.29.144:3000/api/v1"; // Updated to port 3000

/* ================= AXIOS INSTANCE ================= */

const api: AxiosInstance = axios.create({
  baseURL: USE_PRODUCTION ? PRODUCTION_URL : LOCAL_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      const message =
        (data as any)?.message || `HTTP ${status}: ${error.message}`;

      console.error(`API Error [${status}]:`, message);
      throw new Error(message);
    }

    if (error.request) {
      throw new Error(
        "Cannot connect to server. Please check your internet connection."
      );
    }

    throw new Error(error.message);
  }
);

/* ================= API CLIENT ================= */

export const apiClient = {
  get: <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => api.get(endpoint, config).then((res) => res.data),

  post: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => api.post(endpoint, data, config).then((res) => res.data),

  put: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => api.put(endpoint, data, config).then((res) => res.data),

  patch: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => api.patch(endpoint, data, config).then((res) => res.data),

  delete: <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> => api.delete(endpoint, config).then((res) => res.data),
};

export default api;
