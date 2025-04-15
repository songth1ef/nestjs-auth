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
  return response.json()
}

export const handleError = (error: Error) => {
  console.error('API Error:', error)
  throw error
} 