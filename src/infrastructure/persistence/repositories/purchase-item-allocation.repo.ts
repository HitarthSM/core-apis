import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { BaseRepo, Filter, PageableFilter } from '../../../common';
import { PurchaseItemAllocationEntity } from '../entities';
import { PurchaseItemAllocation } from '../../../application/modules/purchase-orders/domain';
import { IPurchaseItemAllocationRepo, PurchaseItemAllocationFilter } from '../../../application/modules/purchase-orders/i-purchase-item-allocation.repo';

@Injectable()
export class PurchaseItemAllocationRepo
  extends BaseRepo<
    PurchaseItemAllocationEntity,
    PurchaseItemAllocation,
    string,
    PageableFilter<PurchaseItemAllocationFilter>,
    Filter<PurchaseItemAllocationFilter>
  >
  implements IPurchaseItemAllocationRepo
{
  constructor(
    @InjectRepository(PurchaseItemAllocationEntity) internalRepo: Repository<PurchaseItemAllocationEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(PurchaseItemAllocationRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, PurchaseItemAllocationEntity, PurchaseItemAllocation);
  }

  public override get idColumnName(): keyof PurchaseItemAllocationEntity {
    return 'id';
  }
}
