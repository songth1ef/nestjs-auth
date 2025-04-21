import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import configuration from './config/configuration';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './modules/email/email.module';
import {
  I18nModule,
  AcceptLanguageResolver,
  QueryResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import { OAuthModule } from './oauth/oauth.module';

// Redis缓存配置接口
interface RedisConfig {
  store: any;
  host: string;
  port: number;
  password: string;
  db: number;
  ttl: number;
  max: number;
  enableReadyCheck: boolean;
  enableOfflineQueue: boolean;
  cluster?: {
    nodes: string[];
    options: {
      maxRedirections: number;
      scaleReads: string;
    };
  };
  retry_strategy?: (options: { attempt: number }) => number;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : process.env.NODE_ENV === 'development'
            ? '.env.development'
            : '.env',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // 基本Redis配置
        const config: RedisConfig = {
          store: redisStore,
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', ''),
          db: configService.get<number>('REDIS_DB', 0),
          ttl: configService.get<number>('REDIS_TTL', 600), // 默认缓存时间10分钟
          max: configService.get<number>('REDIS_MAX_ITEMS', 100000), // 大规模系统默认10万条缓存
          enableReadyCheck: true,
          enableOfflineQueue: true,
        };

        // 添加Redis集群配置(如果启用)
        if (configService.get<boolean>('REDIS_CLUSTER_ENABLED', false)) {
          const clusterNodes = configService.get<string>(
            'REDIS_CLUSTER_NODES',
            '',
          );
          if (clusterNodes) {
            config.cluster = {
              nodes: clusterNodes.split(','),
              options: {
                maxRedirections: configService.get<number>(
                  'REDIS_CLUSTER_MAX_REDIRECTIONS',
                  16,
                ),
                scaleReads: configService.get<string>(
                  'REDIS_CLUSTER_SCALE_READS',
                  'all',
                ),
              },
            };
          }
        }

        // 添加重试策略
        config.retry_strategy = (options: { attempt: number }) => {
          return Math.min(options.attempt * 100, 3000);
        };

        return config;
      },
      inject: [ConfigService],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.get<string>(
          'app.fallbackLanguage',
          'zh',
        ),
        loaderOptions: {
          path: join(__dirname, '/common/i18n/'),
          watch: true,
        },
      }),
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        { use: HeaderResolver, options: ['x-lang'] },
        AcceptLanguageResolver,
      ],
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: true,
        ssl: configService.get('database.ssl'),
        extra: {
          max: 10,
          connectionTimeoutMillis: 2000,
        },
        logger: 'advanced-console',
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
    UsersModule,
    AuthModule,
    EmailModule,
    OAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
