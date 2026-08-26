import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EProductUnit } from '../../../../../infrastructure';

export class ProductResponse {
  @ApiProperty()
  @AutoMap()
  public id: string;

  @ApiPropertyOptional()
  @AutoMap()
  public organizationId?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public categoryId?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public createdById?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public name?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public sku?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public barcode?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public description?: string;

  @ApiPropertyOptional({ enum: EProductUnit })
  @AutoMap(() => String)
  public unit?: EProductUnit;

  @ApiPropertyOptional()
  @AutoMap()
  public costPrice?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public retailPrice?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public loyaltyPrice?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public wholesalePrice?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public transferPrice?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public reorderPoint?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public manufacturer?: string;

  @ApiPropertyOptional()
  @AutoMap()
  public packSize?: number;

  @ApiPropertyOptional()
  @AutoMap()
  public isActive?: boolean;

  @ApiPropertyOptional()
  @AutoMap(() => Date)
  public createdAt?: Date;
}

export class ProductsPagedResponse {
  @ApiProperty({ type: [ProductResponse] })
  public items: ProductResponse[];

  @ApiProperty()
  public page: number;

  @ApiProperty()
  public perPage: number;

  @ApiProperty()
  public totalCount: number;

  @ApiProperty()
  public totalPages: number;
}
