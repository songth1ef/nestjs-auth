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
    // 尝试解析错误信息
    try {
      const errorData = await response.json()
      if (errorData && errorData.message) {
        throw new Error(errorData.message)
      }
    } catch {
      // 如果无法解析错误信息，则使用状态文本
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }
    throw new Error('请求失败')
  }

  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const result = await response.json()
    console.log('API响应:', result)
    
    // API响应可能有不同的结构：
    // 1. { code, data, message, success, timestamp } 格式 - 返回data
    // 2. { data, ... } 格式 - 返回data
    // 3. 其他格式 - 返回原始结果
    
    if (result && typeof result === 'object') {
      // 检查是否有标准API响应结构
      if ('code' in result && 'data' in result && 'success' in result) {
        if (!result.success) {
          throw new Error(result.message || '请求失败')
        }
        console.log('提取API响应中的data字段:', result.data)
        return result.data  // 返回data字段
      }
      
      // 检查是否只有data字段
      if ('data' in result && Object.keys(result).length === 1) {
        return result.data
      }
    }
    
    return result
  }
  
  return response.text()
}

export const handleError = (error: Error) => {
  console.error('API Error:', error)
  throw error
} 