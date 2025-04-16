import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendVerificationCodeDto {
  @IsEmail({}, { message: '请提供有效的电子邮件地址' })
  @IsNotEmpty({ message: '电子邮件地址不能为空' })
  email: string;
}
