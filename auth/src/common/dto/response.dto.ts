import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '数据', example: null })
  data: T;

  @ApiProperty({ description: '消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '时间戳', example: 1619704889647 })
  timestamp: number;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export class PaginatedResponseDto<T> extends ResponseDto<PaginatedData<T>> {
  @ApiProperty({
    description: '数据',
    example: { items: [], total: 0, page: 1, limit: 10 }
  })
  declare data: PaginatedData<T>;
}

export class ErrorResponseDto extends ResponseDto<null> {
  @ApiProperty({ description: '错误路径', example: '/api/users' })
  path: string;

  @ApiProperty({ description: '请求方法', example: 'GET' })
  method: string;
} 