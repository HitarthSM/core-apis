import { AutoMap } from '@automapper/classes';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { EProductUnit } from '../../../../../infrastructure';

export class CreateProductRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AutoMap()
  public name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  @AutoMap()
  public categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AutoMap()
  public sku?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AutoMap()
  public barcode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AutoMap()
  public description?: string;

  @ApiPropertyOptional({ enum: EProductUnit })
  @IsOptional()
  @IsEnum(EProductUnit)
  @AutoMap(() => String)
  public unit?: EProductUnit;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public costPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public retailPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public loyaltyPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public wholesalePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public transferPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @AutoMap()
  public reorderPoint?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @AutoMap()
  public manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @AutoMap()
  public packSize?: number;
}
