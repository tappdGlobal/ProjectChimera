import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ================= CONFIG ================= */

const USE_PRODUCTION = false;
const PRODUCTION_URL = "https://tappd-backend.onrender.com/api/v1";
const PORT = 3000;
const LOCAL_MACHINE_IP = "127.0.0.1";

/* ================= BASE URL ================= */

const getBaseURL = (): string => {
  if (USE_PRODUCTION) return PRODUCTION_URL;

  const isDevice = Device.isDevice ?? true;

  if (Platform.OS === "android" && !isDevice) {
    return `http://10.0.2.2:${PORT}/api/v1`;
  }

  if (Platform.OS === "ios" && !isDevice) {
    return `http://localhost:${PORT}/api/v1`;
  }

  return `http://${LOCAL_MACHINE_IP}:${PORT}/api/v1`;
};

/* ================= AXIOS INSTANCE ================= */

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
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
      config.headers['Authorization'] = `Bearer ${token}`;
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
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timeout. Server may be waking up (Render free tier)."
        );
      }

      throw new Error(
        `Cannot connect to ${error.config?.baseURL}. Check internet or backend.`
      );
    }

    throw new Error(error.message);
  }
);

/* ================= API CLIENT ================= */
/**
 * ✔ Supports multipart/form-data
 * ✔ Supports custom headers
 * ✔ No TS errors
 * ✔ Backward compatible
 */

export const apiClient = {
  get: <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.get(endpoint, config).then((res) => res.data),

  post: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.post(endpoint, data, config).then((res) => res.data),

  put: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.put(endpoint, data, config).then((res) => res.data),

  patch: <T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.patch(endpoint, data, config).then((res) => res.data),

  delete: <T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> =>
    api.delete(endpoint, config).then((res) => res.data),
};

/* ================= DEBUG ================= */

export const getCurrentBaseURL = (): string =>
  api.defaults.baseURL || "";

export default api;
