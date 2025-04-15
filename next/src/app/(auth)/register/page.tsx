'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/lib/api/client'
import Link from 'next/link'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')

  const validateUsername = (username: string) => {
    if (username.includes('@')) {
      setUsernameError(t('errors.usernameNoAt'))
      return false
    }
    setUsernameError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUsernameError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string

    // 验证用户名
    if (!validateUsername(username)) {
      setLoading(false)
      return
    }

    console.log('提交注册:', { email, username, password: '***' })

    try {
      console.log('发送请求到:', `/api/auth/register`)
      const response = await apiClient.register({ email, password, username })
      console.log('注册成功:', response)
      router.push('/login')
    } catch (err) {
      console.error('注册失败:', err)
      setError(err instanceof Error ? err.message : t('errors.unknown'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.register.or')}{' '}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('auth.register.loginLink')}
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
              <label htmlFor="username" className="sr-only">
                {t('auth.register.username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                onChange={(e) => validateUsername(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.register.username')}
              />
              {usernameError && (
                <p className="mt-1 text-sm text-red-600">{usernameError}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.register.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.register.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.register.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.register.password')}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              我已阅读并同意{' '}
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                服务条款
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.register.loading') : t('auth.register.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 