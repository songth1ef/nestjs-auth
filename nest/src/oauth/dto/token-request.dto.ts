import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, IsOptional, IsUrl } from 'class-validator';

export class TokenRequestDto {
  @ApiProperty({
    example: 'authorization_code',
    description: '授权类型',
    enum: ['authorization_code', 'refresh_token', 'client_credentials'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['authorization_code', 'refresh_token', 'client_credentials'])
  grant_type: string;

  @ApiProperty({
    example: 'abc123',
    description: '客户端ID',
  })
  @IsString()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({
    example: 'xyz789',
    description: '客户端密钥',
  })
  @IsString()
  @IsNotEmpty()
  client_secret: string;

  @ApiProperty({
    example: 'def456',
    description: '授权码，仅grant_type为authorization_code时需要',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    example: 'https://example.com/callback',
    description: '重定向URI，需要与授权请求中的一致',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  redirect_uri?: string;

  @ApiProperty({
    example: 'ghi789',
    description: '刷新令牌，仅grant_type为refresh_token时需要',
    required: false,
  })
  @IsString()
  @IsOptional()
  refresh_token?: string;

  @ApiProperty({
    example: 'read write',
    description: '请求的权限范围，空格分隔',
    required: false,
  })
  @IsString()
  @IsOptional()
  scope?: string;
}
