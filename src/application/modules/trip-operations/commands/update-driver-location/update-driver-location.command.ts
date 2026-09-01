import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class UpdateDriverLocationCommand extends CommandBase {
  @AutoMap() public tripId: string;
  @AutoMap() public driverId: string;
  @AutoMap() public latitude: number;
  @AutoMap() public longitude: number;
  @AutoMap() public accuracy: number;
  @AutoMap() public organizationId: string;
}
