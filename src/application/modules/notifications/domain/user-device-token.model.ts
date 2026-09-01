import { AutoMap } from '@automapper/classes';

export class UserDeviceToken {
  @AutoMap() public id: string;
  @AutoMap() public userId: string;
  @AutoMap() public token: string;
  @AutoMap() public platform: string;
  @AutoMap(() => Date) public createdAt: Date;
  @AutoMap(() => Date) public updatedAt?: Date;
}
