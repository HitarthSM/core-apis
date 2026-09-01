import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class ClaimOrderCommand extends CommandBase {
  @AutoMap() public orderId: string;
  @AutoMap() public pickerUserId: string;
  @AutoMap() public organizationId: string;
}
