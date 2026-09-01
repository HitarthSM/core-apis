import { Inject } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QueryHandlerStrict } from '../../../../../common';
import { ORDER_REPO } from '../../../../../application/constants';
import { IOrderRepo } from '../../../orders';
import { Order } from '../../../orders/domain';
import { GetOrderQueueQuery } from './get-order-queue.query';

export type OrderQueueItem = Pick<Order, 'id' | 'orderNumber' | 'customerId' | 'locationId' | 'status' | 'totalAmount' | 'createdAt'>;

@QueryHandlerStrict(GetOrderQueueQuery)
export class GetOrderQueueQueryHandler implements IQueryHandler<GetOrderQueueQuery, OrderQueueItem[]> {
  public constructor(
    @Inject(ORDER_REPO) private readonly orderRepo: IOrderRepo,
    @InjectPinoLogger(GetOrderQueueQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: GetOrderQueueQuery): Promise<OrderQueueItem[]> {
    this.logger.info(`Executing Query '${GetOrderQueueQuery.name}' locationId=${query.locationId}`);

    const orders = await this.orderRepo.findQueueAsync(query.locationId);
    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      locationId: order.locationId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
    }));
  }
}
