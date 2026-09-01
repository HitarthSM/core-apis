import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';
import { ETripStatus } from '../../../../shared/enums/e-trip-status';

export class UpdateTripStatusCommand extends CommandBase {
  @AutoMap() public tripId: string;
  @AutoMap() public driverId: string;
  @AutoMap(() => String) public status: ETripStatus;
}
