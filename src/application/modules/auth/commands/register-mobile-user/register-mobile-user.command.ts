import { AutoMap } from '@automapper/classes';
import { CommandBase } from '../../../../../common';

export class RegisterMobileUserCommand extends CommandBase {
  @AutoMap() public firstName: string;
  @AutoMap() public lastName: string;
  @AutoMap() public email: string;
  @AutoMap() public password: string;
  @AutoMap() public organizationId: string;
  @AutoMap() public roleId: string;
}
