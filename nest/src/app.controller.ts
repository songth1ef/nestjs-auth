import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';

@ApiTags('pages')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiExcludeEndpoint()
  getHello(): string {
    return this.appService.getHello();
  }
}
