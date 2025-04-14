import { Controller, Get, Patch, Body, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { User } from './entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ 
    summary: '获取用户个人资料',
    description: '获取当前登录用户的完整个人资料信息',
    tags: ['users']
  })
  @ApiOkResponse({
    description: '成功获取个人资料',
    type: User,
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  async getProfile(@Request() req) {
    const id = req.user?.id || req.user?.sub;
    return this.usersService.findById(id);
  }

  @Patch('language')
  @ApiOperation({ 
    summary: '更新用户语言偏好',
    description: '设置当前用户的首选语言',
    tags: ['users'] 
  })
  @ApiOkResponse({
    description: '语言偏好更新成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 400, description: '无效的语言选择' })
  async updateLanguage(
    @Request() req, 
    @Body() updateLanguageDto: UpdateLanguageDto
  ) {
    const id = req.user?.id || req.user?.sub;
    const user = await this.usersService.updatePreferredLanguage(
      id,
      updateLanguageDto.language
    );
    
    return {
      messageKey: 'user.profile.updateLanguageSuccess',
      args: { language: updateLanguageDto.language },
      data: { preferredLanguage: user.preferredLanguage }
    };
  }
} 