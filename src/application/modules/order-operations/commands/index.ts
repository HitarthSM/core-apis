export * from './claim-order/claim-order.command';
export * from './claim-order/claim-order.command-handler';
export * from './fulfill-from-store/fulfill-from-store.command';
export * from './fulfill-from-store/fulfill-from-store.command-handler';
export * from './pack-order/pack-order.command';
export * from './pack-order/pack-order.command-handler';

import { ClaimOrderCommandHandler } from './claim-order/claim-order.command-handler';
import { FulfillFromStoreCommandHandler } from './fulfill-from-store/fulfill-from-store.command-handler';
import { PackOrderCommandHandler } from './pack-order/pack-order.command-handler';

export const OrderOperationCommandHandlers = [
  ClaimOrderCommandHandler,
  FulfillFromStoreCommandHandler,
  PackOrderCommandHandler,
];
