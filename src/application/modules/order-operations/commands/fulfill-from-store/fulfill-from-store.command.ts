import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class FulfillFromStoreCommand extends CommandBase {
  @AutoMap() public orderId: string;
  @AutoMap() public userId: string;
  @AutoMap() public organizationId: string;
}
