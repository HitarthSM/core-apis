export * from './get-order-queue/get-order-queue.query';
export * from './get-order-queue/get-order-queue.query-handler';

import { GetOrderQueueQueryHandler } from './get-order-queue/get-order-queue.query-handler';

export const OrderOperationQueryHandlers = [
  GetOrderQueueQueryHandler,
];
