export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 浏览器环境
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8101'
  }
  // 服务器环境
  return process.env.API_URL || 'http://localhost:8101'
}

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '请求失败')
  }
  const result = await response.json()
  // 处理嵌套在data字段中的实际数据
  if (result && typeof result === 'object' && 'data' in result && 'success' in result) {
    return result.data
  }
  return result
}

export const handleError = (error: Error) => {
  console.error('API Error:', error)
  throw error
} 