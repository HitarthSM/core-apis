import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryResponse {
  @ApiProperty() @AutoMap() public id: string;
  @ApiProperty() @AutoMap() public organizationId: string;
  @ApiProperty() @AutoMap() public locationId: string;
  @ApiProperty() @AutoMap() public productId: string;
  @ApiProperty() @AutoMap() public quantityOnHand: number;
  @ApiProperty() @AutoMap() public quantityReserved: number;
  @ApiProperty({ description: 'Black / unpublished pool quantity at this location' })
  @AutoMap()
  public quantityUnpublished: number;
  @ApiProperty() @AutoMap() public reorderLevel: number;
  @ApiPropertyOptional() @AutoMap() public maxStock?: number;
  @ApiPropertyOptional() @AutoMap() public averageCost?: number;
  @ApiPropertyOptional() @AutoMap() public binLocation?: string;
  @ApiPropertyOptional({ description: 'Product pack size; null when product has no pack concept' })
  @AutoMap() public productPackSize?: number;
  @ApiPropertyOptional({ description: 'Full packs available on hand; null when product has no pack size' })
  @AutoMap() public packsOnHand?: number;
  @ApiPropertyOptional({ description: 'Units not fitting into a full pack; null when product has no pack size' })
  @AutoMap() public looseUnits?: number;
  @ApiPropertyOptional() @AutoMap(() => Date) public createdAt?: Date;
  @ApiPropertyOptional() @AutoMap(() => Date) public updatedAt?: Date;
}

export class InventorysPagedResponse {
  @ApiProperty({ type: [InventoryResponse] }) public items: InventoryResponse[];
  @ApiProperty() public page: number;
  @ApiProperty() public perPage: number;
  @ApiProperty() public totalCount: number;
  @ApiProperty() public totalPages: number;
}
