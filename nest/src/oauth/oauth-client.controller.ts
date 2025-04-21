import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OAuthClientService } from './oauth-client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { OAuthClient } from './entities/client.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('oauth-clients')
@Controller('oauth/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OAuthClientController {
  constructor(private readonly oauthClientService: OAuthClientService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: '创建OAuth客户端' })
  @ApiResponse({ status: 201, description: '创建成功', type: OAuthClient })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 409, description: '客户端名称已存在' })
  async create(@Body() createClientDto: CreateClientDto): Promise<OAuthClient> {
    return this.oauthClientService.create(createClientDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: '获取所有OAuth客户端' })
  @ApiResponse({ status: 200, description: '获取成功', type: [OAuthClient] })
  @ApiResponse({ status: 403, description: '无权访问' })
  async findAll(): Promise<OAuthClient[]> {
    return this.oauthClientService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: '获取指定OAuth客户端' })
  @ApiParam({ name: 'id', description: 'OAuth客户端ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: OAuthClient })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '客户端不存在' })
  async findOne(@Param('id') id: string): Promise<OAuthClient> {
    return this.oauthClientService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: '更新OAuth客户端' })
  @ApiParam({ name: 'id', description: 'OAuth客户端ID' })
  @ApiResponse({ status: 200, description: '更新成功', type: OAuthClient })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '客户端不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: Partial<CreateClientDto>,
  ): Promise<OAuthClient> {
    return this.oauthClientService.update(id, updateClientDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: '删除OAuth客户端' })
  @ApiParam({ name: 'id', description: 'OAuth客户端ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '无权访问' })
  @ApiResponse({ status: 404, description: '客户端不存在' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.oauthClientService.remove(id);
    return { message: '客户端已成功删除' };
  }
}
