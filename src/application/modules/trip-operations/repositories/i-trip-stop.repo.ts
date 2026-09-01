import { IBaseRepo } from '../../../../common';
import { TripStop } from '../domain/trip-stop.model';

export const TRIP_STOP_REPO_TOKEN = 'TRIP_STOP_REPO';

export interface ITripStopRepo extends IBaseRepo<TripStop, string> {
  findByTripAndStopAsync(tripId: string, stopId: string): Promise<TripStop | null>;
  findCustomerEmailAsync(tripId: string, stopId: string): Promise<string | null>;
  countByTripAsync(tripId: string): Promise<number>;
  findAllByTripAsync(tripId: string): Promise<TripStop[]>;
  updateOtpAsync(id: string, otpHash: string, expiresAt: Date): Promise<void>;
  markDeliveredAsync(id: string, now: Date): Promise<void>;
}
