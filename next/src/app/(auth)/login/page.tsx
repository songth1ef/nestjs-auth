'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'

// 定义登录响应类型
interface LoginResponse {
  code?: number;
  data?: {
    access_token: string;
    refresh_token: string;
    preferred_language?: string;
  };
  message?: string;
  success?: boolean;
  timestamp?: number;
  // 直接返回令牌的情况
  access_token?: string;
  refresh_token?: string;
  preferred_language?: string;
}

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const identifier = formData.get('identifier') as string
    const password = formData.get('password') as string
    // 获取但暂时不使用这个值
    // const rememberMe = formData.get('remember-me') === 'on'

    try {
      // 判断是用户名还是邮箱
      const isEmail = identifier.includes('@')
      const loginData = isEmail 
        ? { email: identifier, password } 
        : { username: identifier, password }
      
      const response = await apiClient.login(loginData) as LoginResponse
      
      // 登录成功后设置本地存储
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', 'true')
        
        // 处理不同的响应结构
        let accessToken = null;
        
        // 检查嵌套的data结构
        if (response.data && response.data.access_token) {
          accessToken = response.data.access_token;
        } 
        // 检查直接返回的token
        else if (response.access_token) {
          accessToken = response.access_token;
        }
        
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          console.log('Token saved:', accessToken);
          router.push('/dashboard');
        } else {
          console.error('No token received in response:', response);
          setError(t('errors.noToken'));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login.or')}{' '}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('auth.login.registerLink')}
            </Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">
                {t('auth.login.identifier')}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.login.identifier')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.login.password')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                {t('auth.login.rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {t('auth.login.forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.login.loading') : t('auth.login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 