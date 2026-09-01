import { AutoMap } from '@automapper/classes';
import { EPurchaseOrderStatus } from 'src/application/shared/enums';

export class PurchaseOrder {
  @AutoMap() public id: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public supplierId: string;
  @AutoMap() public createdById?: string;
  @AutoMap() public poNumber: string;
  @AutoMap(() => String) public status: EPurchaseOrderStatus;
  @AutoMap(() => Date) public expectedAt?: Date;
  @AutoMap(() => Date) public receivedAt?: Date;
  @AutoMap() public totalAmount: number;
  @AutoMap() public notes?: string;
  @AutoMap(() => Date) public createdAt?: Date;
  @AutoMap(() => Date) public updatedAt?: Date;
}
