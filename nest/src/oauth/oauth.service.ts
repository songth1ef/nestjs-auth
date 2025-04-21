import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthAuthCode } from './entities/auth-code.entity';
import { OAuthClientService } from './oauth-client.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { TokenRequestDto } from './dto/token-request.dto';
import * as crypto from 'crypto';

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    @InjectRepository(OAuthAuthCode)
    private readonly authCodeRepository: Repository<OAuthAuthCode>,
    private readonly clientService: OAuthClientService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  /**
   * 创建授权码
   */
  async createAuthorizationCode(
    clientId: string,
    userId: string,
    redirectUri?: string,
    scopes?: string[],
  ): Promise<string> {
    try {
      // 验证客户端存在
      const client = await this.clientService.findByClientId(clientId);

      // 验证用户存在
      await this.usersService.findById(userId);

      // 验证重定向URI（如果提供）
      if (redirectUri && client.redirectUris?.length) {
        if (!client.redirectUris.includes(redirectUri)) {
          throw new BadRequestException('无效的重定向URI');
        }
      }

      // 生成授权码
      const code = crypto.randomBytes(32).toString('hex');

      // 创建授权码记录
      const authCode = this.authCodeRepository.create({
        code,
        clientId,
        userId,
        redirectUri,
        scopes,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分钟过期
      });

      await this.authCodeRepository.save(authCode);

      return code;
    } catch (error) {
      this.logger.error(`创建授权码失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 使用授权码交换令牌
   */
  async exchangeToken(tokenRequest: TokenRequestDto): Promise<any> {
    try {
      // 验证客户端凭据
      const client = await this.clientService.validateClient(
        tokenRequest.client_id,
        tokenRequest.client_secret,
      );

      // 根据授权类型处理
      switch (tokenRequest.grant_type) {
        case 'authorization_code':
          return this.handleAuthorizationCodeGrant(
            client.clientId,
            tokenRequest,
          );
        case 'refresh_token':
          return this.handleRefreshTokenGrant(tokenRequest);
        default:
          throw new BadRequestException(
            `不支持的授权类型: ${tokenRequest.grant_type}`,
          );
      }
    } catch (error) {
      this.logger.error(`令牌交换失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 处理授权码授权类型
   */
  private async handleAuthorizationCodeGrant(
    clientId: string,
    tokenRequest: TokenRequestDto,
  ): Promise<any> {
    if (!tokenRequest.code) {
      throw new BadRequestException('缺少授权码');
    }

    // 查找并验证授权码
    const authCode = await this.authCodeRepository.findOne({
      where: { code: tokenRequest.code, clientId },
      relations: ['user'],
    });

    if (!authCode) {
      throw new NotFoundException('授权码无效或不存在');
    }

    if (authCode.isExpired()) {
      await this.authCodeRepository.remove(authCode);
      throw new BadRequestException('授权码已过期');
    }

    // 验证重定向URI（如果有）
    if (
      tokenRequest.redirect_uri &&
      authCode.redirectUri !== tokenRequest.redirect_uri
    ) {
      throw new BadRequestException('重定向URI不匹配');
    }

    // 获取用户信息
    const user = await this.usersService.findById(authCode.userId);

    // 生成访问令牌和刷新令牌
    const tokenResponse = await this.authService.login(user);

    // 删除使用过的授权码
    await this.authCodeRepository.remove(authCode);

    // 返回令牌响应
    return {
      ...tokenResponse,
      scope: authCode.scopes?.join(' ') || '',
      token_type: 'Bearer',
    };
  }

  /**
   * 处理刷新令牌授权类型
   */
  private async handleRefreshTokenGrant(
    tokenRequest: TokenRequestDto,
  ): Promise<any> {
    if (!tokenRequest.refresh_token) {
      throw new BadRequestException('缺少刷新令牌');
    }

    // 验证并刷新令牌
    try {
      // 这部分需要实现刷新令牌的逻辑，这里是示例代码
      // 实际实现需要根据你的JWT刷新令牌策略进行调整

      // 解析刷新令牌以获取用户ID
      // const decodedToken = this.jwtService.verify(tokenRequest.refresh_token);
      // const user = await this.usersService.findById(decodedToken.sub);

      // 生成新的访问令牌和刷新令牌
      // const tokenResponse = await this.authService.login(user);

      // 返回令牌响应
      // return {
      //   ...tokenResponse,
      //   scope: tokenRequest.scope || '',
      //   token_type: 'Bearer',
      // };

      // 示例返回，实际项目中需要替换为真实实现
      throw new UnauthorizedException('刷新令牌功能尚未实现');
    } catch (error) {
      this.logger.error(`刷新令牌失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }
}
