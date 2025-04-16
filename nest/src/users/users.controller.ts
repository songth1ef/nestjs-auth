import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { User } from './entities/user.entity';
import { PageDto, PageResponseDto } from '../common/dto/page.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: '获取用户个人资料',
    description: '获取当前登录用户的完整个人资料信息',
    tags: ['users'],
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
    tags: ['users'],
  })
  @ApiOkResponse({
    description: '语言偏好更新成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 400, description: '无效的语言选择' })
  async updateLanguage(
    @Request() req,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    const id = req.user?.id || req.user?.sub;
    const user = await this.usersService.updatePreferredLanguage(
      id,
      updateLanguageDto.language,
    );

    return {
      messageKey: 'user.profile.updateLanguageSuccess',
      args: { language: updateLanguageDto.language },
      data: { preferredLanguage: user.preferredLanguage },
    };
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '分页查询用户列表' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '页码',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '每页数量',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: '搜索关键词',
  })
  @ApiOkResponse({
    description: '用户列表',
    type: PageResponseDto,
  })
  async findAll(@Query() pageDto: PageDto): Promise<PageResponseDto<User>> {
    return await this.usersService.findAll(pageDto);
  }
}
