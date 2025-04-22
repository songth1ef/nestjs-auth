import { API_CONFIG, API_ENDPOINTS } from './config'
import { handleResponse, handleError } from './utils'

// 定义OAuth客户端接口
export interface OAuthClient {
  id: string
  name: string
  description?: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 创建OAuth客户端DTO
export interface CreateClientDto {
  name: string
  description?: string
  redirectUris: string[]
  scopes: string[]
}

// 用户接口
export interface User {
  id: string
  username: string
  email: string
  roles: string[]
  isActive: boolean
  createdAt: string
  lastLoginDate?: string
}

// 分页元数据
export interface PageMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  meta: PageMeta
}

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
    search?: string | undefined; 
  }): Promise<PaginatedResponse<User>> {
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
  
  // OAuth API
  async getOAuthClients(): Promise<OAuthClient[]> {
    return this.request(API_ENDPOINTS.oauth.clients, {
      method: 'GET',
    })
  }
  
  async getOAuthClient(id: string): Promise<OAuthClient> {
    return this.request(`${API_ENDPOINTS.oauth.clients}/${id}`, {
      method: 'GET',
    })
  }
  
  async createOAuthClient(data: CreateClientDto): Promise<OAuthClient> {
    // 确保所有重定向URI都是符合规范的URL格式
    const formattedData = {
      ...data,
      redirectUris: data.redirectUris.map(uri => {
        // 确保URL格式正确
        try {
          // 尝试解析URL
          const url = new URL(uri);
          
          // 确保URL包含协议、主机名和路径 (可能的NestJS验证要求)
          if (!url.protocol || !url.hostname) {
            throw new Error(`Invalid URL: ${uri}`);
          }
          
          // 确保URI不包含片段标识符(fragment)
          if (url.hash) {
            const uriWithoutFragment = uri.split('#')[0];
            console.log(`移除URL中的片段标识符: ${uri} -> ${uriWithoutFragment}`);
            return uriWithoutFragment;
          }
          
          return uri;
        } catch (error) {
          console.error(`无效的重定向URI: ${uri}`, error);
          throw new Error(`无效的重定向URI: ${uri}，必须是完整的URL地址，包含协议和主机名`);
        }
      })
    };
    
    return this.request(API_ENDPOINTS.oauth.clients, {
      method: 'POST',
      body: JSON.stringify(formattedData),
    });
  }
  
  async deleteOAuthClient(id: string): Promise<void> {
    return this.request(`${API_ENDPOINTS.oauth.clients}/${id}`, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient() 