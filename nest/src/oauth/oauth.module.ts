import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClient } from './entities/client.entity';
import { OAuthAuthCode } from './entities/auth-code.entity';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { OAuthClientService } from './oauth-client.service';
import { OAuthClientController } from './oauth-client.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { KeyModule } from '../auth/services/key.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OAuthClient, OAuthAuthCode]),
    AuthModule,
    UsersModule,
    KeyModule,
  ],
  controllers: [OAuthController, OAuthClientController],
  providers: [OAuthService, OAuthClientService],
  exports: [OAuthService, OAuthClientService],
})
export class OAuthModule {}
