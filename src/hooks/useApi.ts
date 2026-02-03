// src/hooks/useApi.ts
/**
 * API Query Hooks using TanStack Query
 * Example hooks for common API operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { QUERY_KEYS } from '@/config/constants';
import type { UserProfile, UpdateUserRequest, UserSettings } from '@/types/user.types';
import toast from 'react-hot-toast';

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.USER.PROFILE,
    queryFn: () => userService.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Update the cached profile data
      queryClient.setQueryData(QUERY_KEYS.USER.PROFILE, updatedProfile);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

/**
 * Hook to fetch user settings
 */
export function useUserSettings() {
  return useQuery({
    queryKey: QUERY_KEYS.USER.SETTINGS,
    queryFn: () => userService.getSettings(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => userService.updateSettings(settings),
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(QUERY_KEYS.USER.SETTINGS, updatedSettings);
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
}

/**
 * Hook to delete user account
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      // Redirect will be handled by the component
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete account');
    },
  });
}

/**
 * Example: Generic API query hook factory
 * Use this pattern to create hooks for other API endpoints
 */
export function useApiQuery<TData>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    retry?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Example: Generic API mutation hook factory
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      if (options?.errorMessage) {
        toast.error(options.errorMessage);
      } else {
        toast.error(error.message || 'An error occurred');
      }
      options?.onError?.(error);
    },
  });
}
