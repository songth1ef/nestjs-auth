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

  async validateUser(username: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByUsername(username);

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
        throw new UnauthorizedException('用户名或密码错误');
      }

      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`用户验证失败: ${error.message}`, error.stack);
      }
      throw error;
    }
  }

  async login(user: User) {
    try {
      const payload: JwtPayload = {
        username: user.username,
        sub: user.id,
        roles: user.roles,
      };

      const isSymmetric = this.configService.get<boolean>(
        'jwt.symmetricEncryption',
      );
      const secretOrKey = isSymmetric
        ? this.keyService.getSymmetricKey()
        : this.keyService.getPrivateKey();

      const algorithm = this.configService.get<Algorithm>('jwt.algorithm') || 'HS256';
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

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        preferred_language: user.preferredLanguage,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`登录失败: ${error.message}`, error.stack);
      }
      throw error;
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

      const algorithm = this.configService.get<Algorithm>('jwt.algorithm') || 'HS256';

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