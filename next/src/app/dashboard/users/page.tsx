'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 模拟用户数据
const mockUsers = [
  { id: 1, name: "张三", email: "zhangsan@example.com", role: "管理员", status: "活跃" },
  { id: 2, name: "李四", email: "lisi@example.com", role: "编辑", status: "活跃" },
  { id: 3, name: "王五", email: "wangwu@example.com", role: "用户", status: "禁用" },
  { id: 4, name: "赵六", email: "zhaoliu@example.com", role: "用户", status: "活跃" },
  { id: 5, name: "钱七", email: "qianqi@example.com", role: "编辑", status: "活跃" },
];

export default function Users() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // 验证用户是否已登录
    const isAuthenticated = localStorage.getItem("auth") === "true";
    
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router]);
  
  // 处理搜索
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setUsers(mockUsers);
      return;
    }
    
    const filtered = mockUsers.filter(
      user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setUsers(filtered);
  };
  
  // 处理状态切换
  const toggleStatus = (id: number) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        const newStatus = user.status === "活跃" ? "禁用" : "活跃";
        return { ...user, status: newStatus };
      }
      return user;
    });
    
    setUsers(updatedUsers);
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }
  
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
      
      <main>
        <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* 搜索和添加用户 */}
          <div className="flex flex-col justify-between mb-6 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex flex-1 max-w-md space-x-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索用户名或邮箱..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                搜索
              </button>
            </div>
            
            <button className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">
              添加用户
            </button>
          </div>
          
          {/* 用户列表 */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "活跃" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                      <button 
                        onClick={() => toggleStatus(user.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {user.status === "活跃" ? "禁用" : "启用"}
                      </button>
                      <span className="mx-2 text-gray-300">|</span>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        编辑
                      </button>
                      <span className="mx-2 text-gray-300">|</span>
                      <button className="text-red-600 hover:text-red-900">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
} 