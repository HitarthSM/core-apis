import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { TripStopEntity, VehicleLocationEntity } from '../../../../infrastructure/persistence/entities';
import { TripStop, VehicleLocation } from '../domain';

@Injectable()
export class TripStopMapperProfile extends AutomapperProfile {
  public constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  public override get profile(): MappingProfile {
    return (mapper) => {
      createMap(mapper, TripStopEntity, TripStop);
      createMap(mapper, VehicleLocationEntity, VehicleLocation);
    };
  }
}
