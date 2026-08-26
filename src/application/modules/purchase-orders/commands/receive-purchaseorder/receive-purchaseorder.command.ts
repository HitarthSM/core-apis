import { CommandBase } from 'src/common';

export class ReceiveItemInput {
  public purchaseItemId: string;
  public quantityReceived: number;
}

export class ReceivePurchaseOrderCommand extends CommandBase {
  public purchaseOrderId: string;
  public organizationId: string;
  public items: ReceiveItemInput[];
  public performedById?: string;
  public notes?: string;
}
