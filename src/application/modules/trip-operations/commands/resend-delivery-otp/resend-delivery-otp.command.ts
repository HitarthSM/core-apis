import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class ResendDeliveryOtpCommand extends CommandBase {
  @AutoMap() public tripId: string;
  @AutoMap() public stopId: string;
  @AutoMap() public driverUserId: string;
  @AutoMap() public organizationId: string;
}

export interface ResendDeliveryOtpResult {
  maskedEmail: string;
}
