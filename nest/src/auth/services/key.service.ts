import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { KeyGenerator } from '../utils/key-generator';

@Injectable()
export class KeyService {
  private readonly keysDir = path.join(process.cwd(), 'keys');

  constructor() {
    if (!fs.existsSync(this.keysDir)) {
      fs.mkdirSync(this.keysDir, { recursive: true });
    }
    this.ensureKeysExist();
  }

  private ensureKeysExist() {
    const publicKeyPath = path.join(this.keysDir, 'public.key');
    const privateKeyPath = path.join(this.keysDir, 'private.key');
    const symmetricKeyPath = path.join(this.keysDir, 'symmetric.key');

    if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath) || !fs.existsSync(symmetricKeyPath)) {
      console.log('Generating new keys...');
      const paths = KeyGenerator.generateKeys();
      console.log('Keys generated successfully');
    }
  }

  getPublicKey(): string {
    const keyPath = path.join(this.keysDir, 'public.key');
    if (!fs.existsSync(keyPath)) {
      throw new Error('Public key not found');
    }
    return this.readKeyFile(keyPath);
  }

  getPrivateKey(): string {
    const keyPath = path.join(this.keysDir, 'private.key');
    if (!fs.existsSync(keyPath)) {
      throw new Error('Private key not found');
    }
    return this.readKeyFile(keyPath);
  }

  getSymmetricKey(): string {
    const keyPath = path.join(this.keysDir, 'symmetric.key');
    if (!fs.existsSync(keyPath)) {
      throw new Error('Symmetric key not found');
    }
    return this.readKeyFile(keyPath);
  }

  private readKeyFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf8');
  }
} 