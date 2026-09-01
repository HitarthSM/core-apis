export * from './get-driver-trips-today/get-driver-trips-today.query';
export * from './get-driver-trips-today/get-driver-trips-today.query-handler';
export * from './get-fleet-live-locations/get-fleet-live-locations.query';
export * from './get-fleet-live-locations/get-fleet-live-locations.query-handler';

import { GetDriverTripsTodayQueryHandler } from './get-driver-trips-today/get-driver-trips-today.query-handler';
import { GetFleetLiveLocationsQueryHandler } from './get-fleet-live-locations/get-fleet-live-locations.query-handler';

export const TripOperationQueryHandlers = [
  GetDriverTripsTodayQueryHandler,
  GetFleetLiveLocationsQueryHandler,
];
