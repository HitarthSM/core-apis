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
import { OrderNotFoundException, OrderNotClaimedByUserException } from '../../exceptions';
import { PackOrderCommand } from './pack-order.command';

@CommandHandlerStrict(PackOrderCommand)
export class PackOrderCommandHandler implements ICommandHandler<PackOrderCommand, Order> {
  public constructor(
    @Inject(ORDER_REPO) private readonly orderRepo: IOrderRepo,
    private readonly centrifugal: CentrifugalService,
    @Inject(PUSH_NOTIFICATION_SERVICE) private readonly pushService: IPushNotificationService,
    @InjectPinoLogger(PackOrderCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: PackOrderCommand): Promise<Order> {
    this.logger.info(`Executing Command '${PackOrderCommand.name}' orderId=${command.orderId}`);

    const order = await this.orderRepo.getAsync(command.orderId);
    if (!order) throw new OrderNotFoundException();

    if (order.claimedByUserId !== command.packerUserId) {
      throw new OrderNotClaimedByUserException();
    }

    order.status = EOrderStatus.Packed;
    order.packedByUserId = command.packerUserId;
    order.packedAt = new Date();
    const updated = await this.orderRepo.updateAsync(order);

    await this.pushService
      .broadcastToOrgAsync(
        command.organizationId,
        'order:packed',
        'Order Packed',
        `Order #${updated.orderNumber} packed`,
        { orderId: updated.id, orderNumber: updated.orderNumber },
      )
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Push broadcast failed — non-fatal'),
      );

    await this.centrifugal
      .publish(`org_${command.organizationId}`, {
        type: 'order:packed',
        orderId: updated.id,
        orderNumber: updated.orderNumber,
        packerUserId: command.packerUserId,
      })
      .catch((err: Error) =>
        this.logger.warn({ error: err.message }, 'Centrifugo publish failed — non-fatal'),
      );

    return updated;
  }
}
