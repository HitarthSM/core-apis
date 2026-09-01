import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Repository } from 'typeorm';
import { BaseRepo, DbException, Filter, PageableFilter } from '../../../common';
import { VehicleLocationEntity } from '../entities';
import { VehicleLocation } from '../../../application/modules/trip-operations/domain/vehicle-location.model';
import { IVehicleLocationRepo } from '../../../application/modules/trips/repositories/i-vehicle-location.repo';

@Injectable()
export class VehicleLocationRepo
  extends BaseRepo<VehicleLocationEntity, VehicleLocation, string, PageableFilter<VehicleLocation>, Filter<VehicleLocation>>
  implements IVehicleLocationRepo
{
  public constructor(
    @InjectRepository(VehicleLocationEntity) internalRepo: Repository<VehicleLocationEntity>,
    @InjectMapper() mapper: Mapper,
    @InjectPinoLogger(VehicleLocationRepo.name) logger: PinoLogger,
  ) {
    super(internalRepo, mapper, logger, VehicleLocationEntity, VehicleLocation);
  }

  public override get idColumnName(): keyof VehicleLocationEntity {
    return 'id';
  }

  public async findByVehicleIdAsync(vehicleId: string): Promise<VehicleLocation | null> {
    try {
      const entity = await this.internalRepo.findOne({ where: { vehicleId } });
      return entity ? this.mapToModel(entity) : null;
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }

  public async upsertByVehicleIdAsync(vehicleId: string, lat: number, lng: number, gpsTime: Date): Promise<void> {
    try {
      const existing = await this.internalRepo.findOne({ where: { vehicleId } });
      if (existing) {
        await this.internalRepo.update(existing.id, { latitude: lat, longitude: lng, gpsTime });
      } else {
        const newLoc = this.internalRepo.create({ vehicleId, latitude: lat, longitude: lng, gpsTime });
        await this.internalRepo.save(newLoc);
      }
    } catch (ex) {
      this.logger.error(ex);
      throw new DbException(ex);
    }
  }
}
