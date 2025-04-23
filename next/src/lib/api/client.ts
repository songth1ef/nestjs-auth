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

// 登录响应
export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
    roles: string[]
  }
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
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (!token || token === 'undefined') {
        console.warn('未找到有效的token或token为undefined')
        return null
      }
      return token
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
      console.log(`发送请求到 ${endpoint} 带有token: ${token.substring(0, 10)}...`)
    } else {
      console.log(`发送请求到 ${endpoint} 无token`)
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
  async login(data: { email?: string; username?: string; password: string }): Promise<LoginResponse> {
    const response = await this.request<{
      code: number,
      data: {
        access_token: string,
        refresh_token: string,
        preferred_language: string
      },
      message: string,
      success: boolean,
      timestamp: number
    }>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    // 登录成功后直接存储token
    if (response && response.data && response.data.access_token) {
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      localStorage.setItem('auth', 'true')
      console.log('登录成功，已存储token')
    }
    
    // 转换为预期的LoginResponse格式
    return {
      token: response.data.access_token,
      user: {
        id: '', // 接口没有返回用户信息，先留空
        username: '',
        email: '',
        roles: []
      }
    }
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
    // 登出时清除token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('auth')
    }
    
    return this.request(API_ENDPOINTS.auth.logout, {
      method: 'POST',
    })
  }

  async refreshToken() {
    const response = await this.request<{token: string}>(API_ENDPOINTS.auth.refresh, {
      method: 'POST',
    })
    
    // 刷新token成功后更新存储的token
    if (response && response.token) {
      localStorage.setItem('token', response.token)
    }
    
    return response
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
    const response = await this.request<{ data: OAuthClient[] } | OAuthClient[]>(API_ENDPOINTS.oauth.clients, {
      method: 'GET',
    })
    
    // 确保返回数组类型
    if (Array.isArray(response)) {
      return response
    } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
      return response.data
    }
    
    console.error('OAuth客户端响应格式不正确:', response)
    return []
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