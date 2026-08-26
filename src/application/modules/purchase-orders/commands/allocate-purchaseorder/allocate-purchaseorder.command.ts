import { CommandBase } from 'src/common';

export class AllocationInput {
  public purchaseItemId: string;
  public locationId: string;
  public quantity: number;
}

export class AllocatePurchaseOrderCommand extends CommandBase {
  public purchaseOrderId: string;
  public organizationId: string;
  public allocations: AllocationInput[];
  public performedById?: string;
  public notes?: string;
}
