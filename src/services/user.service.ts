// src/services/user.service.ts
/**
 * User Service
 * Handles user-related API calls
 */

import { apiRequest } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/config/constants';
import type { UserProfile, UpdateUserRequest, UserSettings } from '@/types/user.types';
import type { ApiResponse } from '@/types/api.types';

class UserService {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await apiRequest<UserProfile>('GET', API_ENDPOINTS.USER.PROFILE);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch profile');
    }
    
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserRequest): Promise<UserProfile> {
    const response = await apiRequest<UserProfile>('PUT', API_ENDPOINTS.USER.UPDATE, data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }
    
    return response.data;
  }

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await apiRequest<UserSettings>('GET', '/api/user/settings');
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch settings');
    }
    
    return response.data;
  }

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await apiRequest<UserSettings>('PUT', '/api/user/settings', settings);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update settings');
    }
    
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    const response = await apiRequest<void>('DELETE', '/api/user/account');
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete account');
    }
  }
}

export const userService = new UserService();
