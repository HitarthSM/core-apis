import { Inject } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QueryHandlerStrict } from '../../../../../common';
import { TRIP_REPO, VEHICLE_LOCATION_REPO } from '../../../../../application/constants';
import { ITripRepo } from '../../../trips/repositories/i-trip.repo';
import { IVehicleLocationRepo } from '../../../trips/repositories/i-vehicle-location.repo';
import { ETripStatus } from '../../../../shared/enums/e-trip-status';
import { GetFleetLiveLocationsQuery } from './get-fleet-live-locations.query';

export interface FleetLiveLocation {
  tripId: string;
  driverId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  gpsTime: Date;
}

@QueryHandlerStrict(GetFleetLiveLocationsQuery)
export class GetFleetLiveLocationsQueryHandler
  implements IQueryHandler<GetFleetLiveLocationsQuery, FleetLiveLocation[]> {
  public constructor(
    @Inject(TRIP_REPO) private readonly tripRepo: ITripRepo,
    @Inject(VEHICLE_LOCATION_REPO) private readonly vehicleLocationRepo: IVehicleLocationRepo,
    @InjectPinoLogger(GetFleetLiveLocationsQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: GetFleetLiveLocationsQuery): Promise<FleetLiveLocation[]> {
    this.logger.info(`Executing Query '${GetFleetLiveLocationsQuery.name}' orgId=${query.organizationId}`);

    const activeTrips = await this.tripRepo.findByStatusAsync(ETripStatus.InTransit);
    const results: FleetLiveLocation[] = [];

    for (const trip of activeTrips) {
      const location = await this.vehicleLocationRepo.findByVehicleIdAsync(trip.vehicleId);
      if (!location) continue;

      results.push({
        tripId: trip.id,
        driverId: trip.driverId,
        vehicleId: trip.vehicleId,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        gpsTime: location.gpsTime,
      });
    }

    return results;
  }
}
