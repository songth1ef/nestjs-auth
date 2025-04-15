/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // 添加路径别名
    config.resolve.alias['@'] = __dirname + '/src'
    return config
  },
  // 禁用开发日志
  experimental: {
    logging: 'none'
  }
}

module.exports = nextConfig 