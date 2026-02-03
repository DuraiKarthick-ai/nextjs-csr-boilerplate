// src/types/user.types.ts
/**
 * User Type Definitions
 */

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, any>;
}

// User Settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
  };
}

// User Update Request
export interface UpdateUserRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
}

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  [key: string]: any;
}
