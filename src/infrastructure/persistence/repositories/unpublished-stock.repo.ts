import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepo, Filter, PageableFilter } from '../../../common';
import { UnpublishedStockEntity } from '../entities';
import { UnpublishedStock, UnpublishedStockFilter, IUnpublishedStockRepo } from 'src/application/modules/unpublished-stock';

@Injectable()
export class UnpublishedStockRepo
  extends BaseRepo<UnpublishedStockEntity, UnpublishedStock, string, PageableFilter<UnpublishedStockFilter>, Filter<UnpublishedStockFilter>>
  implements IUnpublishedStockRepo
{
  constructor(
    @InjectRepository(UnpublishedStockEntity) internalRepo: Repository<UnpublishedStockEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(UnpublishedStockRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, UnpublishedStockEntity, UnpublishedStock);
  }

  public override get idColumnName(): keyof UnpublishedStockEntity {
    return 'id';
  }

  public async findOrCreateAsync(organizationId: string, locationId: string, productId: string, manager: EntityManager): Promise<UnpublishedStock> {
    let entity = await manager.findOne(UnpublishedStockEntity, { where: { organizationId, locationId, productId } });
    if (!entity) {
      entity = manager.create(UnpublishedStockEntity, { organizationId, locationId, productId, quantityOnHand: 0 });
      await manager.save(UnpublishedStockEntity, entity);
    }
    return this.mapper.map(entity, UnpublishedStockEntity, UnpublishedStock);
  }

  public async addStockAsync(id: string, quantity: number, unitCost: number | undefined, manager: EntityManager): Promise<UnpublishedStock> {
    const entity = await manager.findOneOrFail(UnpublishedStockEntity, { where: { id } });
    const before = Number(entity.quantityOnHand);
    manager.merge(UnpublishedStockEntity, entity, {
      quantityOnHand: before + quantity,
      ...(unitCost != null && { averageCost: this.calcAvgCost(before, Number(entity.averageCost ?? 0), quantity, unitCost) }),
    });
    await manager.save(UnpublishedStockEntity, entity);
    return this.mapper.map(entity, UnpublishedStockEntity, UnpublishedStock);
  }

  public async findByOrgLocationProductAsync(
    organizationId: string,
    locationId: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<UnpublishedStock | null> {
    const repo = manager ? manager.getRepository(UnpublishedStockEntity) : this.internalRepo;
    const entity = await repo.findOne({ where: { organizationId, locationId, productId } });
    return entity ? this.mapper.map(entity, UnpublishedStockEntity, UnpublishedStock) : null;
  }

  public async deductStockAsync(id: string, quantity: number, manager: EntityManager): Promise<UnpublishedStock> {
    const entity = await manager.findOneOrFail(UnpublishedStockEntity, { where: { id } });
    const onHand = Number(entity.quantityOnHand);
    if (quantity > onHand) throw new BadRequestException(`Insufficient unpublished stock. Available: ${onHand}`);
    manager.merge(UnpublishedStockEntity, entity, { quantityOnHand: onHand - quantity });
    await manager.save(UnpublishedStockEntity, entity);
    return this.mapper.map(entity, UnpublishedStockEntity, UnpublishedStock);
  }

  private calcAvgCost(currentQty: number, currentAvg: number, addedQty: number, unitCost: number): number {
    const totalQty = currentQty + addedQty;
    return totalQty > 0 ? (currentQty * currentAvg + addedQty * unitCost) / totalQty : unitCost;
  }
}
