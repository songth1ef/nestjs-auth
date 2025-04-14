'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 验证用户是否已登录
    const isAuthenticated = localStorage.getItem("auth") === "true";
    
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">管理系统仪表板</h1>
            <div className="flex space-x-4">
              <Link
                href="/dashboard/users"
                className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                用户管理
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("auth");
                  router.push("/login");
                }}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 数据卡片 */}
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">用户总数</h2>
              <p className="mt-2 text-3xl font-bold text-indigo-600">1,234</p>
              <p className="mt-2 text-sm text-gray-500">较上月增长 12%</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">今日访问</h2>
              <p className="mt-2 text-3xl font-bold text-green-600">567</p>
              <p className="mt-2 text-sm text-gray-500">较昨日增长 5%</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900">总收入</h2>
              <p className="mt-2 text-3xl font-bold text-blue-600">¥98,765</p>
              <p className="mt-2 text-sm text-gray-500">较上周增长 8%</p>
            </div>
          </div>
          
          {/* 最近活动 */}
          <div className="mt-8 overflow-hidden bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">最近活动</h3>
              <p className="max-w-2xl mt-1 text-sm text-gray-500">系统中的最新活动记录。</p>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        用户活动 #{item}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          成功
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          用户 ID: {1000 + item}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          活动类型: 登录
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 