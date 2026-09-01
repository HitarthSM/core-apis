import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { IPushNotificationService, PUSH_NOTIFICATION_SERVICE } from '../../../../../common';
import { CentrifugalService } from '../../../../../common/centrifugal';
import { ORDER_REPO } from '../../../../../application/constants';
import { IOrderRepo } from '../../../orders';
import { Order } from '../../../orders/domain';
import { EOrderStatus } from '../../../../shared/enums/e-order-status';
import { OrderNotFoundException, OrderNotInConfirmedStatusException } from '../../exceptions';
import { FulfillFromStoreCommand } from './fulfill-from-store.command';

@CommandHandlerStrict(FulfillFromStoreCommand)
export class FulfillFromStoreCommandHandler implements ICommandHandler<FulfillFromStoreCommand, Order> {
  public constructor(
    @Inject(ORDER_REPO) private readonly orderRepo: IOrderRepo,
    private readonly centrifugal: CentrifugalService,
    @Inject(PUSH_NOTIFICATION_SERVICE) private readonly pushService: IPushNotificationService,
    @InjectPinoLogger(FulfillFromStoreCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: FulfillFromStoreCommand): Promise<Order> {
    this.logger.info(`Executing Command '${FulfillFromStoreCommand.name}' orderId=${command.orderId}`);

    const order = await this.orderRepo.getAsync(command.orderId);
    if (!order) throw new OrderNotFoundException();

    if (order.status !== EOrderStatus.Confirmed) {
      throw new OrderNotInConfirmedStatusException();
    }

    order.status = EOrderStatus.Packed;
    order.packedByUserId = command.userId;
    order.packedAt = new Date();
    const updated = await this.orderRepo.updateAsync(order);

    await this.pushService
      .broadcastToOrgAsync(
        command.organizationId,
        'order:fulfilled-from-store',
        'Order Ready for Dispatch',
        `Order #${updated.orderNumber} fulfilled from store`,
        { orderId: updated.id, orderNumber: updated.orderNumber },
      )
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Push broadcast failed — non-fatal'),
      );

    await this.centrifugal
      .publish(`org_${command.organizationId}`, {
        type: 'order:fulfilled-from-store',
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        userId: command.userId,
      })
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Centrifugo publish failed — non-fatal'),
      );

    return updated;
  }
}
