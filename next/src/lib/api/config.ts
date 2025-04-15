import { getBaseUrl } from './utils'

export const API_CONFIG = {
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  user: {
    users: '/api/users',
    profile: '/api/users/profile',
    updateProfile: '/api/users/profile',
    changePassword: '/api/users/change-password',
  },
} 