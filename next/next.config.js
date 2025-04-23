/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // 添加路径别名
    config.resolve.alias['@'] = __dirname + '/src'
    return config
  },
  // 构建时忽略类型错误
  typescript: {
    ignoreBuildErrors: true
  },
  // 构建时忽略ESLint错误
  eslint: {
    ignoreDuringBuilds: true
  },
  // 设置更长的构建超时时间
  // staticPageGenerationTimeout: 180,
  experimental: {
    // 禁用热重载以提高构建性能
    webpackBuildWorker: false,
    // 增加ServerComponents建超时
    serverComponentsExternalPackages: []
  }
}

module.exports = nextConfig 