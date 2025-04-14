import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseDto } from '../common/dto/response.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: '用户注册' })
  @ApiOkResponse({
    description: '注册成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.authService.login(user);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: '用户登录' })
  @ApiOkResponse({
    description: '登录成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiOkResponse({
    description: '刷新成功',
    type: ResponseDto,
  })
  @ApiResponse({ status: 401, description: '无效的刷新令牌' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refresh_token);
  }
} 