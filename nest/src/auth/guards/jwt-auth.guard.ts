import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { KeyService } from '../services/key.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Algorithm } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
    private keyService: KeyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查路由是否标记为公开
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供访问令牌');
    }

    try {
      // 验证token
      const isSymmetric = this.configService.get<boolean>(
        'jwt.symmetricEncryption',
      );
      
      const secretOrKey = isSymmetric
        ? this.keyService.getSymmetricKey()
        : this.keyService.getPublicKey();

      const algorithm = this.configService.get<Algorithm>('jwt.algorithm') || 'HS256';

      const payload = await this.jwtService.verifyAsync(token, {
        secret: secretOrKey,
        algorithms: [algorithm],
      });
      
      // 将用户信息添加到请求对象中
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('无效的访问令牌');
    }
  }

  private extractTokenFromHeader(request: Record<string, any>): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
} 