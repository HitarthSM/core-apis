import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class ConfirmDeliveryOtpCommand extends CommandBase {
  @AutoMap() public tripId: string;
  @AutoMap() public stopId: string;
  @AutoMap() public otp: string;
  @AutoMap() public driverUserId: string;
}
