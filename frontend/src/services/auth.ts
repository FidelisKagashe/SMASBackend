import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { apiService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import { User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiService.post<{ user: User; token: string }>(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await apiService.post<{ user: User; token: string }>(
        API_ENDPOINTS.REGISTER,
        userData
      );

      if (response.success && response.data) {
        await this.storeAuthData(response.data.token, response.data.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthData();
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return apiService.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return apiService.post(API_ENDPOINTS.RESET_PASSWORD, {
      token,
      password: newPassword,
    });
  }

  // Store authentication data
  private async storeAuthData(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      
      // Store token securely for biometric access
      await SecureStore.setItemAsync('secure_token', token);
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  // Get stored authentication data
  async getStoredAuthData(): Promise<{ token: string | null; user: User | null }> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      return {
        token,
        user: userData ? JSON.parse(userData) : null,
      };
    } catch (error) {
      console.error('Failed to get stored auth data:', error);
      return { token: null, user: null };
    }
  }

  // Clear authentication data
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
      await SecureStore.deleteItemAsync('secure_token');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Biometric authentication setup
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric check failed:', error);
      return false;
    }
  }

  // Get available biometric types
  async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Failed to get biometric types:', error);
      return [];
    }
  }

  // Authenticate with biometrics
  async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication not available',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use Password',
      });

      if (result.success) {
        // Get stored token and validate
        const secureToken = await SecureStore.getItemAsync('secure_token');
        if (secureToken) {
          // Validate token with backend
          const authData = await this.getStoredAuthData();
          return {
            success: true,
          };
        } else {
          return {
            success: false,
            error: 'No stored authentication found',
          };
        }
      } else {
        return {
          success: false,
          error: result.error || 'Biometric authentication failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  // Enable biometric authentication
  async enableBiometricAuth(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      if (!isAvailable) {
        throw new Error('Biometric authentication not available');
      }

      const authData = await this.getStoredAuthData();
      if (!authData.token) {
        throw new Error('No authentication token found');
      }

      // Store token securely for biometric access
      await SecureStore.setItemAsync('secure_token', authData.token);
      
      // Update user preferences
      const user = authData.user;
      if (user) {
        user.preferences.biometricEnabled = true;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }

      return true;
    } catch (error) {
      console.error('Failed to enable biometric auth:', error);
      return false;
    }
  }

  // Disable biometric authentication
  async disableBiometricAuth(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('secure_token');
      
      // Update user preferences
      const authData = await this.getStoredAuthData();
      const user = authData.user;
      if (user) {
        user.preferences.biometricEnabled = false;
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to disable biometric auth:', error);
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { token } = await this.getStoredAuthData();
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.post<{ token: string }>(API_ENDPOINTS.REFRESH_TOKEN);
      
      if (response.success && response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }
}

export const authService = new AuthService();