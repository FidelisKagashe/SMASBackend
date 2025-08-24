import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import { ApiResponse } from '../types';

class ApiService {
  private api: AxiosInstance;
  private isOnline: boolean = true;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          await this.clearAuthData();
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  private async clearAuthData() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  }

  // Generic API methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      if (!this.isOnline) {
        return this.getOfflineData<T>(url);
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, config);
      
      // Cache successful responses for offline use
      await this.cacheData(url, response.data);
      
      return response.data;
    } catch (error) {
      if (!this.isOnline) {
        return this.getOfflineData<T>(url);
      }
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      if (!this.isOnline) {
        return this.queueOfflineRequest('POST', url, data);
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      if (!this.isOnline) {
        return this.queueOfflineRequest('POST', url, data);
      }
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      if (!this.isOnline) {
        return this.queueOfflineRequest('PUT', url, data);
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      if (!this.isOnline) {
        return this.queueOfflineRequest('PUT', url, data);
      }
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      if (!this.isOnline) {
        return this.queueOfflineRequest('DELETE', url);
      }

      const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      if (!this.isOnline) {
        return this.queueOfflineRequest('DELETE', url);
      }
      throw this.handleError(error);
    }
  }

  // Offline data management
  private async cacheData<T>(key: string, data: ApiResponse<T>) {
    try {
      const cacheKey = `cache_${key.replace(/\//g, '_')}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  private async getOfflineData<T>(key: string): Promise<ApiResponse<T>> {
    try {
      const cacheKey = `cache_${key.replace(/\//g, '_')}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        return {
          ...data,
          message: 'Data loaded from cache (offline)',
        };
      }
    } catch (error) {
      console.warn('Failed to get offline data:', error);
    }

    return {
      success: false,
      data: null as any,
      message: 'No offline data available',
      error: 'Network unavailable and no cached data found',
    };
  }

  private async queueOfflineRequest<T>(
    method: string,
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      const queue = queueData ? JSON.parse(queueData) : [];
      
      queue.push({
        id: Date.now().toString(),
        method,
        url,
        data,
        timestamp: Date.now(),
      });

      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));

      return {
        success: true,
        data: null as any,
        message: 'Request queued for sync when online',
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: 'Failed to queue offline request',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Sync queued requests when back online
  async syncQueuedRequests() {
    if (!this.isOnline) return;

    try {
      const queueData = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      if (!queueData) return;

      const queue = JSON.parse(queueData);
      const successfulSyncs: string[] = [];

      for (const request of queue) {
        try {
          await this.api.request({
            method: request.method,
            url: request.url,
            data: request.data,
          });
          successfulSyncs.push(request.id);
        } catch (error) {
          console.warn('Failed to sync request:', request, error);
        }
      }

      // Remove successfully synced requests
      const remainingQueue = queue.filter(
        (req: any) => !successfulSyncs.includes(req.id)
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(remainingQueue));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      return new Error(error.response.data?.message || 'Server error');
    } else if (error.request) {
      return new Error('Network error');
    } else {
      return new Error(error.message || 'Unknown error');
    }
  }

  // Network status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }
}

export const apiService = new ApiService();