import { Module } from '@nestjs/common';
import { KeyRotationService } from '../services/key-rotation.service';

@Module({
  providers: [KeyRotationService],
  exports: [KeyRotationService],
})
export class KeyRotationModule {} 