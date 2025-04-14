import { KeyGenerator } from '../src/auth/utils/key-generator';

async function main() {
  try {
    console.log('Generating keys...');
    const paths = KeyGenerator.generateKeys();
    console.log('Keys generated successfully:');
    console.log('Public key:', paths.publicKeyPath);
    console.log('Private key:', paths.privateKeyPath);
    console.log('Symmetric key:', paths.symmetricKeyPath);
  } catch (error) {
    console.error('Failed to generate keys:', error);
    process.exit(1);
  }
}

main(); 