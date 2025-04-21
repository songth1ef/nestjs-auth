import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthClient } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';

// 定义一个接口来表示错误
interface DatabaseError extends Error {
  code?: string;
  message: string;
  stack?: string;
}

@Injectable()
export class OAuthClientService {
  private readonly logger = new Logger(OAuthClientService.name);

  constructor(
    @InjectRepository(OAuthClient)
    private readonly clientRepository: Repository<OAuthClient>,
  ) {}

  /**
   * 创建新的OAuth客户端
   */
  async create(createClientDto: CreateClientDto): Promise<OAuthClient> {
    try {
      const client = this.clientRepository.create(createClientDto);
      // 客户端ID和密钥将通过@BeforeInsert钩子自动生成
      await this.clientRepository.save(client);
      return client;
    } catch (error: unknown) {
      const dbError = error as DatabaseError;
      this.logger.error(
        `创建OAuth客户端失败: ${dbError.message}`,
        dbError.stack,
      );
      if (dbError.code === '23505') {
        throw new ConflictException('客户端名称已存在');
      }
      throw error;
    }
  }

  /**
   * 查找所有OAuth客户端
   */
  async findAll(): Promise<OAuthClient[]> {
    return this.clientRepository.find();
  }

  /**
   * 通过ID查找OAuth客户端
   */
  async findOne(id: string): Promise<OAuthClient> {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`未找到ID为${id}的OAuth客户端`);
    }
    return client;
  }

  /**
   * 通过客户端ID查找OAuth客户端
   */
  async findByClientId(clientId: string): Promise<OAuthClient> {
    const client = await this.clientRepository.findOne({ where: { clientId } });
    if (!client) {
      throw new NotFoundException(`未找到客户端ID为${clientId}的OAuth客户端`);
    }
    return client;
  }

  /**
   * 验证OAuth客户端凭据
   */
  async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<OAuthClient> {
    try {
      const client = await this.findByClientId(clientId);

      if (!client.isActive) {
        throw new NotFoundException('客户端已被禁用');
      }

      const isValid = client.validateClientSecret(clientSecret);
      if (!isValid) {
        throw new NotFoundException('客户端密钥无效');
      }

      return client;
    } catch (error: unknown) {
      const dbError = error as DatabaseError;
      this.logger.error(
        `验证OAuth客户端失败: ${dbError.message}`,
        dbError.stack,
      );
      throw error;
    }
  }

  /**
   * 更新OAuth客户端
   */
  async update(
    id: string,
    updateClientDto: Partial<CreateClientDto>,
  ): Promise<OAuthClient> {
    const client = await this.findOne(id);

    // 更新客户端信息
    Object.assign(client, updateClientDto);

    try {
      await this.clientRepository.save(client);
      return client;
    } catch (error: unknown) {
      const dbError = error as DatabaseError;
      this.logger.error(
        `更新OAuth客户端失败: ${dbError.message}`,
        dbError.stack,
      );
      throw error;
    }
  }

  /**
   * 删除OAuth客户端
   */
  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }
}
