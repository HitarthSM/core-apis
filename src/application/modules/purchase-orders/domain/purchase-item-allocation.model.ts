import { AutoMap } from '@automapper/classes';

export class PurchaseItemAllocation {
  @AutoMap() public id: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public purchaseOrderId: string;
  @AutoMap() public purchaseItemId: string;
  @AutoMap() public locationId: string;
  @AutoMap() public quantity: number;
  @AutoMap() public performedById?: string;
  @AutoMap() public notes?: string;
  @AutoMap(() => Date) public createdAt?: Date;
}
