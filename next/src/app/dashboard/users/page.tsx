'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { apiClient, User, PageMeta } from '@/lib/api/client';
import UserTable from '@/components/users/UserTable';

// 内联定义分页组件，避免导入问题
function Pagination({ 
  page, 
  setPage, 
  meta, 
  labels 
}: {
  page: number;
  setPage: (newPage: number) => void;
  meta: PageMeta;
  labels: {
    showing: string;
    to: string;
    of: string;
    results: string;
    previous: string;
    next: string;
    first: string;
    last: string;
  };
}) {
  // 页码变更处理函数
  const handlePageChange = (newPage: number) => {
    console.log(`设置页码从 ${page} 到 ${newPage}`);
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      {/* 移动端分页控件 */}
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={!meta.hasPreviousPage}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            meta.hasPreviousPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {labels.previous}
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={!meta.hasNextPage}
          className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
            meta.hasNextPage
              ? 'text-gray-700 bg-white hover:bg-gray-50'
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          {labels.next}
        </button>
      </div>

      {/* 桌面端分页控件 */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {labels.showing}{' '}
            <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span>
            {' '}{labels.to}{' '}
            <span className="font-medium">
              {Math.min(meta.page * meta.limit, meta.totalItems)}
            </span>
            {' '}{labels.of}{' '}
            <span className="font-medium">{meta.totalItems}</span>
            {' '}{labels.results}
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
            {/* 第一页按钮 */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={!meta.hasPreviousPage || meta.page === 1}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasPreviousPage && meta.page !== 1
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.first}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
              </svg>
            </button>
            
            {/* 上一页按钮 */}
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!meta.hasPreviousPage}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasPreviousPage
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.previous}</span>
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
                  onClick={() => handlePageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    meta.page === pageNum
                      ? 'z-10 bg-indigo-600 text-white focus:z-20  focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* 下一页按钮 */}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!meta.hasNextPage}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${
                meta.hasNextPage
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.next}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* 最后一页按钮 */}
            <button
              onClick={() => handlePageChange(meta.totalPages)}
              disabled={!meta.hasNextPage || meta.page === meta.totalPages}
              className={`relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 ${
                meta.hasNextPage && meta.page !== meta.totalPages
                  ? 'hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  : 'cursor-not-allowed'
              }`}
            >
              <span className="sr-only">{labels.last}</span>
              <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H5.25A.75.75 0 014.5 10z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M9.5 10a.75.75 0 01.75-.75h2.793l-1.147-1.146a.75.75 0 011.061-1.061l2.5 2.5a.75.75 0 010 1.061l-2.5 2.5a.75.75 0 11-1.061-1.061l1.147-1.146H10.25A.75.75 0 019.5 10z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

interface ApiError {
  code: number;
  message: string;
  success: false;
}

// 简化的主页面组件
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

  // limit或search变化时重置page
  useEffect(() => {
    if (search !== '' || limit !== 10) {
      setPage(1);
    }
  }, [limit, search]);

  // 获取用户数据的函数
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log(`获取第${page}页数据，每页${limit}条`);
    
    try {
      const response = await apiClient.getUsers({
        page,
        limit,
        search: search.trim() || undefined,
      });
      
      // 确保response.data是数组
      if (response && response.data && Array.isArray(response.data)) {
        setUsers(response.data);
        setMeta(response.meta);
      } else {
        console.error('用户数据格式不正确:', response);
        setUsers([]);
        setError('获取用户数据失败，返回格式不正确');
      }
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.code === 403) {
        setError(t('error.noPermission') || '您没有权限访问用户管理页面');
      } else {
        setError(apiError.message || t('error.fetchUsersFailed') || '获取用户列表失败');
      }
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, t]);

  // 监听page, limit, search变化，重新获取数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = localStorage.getItem('auth') === 'true';
      const token = localStorage.getItem('token');

      if (!isAuthenticated || !token) {
        router.push('/login');
      } else {
        fetchUsers();
      }
    }
  }, [router, fetchUsers, page, limit, search]);

  // 搜索表单提交处理
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 搜索时自动重置到第一页
    setPage(1);
  };

  // 每页显示数量变化处理
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    console.log(`改变每页显示数量: ${limit} -> ${newLimit}`);
    setLimit(newLimit);
  };

  // 手动设置页码
  const handlePageChange = (newPage: number) => {
    console.log(`切换页码: ${page} -> ${newPage}`);
    setPage(newPage);
  };

  // 日期格式化函数
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  // 错误显示组件
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
          {/* 搜索和筛选控件 */}
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

          {/* 当前状态信息 */}
          <div className="mb-4 text-sm text-gray-600">
            当前页码: {page}, 每页显示: {limit} 
            {meta && `, 总记录数: ${meta.totalItems}, 总页数: ${meta.totalPages}`}
          </div>

          {/* 加载状态或用户表 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-lg text-gray-500">{t('common.loading')}</div>
            </div>
          ) : (
            <>
              {/* 用户表格 */}
              <UserTable 
                users={users} 
                noUsersMessage={t('users.noUsersFound')}
                formatDate={formatDate}
                labels={{
                  username: t('users.username'),
                  email: t('users.email'),
                  roles: t('users.roles'),
                  status: t('users.status'),
                  createdAt: t('users.createdAt'),
                  lastLogin: t('users.lastLogin'),
                  active: t('users.active'),
                  inactive: t('users.inactive')
                }}
              />

              {/* 分页组件 */}
              {meta && (
                <Pagination
                  page={page}
                  setPage={handlePageChange}
                  meta={meta}
                  labels={{
                    showing: t('pagination.showing'),
                    to: t('pagination.to'),
                    of: t('pagination.of'),
                    results: t('pagination.results'),
                    previous: t('pagination.previous'),
                    next: t('pagination.next'),
                    first: t('pagination.first'),
                    last: t('pagination.last')
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
} 