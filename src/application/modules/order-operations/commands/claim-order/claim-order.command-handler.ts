import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { CommandHandlerStrict } from '../../../../../common';
import { ORDER_REPO } from '../../../../../application/constants';
import { IOrderRepo } from '../../../orders';
import { Order } from '../../../orders/domain';
import { ClaimOrderCommand } from './claim-order.command';

@CommandHandlerStrict(ClaimOrderCommand)
export class ClaimOrderCommandHandler implements ICommandHandler<ClaimOrderCommand, Order> {
  public constructor(
    @Inject(ORDER_REPO) private readonly orderRepo: IOrderRepo,
    @InjectPinoLogger(ClaimOrderCommandHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(command: ClaimOrderCommand): Promise<Order> {
    this.logger.info(`Executing Command '${ClaimOrderCommand.name}' orderId=${command.orderId}`);
    return this.orderRepo.claimAsync(command.orderId, command.pickerUserId);
  }
}
