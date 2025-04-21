import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false,
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: '客户端ID（可选，用于OAuth认证）',
    example: 'abc123def456',
    required: false,
  })
  @IsString()
  @IsOptional()
  client_id?: string;

  @ApiProperty({
    description: '客户端密钥（可选，用于OAuth认证）',
    example: 'secret123456',
    required: false,
  })
  @IsString()
  @IsOptional()
  client_secret?: string;

  @ApiProperty({
    description: '重定向URI（可选，用于OAuth认证）',
    example: 'https://example.com/callback',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  redirect_uri?: string;

  @ApiProperty({
    description: '授权范围（可选，用于OAuth认证）',
    example: 'read write',
    required: false,
  })
  @IsString()
  @IsOptional()
  scope?: string;
}
