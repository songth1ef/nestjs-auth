import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OAuthClient } from './client.entity';
import { User } from '../../users/entities/user.entity';

@Entity('oauth_auth_codes')
export class OAuthAuthCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column()
  clientId: string;

  @ManyToOne(() => OAuthClient)
  @JoinColumn({ name: 'clientId', referencedColumnName: 'clientId' })
  client: OAuthClient;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  redirectUri: string;

  @Column({ type: 'simple-array', nullable: true })
  scopes: string[];

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}
