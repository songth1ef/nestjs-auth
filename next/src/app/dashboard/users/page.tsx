'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/lib/api/client';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginDate: string;
}

interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

interface PageResponse {
  data: User[];
  meta: PageMeta;
}

export default function UsersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    // 验证用户是否已登录
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('auth') === 'true';
      
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchUsers();
      }
    }
  }, [router, page, limit, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getUsers({
        page,
        limit,
        search: search || undefined,
      }) as PageResponse;
      
      setUsers(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // 重置到第一页
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              返回仪表板
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
                placeholder="搜索用户名或邮箱"
                className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-r-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                搜索
              </button>
            </form>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="block px-3 py-2 ml-4 text-base border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="5">5条/页</option>
              <option value="10">10条/页</option>
              <option value="20">20条/页</option>
              <option value="50">50条/页</option>
            </select>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">加载中...</div>
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
                              用户名
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              邮箱
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              角色
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              状态
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              注册时间
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                              最后登录
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
                                未找到用户
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
                                    {user.roles.join(', ')}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {user.isActive ? '激活' : '禁用'}
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
                      上一页
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
                      下一页
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        显示第{' '}
                        <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span>
                        {' '}至{' '}
                        <span className="font-medium">
                          {Math.min(meta.page * meta.limit, meta.totalItems)}
                        </span>
                        {' '}条，共{' '}
                        <span className="font-medium">{meta.totalItems}</span>
                        {' '}条结果
                      </p>
                    </div>
                    <div>
                      <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={!meta.hasPreviousPage}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 ${
                            meta.hasPreviousPage
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">上一页</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                          </svg>
                        </button>
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
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={!meta.hasNextPage}
                          className={`relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 ${
                            meta.hasNextPage
                              ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <span className="sr-only">下一页</span>
                          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
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