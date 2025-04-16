import { API_CONFIG, API_ENDPOINTS } from './config'
import { handleResponse, handleError } from './utils'

class ApiClient {
  private baseURL: string
  private headers: HeadersInit

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.headers = API_CONFIG.headers
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token')
    }
    return null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()
    
    // 构建请求头，如果有token则添加Authorization头
    const headers: Record<string, string> = {
      ...this.headers as Record<string, string>,
      ...(options.headers as Record<string, string> || {}),
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const config: RequestInit = {
      ...options,
      headers,
      credentials: API_CONFIG.withCredentials ? 'include' : 'same-origin',
    }

    try {
      const response = await fetch(url, config)
      return handleResponse(response)
    } catch (error) {
      return handleError(error as Error)
    }
  }

  // Auth API
  async login(data: { email?: string; username?: string; password: string }) {
    return this.request(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async register(data: {
    email: string
    password: string
    username: string
  }) {
    return this.request(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async logout() {
    return this.request(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    })
  }

  async refreshToken() {
    return this.request(API_ENDPOINTS.auth.refresh, {
      method: 'POST',
    })
  }

  async forgotPassword(email: string) {
    return this.request(API_ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(data: {
    token: string
    password: string
  }) {
    return this.request(API_ENDPOINTS.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // User API
  async getUsers(params: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return this.request(`${API_ENDPOINTS.user.users}${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  }

  async getProfile() {
    return this.request(API_ENDPOINTS.user.profile, {
      method: 'GET',
    })
  }

  async updateProfile(data: {
    username?: string
    email?: string
  }) {
    return this.request(API_ENDPOINTS.user.updateProfile, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async changePassword(data: {
    oldPassword: string
    newPassword: string
  }) {
    return this.request(API_ENDPOINTS.user.changePassword, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient() 