import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async updateLoginAttempts(user: User, success: boolean): Promise<void> {
    if (success) {
      user.loginAttempts = 0;
      user.lastLoginDate = new Date();
      user.isLocked = false;
      user.lockUntil = null;
    } else {
      user.loginAttempts += 1;
      user.lastLoginAttempt = new Date();

      const maxAttempts = this.configService.get('security.maxLoginAttempts');
      if (user.loginAttempts >= maxAttempts) {
        user.isLocked = true;
        const lockoutTime = this.configService.get('security.loginLockoutTime');
        user.lockUntil = new Date(Date.now() + this.parseDuration(lockoutTime));
      }
    }

    await this.usersRepository.save(user);
  }

  async updatePreferredLanguage(userId: string, language: string): Promise<User> {
    const user = await this.findById(userId);
    
    // 验证语言是否支持
    const supportedLanguages = ['zh', 'en']; // 可以从配置中获取
    if (!supportedLanguages.includes(language)) {
      throw new ConflictException(`不支持的语言: ${language}. 支持的语言: ${supportedLanguages.join(', ')}`);
    }
    
    user.preferredLanguage = language;
    return this.usersRepository.save(user);
  }

  private parseDuration(duration: string): number {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1), 10);

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000; // 默认15分钟
    }
  }
} 