import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateClientDto {
  @ApiProperty({ example: '前端应用', description: '客户端名称' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Web应用，用于前后端分离架构',
    description: '客户端描述',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: [
      'https://example.com/callback',
      'https://staging.example.com/callback',
    ],
    description: '重定向URI列表',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  redirectUris?: string[];

  @ApiProperty({
    example: ['authorization_code', 'refresh_token'],
    description: '允许的授权类型',
    required: false,
    default: ['authorization_code'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  allowedGrantTypes?: string[];

  @ApiProperty({
    example: ['read', 'write'],
    description: '权限范围',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value?.split(',')))
  scopes?: string[];

  @ApiProperty({
    example: true,
    description: '是否激活',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiProperty({
    example: 3600,
    description: '访问令牌有效期（秒）',
    default: 3600,
    required: false,
  })
  @IsNumber()
  @Min(60)
  @IsOptional()
  @Type(() => Number)
  accessTokenLifetime?: number;

  @ApiProperty({
    example: 2592000,
    description: '刷新令牌有效期（秒）',
    default: 2592000,
    required: false,
  })
  @IsNumber()
  @Min(600)
  @IsOptional()
  @Type(() => Number)
  refreshTokenLifetime?: number;
}
