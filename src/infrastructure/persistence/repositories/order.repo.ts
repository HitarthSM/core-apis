import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { IsNull, Repository } from 'typeorm';
import { BaseRepo, DbException, Filter, PageableFilter } from '../../../common';
import { OrderEntity } from '../entities';
import { Order } from '../../../application/modules/orders/domain';
import { IOrderRepo, OrderFilter } from '../../../application/modules/orders';
import { EOrderStatus } from '../../../application/shared/enums/e-order-status';
import { OrderAlreadyClaimedException } from '../../../application/modules/order-operations/exceptions';

@Injectable()
export class OrderRepo
  extends BaseRepo<OrderEntity, Order, string, PageableFilter<OrderFilter>, Filter<OrderFilter>>
  implements IOrderRepo
{
  constructor(
    @InjectRepository(OrderEntity) internalRepo: Repository<OrderEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(OrderRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, OrderEntity, Order);
  }

  public override get idColumnName(): keyof OrderEntity {
    return 'id';
  }

  public async claimAsync(orderId: string, pickerUserId: string): Promise<Order> {
    try {
      const result = await this.internalRepo
        .createQueryBuilder()
        .update()
        .set({ claimedByUserId: pickerUserId, claimedAt: new Date() })
        .where(
          'id = :orderId AND status = :status AND claimed_by_user_id IS NULL',
          { orderId, status: EOrderStatus.Confirmed },
        )
        .execute();

      if (result.affected === 0) {
        throw new OrderAlreadyClaimedException();
      }

      const entity = await this.internalRepo.findOneOrFail({ where: { id: orderId } });
      return this.mapToModel(entity);
    } catch (ex) {
      if (ex instanceof OrderAlreadyClaimedException) throw ex;
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async findQueueAsync(locationId: string): Promise<Order[]> {
    try {
      const entities = await this.internalRepo.find({
        where: { locationId, status: EOrderStatus.Confirmed, claimedByUserId: IsNull() },
        order: { createdAt: 'ASC' },
      });
      return this.mapToModelArray(entities);
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }
}
