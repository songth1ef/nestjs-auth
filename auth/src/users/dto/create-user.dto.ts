import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  Matches,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe', description: '用户名', minLength: 3 })
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

  @ApiProperty({ example: 'StrongP1!', description: '密码' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: '密码必须包含大小写字母、数字和特殊字符，且长度至少为8位',
    },
  )
  password: string;

  @ApiProperty({ 
    example: 'zh', 
    description: '首选语言', 
    enum: ['zh', 'en'],
    default: 'zh',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsIn(['zh', 'en']) // 支持的语言列表
  preferredLanguage?: string;
} 