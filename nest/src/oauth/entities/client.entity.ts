import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as crypto from 'crypto';

@Entity('oauth_clients')
export class OAuthClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Exclude()
  @Column()
  clientSecret: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-array', nullable: true })
  redirectUris: string[];

  @Column({ type: 'simple-array', default: 'authorization_code' })
  allowedGrantTypes: string[];

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 3600 }) // 默认1小时
  accessTokenLifetime: number;

  @Column({ default: 2592000 }) // 默认30天
  refreshTokenLifetime: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateClientCredentials() {
    if (!this.clientId) {
      this.clientId = crypto.randomBytes(16).toString('hex');
    }
    if (!this.clientSecret) {
      this.clientSecret = crypto.randomBytes(32).toString('hex');
    }
  }

  /**
   * 验证客户端密钥
   */
  validateClientSecret(secret: string): boolean {
    return this.clientSecret === secret;
  }
}
