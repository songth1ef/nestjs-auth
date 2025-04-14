import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLanguageDto {
  @ApiProperty({
    description: '首选语言',
    example: 'en',
    enum: ['zh', 'en']
  })
  @IsString()
  @IsIn(['zh', 'en'], { message: '语言必须是支持的语言之一' })
  language: string;
} 