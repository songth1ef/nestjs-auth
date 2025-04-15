import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PageDto {
  @ApiProperty({
    description: '当前页码',
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    description: '每页条数',
    default: 10,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit: number = 10;

  @ApiProperty({
    description: '搜索关键词',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly totalItems: number;

  @ApiProperty()
  readonly totalPages: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(page: number, limit: number, totalItems: number) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / limit);
    this.hasPreviousPage = page > 1;
    this.hasNextPage = page < this.totalPages;
  }
}

export class PageResponseDto<T> {
  @ApiProperty({ isArray: true })
  readonly data: T[];

  @ApiProperty()
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
} 