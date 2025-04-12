# 统一响应格式

为确保API接口的一致性和良好的客户端开发体验，项目采用了统一的响应格式。

## 响应格式

所有API接口的响应都将遵循以下格式：

```json
{
  "code": 200,          // 状态码
  "data": null,         // 响应数据
  "message": "操作成功",  // 响应消息
  "success": true,      // 是否成功
  "timestamp": 1619704889647  // 时间戳
}
```

## 成功响应示例

### 单个对象响应

```json
{
  "code": 200,
  "data": {
    "id": "d64c9949-3c32-4068-bda2-5b5219d78cb4",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2023-04-01T12:00:00Z",
    "updatedAt": "2023-04-01T12:00:00Z"
  },
  "message": "获取成功",
  "success": true,
  "timestamp": 1619704889647
}
```

### 分页列表响应

```json
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "d64c9949-3c32-4068-bda2-5b5219d78cb4",
        "username": "testuser1",
        "email": "test1@example.com",
        "createdAt": "2023-04-01T12:00:00Z",
        "updatedAt": "2023-04-01T12:00:00Z"
      },
      {
        "id": "7f9c4e72-1a24-4b63-8518-9de1c85fc4a7",
        "username": "testuser2",
        "email": "test2@example.com",
        "createdAt": "2023-04-02T12:00:00Z",
        "updatedAt": "2023-04-02T12:00:00Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 10
  },
  "message": "获取成功",
  "success": true,
  "timestamp": 1619704889647
}
```

## 错误响应示例

### 客户端错误 (4xx)

```json
{
  "code": 400,
  "data": null,
  "message": "用户名不能为空",
  "path": "/auth/register",
  "method": "POST",
  "success": false,
  "timestamp": 1619704889647
}
```

### 服务器错误 (5xx)

```json
{
  "code": 500,
  "data": null,
  "message": "服务器内部错误",
  "path": "/users",
  "method": "GET",
  "success": false,
  "timestamp": 1619704889647
}
```

## 实现说明

统一响应格式通过以下组件实现：

1. **ResponseInterceptor**：拦截所有控制器的响应，将其转换为统一格式。
2. **HttpExceptionFilter**：处理HTTP异常，将其转换为统一的错误响应格式。
3. **AllExceptionsFilter**：捕获所有未处理的异常，防止意外错误导致非标准响应。

## 在控制器中使用

控制器方法只需返回业务数据，不需要手动包装为统一格式，拦截器会自动处理：

```typescript
@Get('profile')
async getProfile(@Param('id') id: string) {
  return this.usersService.findOne(id); // 直接返回用户数据
}
```

## 在Swagger中的展示

统一响应格式已在Swagger API文档中配置，包括：

- ResponseDto：通用响应DTO
- PaginatedResponseDto：分页响应DTO
- ErrorResponseDto：错误响应DTO

可以在API方法上使用这些类型：

```typescript
@Get('users')
@ApiOkResponse({
  description: '获取用户列表',
  type: PaginatedResponseDto,
})
async getUsers() {
  // ...
}
``` 