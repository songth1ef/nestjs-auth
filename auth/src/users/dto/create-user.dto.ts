import { IsString, IsEmail, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: '用户名' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john@example.com', description: '电子邮件' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+8613800138000', description: '手机号码' })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, { message: '手机号码格式不正确' })
  phoneNumber?: string;

  @ApiProperty({ example: 'StrongPass123!', description: '密码' })
  @IsString()
  @MinLength(12)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    {
      message:
        '密码必须包含大小写字母、数字和特殊字符，且长度至少为12位',
    },
  )
  password: string;
} 