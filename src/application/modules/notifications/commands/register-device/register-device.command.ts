import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class RegisterDeviceCommand extends CommandBase {
  @AutoMap() public userId: string;
  @AutoMap() public token: string;
  @AutoMap() public platform: string;
}
