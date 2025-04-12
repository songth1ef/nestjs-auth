import { generateKeyPairSync } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export class KeyGenerator {
  static generateKeys(outputDir: string = './keys') {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成RSA密钥对
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // 生成对称加密密钥
    const symmetricKey = this.generateSymmetricKey();

    // 保存密钥
    fs.writeFileSync(path.join(outputDir, 'public.key'), publicKey);
    fs.writeFileSync(path.join(outputDir, 'private.key'), privateKey);
    fs.writeFileSync(path.join(outputDir, 'symmetric.key'), symmetricKey);

    return {
      publicKeyPath: path.join(outputDir, 'public.key'),
      privateKeyPath: path.join(outputDir, 'private.key'),
      symmetricKeyPath: path.join(outputDir, 'symmetric.key')
    };
  }

  private static generateSymmetricKey(): string {
    return require('crypto').randomBytes(32).toString('base64');
  }
} 