'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { apiClient, User, PageMeta } from '@/lib/api/client';

interface ApiError {
  code: number;
  message: string;
  success: false;
}

export default function UsersPage() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // 监听limit变化并重置页码
  useEffect(() => {
    // 仅在非初始化加载时重置页码
    if (!loading && page !== 1) {
      setPage(1);
    }
  }, [limit, search, loading, page]);

  // 将 fetchUsers 用 useCallback 包装，避免无限循环
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`正在获取第${page}页数据, 每页${limit}条`);
      const response = await apiClient.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
      });
      
      // 提取用户数据和分页元数据
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      
      // 处理403错误（权限不足）
      const apiError = error as ApiError;
      if (apiError.code === 403) {
        setError('您没有权限访问用户管理页面');
      } else {
        setError(apiError.message || '获取用户列表失败');
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    // 验证用户是否已登录
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('auth') === 'true';
      const token = localStorage.getItem('token');
      
      if (!isAuthenticated || !token) {
        router.push('/login');
      } else {
        fetchUsers();
      }
    }
  }, [router, fetchUsers]); // 仅依赖router和fetchUsers

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 重置到第一页
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    // 注意：不需要在这里手动设置page=1，因为useEffect会处理这个
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  // 如果有错误信息，显示错误页面
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">访问错误</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {t('common.backToDashboard')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{t('users.management')}</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {t('common.backToDashboard')}
            </Link>
          </div>
        </div>
      </header>
      
      <main className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 bg-white shadow-sm sm:rounded-lg">
          <div className="flex justify-between mb-6">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('users.searchPlaceholder')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-r-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('common.search')}
              </button>
            </form>
            <select
              value={limit}
              onChange={handleLimitChange}
              className="block px-3 py-2 ml-4 text-base border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="5">5{t('common.itemsPerPage')}</option>
              <option value="10">10{t('common.itemsPerPage')}</option>
              <option value="20">20{t('common.itemsPerPage')}</option>
              <option value="50">50{t('common.itemsPerPage')}</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">{t('common.loading')}</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.username')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.email')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.roles')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.createdAt')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              {t('users.lastLogin')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
                                {t('users.noUsersFound')}
                              </td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.username}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {user.roles ? user.roles.join(', ') : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.isActive ? t('users.active') : t('users.inactive')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatDate(user.createdAt)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                  {formatDate(user.lastLoginDate)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {meta && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between flex-1 sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!meta.hasPreviousPage}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        meta.hasPreviousPage
                          ? 'text-gray-700 bg-white hover:bg-gray-50'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      {t('pagination.previous')}
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!meta.hasNextPage}
                      className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
                        meta.hasNextPage
                          ? 'text-gray-700 bg-white hover:bg-gray-50'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      {t('pagination.next')}
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t('pagination.showing')}{' '}
                        <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span>
                        {' '}{t('pagination.to')}{' '}
                        <span className="font-medium">
                          {Math.min(meta.page * meta.limit, meta.totalItems)}
                        </span>
                        {' '}{t('pagination.of')}{' '}
                        <span className="font-medium">{meta.totalItems}</span>
                        {' '}{t('pagination.results')}
                      </p>
                    </div>
                    <div>
                      <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                        {/* 第一页按钮 */}
                        <button
                          onClick={() => setPage(1)}
                          disabled={!meta.hasPreviousPage || meta.page === 1}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                            meta.hasPreviousPage && meta.page !== 1
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">{t('pagination.first')}</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                            <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                          </svg>
                        </button>
                        {/* 上一页按钮 */}
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={!meta.hasPreviousPage}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                            meta.hasPreviousPage
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">{t('pagination.previous')}</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {/* 页码按钮 */}
                        {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                          const pageNum = meta.page <= 3
                            ? i + 1
                            : meta.page >= meta.totalPages - 2
                              ? meta.totalPages - 4 + i
                              : meta.page - 2 + i;
                          
                          if (pageNum <= 0 || pageNum > meta.totalPages) return null;
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                meta.page === pageNum
                                  ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {/* 下一页按钮 */}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={!meta.hasNextPage}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                            meta.hasNextPage
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">{t('pagination.next')}</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                          </svg>
                        </button>
                        {/* 最后一页按钮 */}
                        <button
                          onClick={() => setPage(meta.totalPages)}
                          disabled={!meta.hasNextPage || meta.page === meta.totalPages}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 ${
                            meta.hasNextPage && meta.page !== meta.totalPages
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">{t('pagination.last')}</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 