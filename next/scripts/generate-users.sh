#!/bin/bash

# 设置API地址
API_URL="http://localhost:8101/api/auth/register"

# 设置统一密码
PASSWORD="1qQ!1234"

# 创建100个用户
for i in {1..100}
do
  username="testuser$i"
  email="user$i@example.com"
  
  # 构造JSON数据
  json_data="{\"username\":\"$username\",\"email\":\"$email\",\"password\":\"$PASSWORD\"}"
  
  echo "创建用户: $username, 邮箱: $email"
  
  # 发送注册请求
  response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$json_data" \
    $API_URL)
  
  # 打印响应的关键信息
  success=$(echo $response | grep -o '"success":[^,}]*' | cut -d ':' -f2)
  message=$(echo $response | grep -o '"message":"[^"]*"' | cut -d '"' -f4)
  
  if [ "$success" = "true" ]; then
    echo "✅ 用户 $username 创建成功"
  else
    echo "❌ 用户 $username 创建失败: $message"
  fi
  
  # 添加短暂延迟，避免请求过快
  sleep 0.2
done

echo "完成! 尝试创建了100个用户。" 