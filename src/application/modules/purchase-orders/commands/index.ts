// Standard barrel file
export * from './allocate-purchaseorder';
export * from './create-purchaseorder';
export * from './delete-purchaseorder';
export * from './receive-purchaseorder';
export * from './update-purchaseorder';

import { AllocatePurchaseOrderCommandHandler } from './allocate-purchaseorder';
import { CreatePurchaseOrderCommandHandler } from './create-purchaseorder';
import { DeletePurchaseOrderCommandHandler } from './delete-purchaseorder';
import { ReceivePurchaseOrderCommandHandler } from './receive-purchaseorder';
import { UpdatePurchaseOrderCommandHandler } from './update-purchaseorder';

export const PurchaseOrderCommandHandlers = [
  AllocatePurchaseOrderCommandHandler,
  CreatePurchaseOrderCommandHandler,
  DeletePurchaseOrderCommandHandler,
  ReceivePurchaseOrderCommandHandler,
  UpdatePurchaseOrderCommandHandler,
];
