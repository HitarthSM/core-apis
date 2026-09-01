import { IBaseRepo } from '../../../../common';
import { Trip } from '../domain';
import { ETripStatus } from '../../../shared/enums/e-trip-status';

export interface ITripRepo extends IBaseRepo<Trip, string> {
  findByStatusAsync(status: ETripStatus): Promise<Trip[]>;
  findByDriverAndDateAsync(
    driverId: string,
    startDate: Date,
    endDate: Date,
    statuses: ETripStatus[],
  ): Promise<Trip[]>;
  createTripWithStopsAsync(
    driverId: string,
    vehicleId: string,
    stops: Array<{ orderId: string; sequence: number }>,
  ): Promise<Trip>;
}
