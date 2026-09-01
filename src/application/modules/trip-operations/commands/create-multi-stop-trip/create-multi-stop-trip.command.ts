import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class TripStopInput {
  @AutoMap() public orderId: string;
  @AutoMap() public sequence: number;
}

export class CreateMultiStopTripCommand extends CommandBase {
  @AutoMap() public driverId: string;
  @AutoMap() public vehicleId: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public stops: TripStopInput[];
}
