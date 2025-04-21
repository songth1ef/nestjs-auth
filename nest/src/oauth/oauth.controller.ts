import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OAuthService } from './oauth.service';
import { TokenRequestDto } from './dto/token-request.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// 扩展Express的Request接口，添加user属性
interface RequestWithUser extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// 授权码响应接口
interface AuthorizationResponse {
  code: string;
  state?: string;
}

@ApiTags('oauth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('authorize')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '授权请求' })
  @ApiQuery({ name: 'client_id', required: true, description: '客户端ID' })
  @ApiQuery({ name: 'redirect_uri', required: false, description: '重定向URI' })
  @ApiQuery({ name: 'scope', required: false, description: '请求范围' })
  @ApiQuery({ name: 'state', required: false, description: '客户端状态' })
  @ApiResponse({ status: 200, description: '授权成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  async authorize(
    @Req() request: RequestWithUser,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri?: string,
    @Query('scope') scope?: string,
    @Query('state') state?: string,
  ): Promise<AuthorizationResponse> {
    if (!clientId) {
      throw new BadRequestException('缺少客户端ID');
    }

    // 获取当前登录用户
    if (!request.user || !request.user.id) {
      throw new BadRequestException('用户未登录');
    }

    // 创建授权码
    const code = await this.oauthService.createAuthorizationCode(
      clientId,
      request.user.id,
      redirectUri,
      scope ? scope.split(' ') : undefined,
    );

    // 返回授权码和状态
    return {
      code,
      state,
    };
  }

  @Post('token')
  @Public()
  @ApiOperation({ summary: '令牌交换' })
  @ApiResponse({ status: 200, description: '令牌交换成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '客户端凭据无效' })
  async token(@Body() tokenRequest: TokenRequestDto): Promise<Record<string, any>> {
    return this.oauthService.exchangeToken(tokenRequest);
  }
}
