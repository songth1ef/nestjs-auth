import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface KeyPair {
  publicKey: string;
  privateKey: string;
  expiresAt: Date;
}

@Injectable()
export class KeyRotationService implements OnModuleInit {
  private readonly logger = new Logger(KeyRotationService.name);
  private currentKeyPair: KeyPair;
  private nextKeyPair: KeyPair;
  private rotationTimer: NodeJS.Timeout;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeKeys();
    this.scheduleRotation();
  }

  private initializeKeys(): void {
    const keysDir = path.join(process.cwd(), 'keys');
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    this.currentKeyPair = this.loadOrGenerateKeys('current');
    this.nextKeyPair = this.generateNewKeyPair();
    this.logger.log('密钥初始化完成');
  }

  private loadOrGenerateKeys(type: 'current' | 'next'): KeyPair {
    const publicKeyPath = path.join(
      process.cwd(),
      'keys',
      `${type}_public.key`,
    );
    const privateKeyPath = path.join(
      process.cwd(),
      'keys',
      `${type}_private.key`,
    );
    const expiresAtPath = path.join(
      process.cwd(),
      'keys',
      `${type}_expires_at.txt`,
    );

    if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
      const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      const expiresAt = new Date(fs.readFileSync(expiresAtPath, 'utf8'));

      if (expiresAt > new Date()) {
        return { publicKey, privateKey, expiresAt };
      }
    }

    return this.generateNewKeyPair();
  }

  private generateNewKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + (process.env.NODE_ENV === 'production' ? 30 : 90),
    );

    return { publicKey, privateKey, expiresAt };
  }

  private scheduleRotation() {
    const rotationInterval =
      process.env.NODE_ENV === 'production'
        ? 30 * 24 * 60 * 60 * 1000 // 30天
        : 90 * 24 * 60 * 60 * 1000; // 90天

    this.rotationTimer = setInterval(() => {
      this.rotateKeys().catch((error: Error) => {
        this.logger.error('密钥轮换失败', error.message);
      });
    }, rotationInterval);
  }

  private async rotateKeys() {
    const newKeyPair = this.generateNewKeyPair();
    await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));
    this.currentKeyPair = this.nextKeyPair;
    this.nextKeyPair = newKeyPair;
    this.saveKeys();
    this.logger.log('密钥轮换完成');
  }

  private saveKeys(): void {
    const keysDir = path.join(process.cwd(), 'keys');

    fs.writeFileSync(
      path.join(keysDir, 'current_public.key'),
      this.currentKeyPair.publicKey,
    );
    fs.writeFileSync(
      path.join(keysDir, 'current_private.key'),
      this.currentKeyPair.privateKey,
    );
    fs.writeFileSync(
      path.join(keysDir, 'current_expires_at.txt'),
      this.currentKeyPair.expiresAt.toISOString(),
    );

    fs.writeFileSync(
      path.join(keysDir, 'next_public.key'),
      this.nextKeyPair.publicKey,
    );
    fs.writeFileSync(
      path.join(keysDir, 'next_private.key'),
      this.nextKeyPair.privateKey,
    );
    fs.writeFileSync(
      path.join(keysDir, 'next_expires_at.txt'),
      this.nextKeyPair.expiresAt.toISOString(),
    );
  }

  getCurrentKeyPair(): KeyPair {
    return this.currentKeyPair;
  }

  getNextKeyPair(): KeyPair {
    return this.nextKeyPair;
  }

  onModuleDestroy() {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
    }
  }
}
