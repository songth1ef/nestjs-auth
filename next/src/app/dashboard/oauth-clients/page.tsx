'use client'

import { useState, useEffect, FormEvent } from 'react'
import { apiClient, OAuthClient, CreateClientDto } from '@/lib/api/client'

// 定义API错误类型
interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: Record<string, unknown>;
  data?: unknown;
  code?: number;
  path?: string;
  method?: string;
  success?: boolean;
  timestamp?: number;
}

// 客户端列表组件
const ClientList = ({ clients, onDelete }: { clients: OAuthClient[], onDelete: (id: string) => void }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户端ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客户端密钥</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{client.description || '--'}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="bg-gray-100 p-1 rounded">{client.clientId}</code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="bg-gray-100 p-1 rounded">{client.clientSecret}</code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.isActive ? '启用' : '禁用'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(client.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => onDelete(client.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 函数检查是否是合法的URL
const isValidUrl = (url: string): boolean => {
  try {
    // 检查是否包含协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    
    // 检查URL语法
    const urlObj = new URL(url);
    
    // 确保URL有主机名
    return !!urlObj.hostname;
  } catch {
    return false;
  }
};

// 创建客户端表单组件
const CreateClientForm = ({ onCreate }: { onCreate: () => void }) => {
  const [formData, setFormData] = useState<CreateClientDto>({
    name: '',
    description: '',
    redirectUris: [''],
    scopes: ['read', 'write'],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [rawResponse, setRawResponse] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};
    
    // 检查名称
    if (!formData.name.trim()) {
      errors.name = ['客户端名称不能为空'];
    }
    
    // 检查重定向URI
    const uriErrors: string[] = [];
    const validUris = formData.redirectUris.filter(uri => uri.trim() !== '');
    
    if (validUris.length === 0) {
      uriErrors.push('至少需要提供一个重定向URI');
    } else {
      formData.redirectUris.forEach((uri, index) => {
        if (uri.trim() && !isValidUrl(uri)) {
          uriErrors.push(`URI #${index + 1} 格式无效：必须是完整的URL地址，以http://或https://开头`);
        }
      });
    }
    
    if (uriErrors.length > 0) {
      errors.redirectUris = uriErrors;
    }
    
    // 检查权限范围
    if (formData.scopes.length === 0) {
      errors.scopes = ['至少需要选择一个权限范围'];
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setRawResponse(null)
    setFormErrors({})
    
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // 清理空的重定向URI
      const cleanRedirectUris = formData.redirectUris
        .filter(uri => uri.trim().length > 0)
        .map(uri => uri.trim());
        
      const cleanFormData = {
        ...formData,
        redirectUris: cleanRedirectUris,
      }
      
      await apiClient.createOAuthClient(cleanFormData)
      setFormData({
        name: '',
        description: '',
        redirectUris: [''],
        scopes: ['read', 'write'],
      })
      onCreate()
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || '创建客户端失败，请重试');
      
      // 显示原始错误信息以便调试
      setRawResponse(JSON.stringify(apiError, null, 2));
    } finally {
      setIsSubmitting(false)
    }
  }

  const addRedirectUri = () => {
    setFormData({
      ...formData,
      redirectUris: [...formData.redirectUris, ''],
    })
  }

  const updateRedirectUri = (index: number, value: string) => {
    const updatedUris = [...formData.redirectUris]
    updatedUris[index] = value
    setFormData({
      ...formData,
      redirectUris: updatedUris,
    })
  }

  const removeRedirectUri = (index: number) => {
    const updatedUris = formData.redirectUris.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      redirectUris: updatedUris.length ? updatedUris : [''],
    })
  }

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900">创建新的OAuth客户端</h3>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {rawResponse && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
          <details>
            <summary className="cursor-pointer font-medium">查看详细错误信息</summary>
            <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-100 rounded">
              {rawResponse}
            </pre>
          </details>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">客户端名称</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`mt-1 block w-full border ${formErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
            required
          />
          {formErrors.name && (
            <div className="mt-1 text-sm text-red-600">
              {formErrors.name.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">描述</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">重定向URI</label>
          <p className="text-xs text-gray-500 mb-2">必须是完整的URL地址，包含协议（例如：https://example.com/callback）</p>
          {formData.redirectUris.map((uri, index) => (
            <div key={index} className="flex mt-2">
              <input
                type="url"
                value={uri}
                onChange={(e) => updateRedirectUri(index, e.target.value)}
                className={`block w-full border ${formErrors.redirectUris ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-2`}
                placeholder="https://example.com/callback"
                pattern="https?://.*"
                title="请输入有效的URL，必须以http://或https://开头"
                required
              />
              <button
                type="button"
                onClick={() => removeRedirectUri(index)}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md"
              >
                删除
              </button>
            </div>
          ))}
          {formErrors.redirectUris && (
            <div className="mt-1 text-sm text-red-600">
              {formErrors.redirectUris.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={addRedirectUri}
            className="mt-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md"
          >
            添加更多重定向URI
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">权限范围</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.scopes.includes('read')}
                onChange={(e) => {
                  const newScopes = e.target.checked
                    ? [...formData.scopes, 'read']
                    : formData.scopes.filter(s => s !== 'read')
                  setFormData({ ...formData, scopes: newScopes })
                }}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">读取 (read)</span>
            </label>
            
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.scopes.includes('write')}
                onChange={(e) => {
                  const newScopes = e.target.checked
                    ? [...formData.scopes, 'write']
                    : formData.scopes.filter(s => s !== 'write')
                  setFormData({ ...formData, scopes: newScopes })
                }}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">写入 (write)</span>
            </label>
          </div>
          {formErrors.scopes && (
            <div className="mt-1 text-sm text-red-600">
              {formErrors.scopes.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? '创建中...' : '创建客户端'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function OAuthClientsPage() {
  const [clients, setClients] = useState<OAuthClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getOAuthClients()
      setClients(data)
      setError('')
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || '获取OAuth客户端列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const deleteClient = async (id: string) => {
    try {
      await apiClient.deleteOAuthClient(id)
      setDeleteConfirmId(null)
      loadClients()
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || '删除客户端失败，请重试')
    }
  }
  
  // 确认删除对话框
  const DeleteConfirmDialog = ({ id, onCancel, onConfirm }: { id: string, onCancel: () => void, onConfirm: (id: string) => void }) => {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
          <p className="text-gray-500 mb-6">
            您确定要删除这个OAuth客户端吗？此操作不可撤销，并且会使所有使用此客户端的应用无法继续访问API。
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">OAuth客户端管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {showForm ? '隐藏表单' : '创建新客户端'}
        </button>
      </div>
      
      {showForm && <CreateClientForm onCreate={() => { loadClients(); setShowForm(false); }} />}
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="mt-6 text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">加载中...</p>
        </div>
      ) : clients.length > 0 ? (
        <ClientList 
          clients={clients} 
          onDelete={(id) => setDeleteConfirmId(id)} 
        />
      ) : (
        <div className="mt-6 text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500">暂无OAuth客户端，请创建一个新的客户端。</p>
        </div>
      )}
      
      {deleteConfirmId && (
        <DeleteConfirmDialog 
          id={deleteConfirmId}
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={deleteClient}
        />
      )}
    </div>
  )
} 