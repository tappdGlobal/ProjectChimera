import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Update with your backend URL

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get(endpoint: string, includeAuth: boolean = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  async post(endpoint: string, data: any, includeAuth: boolean = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put(endpoint: string, data: any, includeAuth: boolean = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete(endpoint: string, includeAuth: boolean = true): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders(includeAuth);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse(response);
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);