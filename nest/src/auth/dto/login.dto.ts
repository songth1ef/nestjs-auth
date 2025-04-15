import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    required: false
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false
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
} 