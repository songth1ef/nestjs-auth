import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { KeyService } from './services/key.service';
import { Algorithm, SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  username: string;
  sub: string;
  roles: string[];
  client_id?: string;
}

interface ClientOptions {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scope?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private keyService: KeyService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
    isEmail = false,
  ): Promise<User> {
    try {
      let user: User;

      if (isEmail) {
        user = await this.usersService.findByEmail(identifier);
      } else {
        user = await this.usersService.findByUsername(identifier);
      }

      if (user.isLocked) {
        if (user.lockUntil && user.lockUntil > new Date()) {
          throw new UnauthorizedException('账户已被锁定，请稍后再试');
        } else {
          user.isLocked = false;
          user.loginAttempts = 0;
          await this.usersService.updateLoginAttempts(user, true);
        }
      }

      const isValid = await user.validatePassword(password);
      await this.usersService.updateLoginAttempts(user, isValid);

      if (!isValid) {
        throw new UnauthorizedException('用户名/邮箱或密码错误');
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`用户验证失败: ${error.message}`, error.stack);
      }
      throw new UnauthorizedException('用户名/邮箱或密码错误');
    }
  }

  async login(user: User, clientOptions?: ClientOptions) {
    try {
      const payload: JwtPayload = {
        username: user.username,
        sub: user.id,
        roles: user.roles,
      };

      if (clientOptions?.clientId) {
        payload.client_id = clientOptions.clientId;
      }

      const isSymmetric = this.configService.get<boolean>(
        'jwt.symmetricEncryption',
      );
      const secretOrKey = isSymmetric
        ? this.keyService.getSymmetricKey()
        : this.keyService.getPrivateKey();

      const algorithm =
        this.configService.get<Algorithm>('jwt.algorithm') || 'HS256';

      const signOptions: SignOptions = {
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
        algorithm,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          secret: secretOrKey,
          ...signOptions,
        }),
        this.jwtService.signAsync(payload, {
          secret: secretOrKey,
          ...signOptions,
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        }),
      ]);

      const response = {
        access_token: accessToken,
        refresh_token: refreshToken,
        preferred_language: user.preferredLanguage,
      };

      if (clientOptions?.clientId) {
        const expiresIn =
          this.configService.get<string>('jwt.expiresIn') || '1h';

        Object.assign(response, {
          token_type: 'Bearer',
          expires_in: this.parseExpiresIn(expiresIn),
          scope: clientOptions.scope || '',
        });
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`登录失败: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 3600;
    }
  }

  async refreshToken(token: string) {
    try {
      const isSymmetric = this.configService.get<boolean>(
        'jwt.symmetricEncryption',
      );
      const secretOrKey = isSymmetric
        ? this.keyService.getSymmetricKey()
        : this.keyService.getPublicKey();

      const algorithm =
        this.configService.get<Algorithm>('jwt.algorithm') || 'HS256';

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: secretOrKey,
        algorithms: [algorithm],
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return this.login(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`刷新令牌失败: ${error.message}`, error.stack);
      }
      throw new UnauthorizedException('无效的刷新令牌');
    }
  }
}
