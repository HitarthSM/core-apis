import { AutoMap } from '@automapper/classes';
import { CommandBase } from 'src/common';

export class CreatePurchaseOrderItemInput {
  public productId: string;
  public quantityOrdered: number;
  public unitCost: number;
}

export class CreatePurchaseOrderCommand extends CommandBase {
  @AutoMap() public organizationId: string;
  @AutoMap() public supplierId: string;
  @AutoMap() public createdById?: string;
  @AutoMap() public expectedAt?: string;
  @AutoMap() public notes?: string;
  public items: CreatePurchaseOrderItemInput[];
}
