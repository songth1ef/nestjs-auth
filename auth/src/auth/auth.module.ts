import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { KeyModule } from './services/key.module';
import { Algorithm } from 'jsonwebtoken';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    UsersModule,
    KeyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isSymmetric = configService.get<boolean>('jwt.symmetricEncryption');
        const algorithm = configService.get<Algorithm>('jwt.algorithm');
        return {
          secret: isSymmetric
            ? configService.get<string>('jwt.secret')
            : configService.get<string>('jwt.privateKey'),
          signOptions: {
            expiresIn: configService.get<string>('jwt.expiresIn'),
            algorithm,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {} 