import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { EntityManager, Repository } from 'typeorm';
import { BaseRepo, Filter, PageableFilter } from '../../../common';
import { InventoryEntity } from '../entities';
import { Inventory, InventoryFilter, IInventoryRepo } from 'src/application/modules/inventory';

@Injectable()
export class InventoryRepo
  extends BaseRepo<InventoryEntity, Inventory, string, PageableFilter<InventoryFilter>, Filter<InventoryFilter>>
  implements IInventoryRepo
{
  constructor(
    @InjectRepository(InventoryEntity) internalRepo: Repository<InventoryEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(InventoryRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, InventoryEntity, Inventory);
  }

  public override get idColumnName(): keyof InventoryEntity {
    return 'id';
  }

  public async addStockAsync(id: string, quantity: number, unitCost: number | undefined, manager: EntityManager): Promise<Inventory> {
    const entity = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const before = Number(entity.quantityOnHand);
    manager.merge(InventoryEntity, entity, {
      quantityOnHand: before + quantity,
      ...(unitCost != null && { averageCost: this.calcAvgCost(before, Number(entity.averageCost ?? 0), quantity, unitCost) }),
    });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async removeStockAsync(id: string, quantity: number, manager: EntityManager): Promise<Inventory> {
    const entity    = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const available = Number(entity.quantityOnHand) - Number(entity.quantityReserved);
    if (quantity > available) throw new BadRequestException(`Insufficient available stock. Available: ${available}`);
    manager.merge(InventoryEntity, entity, { quantityOnHand: Number(entity.quantityOnHand) - quantity });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async adjustStockAsync(id: string, absoluteQty: number, unitCost: number | undefined, manager: EntityManager): Promise<Inventory> {
    const entity = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    manager.merge(InventoryEntity, entity, {
      quantityOnHand: absoluteQty,
      ...(unitCost != null && { averageCost: unitCost }),
    });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async reserveStockAsync(id: string, quantity: number, manager: EntityManager): Promise<Inventory> {
    const entity    = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const available = Number(entity.quantityOnHand) - Number(entity.quantityReserved);
    if (quantity > available) throw new BadRequestException(`Insufficient stock to reserve. Available: ${available}`);
    manager.merge(InventoryEntity, entity, { quantityReserved: Number(entity.quantityReserved) + quantity });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async releaseReservationAsync(id: string, quantity: number, manager: EntityManager): Promise<Inventory> {
    const entity  = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const current = Number(entity.quantityReserved);
    if (quantity > current) throw new BadRequestException(`Cannot release more than reserved: ${current}`);
    manager.merge(InventoryEntity, entity, { quantityReserved: current - quantity });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async deductStockAsync(id: string, quantity: number, manager: EntityManager): Promise<Inventory> {
    const entity = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const onHand = Number(entity.quantityOnHand);
    if (quantity > onHand) throw new BadRequestException(`Cannot deduct more than on-hand stock: ${onHand}`);
    manager.merge(InventoryEntity, entity, { quantityOnHand: onHand - quantity });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async deductUnpublishedStockAsync(id: string, quantity: number, manager: EntityManager): Promise<Inventory> {
    const entity = await manager.findOneOrFail(InventoryEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
    const unpublished = Number(entity.quantityUnpublished);
    if (quantity > unpublished) {
      throw new BadRequestException(`Insufficient black stock. Available: ${unpublished}`);
    }
    manager.merge(InventoryEntity, entity, { quantityUnpublished: unpublished - quantity });
    await manager.save(InventoryEntity, entity);
    return this.mapper.map(entity, InventoryEntity, Inventory);
  }

  public async findByOrgLocationProductAsync(
    organizationId: string,
    locationId: string,
    productId: string,
    manager?: EntityManager,
  ): Promise<Inventory | null> {
    const repo = manager ? manager.getRepository(InventoryEntity) : this.internalRepo;
    const entity = await repo.findOne({ where: { organizationId, locationId, productId } });
    return entity ? this.mapper.map(entity, InventoryEntity, Inventory) : null;
  }

  public async getLowStockAsync(organizationId: string): Promise<Inventory[]> {
    const entities = await this.internalRepo
      .createQueryBuilder('inv')
      .where('inv.organization_id = :organizationId', { organizationId })
      .andWhere('inv.quantity_on_hand <= inv.reorder_level')
      .getMany();
    return this.mapper.mapArray(entities, InventoryEntity, Inventory);
  }

  public async getValuationAsync(organizationId: string): Promise<Inventory[]> {
    const entities = await this.internalRepo.find({ where: { organizationId } });
    return this.mapper.mapArray(entities, InventoryEntity, Inventory);
  }

  private calcAvgCost(currentQty: number, currentAvg: number, addedQty: number, unitCost: number): number {
    const totalQty = currentQty + addedQty;
    return totalQty > 0 ? (currentQty * currentAvg + addedQty * unitCost) / totalQty : unitCost;
  }
}
