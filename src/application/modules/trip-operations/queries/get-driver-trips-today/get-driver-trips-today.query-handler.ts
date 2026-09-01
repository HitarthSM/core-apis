import { Inject } from '@nestjs/common';
import { IQueryHandler } from '@nestjs/cqrs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { QueryHandlerStrict } from '../../../../../common';
import { TRIP_REPO, TRIP_STOP_REPO } from '../../../../../application/constants';
import { ITripRepo } from '../../../trips/repositories/i-trip.repo';
import { ITripStopRepo } from '../../repositories/i-trip-stop.repo';
import { ETripStatus } from '../../../../shared/enums/e-trip-status';
import { GetDriverTripsTodayQuery } from './get-driver-trips-today.query';

export interface DriverTripItem {
  id: string;
  tripNumber: string;
  tripStatus: ETripStatus;
  startDatetime: Date;
  stopCount: number;
}

@QueryHandlerStrict(GetDriverTripsTodayQuery)
export class GetDriverTripsTodayQueryHandler
  implements IQueryHandler<GetDriverTripsTodayQuery, DriverTripItem[]> {
  public constructor(
    @Inject(TRIP_REPO) private readonly tripRepo: ITripRepo,
    @Inject(TRIP_STOP_REPO) private readonly stopRepo: ITripStopRepo,
    @InjectPinoLogger(GetDriverTripsTodayQueryHandler.name) private readonly logger: PinoLogger,
  ) {}

  public async execute(query: GetDriverTripsTodayQuery): Promise<DriverTripItem[]> {
    this.logger.info(`Executing Query '${GetDriverTripsTodayQuery.name}' driverId=${query.driverId}`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const trips = await this.tripRepo.findByDriverAndDateAsync(
      query.driverId,
      todayStart,
      todayEnd,
      [ETripStatus.Scheduled, ETripStatus.InTransit],
    );

    const results: DriverTripItem[] = [];
    for (const trip of trips) {
      const stopCount = await this.stopRepo.countByTripAsync(trip.id);
      results.push({
        id: trip.id,
        tripNumber: trip.tripNumber,
        tripStatus: trip.tripStatus,
        startDatetime: trip.startDatetime,
        stopCount,
      });
    }

    return results;
  }
}
