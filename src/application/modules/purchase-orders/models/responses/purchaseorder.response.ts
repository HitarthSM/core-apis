import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EPurchaseOrderStatus } from 'src/application/shared/enums';

export class PurchaseOrderResponse {
  @ApiProperty() @AutoMap() public id: string;
  @ApiProperty() @AutoMap() public organizationId: string;
  @ApiProperty() @AutoMap() public supplierId: string;
  @ApiPropertyOptional() @AutoMap() public createdById?: string;
  @ApiProperty() @AutoMap() public poNumber: string;
  @ApiProperty({ enum: EPurchaseOrderStatus }) @AutoMap(() => String) public status: EPurchaseOrderStatus;
  @ApiPropertyOptional() @AutoMap(() => Date) public expectedAt?: Date;
  @ApiPropertyOptional() @AutoMap(() => Date) public receivedAt?: Date;
  @ApiProperty() @AutoMap() public totalAmount: number;
  @ApiPropertyOptional() @AutoMap() public notes?: string;
  @ApiPropertyOptional() @AutoMap(() => Date) public createdAt?: Date;
  @ApiPropertyOptional() @AutoMap(() => Date) public updatedAt?: Date;
}

export class PurchaseOrdersPagedResponse {
  @ApiProperty({ type: [PurchaseOrderResponse] }) public items: PurchaseOrderResponse[];
  @ApiProperty() public page: number;
  @ApiProperty() public perPage: number;
  @ApiProperty() public totalCount: number;
  @ApiProperty() public totalPages: number;
}
