import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Exclude()
  @Column()
  password: string;

  // 用于检测密码是否已更改的标志
  private previousPassword: string;

  @Column({ default: 'zh' })
  preferredLanguage: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lastLoginAttempt: Date;

  @Column({ nullable: true })
  lastLoginDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  lockUntil: Date | null;

  @Column({ type: 'simple-array', nullable: true })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // 只有当密码实际发生变化时才重新哈希
    if (
      this.password && 
      this.previousPassword !== this.password && 
      !this.password.startsWith('$2b$')
    ) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    // 保存当前密码哈希值，用于检测是否发生变化
    this.previousPassword = this.password;
    return bcrypt.compare(password, this.password);
  }
} 