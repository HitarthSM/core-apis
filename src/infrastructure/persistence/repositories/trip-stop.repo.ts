import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { BaseRepo, DbException, Filter, PageableFilter } from '../../../common';
import { TripStopEntity } from '../entities';
import { TripStop } from '../../../application/modules/trip-operations/domain/trip-stop.model';
import { ITripStopRepo } from '../../../application/modules/trip-operations/repositories/i-trip-stop.repo';
import { ETripStopStatus } from '../../../application/shared/enums/e-trip-stop-status';

@Injectable()
export class TripStopRepo
  extends BaseRepo<TripStopEntity, TripStop, string, PageableFilter<TripStop>, Filter<TripStop>>
  implements ITripStopRepo
{
  public constructor(
    @InjectRepository(TripStopEntity) internalRepo: Repository<TripStopEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(TripStopRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, TripStopEntity, TripStop);
  }

  public override get idColumnName(): keyof TripStopEntity {
    return 'id';
  }

  public async findByTripAndStopAsync(tripId: string, stopId: string): Promise<TripStop | null> {
    try {
      const entity = await this.internalRepo.findOne({ where: { id: stopId, tripId } });
      return entity ? this.mapToModel(entity) : null;
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async findCustomerEmailAsync(tripId: string, stopId: string): Promise<string | null> {
    try {
      const entity = await this.internalRepo.findOne({
        where: { id: stopId, tripId },
        relations: ['order', 'order.customer'],
      });
      return entity?.order?.customer?.email ?? null;
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async countByTripAsync(tripId: string): Promise<number> {
    try {
      return this.internalRepo.count({ where: { tripId } });
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async findAllByTripAsync(tripId: string): Promise<TripStop[]> {
    try {
      const entities = await this.internalRepo.find({ where: { tripId } });
      return this.mapToModelArray(entities);
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async updateOtpAsync(id: string, otpHash: string, expiresAt: Date): Promise<void> {
    try {
      await this.internalRepo.update(id, { otpCode: otpHash, otpExpiresAt: expiresAt });
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async markDeliveredAsync(id: string, now: Date): Promise<void> {
    try {
      await this.internalRepo.update(id, {
        otpVerifiedAt: now,
        deliveredAt: now,
        status: ETripStopStatus.Delivered,
      });
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }
}
